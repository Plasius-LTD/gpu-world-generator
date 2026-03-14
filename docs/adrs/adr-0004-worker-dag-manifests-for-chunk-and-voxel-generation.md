# ADR-0004: Worker DAG Manifests for Chunk and Voxel Generation

- **Status**: Accepted
- **Date**: 2026-03-14

## Context

World generation already has an inherent DAG: fractal prepass and field
synthesis can start independently, terrain synthesis joins them, and voxel,
mesh, bake, and serialization stages branch afterwards. Leaving this implicit
forces consumer packages to flatten the pipeline into opaque queue work.

## Decision

Publish worker-first manifest helpers from `@plasius/gpu-world-generator`.

- `streaming` profile:
  runtime chunk generation and mesh-ready output
- `bake` profile:
  background/offline generation plus asset serialization

Each manifest exports:

- `queueClass: voxel`
- `schedulerMode: dag`
- explicit job priorities and dependencies
- adaptive budget ladders for degradable stages
- debug allocation metadata for observability

## Consequences

- Positive: chunk and voxel generation can be coordinated by shared worker and
  performance packages without package-specific glue.
- Positive: authoritative terrain stages remain explicit and protected from
  visual-only degradation.
- Negative: world-generation stage names become part of the public contract and
  require migration discipline.
