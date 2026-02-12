# @plasius/gpu-world-generator

GPU-assisted world generation focused on hex-grid terrain synthesis. This package targets pre-generation of terrain height/heat/biome layers using WebGPU compute jobs (compatible with `@plasius/gpu-worker`).

## Goals
- Hierarchical hex grid (1000 km² regional zones down to ~10 m² tiles).
- 3D heat-map based terrain synthesis (height = depth, heat = biome driver).
- Extensible biome classification (tundra, savanna, river, city, village, ice, snow, mountainous, volcanic, road, town, castle, etc).
- Shader-first pipeline with CPU fallback helpers.

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

## Demo
The WebGPU mixed-forest demo lives in `demo/`. Run it with:

```
cd demo
npm install
npm run dev
```

## Notes
- For Vite/Pnpm setups, raw WGSL import is the most reliable.
- See `docs/plan.md` for hierarchy and biome rules.
