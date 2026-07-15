import assert from "node:assert/strict";
import test from "node:test";

import {
  GPU_WORLD_GENERATOR_PACKAGE_NAME,
  ORIGIN_SHARD_ATLAS_SPEC,
  PERSISTENT_WORLD_ATLAS_FEATURE_FLAG,
  WORLD_ATLAS_COUNTS,
  WORLD_HYDROLOGY_CLASSES,
  WORLD_WATER_KINDS,
  bakeWorldAtlas,
  createWorldAtlasBakePlan,
  decodeWorldTile,
  generateWorldAtlasMacroGrid,
  getWorldEditDirtyAddresses,
  normalizeWorldAtlasPosition,
  validateWorldEditMassClosure,
  worldLatitudeDegrees,
  worldLocalZoneBounds,
  worldPositionToWorldAddress,
  worldTileBounds,
  worldZoneBounds,
} from "../dist/index.js";

test("origin-shard exposes the exact finite atlas hierarchy", () => {
  assert.equal(GPU_WORLD_GENERATOR_PACKAGE_NAME, "@plasius/gpu-world-generator");
  assert.equal(PERSISTENT_WORLD_ATLAS_FEATURE_FLAG, "world.persistent-atlas.enabled");
  assert.deepEqual(ORIGIN_SHARD_ATLAS_SPEC, {
    schemaVersion: 1,
    worldId: "origin-shard",
    widthM: 100_000,
    heightM: 50_000,
    tileSizeM: 1_000,
    zoneSizeM: 100,
    localZoneSizeM: 10,
    slabHeightM: 32,
    minYM: -1_024,
    maxYM: 2_560,
    seaLevelM: 0,
    wrapX: true,
  });
  assert.deepEqual(WORLD_ATLAS_COUNTS, {
    tilesX: 100,
    tilesZ: 50,
    tileCount: 5_000,
    zonesPerTileAxis: 10,
    zoneCount: 500_000,
    localZonesPerZoneAxis: 10,
    localZoneCount: 50_000_000,
    slabCount: 112,
  });
});

test("world coordinates wrap east-west and clamp to half-open polar bounds", () => {
  assert.deepEqual(normalizeWorldAtlasPosition(-1, -5), {
    x: 99_999,
    z: 0,
  });
  assert.deepEqual(normalizeWorldAtlasPosition(100_000, 50_000), {
    x: 0,
    z: 49_999.999999,
  });

  const northWest = worldPositionToWorldAddress(-1, -5);
  assert.deepEqual(northWest.tile, { tx: 99, tz: 0 });
  assert.deepEqual(northWest.zone, {
    tile: { tx: 99, tz: 0 },
    zx: 9,
    zz: 0,
  });
  assert.deepEqual(northWest.localZone, {
    zone: {
      tile: { tx: 99, tz: 0 },
      zx: 9,
      zz: 0,
    },
    lx: 9,
    lz: 0,
  });

  const southEast = worldPositionToWorldAddress(100_000, 50_000);
  assert.deepEqual(southEast.tile, { tx: 0, tz: 49 });
  assert.equal(worldLatitudeDegrees(0), 90);
  assert.equal(worldLatitudeDegrees(25_000), 0);
  assert.equal(worldLatitudeDegrees(50_000), -90);
});

test("tile, zone, and local-zone bounds remain aligned and half-open", () => {
  const tile = { tx: 12, tz: 7 };
  const zone = { tile, zx: 3, zz: 4 };
  const localZone = { zone, lx: 5, lz: 6 };

  assert.deepEqual(worldTileBounds(tile), {
    minX: 12_000,
    minZ: 7_000,
    maxX: 13_000,
    maxZ: 8_000,
  });
  assert.deepEqual(worldZoneBounds(zone), {
    minX: 12_300,
    minZ: 7_400,
    maxX: 12_400,
    maxZ: 7_500,
  });
  assert.deepEqual(worldLocalZoneBounds(localZone), {
    minX: 12_350,
    minZ: 7_460,
    maxX: 12_360,
    maxZ: 7_470,
  });
});

test("the bake plan addresses every immutable tile exactly once", () => {
  const plan = createWorldAtlasBakePlan({
    seed: 0x4f524947,
    atlasRevision: "origin-shard-2026-07-v1",
    generatorVersion: "0.0.27-test",
  });

  assert.equal(plan.tileKeys.length, 5_000);
  assert.equal(new Set(plan.tileKeys.map(({ tx, tz }) => `${tx}:${tz}`)).size, 5_000);
  assert.deepEqual(plan.tileKeys[0], { tx: 0, tz: 0 });
  assert.deepEqual(plan.tileKeys.at(-1), { tx: 99, tz: 49 });
});

test("bakes fail closed when a caller mutates the complete atlas contract", async () => {
  const plan = createWorldAtlasBakePlan({ generatorVersion: "0.0.27-test" });
  await assert.rejects(
    bakeWorldAtlas({
      ...plan,
      spec: { ...plan.spec, widthM: 99_000 },
    }, { tileKeys: [{ tx: 0, tz: 0 }] }),
    /spec|plan/i,
  );
  await assert.rejects(
    bakeWorldAtlas({
      ...plan,
      tileKeys: plan.tileKeys.map((key, index) =>
        index === plan.tileKeys.length - 1 ? { tx: 0, tz: 0 } : key),
    }, { tileKeys: [{ tx: 0, tz: 0 }] }),
    /tile key|plan/i,
  );
});

test("partial deterministic bakes preserve global diagnostics and verified tile codecs", async () => {
  const plan = createWorldAtlasBakePlan({
    seed: 0x4f524947,
    atlasRevision: "origin-shard-2026-07-v1",
    generatorVersion: "0.0.27-test",
  });
  const captured = [];
  const partialPublicationAttempts = [];
  const selection = [
    { tx: 0, tz: 0 },
    { tx: 99, tz: 0 },
    { tx: 50, tz: 25 },
  ];

  const first = await bakeWorldAtlas(plan, {
    tileKeys: selection,
    writeTile: (tile) => captured.push(tile),
    writeOverview: () => partialPublicationAttempts.push("overview"),
    writeTileIndex: () => partialPublicationAttempts.push("tile-index"),
    writeManifest: () => partialPublicationAttempts.push("manifest"),
  });
  const second = await bakeWorldAtlas(plan, {
    tileKeys: [...selection].reverse(),
  });

  assert.equal(first.complete, false);
  assert.deepEqual(partialPublicationAttempts, []);
  assert.equal(first.tileIndex.length, selection.length);
  assert.deepEqual(first.tileIndex, second.tileIndex);
  assert.deepEqual(
    first.tileIndex.map(({ contentHash }) => contentHash),
    [
      "36b26623bb33bada29bd72e8fbbeb015116150c2b033f9c55a366bcad55f07d5",
      "709e86e4bc724b0e6dc69c332cc17057a6f5ce8de49f0f883ba9be055622c158",
      "264746253f3bc4793df2f6ff3ca4cdc572adc24d6b2c87fc6cc1c246cf2e7968",
    ],
  );
  assert.equal(first.overview.length, 5_000);
  assert.equal(first.diagnostics.flowCycleCount, 0);
  assert.equal(first.diagnostics.invalidDrainageTerminationCount, 0);
  assert.ok(first.diagnostics.riverZoneCount > 0);
  assert.ok(first.diagnostics.oceanCoverage >= 0.4);
  assert.ok(first.diagnostics.oceanCoverage <= 0.5);
  assert.ok(
    Math.abs(first.diagnostics.mountainCoverage - first.diagnostics.oceanCoverage) <= 0.1,
  );

  const northTemperature = first.overview
    .filter(({ key }) => key.tz < 3)
    .reduce((sum, cell) => sum + cell.meanTemperatureC, 0);
  const equatorTemperature = first.overview
    .filter(({ key }) => key.tz >= 24 && key.tz <= 25)
    .reduce((sum, cell) => sum + cell.meanTemperatureC, 0);
  assert.ok(equatorTemperature > northTemperature);

  assert.equal(captured.length, selection.length);
  const decoded = await decodeWorldTile(captured[0].binary, {
    expectedContentHash: captured[0].contentHash,
  });
  assert.deepEqual(decoded.key, { tx: 0, tz: 0 });
  assert.equal(decoded.zones.length, 100);
  assert.equal(decoded.schemaVersion, 1);
  assert.deepEqual(
    decoded.zones.map(({ floraProfile, floraSeed }) => ({ floraProfile, floraSeed })),
    captured[0].tile.zones.map(({ floraProfile, floraSeed }) => ({
      floraProfile,
      floraSeed,
    })),
  );
  await assert.rejects(
    decodeWorldTile(new Uint8Array([1, 2, 3]).buffer),
    /too short/i,
  );
  await assert.rejects(
    decodeWorldTile(captured[0].binary, { expectedContentHash: "0".repeat(64) }),
    /content hash/i,
  );
  const corruptEnum = captured[0].binary.slice(0);
  const corruptView = new DataView(corruptEnum);
  const fieldsOffset = corruptView.getUint32(36, true);
  corruptView.setFloat32(fieldsOffset + 11 * 4, 0.5, true);
  await assert.rejects(decodeWorldTile(corruptEnum), /waterKind|integer/i);
});

test("river networks preserve order and continuous geological support", () => {
  const grid = generateWorldAtlasMacroGrid(
    createWorldAtlasBakePlan({ generatorVersion: "0.0.27-test" }),
  );
  const river = WORLD_WATER_KINDS.indexOf("river");
  const validDownstream = new Set([
    river,
    WORLD_WATER_KINDS.indexOf("lake"),
    WORLD_WATER_KINDS.indexOf("ocean"),
  ]);
  let riverCount = 0;
  let maximumOrder = 0;
  const drainageRoles = new Set();

  for (let index = 0; index < grid.waterKind.length; index += 1) {
    if (grid.waterKind[index] !== river) continue;
    riverCount += 1;
    maximumOrder = Math.max(maximumOrder, grid.streamOrder[index]);
    drainageRoles.add(WORLD_HYDROLOGY_CLASSES[grid.hydrologyClass[index]]);
    assert.ok(grid.flowAccumulation[index] >= 80);
    assert.ok(grid.streamOrder[index] >= 1);
    assert.ok(grid.riverDepth[index] > 0);
    assert.ok(grid.waterSurfaceElevation[index] > grid.elevation[index]);
    assert.notEqual(
      grid.hydrologyClass[index],
      WORLD_HYDROLOGY_CLASSES.indexOf("none"),
    );
    assert.ok(grid.riverbedGravelDepth[index] > 0);
    assert.ok(grid.sedimentDepth[index] > 0);
    assert.ok(grid.alluvialDepth[index] > 0);
    assert.ok(grid.floodplainSiltDepth[index] >= 0);
    assert.ok(grid.floodplainClayDepth[index] >= 0);
    assert.ok(grid.waterTableDepth[index] >= 0);
    const downstream = grid.downstream[index];
    assert.ok(downstream >= 0);
    assert.ok(validDownstream.has(grid.waterKind[downstream]));
    assert.ok(grid.flowAccumulation[downstream] >= grid.flowAccumulation[index]);
    assert.ok(grid.elevation[index] > grid.elevation[downstream]);
  }

  assert.equal(riverCount, grid.diagnostics.riverZoneCount);
  assert.ok(maximumOrder >= 4);
  assert.deepEqual(drainageRoles, new Set([
    "headwater",
    "tributary",
    "main-channel",
    "floodplain",
    "delta",
  ]));
});

test("the complete shipped bake publishes one pinned immutable manifest", async () => {
  const plan = createWorldAtlasBakePlan();
  const result = await bakeWorldAtlas(plan);

  assert.equal(result.complete, true);
  assert.equal(result.tileIndex.length, 5_000);
  assert.equal(
    result.manifest?.atlasChecksum,
    "6423b4649f6ec3e03d323e2e19c045ec2a94743b18b3c838a39c22d066385c6e",
  );
  assert.equal(
    result.manifest?.overview.contentHash,
    "d47d5e9a38790c6d1c0cef2640adb98142f30c8137e0a361b4fc16d4316e695f",
  );
  assert.match(
    result.manifest?.overview.path ?? "",
    /overview\.d47d5e9a38790c6d1c0cef2640adb98142f30c8137e0a361b4fc16d4316e695f\.v1\.json$/,
  );
  assert.equal(
    result.manifest?.tileIndex.contentHash,
    "e9f806d829cadbcdd21f438beb45d67348462303d0ab44ed0f96246a01a8c7ba",
  );
  assert.match(
    result.manifest?.tileIndex.path ?? "",
    /tile-index\.e9f806d829cadbcdd21f438beb45d67348462303d0ab44ed0f96246a01a8c7ba\.v1\.json$/,
  );
});

test("custom seeds report qualification metrics without a hard shipped-seed gate", async () => {
  const customPlan = createWorldAtlasBakePlan({
    seed: 2,
    atlasRevision: "custom-seed-2-v1",
    generatorVersion: "0.0.27-test",
  });
  const custom = await bakeWorldAtlas(customPlan);
  assert.equal(custom.complete, true);
  assert.ok(custom.diagnostics.oceanCoverage < 0.4);
  await assert.rejects(
    bakeWorldAtlas(customPlan, { requireQualification: true }),
    /ocean coverage/i,
  );
});

test("edit dirty-address derivation wraps bounds and enforces mass closure", () => {
  const edit = {
    schemaVersion: 1,
    id: "edit-cross-seam",
    worldId: "origin-shard",
    atlasRevision: "origin-shard-2026-07-v1",
    operations: [
      {
        kind: "densityDelta",
        center: [0.5, 12, 20],
        radiusM: 2,
        densityDelta: -0.8,
        materialDensityKgM3: 1_800,
      },
    ],
  };

  const dirty = getWorldEditDirtyAddresses(edit);
  assert.deepEqual(dirty.tiles, [
    { tx: 0, tz: 0 },
    { tx: 99, tz: 0 },
  ]);
  assert.ok(dirty.localZones.length > 0);

  const exactlyAligned = getWorldEditDirtyAddresses({
    ...edit,
    id: "edit-exact-half-open-boundary",
    operations: [{
      kind: "materialPaint",
      center: [5, 1, 5],
      radiusM: 5,
      materialId: 4,
    }],
  });
  assert.deepEqual(exactlyAligned.localZones, [
    { zone: { tile: { tx: 0, tz: 0 }, zx: 0, zz: 0 }, lx: 0, lz: 0 },
    { zone: { tile: { tx: 0, tz: 0 }, zx: 0, zz: 0 }, lx: 1, lz: 0 },
    { zone: { tile: { tx: 0, tz: 0 }, zx: 0, zz: 0 }, lx: 0, lz: 1 },
    { zone: { tile: { tx: 0, tz: 0 }, zx: 0, zz: 0 }, lx: 1, lz: 1 },
    { zone: { tile: { tx: 99, tz: 0 }, zx: 9, zz: 0 }, lx: 9, lz: 0 },
    { zone: { tile: { tx: 99, tz: 0 }, zx: 9, zz: 0 }, lx: 9, lz: 1 },
  ]);

  const haloOnlyNeighbor = getWorldEditDirtyAddresses({
    ...edit,
    id: "edit-invalidates-sampling-halo",
    operations: [{
      kind: "materialPaint",
      center: [9.75, 1, 5],
      radiusM: 0.1,
      materialId: 4,
    }],
  });
  assert.deepEqual(
    haloOnlyNeighbor.localZones.map(({ lx, lz }) => ({ lx, lz })),
    [{ lx: 0, lz: 0 }, { lx: 1, lz: 0 }],
  );

  assert.deepEqual(
    validateWorldEditMassClosure({
      worldDeltaKg: -125,
      ledgerDeltaKg: 125,
    }),
    { closed: true, residualKg: 0 },
  );
  assert.deepEqual(
    validateWorldEditMassClosure({
      worldDeltaKg: -125,
      ledgerDeltaKg: 120,
    }),
    { closed: false, residualKg: -5 },
  );
});
