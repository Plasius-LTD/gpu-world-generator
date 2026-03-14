# TDR-0001: World-Generator Worker Manifest Contract

- **Status**: Accepted
- **Date**: 2026-03-14

## Context

The world-generator package needs to expose its chunk and voxel pipeline in a
form that `@plasius/gpu-worker` and `@plasius/gpu-performance` can consume
directly, without adding a hard dependency on either package.

## Decision

Publish two manifest profiles:

- `streaming`
  - `fractalPrepass`
  - `fieldSynthesis`
  - `terrainSynthesis`
  - `voxelMaterialize`
  - `meshBuild`
  - `tileBake`
- `bake`
  - all streaming jobs plus `assetSerialize`

Contract rules:

- authoritative terrain jobs use fixed levels
- degradable voxel/mesh/bake jobs expose low/medium/high ladders
- job ids are namespaced as `world-generator.<profile>.<job>`
- queue class is always `voxel`
- scheduler mode is always `dag`

## Consequences

- Positive: consumers can import manifests directly and feed them into shared
  worker-budget adapters.
- Positive: the package stays in control of its actual generation topology.
- Negative: adding or renaming stages becomes a public API change.
