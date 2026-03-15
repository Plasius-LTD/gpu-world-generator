# @plasius/gpu-world-generator

[![npm version](https://img.shields.io/npm/v/@plasius/gpu-world-generator.svg)](https://www.npmjs.com/package/@plasius/gpu-world-generator)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Plasius-LTD/gpu-world-generator/ci.yml?branch=main&label=build&style=flat)](https://github.com/Plasius-LTD/gpu-world-generator/actions/workflows/ci.yml)
[![coverage](https://img.shields.io/codecov/c/github/Plasius-LTD/gpu-world-generator)](https://codecov.io/gh/Plasius-LTD/gpu-world-generator)
[![License](https://img.shields.io/github/license/Plasius-LTD/gpu-world-generator)](./LICENSE)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-yes-blue.svg)](./CODE_OF_CONDUCT.md)
[![Security Policy](https://img.shields.io/badge/security%20policy-yes-orange.svg)](./SECURITY.md)
[![Changelog](https://img.shields.io/badge/changelog-md-blue.svg)](./CHANGELOG.md)

GPU-assisted world generation focused on hex-grid terrain synthesis. This package targets pre-generation of terrain height/heat/biome layers using WebGPU compute jobs (compatible with `@plasius/gpu-worker`).

## Goals
- Hierarchical hex grid (1000 km² regional zones down to ~10 m² tiles).
- 3D heat-map based terrain synthesis (height = depth, heat = biome driver).
- Extensible biome classification (tundra, savanna, river, city, village, ice, snow, mountainous, volcanic, road, town, castle, etc).
- Shader-first pipeline with CPU fallback helpers.

## Layered Fractal Model
Generation now uses three explicit fractal layers:
- Layer 1 (terrain trend): cumulative height banding where `0.0..0.2` is downward slope, `0.2..0.8` is flat, and `0.8..1.0` is upward slope.
- Layer 2 (features/obstacles): dedicated fractal mask for obstacles and prop placement (rocks, boulders, ruins, water ripples, etc).
- Layer 3 (foliage): dedicated fractal mask for vegetation density (trees, bushes, grass tufts, reeds).

`TerrainCell` outputs may include `surface`, `feature`, `obstacle`, `foliage`, and `slopeBand` in addition to `height`, `heat`, `moisture`, and `biome`.

## Install (local)
```
npm install
npm run build
```

## Usage (WGSL)
```js
import {
  assembleWorkerWgsl,
  loadJobWgsl,
} from "@plasius/gpu-worker";
import { terrainWgslUrl, loadTerrainWgsl } from "@plasius/gpu-world-generator";

const jobWgsl = await loadTerrainWgsl();
await loadJobWgsl({ wgsl: jobWgsl, label: "terrain" });
const workerWgsl = await loadWorkerWgsl();
const shaderCode = await assembleWorkerWgsl(workerWgsl, { debug: true });
```

## Usage (Temperate Mixed Forest)
```js
import { generateTemperateMixedForest } from "@plasius/gpu-world-generator";

const { levelSpec, cells, terrain } = generateTemperateMixedForest({
  seed: 1337,
  radius: 6,
});
```

## Usage (raw import with bundlers)
```js
import terrainWgsl from "@plasius/gpu-world-generator/terrain.wgsl?raw";
```

## Worker DAG Manifests

`@plasius/gpu-world-generator` now publishes worker-first generation manifests
so chunk and voxel work can be scheduled as a multi-root DAG instead of a flat
queue.

```js
import { getWorldGeneratorWorkerManifest } from "@plasius/gpu-world-generator";

const streaming = getWorldGeneratorWorkerManifest();
const bake = getWorldGeneratorWorkerManifest("bake");

console.log(streaming.jobs.map((job) => job.worker.jobType));
console.log(bake.jobs.find((job) => job.key === "assetSerialize"));
```

- `streaming` models runtime chunk generation and mesh materialization.
- `bake` extends the DAG with asset serialization for background/offline output.
- Jobs include queue class, priority, dependencies, adaptive budget ladders, and
  debug allocation tags for integration with `@plasius/gpu-performance` and
  `@plasius/gpu-debug`.

## Render Representation Plans

`@plasius/gpu-world-generator` now also publishes explicit chunk
representation-tier plans so renderer and worker packages can coordinate near,
mid, far, and horizon outputs without guessing from distance alone.

```js
import { createWorldGeneratorRepresentationPlan } from "@plasius/gpu-world-generator";

const plan = createWorldGeneratorRepresentationPlan({
  chunkId: "hex-12-9",
  profile: "streaming",
  gameplayImportance: "critical",
});

console.log(plan.bands);
console.log(plan.representations.find((entry) => entry.output === "rtProxy"));
```

Each plan exposes raster-facing and RT-facing outputs separately, plus refresh
cadence, shadow relevance, chunk-identity preservation, and scheduling metadata
that downstream renderer and worker packages can prioritize by band and
importance.

## Demo
The WebGPU mixed-forest demo lives in `demo/`. Run it with:

```
cd demo
npm install
npm run dev
```

## Development Checks

```sh
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run pack:check
```

## Notes
- For Vite/Pnpm setups, raw WGSL import is the most reliable.
- See `docs/plan.md` for hierarchy and biome rules.
- See `docs/design/worker-manifest-integration.md` for the chunk/voxel DAG
  contract.
