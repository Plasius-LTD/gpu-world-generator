# TDR-0003: Persistent Atlas Bake Contract

Status: Accepted
Date: 2026-07-13

## Purpose

Define the deterministic address, macro-field, hydrology, encoding, and bake
contract for the finite `origin-shard` atlas.

## Address Rules

1. World X is normalized with positive modulo over `100,000 m`.
2. World Z is clamped below the exclusive `50,000 m` south boundary.
3. Tile, zone, and local-zone ownership uses `floor(normalized / size)` and
   half-open bounds.
4. Tile keys are `tx ∈ [0, 99]`, `tz ∈ [0, 49]`.
5. Zone/local indices within their parents are each in `[0, 9]`.
6. Local voxel materialization uses 32 m slabs over `[-1,024 m, 2,560 m)` and
   includes resolution and edit revision in its materialization key.

## Macro Field Rules

1. Generation operates on a 1,000 × 500 grid of 100 m zones.
2. Stochastic inputs use coordinate hashing; no result depends on traversal or
   asynchronous completion order.
3. Macro elevation is east-west periodic and combines plate, ridge, basin,
   domain-warp, and detail fields.
4. Climate combines logical latitude, altitude lapse, ocean influence,
   circulation bands, prevailing moisture, and orographic lift.
5. Hydrology handles depressions before deterministic D8 routing, computes
   accumulation and Strahler order, and carves channels without cycles.
6. Rivers terminate at ocean or lake cells. Polar boundaries do not leak flow
   outside the atlas.
7. Hydrology/geology store water-surface height, bedrock, soil, sediment, water
   table, aquifer, explicit riverbed gravel, floodplain silt/clay, and alluvial
   inputs required by local voxel sampling.
8. Flora stores profile/seed data and stable model references; base instance
   placement remains reproducible rather than eagerly serialized.

## Encoding Rules

1. The manifest schema is version 1 and pins the generator version.
2. Tile binary schema is version 1 with a magic prefix, explicit little-endian
   header, bounded section counts, and a SHA-256 content hash.
3. Each tile contains exactly 100 macro cells in row-major local-zone order.
4. Decoding validates the magic, version, byte length, tile bounds, strides,
   field ranges, and optional expected content hash before allocating outputs.
5. The tile index contains exactly 5,000 stable key/hash/byte-length entries.
6. Bake writers receive the manifest, overview, tile index, and individual
   immutable tile outputs; the package does not own cloud upload credentials.

## Diagnostic Rules

1. The default shipped seed must have 40–50% ocean coverage.
2. Mountain coverage, classified from elevation and local relief, must be within
   ten percentage points of ocean coverage.
3. Custom seeds always receive the diagnostic report but are not rejected unless
   the caller explicitly requests shipped-seed qualification.
4. Bake output includes deterministic checksums and hydrology invariant counts.

## Compatibility

Legacy tile, voxel, and hex APIs remain unchanged. Finite-atlas keys and codec
types are distinct and exported additively.
