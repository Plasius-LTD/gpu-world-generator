# @plasius/gpu-world-generator

[![npm version](https://img.shields.io/npm/v/@plasius/gpu-world-generator.svg)](https://www.npmjs.com/package/@plasius/gpu-world-generator)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Plasius-LTD/gpu-world-generator/ci.yml?branch=main&label=build&style=flat)](https://github.com/Plasius-LTD/gpu-world-generator/actions/workflows/ci.yml)
[![coverage](https://img.shields.io/codecov/c/github/Plasius-LTD/gpu-world-generator)](https://codecov.io/gh/Plasius-LTD/gpu-world-generator)
[![License](https://img.shields.io/github/license/Plasius-LTD/gpu-world-generator)](./LICENSE)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-yes-blue.svg)](./CODE_OF_CONDUCT.md)
[![Security Policy](https://img.shields.io/badge/security%20policy-yes-orange.svg)](./SECURITY.md)
[![Changelog](https://img.shields.io/badge/changelog-md-blue.svg)](./CHANGELOG.md)

GPU-assisted world generation focused on voxel-first terrain, biome synthesis,
and renderer-ready derived outputs. Voxel chunks are the authoritative world
state; heightfields, meshes, proxy outputs, and decorations are derived from
seeded chunks plus edit journals.

## Goals
- Voxel chunks for mining, destruction, caves, overhangs, sinkholes, lava
  deposits, and underground content.
- Full climate coverage across polar, cold temperate, temperate, arid,
  tropical, alpine, volcanic, freshwater, coastal, urban, and underground
  worlds.
- Renderer-ready XZ ground plane / +Y up outputs.
- Decorative and world-affecting instance generation for trees, shrubs, grass,
  water, snow, rocks, crystals, lava cracks, and related biome content.
- Shader-first pipeline with CPU fallback helpers and compatibility exports.

## Voxel World Authority

The preferred API is voxel-first:

```js
import {
  applyVoxelEditJournal,
  buildVoxelCollisionMesh,
  buildVoxelRenderSurfaces,
  buildVoxelSurfaceMesh,
  createVoxelFluidSimulationInputs,
  createVoxelEditJournal,
  generateWorldDecorations,
  getVoxelEditDirtyChunkKeys,
  materializeVoxelChunk,
} from "@plasius/gpu-world-generator";

const chunk = materializeVoxelChunk({
  key: { seed: 20260702, cx: 0, cy: 0, cz: 0 },
  climate: "temperate",
});

const journal = createVoxelEditJournal(chunk.key, [
  {
    id: "mine-entrance",
    kind: "subtractBrush",
    brush: { center: [12, 9, 14], radius: 3 },
  },
]);

const { chunk: editedChunk, delta } = applyVoxelEditJournal(chunk, journal);
const dirtyChunks = getVoxelEditDirtyChunkKeys(chunk.key, chunk.spec, journal.edits);
const mesh = buildVoxelSurfaceMesh(editedChunk, { journals: [journal] });
const collider = buildVoxelCollisionMesh(editedChunk);
const decorations = generateWorldDecorations(editedChunk);
const fluidInputs = createVoxelFluidSimulationInputs(editedChunk, { journals: [journal] });
const renderSurfaces = buildVoxelRenderSurfaces(editedChunk, { journals: [journal] });

console.log(
  mesh.materialIds,
  collider.exposedFaceCount,
  dirtyChunks.chunkKeys.length,
  decorations.instances.length,
  fluidInputs.sourceSinks.length,
  renderSurfaces.fluids.length,
  delta.dirtyMin
);
```

Chunks use signed density, where `density >= 0` is solid. Runtime deformation
is represented by ordered edit journals over deterministic base chunks.
Chunks own voxel cells; render meshing reads a shared lattice with a one-voxel
halo so adjacent chunks sample identical world-space boundary densities instead
of using skirts or filler geometry. `buildVoxelSurfaceMesh(...)` is the smooth
render surface; use `buildVoxelCollisionMesh(...)` for gameplay collision
because it emits shared, axis-aligned exterior faces from solid voxels so rigid
bodies cannot fall through visual spacing between individual samples. Runtime
tools should mark every chunk from `getVoxelEditDirtyChunkKeys(...)` for rebuild
after an edit, including halo-only neighbors.

## Fluid-Aware Rendering

Voxel materials still include water, lava, and sludge so biome rules, edit
journals, and resource layers can describe fluid placement. Rendering keeps
those fluids separate from solid terrain:

- `buildVoxelSurfaceMesh(...)` and `materializeVoxelMeshingField(...)` exclude
  liquid materials by default, so terrain triangles are never painted as water,
  lava, or sludge.
- `buildVoxelFluidBoundaryField(...)` emits solid non-liquid voxel boundaries
  for `@plasius/gpu-fluid`.
- `createVoxelFluidSimulationInputs(...)` emits fluid volume buffers,
  source/sink edits, boundary metadata, and dirty chunk keys for simulation.
- `buildVoxelRenderSurfaces(...)` returns separate `terrain`, `fluids`,
  `overlays`, and `decorations` payloads.
- `createVoxelMaterialPalette(...)` exposes terrain PBR-style material profiles
  and fluid material ids that map to `@plasius/gpu-fluid` water, lava, and
  sludge render materials.

This prevents the “blue mountain” failure mode: water and lava are simulation
surfaces/volumes derived from voxel state, not arbitrary solid terrain colors.

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
- DAG profiles expose `descriptionKey` and `descriptionDefault` alongside the
  existing `description` field. Register `worldGeneratorTranslations` with
  `@plasius/translations` when rendering those descriptions:

```js
import { createI18n } from "@plasius/translations";
import {
  getWorldGeneratorWorkerManifest,
  worldGeneratorTranslations,
} from "@plasius/gpu-world-generator";

const i18n = createI18n({
  language: "en-GB",
  fallback: "en-GB",
  translations: worldGeneratorTranslations,
});
const manifest = getWorldGeneratorWorkerManifest();

console.log(i18n.t(manifest.descriptionKey));
```

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

## Wavefront Scene Source Adapters

`@plasius/gpu-world-generator` also publishes a renderer-facing adapter helper
so terrain and proxy meshes can move into the wavefront path without site-local
contract glue.

```js
import {
  createWorldGeneratorRepresentationPlan,
  createWorldGeneratorWavefrontSceneSourceAdapter,
} from "@plasius/gpu-world-generator";

const plan = createWorldGeneratorRepresentationPlan({
  chunkId: "hex-12-9",
  profile: "streaming",
});
const representation = plan.representations.find(
  (entry) => entry.output === "liveGeometry"
);

const adapter = createWorldGeneratorWavefrontSceneSourceAdapter({
  representation,
  mesh: {
    materialIds: ["terrain.grass", "terrain.rock"],
    positions: [-1, 0, -1, 1, 0, -1, 1, 0, 1],
    indices: [0, 1, 2],
  },
});

console.log(adapter.mesh.representationOutput);
console.log(adapter.mesh.refreshCadence);
```

The adapter preserves representation band, source chunk ids, source job keys,
material ids, RT participation, shadow relevance, and cadence so downstream
renderer packages can map live terrain, RT proxies, merged proxies, and horizon
shells to stable scene-source records.

## Demo
The voxel world demo lives in `demo/`. It renders package-generated climates,
world materials, decorative layers, and deformation tools. Run it with:

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
