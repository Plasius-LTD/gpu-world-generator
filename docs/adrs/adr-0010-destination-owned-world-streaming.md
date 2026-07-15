# ADR-0010: Destination-Owned World Streaming

## Status

- Accepted
- Date: 2026-07-13
- Version: 1.0

## Tags

world, streaming, clipping, residency, models, seams

## Context

Persistent atlas ownership is defined by immutable one-kilometre tiles, but a
rendered 100 m zone can require sampling halos, terrain features, fluids, and
models owned by neighbouring tiles. Loading only the destination's owner tile
would create seams. Copying cross-boundary models into every intersecting tile
would create duplicate asset loads and ambiguous edit ownership.

The viewer also needs predictable degradation under hard CPU/GPU budgets while
moving quickly through millions of logical local zones.

## Decision

Use destination-owned assembly with expanded source queries.

- A destination zone owns its emitted terrain and fluid geometry and clips all
  output to its exact half-open bounds.
- Its source query expands by the selected voxel sampling halo and by every
  intersecting feature/model bound. Required owner tiles wrap across the
  east–west seam and clamp at the logical poles.
- Shared world-space density samples are evaluated from the same atlas and edit
  revision so 0.5 m and 1 m materializations agree where their lattices align.
- A discrete model has one canonical owner and one `ModelAssetRef`. Intersecting
  destinations reference the same stable instance and apply clip planes; they
  do not duplicate model bytes. Existing asset-contract partition metadata is
  used for exceptionally large assets.
- View planning uses the lean 0.5 m, 1 m, 5 m, 25 m, and 100 m ladder, 20%
  hysteresis, one velocity-directed prefetch ring, obsolete-work cancellation,
  and an immediately usable coarser fallback.
- Residency keys include world, atlas revision, address, resolution, vertical
  slab, and edit revision. Detailed unpinned derivatives are always the first
  eviction candidates.

## Alternatives Considered

- Owner-only sampling was rejected because zone and tile boundaries would
  expose cracks and incomplete rivers/models.
- Duplicating intersecting model payloads was rejected because it violates
  canonical ownership and defeats reference-counted model residency.
- Unbounded distance caches were rejected because memory use would depend on
  travel history rather than the selected device profile.

## Consequences

- Boundary assembly has explicit source-loading work, but emitted ownership is
  unambiguous and testable.
- The active view can retain coarse coverage while detailed work is aborted or
  regenerated.
- Model bytes are loaded and disposed independently by
  `@plasius/gpu-model-runtime`; this package plans references and clipped world
  geometry only.

## Related Decisions

- ADR-0002: Tiled World Generation, LOD, and Stitching
- ADR-0007: Voxel World Authority
- ADR-0009: Finite Wrapped World Atlas
- TDR-0004: Zoned Streaming and Residency Contract

## References

- Plasius-LTD/plasius-ltd-site#1517
- Plasius-LTD/gpu-world-generator#39
