import assert from "node:assert/strict";
import test from "node:test";
import {
  createWorldGeneratorRepresentationPlan,
  worldGeneratorRepresentationBands,
} from "../dist/index.js";

test("world-generator representation plans publish explicit near, mid, far, and horizon tiers", () => {
  const plan = createWorldGeneratorRepresentationPlan({
    chunkId: "hex-12-9",
  });

  assert.deepEqual(worldGeneratorRepresentationBands, [
    "near",
    "mid",
    "far",
    "horizon",
  ]);
  assert.deepEqual(plan.bands, ["near", "mid", "far", "horizon"]);
  assert.equal(
    plan.representations.some(
      (representation) =>
        representation.band === "near" &&
        representation.output === "liveGeometry"
    ),
    true
  );
  assert.equal(
    plan.representations.some(
      (representation) =>
        representation.band === "horizon" &&
        representation.output === "horizonShell"
    ),
    true
  );
});

test("world-generator plans distinguish raster-facing and RT proxy outputs", () => {
  const plan = createWorldGeneratorRepresentationPlan({
    chunkId: "hex-13-4",
    profile: "streaming",
  });

  const midLive = plan.representations.find(
    (representation) =>
      representation.band === "mid" &&
      representation.output === "simplifiedGeometry"
  );
  const midRtProxy = plan.representations.find(
    (representation) =>
      representation.band === "mid" &&
      representation.output === "rtProxy"
  );

  assert.equal(midLive.rasterMode, "simplified-live");
  assert.equal(midLive.rtParticipation, "selective");
  assert.equal(midRtProxy.rasterMode, "not-rendered");
  assert.equal(midRtProxy.rtParticipation, "proxy");
  assert.notEqual(midLive.id, midRtProxy.id);
});

test("world-generator plans declare refresh cadence and shadow relevance for distant outputs", () => {
  const plan = createWorldGeneratorRepresentationPlan({
    chunkId: "hex-18-1",
    profile: "bake",
  });

  const far = plan.representations.find(
    (representation) => representation.band === "far"
  );
  const horizon = plan.representations.find(
    (representation) => representation.band === "horizon"
  );

  assert.deepEqual(far.refreshCadence, { kind: "interval", divisor: 8 });
  assert.equal(far.shadowRelevance, "proxy-caster");
  assert.deepEqual(horizon.refreshCadence, { kind: "interval", divisor: 60 });
  assert.equal(horizon.shadowRelevance, "baked-impression");
});

test("world-generator plans preserve chunk identity through merged and horizon outputs", () => {
  const plan = createWorldGeneratorRepresentationPlan({
    chunkId: "hex-21-3",
    profile: "bake",
  });

  const far = plan.representations.find(
    (representation) => representation.band === "far"
  );
  const horizon = plan.representations.find(
    (representation) => representation.band === "horizon"
  );

  assert.equal(far.preservesChunkIdentity, true);
  assert.deepEqual(far.sourceChunkIds, ["hex-21-3"]);
  assert.equal(horizon.preservesChunkIdentity, true);
  assert.deepEqual(horizon.sourceChunkIds, ["hex-21-3"]);
  assert.deepEqual(far.sourceJobKeys, ["meshBuild", "tileBake", "assetSerialize"]);
});

test("world-generator plans expose renderer and worker scheduling metadata", () => {
  const plan = createWorldGeneratorRepresentationPlan({
    chunkId: "hex-3-8",
    gameplayImportance: "critical",
  });

  const near = plan.representations.find(
    (representation) => representation.band === "near"
  );
  const far = plan.representations.find(
    (representation) => representation.band === "far"
  );

  assert.equal(near.scheduling.owner, "renderer");
  assert.equal(near.scheduling.queueClass, "voxel");
  assert.equal(near.scheduling.gameplayImportance, "critical");
  assert.ok(near.scheduling.priorityHint > far.scheduling.priorityHint);
});
