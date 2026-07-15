/** Stable public package identity for diagnostics and compatibility checks. */
export const GPU_WORLD_GENERATOR_PACKAGE_NAME =
  "@plasius/gpu-world-generator" as const;

export * from "./types";
export * from "./hex";
export * from "./generator";
export * from "./wgsl";
export * from "./fields";
export * from "./biomes/temperate";
export * from "./perf-monitor";
export * from "./fractal-prepass";
export * from "./tiles";
export * from "./tile-cache";
export * from "./mesh";
export * from "./worker";
export * from "./render-adapter";
export * from "./voxels";
export * from "./world-atlas";
export * from "./world-streaming";
