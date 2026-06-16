import assert from "node:assert/strict";
import test from "node:test";
import {
  createWorldGeneratorRepresentationPlan,
  createWorldGeneratorWavefrontSceneSourceAdapter,
} from "../dist/index.js";

function getRepresentation(plan, output) {
  return plan.representations.find((representation) => representation.output === output);
}

test("world-generator wavefront scene adapters preserve terrain chunk and material metadata", () => {
  const plan = createWorldGeneratorRepresentationPlan({
    chunkId: "hex-12-9",
    profile: "streaming",
  });
  const representation = getRepresentation(plan, "liveGeometry");

  const adapter = createWorldGeneratorWavefrontSceneSourceAdapter({
    representation,
    mesh: {
      materialIds: ["terrain.grass", "terrain.rock"],
      positions: [-1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1],
      normals: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
      uvs: [0, 0, 1, 0, 1, 1, 0, 1],
      indices: [0, 1, 2, 0, 2, 3],
    },
  });

  assert.equal(adapter.chunkId, "hex-12-9");
  assert.equal(adapter.mesh.representationBand, "near");
  assert.equal(adapter.mesh.representationOutput, "liveGeometry");
  assert.deepEqual(adapter.mesh.materialIds, ["terrain.grass", "terrain.rock"]);
  assert.deepEqual(adapter.mesh.sourceChunkIds, ["hex-12-9"]);
  assert.equal(adapter.mesh.accelerationStructureUpdateClass, "streaming");
  assert.equal(adapter.mesh.derivableUvs.enabled, false);
});

test("world-generator wavefront scene adapters map RT proxy outputs to proxy update semantics", () => {
  const plan = createWorldGeneratorRepresentationPlan({
    chunkId: "hex-13-4",
    profile: "streaming",
  });
  const representation = getRepresentation(plan, "rtProxy");

  const adapter = createWorldGeneratorWavefrontSceneSourceAdapter({
    representation,
    mesh: {
      materialIds: ["terrain.proxy.mid"],
      positions: [-1, 0, 0, 1, 0, 0, 0, 1, 0],
      derivableUvs: {
        projection: "triplanar",
        scale: [4, 4],
      },
      indices: [0, 1, 2],
    },
  });

  assert.equal(adapter.mesh.representationBand, "mid");
  assert.equal(adapter.mesh.rtParticipation, "proxy");
  assert.equal(adapter.mesh.shadowRelevance, "selective-raster");
  assert.equal(adapter.mesh.accelerationStructureUpdateClass, "proxy");
  assert.deepEqual(adapter.mesh.derivableUvs, {
    enabled: true,
    projection: "triplanar",
    scale: [4, 4],
  });
});

test("world-generator wavefront scene adapters keep far merged-proxy cadence and source jobs", () => {
  const plan = createWorldGeneratorRepresentationPlan({
    chunkId: "hex-18-1",
    profile: "bake",
  });
  const representation = getRepresentation(plan, "mergedProxy");

  const adapter = createWorldGeneratorWavefrontSceneSourceAdapter({
    representation,
    mesh: {
      materialIds: ["terrain.proxy.far"],
      positions: [-2, 0, -2, 2, 0, -2, 0, 0, 2],
      indices: [0, 1, 2],
    },
  });

  assert.equal(adapter.mesh.representationBand, "far");
  assert.deepEqual(adapter.mesh.refreshCadence, { kind: "interval", divisor: 8 });
  assert.equal(adapter.mesh.shadowRelevance, "proxy-caster");
  assert.deepEqual(adapter.mesh.sourceJobKeys, ["meshBuild", "tileBake", "assetSerialize"]);
  assert.equal(adapter.mesh.accelerationStructureUpdateClass, "proxy");
});

test("world-generator wavefront scene adapters preserve horizon-shell disablement", () => {
  const plan = createWorldGeneratorRepresentationPlan({
    chunkId: "hex-21-3",
    profile: "bake",
  });
  const representation = getRepresentation(plan, "horizonShell");

  const adapter = createWorldGeneratorWavefrontSceneSourceAdapter({
    representation,
    mesh: {
      materialIds: ["terrain.skyline"],
      positions: [-4, 0, -4, 4, 0, -4, 0, 0, 4],
      indices: [0, 1, 2],
    },
  });

  assert.equal(adapter.mesh.representationBand, "horizon");
  assert.equal(adapter.mesh.representationOutput, "horizonShell");
  assert.equal(adapter.mesh.rtParticipation, "disabled");
  assert.equal(adapter.mesh.accelerationStructureUpdateClass, "horizon");
  assert.deepEqual(adapter.mesh.refreshCadence, { kind: "interval", divisor: 60 });
});
