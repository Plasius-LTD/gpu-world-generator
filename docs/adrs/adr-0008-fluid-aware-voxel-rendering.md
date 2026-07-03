# ADR-0008: Fluid-Aware Voxel Rendering

## Status

Accepted

## Context

Voxel worlds need water, lava, and sludge placement for climates, caves,
sinkholes, mining, and volcanic edits. Rendering those liquid materials as
ordinary solid terrain surface colors creates unrealistic output such as blue
mountains and lava-painted cliffs. It also hides the fact that fluids should
react to terrain edits and boundaries through a simulation package.

## Decision

`@plasius/gpu-world-generator` keeps voxel chunks as the authoritative world
source, but separates solid terrain rendering from fluid simulation/rendering.
Surface-net terrain meshing excludes liquid materials by default. Fluid
materials are converted into `@plasius/gpu-fluid`-compatible volume inputs,
source/sink edits, boundary fields, dirty chunk keys, and separate fluid render
surface payloads.

`buildVoxelRenderSurfaces(...)` is the preferred render entry point for voxel
worlds because it returns separate `terrain`, `fluids`, `overlays`, and
`decorations` surfaces. `buildVoxelFluidBoundaryField(...)` and
`createVoxelFluidSimulationInputs(...)` provide the simulation-side bridge.

## Consequences

- Solid terrain triangles no longer use water, lava, or sludge material ids by
  default.
- Water, lava, and sludge remain part of biome/material generation, edit
  journals, and persisted voxel state.
- Fluid behavior can be simulated by `@plasius/gpu-fluid` against solid voxel
  boundaries while preserving stitchable terrain meshing.
- Demo and renderer integrations can validate terrain and fluid surfaces
  separately, avoiding color-dominance regressions such as blue mountains.
