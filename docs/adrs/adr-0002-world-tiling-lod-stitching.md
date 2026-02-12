# ADR-0002: Tiled World Generation, LOD, and Stitching

- **Status**: Accepted
- **Date**: 2026-02-03

## Context
We need a deterministic way to generate, store, and render large worlds by splitting them into parts that can be streamed and stitched seamlessly. The system must support multi-LOD rendering, keep seams invisible across tiles and LOD boundaries, and enable consistent material/shader assignment per terrain type. We also want the pipeline to work with GPU compute prepasses, allow on-demand generation for an effectively infinite world, and emit baked assets that can be reused or distributed.

## Decision
Adopt a tile-based world pipeline with deterministic sampling and explicit LOD stitching rules:
- **Partitioning**: The world is divided into tiles keyed by `(tx, tz, level, tileSizeWorld)`, each with a world size and grid resolution derived from the LOD level. `tileSizeWorld` is optional and enables sub-division for complex areas (e.g., cities) without changing the global world rules.
- **Shared borders**: Each tile generates a `(gridSize + 1)` vertex lattice so adjacent tiles share identical border samples. A 1–2 cell halo is sampled for normals/filters and discarded after generation.
- **Generation pipeline**: GPU compute prepass produces base height + field maps (heat, moisture, rockiness, water). Material masks and feature placement are derived from those fields. Tiles are generated on demand and can be baked to reusable assets as part of the same pipeline.
- **LOD generation**: Lower LODs are created via deterministic downsampling aligned to parent tiles, then re-classified for materials/features to avoid drift.
- **Stitching**:
  - Same-LOD seams are avoided by shared border samples.
  - Cross-LOD seams use skirts initially, with optional edge-stitch indices and geomorphing for higher fidelity.
- **Shader assignment**: Tiles store material ids or blend weights; shaders are selected by material classification, not per-tile shader variants.
- **Storage**: Tile assets cache heightfields, material masks, features, and LOD mesh buffers for streaming and reuse. Assets are produced from on-demand generation and can be serialized for reuse across sessions or sharing.

## Consequences
- Deterministic sampling enables seamless stitching but requires strict coordinate conventions and halo handling.
- LOD generation becomes a first-class asset pipeline with extra memory and bake time.
- Stitching techniques (skirts/edge-stitch/geomorph) must be maintained alongside mesh builders.
- Tile identity must include `tileSizeWorld` (or equivalent) to avoid mismatched stitching when sub-division is used.
- Infinite-world streaming requires cache eviction and background bake queues to avoid memory growth.
- Material assignment is centralized and data-driven, improving consistency but requiring more per-vertex metadata.
- Supports both offline baking and on-demand generation while keeping the runtime renderer simple.
