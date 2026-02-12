# ADR-0003: Terrain Generation Style Mixing (Shader-Based)

- **Status**: Accepted
- **Date**: 2026-02-04

## Context
The current terrain outputs are too flat and homogeneous. We need a more dramatic and unusual surface with stronger height variation, terraces, cratered basins, and sharper ridges. The height variation should be produced by the shader generators themselves (WGSL) so that prepass and LOD sampling stay deterministic and consistent.

## Decision
Adopt a shader-based, mixed-style height pipeline with signed heights:
- **Macro style map**: A low-frequency fractal map selects between two terrain styles per region.
- **Style A (earth-like dramatic)**: ridged multifractal with broad ranges and smoother slopes.
- **Style B (surreal)**: terracing + crater basins with sharper ridge boosts.
- **Signed heights**: heights are allowed to go below 0 and above 1 internally; a clamped `height01` is used for biome/heat/moisture/water.
- **Shader-first**: the WGSL field generators and fractal prepass compute the final height variation, not CPU post-processing.

## Consequences
- Terrain outputs are more varied and less uniform, with large-scale regions that differ in style.
- Terrain height values can be negative or greater than 1; consumers must clamp if needed.
- Terrain params expand to include macro/style/terrace/crater controls.
- CPU fallbacks must mirror the shader logic to stay consistent.
