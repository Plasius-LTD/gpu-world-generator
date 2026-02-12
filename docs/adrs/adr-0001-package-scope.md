# ADR-0001: GPU World Generator Package Scope

- **Status**: Accepted
- **Date**: 2026-02-02

## Context
We need a dedicated package to pre-generate hierarchical hex-grid terrain on the GPU. The generator must support multi-level zones (1000 km² down to ~10 m²) and emit height/heat/moisture + biome classifications for runtime streaming. It should integrate cleanly with `@plasius/gpu-worker` to run WGSL jobs.

## Decision
Create `@plasius/gpu-world-generator` as a standalone package that ships:
- A WGSL job (`terrain.wgsl`) compatible with `@plasius/gpu-worker`.
- TypeScript utilities for hex grid generation and buffer packing.
- Biome id mappings and plan documentation.

## Consequences
- We can iterate on terrain synthesis independently of rendering and HUD work.
- Future shader jobs (rivers, roads, foliage) can live in the same package.
- Consumers should load WGSL via `?raw` for bundlers or `loadTerrainWgsl` for direct fetch.
