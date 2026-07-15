# TDR-0004: Zoned Streaming and Residency Contract

Status: Accepted
Date: 2026-07-13

## Representation Ladder

| Viewpoint distance | Required representation |
|---|---|
| `0 m ≤ d < 8 m` | 0.5 m voxels |
| `8 m ≤ d < 32 m` | 1 m voxels |
| `32 m ≤ d < 150 m` | 5 m zone mesh |
| `150 m ≤ d < 1,000 m` | 25 m tile mesh |
| `d ≥ 1,000 m` | 100 m atlas overview |

Transitions use a 20% margin around the boundary of the currently resident
representation. A newly requested finer representation never removes a usable
coarser representation until the finer work completes.

## View Planning

1. Inputs are finite viewpoint position, velocity, selected residency budget,
   edit revisions, and the previous representation state.
2. The planner normalizes X, clamps Z, applies hysteresis, and emits stable
   nearest-first work identifiers.
3. One additional ring is biased in the normalized horizontal velocity
   direction. Zero/invalid velocity produces no directional bias.
4. A new plan aborts obsolete pending work through caller-owned abort signals.
5. Low, standard, and high profiles respectively cap CPU/GPU bytes at
   128/192 MiB, 256/384 MiB, and 512/768 MiB and generation at 2, 4, and 8
   concurrent jobs.

## Local Materialization

1. A local zone is a 10 × 10 m horizontal address. Only 32 m slabs intersecting
   surface, fluid, or an edit envelope are generated.
2. 0.5 m and 1 m voxel fields sample one deterministic world-space density and
   material function, including macro geology and ordered edit replay.
3. Flora instances are reconstructed from the persisted profile/seed and stable
   model references. Instance identifiers are coordinate-derived and invariant
   across LOD changes.
4. Cache identity includes world id, atlas revision, local address,
   metres-per-voxel, slab index, and edit revision.

## Cross-Owner Assembly

1. Expand a destination by the voxel sampling halo and every intersecting
   terrain/fluid/model bound.
2. Resolve every required owner tile; X lookup wraps and Z lookup never crosses
   a logical pole.
3. Deduplicate model instances by stable instance id and reject conflicting
   definitions for the same id.
4. Clip every emitted terrain/fluid triangle to the destination's half-open X/Z
   bounds. Boundary samples may be read from a neighbour, but ownership remains
   with exactly one destination.
5. Models retain one asset acquisition and render through destination clip
   planes. Wrapped destinations apply the emitted render-space X offset before
   clipping while canonical identity remains stable. Assets marked partitioned by the canonical asset contract may load
   only their intersecting partitions.

## Eviction and Pinning

Evict in this deterministic order: far-detail derivatives, mid-distance
meshes, detailed local zones, tile descriptors, then unreferenced models. Never
evict collision data for the active interaction area, in-flight edit data, or a
model resource referenced by a visible zone.
