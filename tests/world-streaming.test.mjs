import assert from "node:assert/strict";
import test from "node:test";

import {
  WORLD_RESIDENCY_BUDGETS,
  WorldResourceResidencyManager,
  assembleWorldZoneGeometry,
  materializeWorldLocalZone,
  planWorldView,
  selectWorldRepresentation,
  worldLocalZoneBounds,
} from "../dist/index.js";

const MIB = 1024 * 1024;

function macro(overrides = {}) {
  return Object.freeze({
    elevationM: 18,
    temperatureC: 14,
    precipitationMm: 900,
    moisture: 0.65,
    windX: 1,
    windZ: 0,
    oceanInfluence: 0.1,
    slope: 0.1,
    flowDirection: -1,
    flowAccumulation: 1,
    streamOrder: 0,
    waterKind: "land",
    riverDepthM: 0,
    floodplain: 0,
    hydrologyClass: "none",
    waterSurfaceElevationM: 0,
    bedrock: "granite",
    soilDepthM: 1.2,
    sedimentDepthM: 0.4,
    waterTableDepthM: 3,
    aquifer: 0.2,
    riverbedGravelDepthM: 0,
    floodplainSiltDepthM: 0,
    floodplainClayDepthM: 0,
    alluvialDepthM: 0,
    biome: "temperate-forest",
    floraProfile: "temperate-mixed",
    floraSeed: 12345,
    mountainous: false,
    ...overrides,
  });
}

function modelAssetRef(contentHash = "a".repeat(64)) {
  return Object.freeze({
    contractVersion: 1,
    assetId: "temperate-oak",
    version: "1.0.0",
    kind: "leaf",
    contentHash,
    runtimeManifestUri: `models/${contentHash}/manifest.json`,
  });
}

function tile(tx, tz, overrides = {}) {
  return Object.freeze({
    schemaVersion: 1,
    worldId: "origin-shard",
    atlasRevision: "origin-shard-2026-07-v1",
    seed: 0x4f524947,
    key: Object.freeze({ tx, tz }),
    zones: Object.freeze(Array.from({ length: 100 }, () => macro())),
    spatialModels: Object.freeze([]),
    ...overrides,
  });
}

function localZone(tx = 0, tz = 0, zx = 0, zz = 0, lx = 0, lz = 0) {
  return {
    zone: { tile: { tx, tz }, zx, zz },
    lx,
    lz,
  };
}

function chunkKey(metresPerVoxel, slabY = 0, address = localZone()) {
  return {
    worldId: "origin-shard",
    atlasRevision: "origin-shard-2026-07-v1",
    localZone: address,
    metresPerVoxel,
    slabY,
    editRevision: 0,
  };
}

test("the lean ladder exposes exact hard residency budgets and 20% hysteresis", () => {
  assert.deepEqual(WORLD_RESIDENCY_BUDGETS, {
    low: {
      profile: "low",
      maxCpuBytes: 128 * MIB,
      maxGpuBytes: 192 * MIB,
      maxGenerationJobs: 2,
    },
    standard: {
      profile: "standard",
      maxCpuBytes: 256 * MIB,
      maxGpuBytes: 384 * MIB,
      maxGenerationJobs: 4,
    },
    high: {
      profile: "high",
      maxCpuBytes: 512 * MIB,
      maxGpuBytes: 768 * MIB,
      maxGenerationJobs: 8,
    },
  });

  assert.equal(selectWorldRepresentation(0), "voxel-0.5m");
  assert.equal(selectWorldRepresentation(8), "voxel-1m");
  assert.equal(selectWorldRepresentation(32), "zone-5m");
  assert.equal(selectWorldRepresentation(150), "tile-25m");
  assert.equal(selectWorldRepresentation(1_000), "overview-100m");
  assert.equal(
    selectWorldRepresentation(9.5, "voxel-0.5m"),
    "voxel-0.5m",
  );
  assert.equal(
    selectWorldRepresentation(9.6, "voxel-0.5m"),
    "voxel-1m",
  );
  assert.equal(
    selectWorldRepresentation(7, "voxel-1m"),
    "voxel-1m",
  );
  assert.equal(
    selectWorldRepresentation(6.3, "voxel-1m"),
    "voxel-0.5m",
  );
});

test("view plans wrap directional prefetch and cancel obsolete detailed work", () => {
  const cancelled = [];
  const previousPlan = planWorldView({
    worldId: "origin-shard",
    atlasRevision: "origin-shard-2026-07-v1",
    editRevision: 4,
    viewpoint: { x: 50, y: 20, z: 1_500 },
    velocity: { x: 0, z: 0 },
    budget: "low",
    viewDistanceM: 1_100,
  });
  const nextPlan = planWorldView({
    worldId: "origin-shard",
    atlasRevision: "origin-shard-2026-07-v1",
    editRevision: 5,
    viewpoint: { x: 99_950, y: 20, z: 1_500 },
    velocity: { x: 12, z: 0 },
    budget: "standard",
    viewDistanceM: 1_100,
    previousPlan,
    cancelObsoleteWork: (key) => cancelled.push(key),
  });

  assert.equal(nextPlan.budget.profile, "standard");
  assert.ok(nextPlan.requiredTiles.some(({ tx, tz }) => tx === 99 && tz === 1));
  assert.ok(nextPlan.requiredTiles.some(({ tx, tz }) => tx === 0 && tz === 1));
  assert.deepEqual(nextPlan.prefetchTiles, [{ tx: 0, tz: 1 }]);
  assert.ok(nextPlan.localChunks.length > 0);
  assert.ok(nextPlan.representations.some(({ fallback }) => fallback !== undefined));
  assert.ok(nextPlan.obsoleteWorkKeys.length > 0);
  assert.deepEqual(cancelled, nextPlan.obsoleteWorkKeys);
  assert.equal(new Set(nextPlan.workKeys).size, nextPlan.workKeys.length);
});

test("large polar view plans clamp north-south and deduplicate wrapped work", () => {
  const plan = planWorldView({
    worldId: "origin-shard",
    atlasRevision: "origin-shard-2026-07-v1",
    editRevision: 0,
    viewpoint: { x: -25, y: 0, z: -100 },
    velocity: { x: -1, z: -10 },
    budget: "low",
    viewDistanceM: 51_000,
  });

  assert.equal(new Set(plan.workKeys).size, plan.workKeys.length);
  assert.ok(plan.requiredTiles.every(({ tx, tz }) =>
    tx >= 0 && tx < 100 && tz >= 0 && tz < 50));
  assert.ok(plan.prefetchTiles.every(({ tz }) => tz >= 0));
});

test("local slabs materialize only around features and share exact samples across voxel LODs", () => {
  const address = localZone(0, 0, 1, 1, 1, 1);
  const sourceTile = tile(0, 0);
  const halfMetre = materializeWorldLocalZone({
    key: chunkKey(0.5, 0, address),
    tiles: [sourceTile],
    floraAssets: { "temperate-mixed": [modelAssetRef()] },
  });
  const oneMetre = materializeWorldLocalZone({
    key: chunkKey(1, 0, address),
    tiles: [sourceTile],
    floraAssets: { "temperate-mixed": [modelAssetRef()] },
  });

  assert.ok(halfMetre);
  assert.ok(oneMetre);
  assert.deepEqual(halfMetre.dimensions, { x: 21, y: 65, z: 21 });
  assert.deepEqual(oneMetre.dimensions, { x: 11, y: 33, z: 11 });
  for (let z = 0; z < oneMetre.dimensions.z; z += 1) {
    for (let y = 0; y < oneMetre.dimensions.y; y += 1) {
      for (let x = 0; x < oneMetre.dimensions.x; x += 1) {
        const coarse = (z * oneMetre.dimensions.y + y) * oneMetre.dimensions.x + x;
        const fine = ((z * 2) * halfMetre.dimensions.y + y * 2)
          * halfMetre.dimensions.x + x * 2;
        assert.equal(halfMetre.density[fine], oneMetre.density[coarse]);
        assert.equal(halfMetre.materials[fine], oneMetre.materials[coarse]);
      }
    }
  }
  assert.deepEqual(halfMetre.floraInstances, oneMetre.floraInstances);
  assert.equal(
    materializeWorldLocalZone({ key: chunkKey(1, 20, address), tiles: [sourceTile] }),
    null,
  );
});

test("ordered edits replay identically at shared positions and extend slab materialization", () => {
  const address = localZone(0, 0, 1, 1, 1, 1);
  const sourceTile = tile(0, 0);
  const edits = [{
    schemaVersion: 1,
    id: "edit-1",
    worldId: "origin-shard",
    atlasRevision: "origin-shard-2026-07-v1",
    operations: [
      {
        kind: "densityDelta",
        center: [115, 50, 115],
        radiusM: 2,
        densityDelta: 4,
        materialDensityKgM3: 1_600,
      },
      {
        kind: "materialPaint",
        center: [115, 50, 115],
        radiusM: 1.5,
        materialId: 20,
      },
    ],
  }];
  const fine = materializeWorldLocalZone({
    key: chunkKey(0.5, 1, address),
    tiles: [sourceTile],
    edits,
  });
  const coarse = materializeWorldLocalZone({
    key: chunkKey(1, 1, address),
    tiles: [sourceTile],
    edits,
  });

  assert.ok(fine);
  assert.ok(coarse);
  const coarseIndex = (5 * coarse.dimensions.y + (50 - 32))
    * coarse.dimensions.x + 5;
  const fineIndex = (10 * fine.dimensions.y + (50 - 32) * 2)
    * fine.dimensions.x + 10;
  assert.equal(fine.density[fineIndex], coarse.density[coarseIndex]);
  assert.equal(fine.materials[fineIndex], 20);
  assert.equal(coarse.materials[coarseIndex], 20);
});

test("a remote edit envelope does not materialize an unrelated vertical slab", () => {
  const address = localZone(0, 0, 1, 1, 1, 1);
  const edits = [{
    schemaVersion: 1,
    id: "remote-edit",
    worldId: "origin-shard",
    atlasRevision: "origin-shard-2026-07-v1",
    operations: [{
      kind: "densityDelta",
      center: [50_000, 50, 25_000],
      radiusM: 2,
      densityDelta: 1,
      materialDensityKgM3: 1_600,
    }],
  }];
  assert.equal(materializeWorldLocalZone({
    key: chunkKey(1, 1, address),
    tiles: [tile(0, 0)],
    edits,
  }), null);
});

test("zone assembly wraps source ownership, clips geometry, and deduplicates canonical models", () => {
  const assetRef = modelAssetRef("b".repeat(64));
  const instance = Object.freeze({
    schemaVersion: 1,
    instanceId: "seam-tree",
    ownerTile: { tx: 99, tz: 0 },
    intersectingTiles: [{ tx: 99, tz: 0 }, { tx: 0, tz: 0 }],
    assetRef,
    transform: {
      translationMetres: [99_999, 18, 50],
      rotationQuaternion: [0, 0, 0, 1],
      scale: [1, 1, 1],
    },
    boundsMetres: { min: [99_995, 18, 45], max: [100_005, 30, 55] },
    lodDistancesM: [50, 150],
  });
  const west = tile(99, 0, { spatialModels: [instance] });
  const east = tile(0, 0, { spatialModels: [instance] });
  const destination = { tile: { tx: 99, tz: 0 }, zx: 9, zz: 0 };
  const result = assembleWorldZoneGeometry({
    destination,
    tiles: [west, east],
    metresPerCell: 5,
  });

  assert.deepEqual(result.requiredTiles, [{ tx: 0, tz: 0 }, { tx: 99, tz: 0 }]);
  assert.equal(result.models.length, 1);
  assert.equal(result.models[0].instance.instanceId, "seam-tree");
  assert.deepEqual(result.models[0].clipBounds, {
    minX: 99_900,
    minZ: 0,
    maxX: 100_000,
    maxZ: 100,
  });
  for (let index = 0; index < result.terrain.positions.length; index += 3) {
    const x = result.terrain.positions[index];
    const z = result.terrain.positions[index + 2];
    assert.ok(x >= 99_900 && x <= 100_000);
    assert.ok(z >= 0 && z <= 100);
  }
  assert.equal(result.terrain.positions.at(-3), 100_000);

  const wrappedResult = assembleWorldZoneGeometry({
    destination: { tile: { tx: 0, tz: 0 }, zx: 0, zz: 0 },
    tiles: [west, east],
    metresPerCell: 5,
  });
  assert.equal(wrappedResult.models.length, 1);
  assert.equal(wrappedResult.models[0].instance.instanceId, "seam-tree");
  assert.deepEqual(wrappedResult.models[0].clipBounds, {
    minX: 0,
    minZ: 0,
    maxX: 100,
    maxZ: 100,
  });
});

test("zone assembly reports a large intersecting model's remote canonical owner", () => {
  const assetRef = modelAssetRef("c".repeat(64));
  const instance = Object.freeze({
    schemaVersion: 1,
    instanceId: "long-bridge",
    ownerTile: { tx: 1, tz: 0 },
    intersectingTiles: [{ tx: 0, tz: 0 }, { tx: 1, tz: 0 }],
    assetRef,
    transform: {
      translationMetres: [1_000, 20, 50],
      rotationQuaternion: [0, 0, 0, 1],
      scale: [1, 1, 1],
    },
    boundsMetres: { min: [50, 10, 45], max: [1_050, 30, 55] },
    lodDistancesM: [150, 1_000],
  });
  const descriptor = tile(0, 0, { spatialModels: [instance] });
  const owner = tile(1, 0, { spatialModels: [instance] });
  const result = assembleWorldZoneGeometry({
    destination: { tile: { tx: 0, tz: 0 }, zx: 0, zz: 0 },
    tiles: [descriptor, owner, tile(99, 0)],
    metresPerCell: 25,
  });

  assert.ok(result.requiredTiles.some(({ tx, tz }) => tx === 1 && tz === 0));
  assert.equal(result.models.length, 1);
});

test("adjacent zone assemblies share byte-identical tile and atlas-seam samples", () => {
  const low = tile(0, 0, {
    zones: Object.freeze(Array.from({ length: 100 }, () => macro({ elevationM: 10 }))),
  });
  const high = tile(1, 0, {
    zones: Object.freeze(Array.from({ length: 100 }, () => macro({ elevationM: 30 }))),
  });
  const left = assembleWorldZoneGeometry({
    destination: { tile: { tx: 0, tz: 0 }, zx: 9, zz: 0 },
    tiles: [low, high],
    metresPerCell: 5,
  });
  const right = assembleWorldZoneGeometry({
    destination: { tile: { tx: 1, tz: 0 }, zx: 0, zz: 0 },
    tiles: [low, high],
    metresPerCell: 5,
  });
  const stride = 21;
  for (let z = 0; z < stride; z += 1) {
    const leftHeight = left.terrain.positions[(z * stride + 20) * 3 + 1];
    const rightHeight = right.terrain.positions[(z * stride) * 3 + 1];
    assert.equal(leftHeight, rightHeight);
  }

  const atlasWest = tile(99, 0, {
    zones: Object.freeze(Array.from({ length: 100 }, () => macro({ elevationM: 5 }))),
  });
  const atlasEast = tile(0, 0, {
    zones: Object.freeze(Array.from({ length: 100 }, () => macro({ elevationM: 25 }))),
  });
  const seamWest = assembleWorldZoneGeometry({
    destination: { tile: { tx: 99, tz: 0 }, zx: 9, zz: 0 },
    tiles: [atlasWest, atlasEast],
    metresPerCell: 25,
  });
  const seamEast = assembleWorldZoneGeometry({
    destination: { tile: { tx: 0, tz: 0 }, zx: 0, zz: 0 },
    tiles: [atlasWest, atlasEast],
    metresPerCell: 25,
  });
  const coarseStride = 5;
  for (let z = 0; z < coarseStride; z += 1) {
    const westHeight = seamWest.terrain.positions[(z * coarseStride + 4) * 3 + 1];
    const eastHeight = seamEast.terrain.positions[(z * coarseStride) * 3 + 1];
    assert.equal(westHeight, eastHeight);
  }
});

test("zone assembly rejects conflicting records for one stable model id", () => {
  const common = {
    schemaVersion: 1,
    instanceId: "conflict",
    ownerTile: { tx: 99, tz: 0 },
    intersectingTiles: [{ tx: 99, tz: 0 }, { tx: 0, tz: 0 }],
    transform: {
      translationMetres: [99_999, 18, 50],
      rotationQuaternion: [0, 0, 0, 1],
      scale: [1, 1, 1],
    },
    boundsMetres: { min: [99_995, 18, 45], max: [100_005, 30, 55] },
    lodDistancesM: [50, 150],
  };
  assert.throws(() => assembleWorldZoneGeometry({
    destination: { tile: { tx: 99, tz: 0 }, zx: 9, zz: 0 },
    tiles: [
      tile(99, 0, { spatialModels: [{ ...common, assetRef: modelAssetRef("d".repeat(64)) }] }),
      tile(0, 0, { spatialModels: [{ ...common, assetRef: modelAssetRef("e".repeat(64)) }] }),
    ],
    metresPerCell: 25,
  }), /conflicting spatial model/i);
});

test("the resource coordinator stays inside hard budgets and disposes each eviction once", () => {
  const disposed = [];
  const manager = new WorldResourceResidencyManager({
    profile: "low",
    maxCpuBytes: 300,
    maxGpuBytes: 300,
    maxGenerationJobs: 2,
  });
  manager.upsert({
    id: "pinned-local",
    category: "local-zone",
    cpuBytes: 100,
    gpuBytes: 100,
    distanceM: 0,
    pinned: true,
    dispose: () => disposed.push("pinned-local"),
  });
  for (let index = 0; index < 2_000; index += 1) {
    manager.upsert({
      id: `far-${index}`,
      category: "far-detail",
      cpuBytes: 2,
      gpuBytes: 2,
      distanceM: index,
      dispose: () => disposed.push(`far-${index}`),
    });
  }

  assert.ok(manager.snapshot().cpuBytes <= 300);
  assert.ok(manager.snapshot().gpuBytes <= 300);
  assert.ok(manager.has("pinned-local"));
  assert.equal(new Set(disposed).size, disposed.length);
  assert.equal(manager.tryBeginGeneration("one"), true);
  assert.equal(manager.tryBeginGeneration("two"), true);
  assert.equal(manager.tryBeginGeneration("three"), false);
  manager.endGeneration("one");
  assert.equal(manager.tryBeginGeneration("three"), true);
});

test("resource eviction preserves models until every earlier unpinned category", () => {
  const disposed = [];
  const manager = new WorldResourceResidencyManager({
    profile: "low",
    maxCpuBytes: 100,
    maxGpuBytes: 100,
    maxGenerationJobs: 1,
  });
  manager.upsert({
    id: "model",
    category: "model",
    cpuBytes: 80,
    gpuBytes: 80,
    distanceM: 10_000,
    dispose: () => disposed.push("model"),
  });
  manager.upsert({
    id: "far-detail",
    category: "far-detail",
    cpuBytes: 40,
    gpuBytes: 40,
    distanceM: 1,
    dispose: () => disposed.push("far-detail"),
  });
  assert.deepEqual(disposed, ["far-detail"]);
  assert.equal(manager.has("model"), true);
  assert.throws(() => manager.upsert({
    id: "pinned-too-large",
    category: "local-zone",
    cpuBytes: 101,
    gpuBytes: 101,
    distanceM: 0,
    pinned: true,
    dispose: () => disposed.push("pinned-too-large"),
  }), /exceed/i);
  assert.equal(disposed.filter((id) => id === "pinned-too-large").length, 1);
});

test("a thousand-zone traversal remains bounded with unique work and exact disposal", () => {
  const disposed = [];
  const manager = new WorldResourceResidencyManager({
    profile: "low",
    maxCpuBytes: 64 * 1_024,
    maxGpuBytes: 96 * 1_024,
    maxGenerationJobs: 2,
  });
  let previousPlan;
  for (let step = 0; step < 1_000; step += 1) {
    const plan = planWorldView({
      worldId: "origin-shard",
      atlasRevision: "origin-shard-2026-07-v1",
      editRevision: 3,
      viewpoint: { x: step * 10 + 5, y: 20, z: 25_005 },
      velocity: { x: 10, z: 0 },
      budget: "low",
      viewDistanceM: 1_000,
      previousPlan,
    });
    assert.equal(new Set(plan.workKeys).size, plan.workKeys.length);
    for (const entry of plan.representations.slice(0, 12)) {
      const id = `${step}:${entry.workKey}`;
      manager.upsert({
        id,
        category: entry.representation.startsWith("voxel")
          ? "local-zone"
          : entry.representation === "zone-5m"
            ? "mid-distance"
            : "far-detail",
        cpuBytes: 512,
        gpuBytes: 768,
        distanceM: entry.distanceM,
        dispose: () => disposed.push(id),
      });
    }
    previousPlan = plan;
    const snapshot = manager.snapshot();
    assert.ok(snapshot.cpuBytes <= snapshot.budget.maxCpuBytes);
    assert.ok(snapshot.gpuBytes <= snapshot.budget.maxGpuBytes);
  }
  assert.equal(new Set(disposed).size, disposed.length);
});

test("streaming work honors pre-aborted signals", () => {
  const controller = new AbortController();
  controller.abort();
  assert.throws(
    () => materializeWorldLocalZone({
      key: chunkKey(1),
      tiles: [tile(0, 0)],
      signal: controller.signal,
    }),
    { name: "AbortError" },
  );
  assert.throws(
    () => assembleWorldZoneGeometry({
      destination: { tile: { tx: 0, tz: 0 }, zx: 0, zz: 0 },
      tiles: [tile(0, 0)],
      metresPerCell: 5,
      signal: controller.signal,
    }),
    { name: "AbortError" },
  );
});

test("materialization rejects missing halo owner tiles at an east-west seam", () => {
  const address = localZone(99, 0, 9, 0, 9, 0);
  const bounds = worldLocalZoneBounds(address);
  assert.equal(bounds.maxX, 100_000);
  assert.throws(
    () => materializeWorldLocalZone({
      key: chunkKey(1, 0, address),
      tiles: [tile(99, 0)],
    }),
    /required owner tile 0:0/i,
  );
});
