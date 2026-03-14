# Worker Manifest Integration

## Overview

`@plasius/gpu-world-generator` now publishes chunk/voxel generation as a
multi-root DAG so shared scheduling and performance packages can reason about
world generation explicitly.

## Streaming Profile

- roots:
  `fractalPrepass`, `fieldSynthesis`
- join:
  `terrainSynthesis`
- branches after terrain:
  `voxelMaterialize`, `tileBake`
- final runtime visual stage:
  `meshBuild`

This profile models the latency-sensitive path used while streaming terrain
around the active camera or player.

## Bake Profile

The bake profile reuses the same early stages and extends the tail with:

- `assetSerialize`

This represents offline or background generation where asset persistence is part
of the pipeline.

## Authority Boundaries

- `fractalPrepass`, `fieldSynthesis`, `terrainSynthesis`
  authoritative, fixed budgets
- `voxelMaterialize`, `tileBake`
  non-authoritative, degradable
- `meshBuild`
  visual, degradable

This keeps core terrain correctness stable while allowing runtime pressure
control to trim mesh and auxiliary output cost first.
