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

## Persistent Zoned Atlas

The versioned world-atlas API describes finite, persistent worlds independently
from their local voxel materialization. The shipped `origin-shard` contract is a
100 × 50 km atlas with east–west wrapping and logical polar boundaries:

- 5,000 immutable 1 km tiles;
- 500,000 aligned 100 m macro zones;
- 50,000,000 logical 10 m local zones, generated only when requested; and
- 32 m vertical slabs across the fixed −1,024 m to +2,560 m domain.

`createWorldAtlasBakePlan(...)` and `bakeWorldAtlas(...)` deterministically
derive the overview, climate, hydrology, geology, biome/flora profiles, and
content-addressed tile binaries. `decodeWorldTile(...)` validates an untrusted
tile, including nested model transforms, bounds, and LOD hints, and can verify
its SHA-256 content hash. Address helpers use half-open
bounds so each point has one owner; X wraps modulo 100,000 m and Z clamps to the
logical polar interval.

Macro hydrology persists drainage role and Strahler order alongside explicit
riverbed gravel, floodplain silt/clay, alluvial thickness, bedrock, soil,
sediment, water-surface height, water-table, and aquifer fields. Local
materialization therefore samples geological river support rather than
repainting a generic surface.

```js
import {
  bakeWorldAtlas,
  createWorldAtlasBakePlan,
  decodeWorldTile,
  getWorldEditDirtyAddresses,
} from "@plasius/gpu-world-generator";

const plan = createWorldAtlasBakePlan();
const result = await bakeWorldAtlas(plan, {
  tileKeys: [{ tx: 0, tz: 0 }],
  writeTile: async ({ binary, contentHash }) => {
    const verified = await decodeWorldTile(binary, { expectedContentHash: contentHash });
    console.log(verified.key);
  },
});

const dirty = getWorldEditDirtyAddresses({
  schemaVersion: 1,
  id: "paint-across-seam",
  worldId: "origin-shard",
  atlasRevision: plan.atlasRevision,
  operations: [{
    kind: "materialPaint",
    center: [99_999, 1, 15],
    radiusM: 6,
    materialId: 4,
  }],
});
```

`WorldSpatialModelInstanceV1` uses canonical model references from
`@plasius/asset-contracts`; consumers must not invent package-local model
identities. Atlas density edits also expose mass-closure validation so a shared
mutable edit log can preserve the accepted world/ledger conservation rule.
Dirty-address derivation includes the one-metre local sampling halo, including
wrapped seam neighbours, so cached meshes cannot retain stale boundary samples.

### Zoned Streaming and Residency

`planWorldView(...)` applies the fixed 0.5 m, 1 m, 5 m, 25 m, and 100 m
representation ladder with 20% transition hysteresis. Plans include coarse
fallbacks, stable work keys, obsolete-work cancellation, every required owner
tile, and one horizontal velocity-directed prefetch tile. The published low,
standard, and high budgets cap CPU/GPU residency at 128/192 MiB, 256/384 MiB,
and 512/768 MiB with two, four, and eight generation jobs respectively.

`materializeWorldLocalZone(...)` reconstructs only a 32 m slab that intersects
surface, fluid, or a local edit envelope. Its 0.5 m and 1 m outputs call the same
world-space density/material sampler, replay ordered edits, consume persisted
geology, and reconstruct stable flora instances from profile seeds plus
canonical model references. `assembleWorldZoneGeometry(...)` loads the sampling
halo and spatial-model owners, deduplicates stable model ids, and emits terrain,
fluid, and model clip planes against the destination zone. Each clipped model
retains its canonical asset identity while exposing a wrapped render transform
and bounds for destinations across the east-west seam.

```js
import {
  WORLD_RESIDENCY_BUDGETS,
  assembleWorldZoneGeometry,
  materializeWorldLocalZone,
  planWorldView,
} from "@plasius/gpu-world-generator";

const view = planWorldView({
  worldId: "origin-shard",
  atlasRevision: "origin-shard-2026-07-v1",
  editRevision: 12,
  viewpoint: { x: 99_995, y: 24, z: 25_000 },
  velocity: { x: 8, z: 0 },
  budget: WORLD_RESIDENCY_BUDGETS.standard,
});

const chunk = materializeWorldLocalZone({
  key: view.localChunks[0],
  tiles: decodedOwnerTiles,
  edits: orderedTileEdits,
});

const mesh = assembleWorldZoneGeometry({
  destination: view.localChunks[0].localZone.zone,
  tiles: decodedOwnerTiles,
  metresPerCell: 5,
});
```

`WorldResourceResidencyManager` accounts caller-owned CPU/GPU resources,
enforces concurrent-generation limits, respects pins and references, evicts in
the documented far-to-model order, and invokes every disposal callback at most
once. Admission rejects resources that cannot coexist with protected residents
before evicting any valid cache entry.

The package's hex zoning helpers remain supported as a legacy LOD and terrain
facility. Hex cells are not persistent world addresses and do not replace the
tile/zone/local-zone hierarchy above.

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

<!-- BEGIN PLASIUS RELEASE INTEGRITY -->
## Release integrity

CI keeps the administrative contributor registry outside Git and npm package
artifacts using exact, case-normalised path checks. CI runs on approved
GitHub-hosted runners for same-repository pull requests and `main`, with
package-manager cache finalization disabled; fork PR code is denied.
Publication uses the GitHub-hosted `production` job with Node 24 and a pinned
npm 11.6.2 client. It is token-free and proceeds only while the prepared SHA
is the exact `main` head after successful push-triggered CI. Do not dispatch CD
until the npm trusted-publisher binding is verified.
<!-- END PLASIUS RELEASE INTEGRITY -->
