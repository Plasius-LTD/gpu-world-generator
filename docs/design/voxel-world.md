# Voxel World Design

`@plasius/gpu-world-generator` now exposes a voxel-first path for game-ready
terrain. The base world is deterministic from `(seed, chunk key, climate,
spec)`, and runtime changes are stored as edit journals.

## Contract

- Coordinate convention: XZ ground plane, +Y up.
- Default chunk: `32x32x32`, `1m` voxels.
- Density: signed scalar field, where `density >= 0` is solid.
- Materials: numeric ids for air, soil, grass, leaf litter, roots, rock,
  gravel, sand, clay, mud, moss, water, ice, snowpack, basalt, ash, lava,
  crystal, sludge, cobble, road, and ore.
- Authoritative API: `materializeVoxelChunk(...)`.
- Chunk ownership: chunks own voxel cells, while render meshing samples a
  shared lattice with a one-voxel halo. Adjacent chunks must produce identical
  lattice density/material values for the same world-space boundary coordinate.

## Derived Outputs

- `applyVoxelEditJournal(...)` replays mining, sinkhole, material, and volcanic
  edits over the deterministic base chunk.
- `materializeVoxelMeshingField(...)` emits the halo lattice used for
  stitchable meshing.
- `buildVoxelSurfaceMesh(...)` emits renderer-ready XZ/+Y mesh data from the
  halo lattice. It does not rely on skirts, filler strips, or forced seam
  geometry. Liquid voxel materials are excluded by default so the solid terrain
  mesh is not used to render water, lava, or sludge.
- `buildVoxelCollisionMesh(...)` emits block-accurate exterior faces from
  contiguous solid voxels for physics and placement queries. This is the
  gameplay collider path; surface-net smoothing is visual and should not be the
  only support surface for rigid bodies.
- `buildVoxelFluidBoundaryField(...)` emits solid non-liquid voxel boundaries
  for `@plasius/gpu-fluid`.
- `createVoxelFluidSimulationInputs(...)` emits fluid volume buffers,
  source/sink edits, boundary metadata, and dirty chunk keys for water, lava,
  and sludge simulation.
- `buildVoxelRenderSurfaces(...)` returns separate terrain, fluid, overlay, and
  decoration surfaces. Fluid surfaces are simulation/render payloads, not solid
  terrain triangle materials.
- `createVoxelMaterialPalette(...)` exposes PBR-style terrain material profiles
  and fluid material ids that map to `@plasius/gpu-fluid` fluid render
  descriptors.
- `getVoxelEditDirtyChunkKeys(...)` expands edit bounds by the halo distance so
  runtime tools rebuild chunks that changed directly and chunks whose boundary
  mesh/collider depends on changed samples.
- `generateWorldDecorations(...)` emits world and decorative instances from
  climate/material rules.
- Wavefront scene-source adapters preserve voxel chunk keys, dirty regions,
  material palette ids, decoration layer ids, and the coordinate convention.

## Climate Coverage

The voxel path covers polar, cold temperate, temperate, arid, tropical, alpine,
volcanic, freshwater, coastal, urban, and underground climates. Each climate
owns surface materials, subsurface materials, liquid materials, and decorative
families.

## Persistence Model

Persist seed + chunk key + climate/spec + ordered edit journal for runtime
world state. Persist full voxel chunks only for bake/export workflows.
