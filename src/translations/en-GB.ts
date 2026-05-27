import type { WorldGeneratorWorkerTranslationKey } from "../worker.translations";

export const worldGeneratorEnGbTranslations = {
  "gpuWorldGenerator.worker.profile.streaming.description":
    "Runtime chunk generation DAG for fractal prepass, terrain synthesis, voxel materialization, mesh build, and tile bake.",
  "gpuWorldGenerator.worker.profile.bake.description":
    "Offline tile bake DAG for terrain generation, voxel materialization, mesh build, and asset serialization.",
} as const satisfies Record<WorldGeneratorWorkerTranslationKey, string>;
