import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultWorldGeneratorWorkerProfile,
  getWorldGeneratorWorkerManifest,
  getWorldGeneratorWorkerProfile,
  worldGeneratorDebugOwner,
  worldGeneratorWorkerManifests,
  worldGeneratorWorkerProfileNames,
  worldGeneratorWorkerProfiles,
  worldGeneratorWorkerQueueClass,
} from "../dist/index.js";

test("world-generator worker profiles expose streaming and bake DAGs", () => {
  assert.deepEqual(worldGeneratorWorkerProfileNames, ["streaming", "bake"]);
  assert.equal(defaultWorldGeneratorWorkerProfile, "streaming");
  assert.deepEqual(worldGeneratorWorkerProfiles.streaming, {
    name: "streaming",
    description:
      "Runtime chunk generation DAG for fractal prepass, terrain synthesis, voxel materialization, mesh build, and tile bake.",
    jobs: [
      "fractalPrepass",
      "fieldSynthesis",
      "terrainSynthesis",
      "voxelMaterialize",
      "meshBuild",
      "tileBake",
    ],
  });
  assert.deepEqual(getWorldGeneratorWorkerProfile("bake").jobs, [
    "fractalPrepass",
    "fieldSynthesis",
    "terrainSynthesis",
    "voxelMaterialize",
    "meshBuild",
    "tileBake",
    "assetSerialize",
  ]);
});

test("world-generator worker manifests publish queue, dependencies, and authorities", () => {
  const streaming = getWorldGeneratorWorkerManifest();
  const bake = getWorldGeneratorWorkerManifest("bake");

  assert.equal(streaming, worldGeneratorWorkerManifests.streaming);
  assert.equal(streaming.owner, worldGeneratorDebugOwner);
  assert.equal(streaming.queueClass, worldGeneratorWorkerQueueClass);
  assert.equal(streaming.schedulerMode, "dag");
  assert.deepEqual(
    streaming.jobs.map((job) => ({
      key: job.key,
      priority: job.worker.priority,
      dependencies: job.worker.dependencies,
      authority: job.performance.authority,
    })),
    [
      {
        key: "fractalPrepass",
        priority: 4,
        dependencies: [],
        authority: "authoritative",
      },
      {
        key: "fieldSynthesis",
        priority: 4,
        dependencies: [],
        authority: "authoritative",
      },
      {
        key: "terrainSynthesis",
        priority: 5,
        dependencies: [
          "world-generator.streaming.fractalPrepass",
          "world-generator.streaming.fieldSynthesis",
        ],
        authority: "authoritative",
      },
      {
        key: "voxelMaterialize",
        priority: 3,
        dependencies: ["world-generator.streaming.terrainSynthesis"],
        authority: "non-authoritative-simulation",
      },
      {
        key: "meshBuild",
        priority: 2,
        dependencies: [
          "world-generator.streaming.terrainSynthesis",
          "world-generator.streaming.voxelMaterialize",
        ],
        authority: "visual",
      },
      {
        key: "tileBake",
        priority: 2,
        dependencies: ["world-generator.streaming.terrainSynthesis"],
        authority: "non-authoritative-simulation",
      },
    ]
  );
  assert.deepEqual(
    streaming.jobs.find((job) => job.key === "meshBuild").performance.levels.map(
      (level) => level.id
    ),
    ["low", "medium", "high"]
  );

  assert.deepEqual(
    bake.jobs.map((job) => ({
      key: job.key,
      dependencies: job.worker.dependencies,
    })),
    [
      { key: "fractalPrepass", dependencies: [] },
      { key: "fieldSynthesis", dependencies: [] },
      {
        key: "terrainSynthesis",
        dependencies: [
          "world-generator.bake.fractalPrepass",
          "world-generator.bake.fieldSynthesis",
        ],
      },
      {
        key: "voxelMaterialize",
        dependencies: ["world-generator.bake.terrainSynthesis"],
      },
      {
        key: "meshBuild",
        dependencies: [
          "world-generator.bake.terrainSynthesis",
          "world-generator.bake.voxelMaterialize",
        ],
      },
      {
        key: "tileBake",
        dependencies: ["world-generator.bake.terrainSynthesis"],
      },
      {
        key: "assetSerialize",
        dependencies: [
          "world-generator.bake.meshBuild",
          "world-generator.bake.tileBake",
        ],
      },
    ]
  );
  assert.deepEqual(
    bake.jobs.find((job) => job.key === "assetSerialize").debug.tags,
    ["world-generator", "bake", "assetSerialize", "custom"]
  );
});

test("world-generator worker helpers reject unknown profile names", () => {
  assert.throws(
    () => getWorldGeneratorWorkerProfile("cinematic"),
    /Unknown world-generator worker profile "cinematic"/
  );
  assert.throws(
    () => getWorldGeneratorWorkerManifest("cinematic"),
    /Unknown world-generator worker profile "cinematic"/
  );
});
