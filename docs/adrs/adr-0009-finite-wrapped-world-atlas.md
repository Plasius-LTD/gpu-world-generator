# ADR-0009: Finite Wrapped World Atlas

## Status

- Accepted
- Date: 2026-07-13
- Version: 1.0

## Tags

world, atlas, tiles, hydrology, persistence, compatibility

## Context

The package already owns deterministic voxel fields, terrain/fluid surface
generation, tiled assets, and worker manifests, but its tile keys describe an
unbounded procedural plane. `origin-shard` requires a finite 5,000 km² world
whose base is stable across package versions and whose local detail can be
reconstructed without eagerly persisting fifty million local zones.

The site-level accepted TDR-0020 through TDR-0024 require coordinate-addressed
randomness, hydrology-first terrain, coherent strata, editable voxels, and mass
conservation.

## Decision

Add a versioned, square atlas API alongside the existing unbounded tile and hex
APIs.

- The atlas is 100 × 50 one-kilometre tiles. X wraps and Z terminates at logical
  poles.
- Each tile contains a 10 × 10 grid of 100 m macro zones. Ten-metre local zones
  and voxel slabs are logical addresses materialized on demand.
- An immutable manifest pins generator/schema versions, topology, dimensions,
  seeds, vertical bounds, atlas revision, and content hashes.
- Atlas bake outputs are a one-kilometre overview, a compact tile index, and
  5,000 content-addressed tile binaries.
- Macro fields are deterministic and include elevation, climate, hydrology,
  geology, biome, flora profiles, and stable spatial model references.
- `ModelAssetRef` is consumed from `@plasius/asset-contracts`; this package does
  not define a competing model-identity contract or load model bytes.
- Existing `TileKey`, `VoxelChunkKey`, and hex functions remain supported. They
  are not silently reinterpreted as finite-atlas addresses.

## Alternatives Considered

- A spherical or cube-sphere world was rejected for v1 because it conflicts
  with the requested square kilometre address hierarchy and requires polar seam
  handling outside the current renderer contract.
- Eagerly persisting every local zone was rejected because fifty million local
  zones would multiply storage, migration, and cache pressure unnecessarily.
- Extending the legacy hex hierarchy was rejected because it cannot express the
  required aligned square ownership and clipping rules without ambiguity.

## Consequences

- Atlas clients can pin and validate one stable base world.
- Base storage stays bounded while high resolution remains deterministic.
- Package APIs grow additively and retain backward compatibility.
- Generator/seed changes require a new atlas revision and explicit edit
  migration rather than transparent reinterpretation.

## Related Decisions

- ADR-0002: Tiled World Generation, LOD, and Stitching
- ADR-0007: Voxel World Authority
- ADR-0008: Fluid-Aware Voxel Rendering
- TDR-0003: Persistent Atlas Bake Contract
- `plasius-ltd-site` TDR-0020 through TDR-0024

## References

- Plasius-LTD/plasius-ltd-site#1516
- Plasius-LTD/gpu-world-generator#38
