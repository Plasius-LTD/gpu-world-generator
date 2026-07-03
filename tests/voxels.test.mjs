import assert from "node:assert/strict";
import test from "node:test";
import {
  ClimateBands,
  VOXEL_FIELD_STRIDE,
  VoxelMaterial,
  WORLD_GENERATOR_COORDINATE_CONVENTION,
  applyVoxelEditJournal,
  buildVoxelFluidBoundaryField,
  buildVoxelCollisionMesh,
  buildVoxelRenderSurfaces,
  buildVoxelSurfaceMesh,
  buildVoxelSurfaceMeshFromField,
  createVoxelFluidSimulationInputs,
  createVoxelEditJournal,
  createVoxelMaterialPalette,
  createWorldGeneratorRepresentationPlan,
  createWorldGeneratorWavefrontSceneSourceAdapter,
  generateWorldDecorations,
  getVoxelEditDirtyChunkKeys,
  getWorldBiomeProfile,
  isVoxelMaterialId,
  materializeVoxelChunk,
  materializeVoxelMeshingField,
  splitVoxelEditJournalByChunk,
} from "../dist/index.js";

const smallSpec = Object.freeze({
  sizeX: 12,
  sizeY: 12,
  sizeZ: 12,
  voxelSize: 1,
});

function materialSet(chunk) {
  return new Set(Array.from(chunk.materials));
}

function firstSolidWorldPoint(chunk) {
  const { sizeX, sizeY, sizeZ, voxelSize } = chunk.spec;
  for (let y = sizeY - 1; y >= 0; y -= 1) {
    for (let z = 0; z < sizeZ; z += 1) {
      for (let x = 0; x < sizeX; x += 1) {
        const index = x + sizeX * (z + sizeZ * y);
        if (chunk.materials[index] !== VoxelMaterial.Air && chunk.density[index] >= 0) {
          return [
            chunk.bounds.min[0] + (x + 0.5) * voxelSize,
            chunk.bounds.min[1] + (y + 0.5) * voxelSize,
            chunk.bounds.min[2] + (z + 0.5) * voxelSize,
          ];
        }
      }
    }
  }
  throw new Error("expected at least one solid voxel");
}

function fieldIndex(field, x, y, z) {
  return x + field.latticeSizeX * (z + field.latticeSizeZ * y);
}

function boundaryVertices(mesh, axis, value, epsilon = 1e-5) {
  const offset = axis === "x" ? 0 : axis === "y" ? 1 : 2;
  const vertices = [];
  for (let index = 0; index < mesh.positions.length; index += 3) {
    if (Math.abs(mesh.positions[index + offset] - value) <= epsilon) {
      vertices.push([
        mesh.positions[index],
        mesh.positions[index + 1],
        mesh.positions[index + 2],
      ]);
    }
  }
  return vertices;
}

test("voxel chunks are deterministic and use XZ ground with +Y up", () => {
  const key = { seed: 1234, cx: 0, cy: 0, cz: 0 };
  const a = materializeVoxelChunk({ key, spec: smallSpec, climate: "temperate" });
  const b = materializeVoxelChunk({ key, spec: smallSpec, climate: "temperate" });

  assert.deepEqual(a.coordinateConvention, WORLD_GENERATOR_COORDINATE_CONVENTION);
  assert.deepEqual(a.bounds.min, [0, 0, 0]);
  assert.deepEqual(a.bounds.max, [12, 12, 12]);
  assert.equal(a.density.length, smallSpec.sizeX * smallSpec.sizeY * smallSpec.sizeZ);
  assert.equal(a.materials.length, a.density.length);
  assert.equal(a.fields.length, a.density.length * VOXEL_FIELD_STRIDE);
  assert.deepEqual(Array.from(a.density), Array.from(b.density));
  assert.deepEqual(Array.from(a.materials), Array.from(b.materials));
  assert.ok(Array.from(a.density).every(Number.isFinite));
  assert.ok(Array.from(a.materials).every(isVoxelMaterialId));
});

test("all macro climates produce expected world materials and decorations", () => {
  for (const climate of ClimateBands) {
    const chunk = materializeVoxelChunk({
      key: { seed: 9988, cx: 0, cy: 0, cz: 0 },
      spec: smallSpec,
      climate,
    });
    const profile = getWorldBiomeProfile(climate);
    const materials = materialSet(chunk);
    const expectedFamilies = new Set(profile.decorativeFamilies);
    const decorations = generateWorldDecorations(chunk, { maxInstances: 64 });

    assert.equal(chunk.climate, climate);
    assert.ok(chunk.biome.surfaceMaterials.length > 0);
    assert.ok([...materials].some((material) => material !== VoxelMaterial.Air));
    assert.ok(
      decorations.instances.every(
        (instance) => instance.climate === climate && expectedFamilies.has(instance.family)
      ),
      `${climate} decorations should come from the biome profile`
    );
  }
});

test("voxel materialization supports non-heightfield caves and overhangs", () => {
  const underground = materializeVoxelChunk({
    key: { seed: 42, cx: 0, cy: 0, cz: 0 },
    spec: { sizeX: 18, sizeY: 18, sizeZ: 18, voxelSize: 1 },
    climate: "underground",
  });
  const volcanic = materializeVoxelChunk({
    key: { seed: 77, cx: 0, cy: 0, cz: 0 },
    spec: { sizeX: 18, sizeY: 18, sizeZ: 18, voxelSize: 1 },
    climate: "volcanic",
  });

  let enclosedAir = 0;
  for (let y = 1; y < underground.spec.sizeY - 1; y += 1) {
    for (let z = 1; z < underground.spec.sizeZ - 1; z += 1) {
      for (let x = 1; x < underground.spec.sizeX - 1; x += 1) {
        const index = x + underground.spec.sizeX * (z + underground.spec.sizeZ * y);
        if (underground.materials[index] === VoxelMaterial.Air) enclosedAir += 1;
      }
    }
  }

  let elevatedSolid = 0;
  for (let y = 12; y < volcanic.spec.sizeY; y += 1) {
    for (let z = 0; z < volcanic.spec.sizeZ; z += 1) {
      for (let x = 0; x < volcanic.spec.sizeX; x += 1) {
        const index = x + volcanic.spec.sizeX * (z + volcanic.spec.sizeZ * y);
        if (volcanic.materials[index] !== VoxelMaterial.Air && volcanic.density[index] >= 0) {
          elevatedSolid += 1;
        }
      }
    }
  }

  assert.ok(enclosedAir > 0, "underground chunks should include cave voids");
  assert.ok(elevatedSolid > 0, "volcanic chunks should include elevated solids/overhangs");
});

test("voxel edit journals mine, collapse, and add volcanic deposits deterministically", () => {
  const key = { seed: 314, cx: 0, cy: 0, cz: 0 };
  const base = materializeVoxelChunk({ key, spec: smallSpec, climate: "temperate" });
  const center = firstSolidWorldPoint(base);
  const journal = createVoxelEditJournal(key, [
    {
      id: "mine-1",
      kind: "subtractBrush",
      brush: { center, radius: 2.5, strength: 1 },
    },
    {
      id: "sink-1",
      kind: "collapseSinkhole",
      brush: { center: [center[0] + 2, center[1], center[2]], radius: 2.5 },
      collapseDepth: 3,
    },
    {
      id: "volcano-1",
      kind: "volcanicDeposit",
      brush: { center: [center[0] + 4, center[1], center[2]], radius: 2.5 },
      heat: 1,
    },
  ]);

  const first = applyVoxelEditJournal(base, journal);
  const second = applyVoxelEditJournal(base, journal);
  assert.deepEqual(first.delta.editIds, ["mine-1", "sink-1", "volcano-1"]);
  assert.equal(first.delta.collapseEvents.length, 1);
  assert.deepEqual(Array.from(first.chunk.density), Array.from(second.chunk.density));
  assert.deepEqual(Array.from(first.chunk.materials), Array.from(second.chunk.materials));
  assert.ok(materialSet(first.chunk).has(VoxelMaterial.Lava));
});

test("voxel surface meshes and wavefront adapters preserve voxel metadata", () => {
  const key = { seed: 456, cx: 0, cy: 0, cz: 0 };
  const chunk = materializeVoxelChunk({ key, spec: smallSpec, climate: "temperate" });
  const mesh = buildVoxelSurfaceMesh(chunk);

  assert.equal(mesh.algorithm, "surface-nets");
  assert.equal(mesh.positions.length % 3, 0);
  assert.equal(mesh.normals.length, mesh.positions.length);
  assert.equal(mesh.indices.length % 3, 0);
  assert.ok(mesh.materialIds.length > 0);
  assert.ok(
    mesh.positions.some((value) => Math.abs(value - Math.round(value)) > 1e-3),
    "surface-net render mesh should preserve fractional slope vertices"
  );
  let hasAngledNormal = false;
  for (let index = 0; index < mesh.normals.length; index += 3) {
    const ny = Math.abs(mesh.normals[index + 1]);
    assert.ok(
      Math.abs(Math.hypot(mesh.normals[index], mesh.normals[index + 1], mesh.normals[index + 2]) - 1) <
        1e-6
    );
    if (ny > 1e-3 && ny < 0.98) {
      hasAngledNormal = true;
    }
  }
  assert.equal(hasAngledNormal, true, "surface-net render mesh should include angled slope normals");

  const representation = createWorldGeneratorRepresentationPlan({
    chunkId: "voxel-test",
    profile: "streaming",
  }).representations.find((entry) => entry.output === "liveGeometry");
  const adapter = createWorldGeneratorWavefrontSceneSourceAdapter({
    representation,
    mesh: {
      materialIds: mesh.materialIds,
      positions: mesh.positions,
      normals: mesh.normals,
      indices: mesh.indices,
      voxelSource: {
        enabled: true,
        chunkKeys: [key],
        materialPaletteId: "world.voxel.v1",
        decorationLayerIds: ["decorations.voxel-test"],
        dirtyRegion: mesh.dirtyRegion,
      },
    },
  });

  assert.equal(adapter.mesh.coordinateConvention.groundPlane, "xz");
  assert.equal(adapter.mesh.coordinateConvention.upAxis, "y");
  assert.equal(adapter.mesh.voxelSource.enabled, true);
  assert.deepEqual(adapter.mesh.voxelSource.chunkKeys, [key]);
  assert.equal(adapter.mesh.voxelSource.materialPaletteId, "world.voxel.v1");
});

test("voxel render surfaces keep terrain and fluids separated", () => {
  const key = { seed: 2027, cx: 0, cy: 0, cz: 0 };
  const base = materializeVoxelChunk({ key, spec: smallSpec, climate: "freshwater" });
  const journal = createVoxelEditJournal(key, [
    {
      id: "water-source",
      kind: "addMaterialBrush",
      material: VoxelMaterial.Water,
      density: 0.2,
      brush: { center: [6, 7, 6], radius: 3, strength: 1 },
    },
    {
      id: "lava-source",
      kind: "addMaterialBrush",
      material: VoxelMaterial.Lava,
      density: 0.2,
      brush: { center: [8, 5, 8], radius: 2.5, strength: 1 },
    },
  ]);
  const edited = applyVoxelEditJournal(base, journal).chunk;
  const surfaces = buildVoxelRenderSurfaces(edited, { journals: [journal], maxInstances: 64 });
  const liquidMaterials = new Set([VoxelMaterial.Water, VoxelMaterial.Lava, VoxelMaterial.Sludge]);

  assert.ok(surfaces.terrain.indices.length > 0);
  assert.ok(
    surfaces.terrain.vertexMaterials.every((material) => !liquidMaterials.has(material)),
    "solid terrain mesh must not use fluid material ids"
  );
  assert.ok(surfaces.fluids.some((surface) => surface.material === "water" && surface.indices.length > 0));
  assert.ok(surfaces.fluids.some((surface) => surface.material === "lava" && surface.indices.length > 0));
  assert.equal(surfaces.materialPalette.fluidMaterialIds.water, "fluid.water");
  assert.ok(surfaces.decorations.instances.length <= 64);
});

test("voxel fluid boundary fields match solid non-liquid voxels", () => {
  const key = { seed: 818, cx: 0, cy: 0, cz: 0 };
  const chunk = materializeVoxelChunk({ key, spec: smallSpec, climate: "coastal" });
  const boundary = buildVoxelFluidBoundaryField(chunk);
  const liquids = new Set([VoxelMaterial.Water, VoxelMaterial.Lava, VoxelMaterial.Sludge]);

  assert.equal(boundary.owner, "fluid");
  assert.equal(boundary.sizeX, chunk.spec.sizeX);
  assert.equal(boundary.solid.length, chunk.materials.length);
  for (let index = 0; index < chunk.materials.length; index += 1) {
    const material = chunk.materials[index];
    const expected =
      material !== VoxelMaterial.Air && !liquids.has(material) && chunk.density[index] >= 0 ? 1 : 0;
    assert.equal(boundary.solid[index], expected);
  }
});

test("voxel fluid simulation inputs include edit sources and halo dirty chunks", () => {
  const key = { seed: 909, cx: 0, cy: 0, cz: 0 };
  const chunk = materializeVoxelChunk({ key, spec: smallSpec, climate: "volcanic" });
  const journal = createVoxelEditJournal(key, [
    {
      id: "boundary-mine",
      kind: "subtractBrush",
      brush: { center: [11.7, 6, 6], radius: 1.5, strength: 1 },
    },
    {
      id: "volcano",
      kind: "volcanicDeposit",
      brush: { center: [6, 5, 6], radius: 2.5, strength: 1 },
      heat: 1,
    },
    {
      id: "sinkhole",
      kind: "collapseSinkhole",
      brush: { center: [6, 8, 6], radius: 2.5, strength: 1 },
      collapseDepth: 4,
    },
  ]);

  const inputs = createVoxelFluidSimulationInputs(chunk, { journals: [journal] });

  assert.ok(inputs.fluidVolumes.some((volume) => volume.material === "water"));
  assert.ok(inputs.sourceSinks.some((source) => source.material === "lava" && source.kind === "source"));
  assert.ok(inputs.sourceSinks.some((source) => source.material === "water" && source.kind === "sink"));
  assert.ok(inputs.dirtyChunkKeys.some((dirty) => dirty.cx === 1));
});

test("voxel material palette excludes fluid materials from terrain profiles", () => {
  const palette = createVoxelMaterialPalette();
  const terrainMaterials = new Set(palette.terrainMaterials.map((entry) => entry.material));

  assert.equal(palette.id, "world.voxel.v1");
  assert.equal(terrainMaterials.has(VoxelMaterial.Water), false);
  assert.equal(terrainMaterials.has(VoxelMaterial.Lava), false);
  assert.equal(terrainMaterials.has(VoxelMaterial.Sludge), false);
  assert.ok(terrainMaterials.has(VoxelMaterial.Grass));
  assert.ok(terrainMaterials.has(VoxelMaterial.Rock));
});

test("voxel meshing fields share exact boundary lattice samples across adjacent chunks", () => {
  const spec = Object.freeze({ sizeX: 10, sizeY: 10, sizeZ: 10, voxelSize: 1 });
  const left = materializeVoxelChunk({ key: { seed: 2026, cx: 0, cy: 0, cz: 0 }, spec, climate: "temperate" });
  const right = materializeVoxelChunk({ key: { seed: 2026, cx: 1, cy: 0, cz: 0 }, spec, climate: "temperate" });
  const leftField = materializeVoxelMeshingField({ chunk: left });
  const rightField = materializeVoxelMeshingField({ chunk: right });
  const leftX = leftField.halo + spec.sizeX;
  const rightX = rightField.halo;

  for (let y = 0; y <= spec.sizeY; y += 1) {
    for (let z = 0; z <= spec.sizeZ; z += 1) {
      const leftIndex = fieldIndex(leftField, leftX, y + leftField.halo, z + leftField.halo);
      const rightIndex = fieldIndex(rightField, rightX, y + rightField.halo, z + rightField.halo);
      assert.equal(leftField.density[leftIndex], rightField.density[rightIndex]);
      assert.equal(leftField.materials[leftIndex], rightField.materials[rightIndex]);
    }
  }
});

test("voxel surface meshes use halo fields for stitchable boundary geometry", () => {
  const spec = Object.freeze({ sizeX: 18, sizeY: 32, sizeZ: 18, voxelSize: 1 });
  for (const climate of ["temperate", "alpine", "volcanic", "coastal", "underground"]) {
    const left = materializeVoxelChunk({ key: { seed: 4040, cx: 0, cy: 0, cz: 0 }, spec, climate });
    const right = materializeVoxelChunk({ key: { seed: 4040, cx: 1, cy: 0, cz: 0 }, spec, climate });
    const leftMesh = buildVoxelSurfaceMeshFromField(materializeVoxelMeshingField({ chunk: left }));
    const rightMesh = buildVoxelSurfaceMeshFromField(materializeVoxelMeshingField({ chunk: right }));
    assert.ok(leftMesh.positions.length > 0, `${climate} left mesh should not be empty`);
    assert.ok(rightMesh.positions.length > 0, `${climate} right mesh should not be empty`);

    const seamX = left.bounds.max[0];
    const leftBoundary = boundaryVertices(leftMesh, "x", seamX);
    const rightBoundary = boundaryVertices(rightMesh, "x", seamX);
    if (leftBoundary.length === 0 || rightBoundary.length === 0) continue;

    const rightKeys = new Set(rightBoundary.map((point) => `${point[1].toFixed(5)}:${point[2].toFixed(5)}`));
    assert.ok(
      leftBoundary.every((point) => rightKeys.has(`${point[1].toFixed(5)}:${point[2].toFixed(5)}`)),
      `${climate} seam vertices should align across the shared X boundary`
    );
  }
});

test("voxel edit journals split owned chunks and dirty halo neighbors separately", () => {
  const key = { seed: 5150, cx: 0, cy: 0, cz: 0 };
  const journal = createVoxelEditJournal(key, [
    {
      id: "edge-mine",
      kind: "subtractBrush",
      brush: { center: [31.8, 8, 8], radius: 0.15, strength: 1 },
    },
  ]);
  const split = splitVoxelEditJournalByChunk(journal, { sizeX: 32, sizeY: 32, sizeZ: 32, voxelSize: 1 });
  const dirty = getVoxelEditDirtyChunkKeys(
    key,
    { sizeX: 32, sizeY: 32, sizeZ: 32, voxelSize: 1 },
    journal.edits,
    1
  );

  assert.deepEqual(
    split.map((entry) => [entry.chunkKey.cx, entry.chunkKey.cy, entry.chunkKey.cz]),
    [[0, 0, 0]]
  );
  assert.ok(
    dirty.chunkKeys.some((entry) => entry.cx === 1 && entry.cy === 0 && entry.cz === 0),
    "halo dirty keys should include the adjacent +X chunk"
  );
});

test("edited boundary meshing replays journals into adjacent lattice halos", () => {
  const spec = Object.freeze({ sizeX: 16, sizeY: 16, sizeZ: 16, voxelSize: 1 });
  const key = { seed: 6161, cx: 0, cy: 0, cz: 0 };
  const left = materializeVoxelChunk({ key, spec, climate: "temperate" });
  const right = materializeVoxelChunk({ key: { seed: 6161, cx: 1, cy: 0, cz: 0 }, spec, climate: "temperate" });
  const journal = createVoxelEditJournal(key, [
    {
      id: "boundary-cut",
      kind: "subtractBrush",
      brush: { center: [16, 9, 8], radius: 2.4, strength: 1 },
    },
  ]);
  const leftField = materializeVoxelMeshingField({ chunk: left, journals: [journal] });
  const rightField = materializeVoxelMeshingField({ chunk: right, journals: [journal] });
  const leftX = leftField.halo + spec.sizeX;
  const rightX = rightField.halo;

  for (let y = 4; y <= 12; y += 1) {
    for (let z = 4; z <= 12; z += 1) {
      const leftIndex = fieldIndex(leftField, leftX, y + leftField.halo, z + leftField.halo);
      const rightIndex = fieldIndex(rightField, rightX, y + rightField.halo, z + rightField.halo);
      assert.equal(leftField.density[leftIndex], rightField.density[rightIndex]);
      assert.equal(leftField.materials[leftIndex], rightField.materials[rightIndex]);
    }
  }
});

test("voxel collision mesh covers exposed solid surfaces without per-voxel gaps", () => {
  const key = { seed: 456, cx: 0, cy: 0, cz: 0 };
  const chunk = materializeVoxelChunk({ key, spec: smallSpec, climate: "temperate" });
  const collider = buildVoxelCollisionMesh(chunk);
  const upwardFaces = new Set();

  assert.equal(collider.algorithm, "voxel-block-collider");
  assert.ok(collider.solidVoxelCount > 0);
  assert.ok(collider.exposedFaceCount > 0);
  assert.equal(collider.positions.length % 12, 0);
  assert.equal(collider.normals.length, collider.positions.length);
  assert.equal(collider.indices.length, collider.exposedFaceCount * 6);

  for (let offset = 0; offset < collider.positions.length; offset += 12) {
    const nx = collider.normals[offset];
    const ny = collider.normals[offset + 1];
    const nz = collider.normals[offset + 2];
    if (nx !== 0 || ny !== 1 || nz !== 0) continue;
    const xs = [
      collider.positions[offset],
      collider.positions[offset + 3],
      collider.positions[offset + 6],
      collider.positions[offset + 9],
    ];
    const ys = [
      collider.positions[offset + 1],
      collider.positions[offset + 4],
      collider.positions[offset + 7],
      collider.positions[offset + 10],
    ];
    const zs = [
      collider.positions[offset + 2],
      collider.positions[offset + 5],
      collider.positions[offset + 8],
      collider.positions[offset + 11],
    ];
    upwardFaces.add(`${Math.min(...xs)},${ys[0]},${Math.min(...zs)}`);
    assert.equal(new Set(ys).size, 1, "upward collider face should be planar");
  }

  for (let y = 0; y < chunk.spec.sizeY; y += 1) {
    for (let z = 0; z < chunk.spec.sizeZ; z += 1) {
      for (let x = 0; x < chunk.spec.sizeX; x += 1) {
        const index = x + chunk.spec.sizeX * (z + chunk.spec.sizeZ * y);
        const material = chunk.materials[index];
        const above =
          y + 1 < chunk.spec.sizeY
            ? chunk.materials[x + chunk.spec.sizeX * (z + chunk.spec.sizeZ * (y + 1))]
            : VoxelMaterial.Air;
        if (
          material === VoxelMaterial.Air ||
          material === VoxelMaterial.Water ||
          material === VoxelMaterial.Lava ||
          chunk.density[index] < 0 ||
          above !== VoxelMaterial.Air
        ) {
          continue;
        }
        assert.ok(upwardFaces.has(`${x},${y + 1},${z}`), `missing upward collider face at ${x},${y + 1},${z}`);
      }
    }
  }
});

test("voxel collision mesh suppresses internal faces when solid neighbors are loaded", () => {
  const spec = Object.freeze({ sizeX: 12, sizeY: 12, sizeZ: 12, voxelSize: 1 });
  const left = materializeVoxelChunk({ key: { seed: 7171, cx: 0, cy: 0, cz: 0 }, spec, climate: "underground" });
  const right = materializeVoxelChunk({ key: { seed: 7171, cx: 1, cy: 0, cz: 0 }, spec, climate: "underground" });
  const openCollider = buildVoxelCollisionMesh(left);
  const stitchedCollider = buildVoxelCollisionMesh(left, {
    neighborhood: {
      center: left,
      neighbors: [right],
    },
  });

  assert.ok(stitchedCollider.exposedFaceCount <= openCollider.exposedFaceCount);
});
