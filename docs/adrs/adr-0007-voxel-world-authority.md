# ADR-0007: Voxel World Authority

## Status

Accepted

## Context

The heightfield-first terrain path cannot represent the gameplay surface needed
for mining, sinkholes, volcanic deposits, caves, overhangs, and other
destructive or deformable world systems. Renderer-facing meshes also need a
clear coordinate convention so generated ground aligns with the rest of the
pipeline.

## Decision

`@plasius/gpu-world-generator` treats voxel chunks as the authoritative world
representation. Heightfields, render meshes, RT proxies, horizon shells,
previews, and decorative placement are derived outputs.

The authoritative convention is XZ ground plane with +Y up. Voxel chunks store
signed density and material ids. Runtime deformation is represented as
deterministic chunk-local edit journals replayed over seeded base chunks.

## Consequences

- Positive: mining, caves, overhangs, sinkholes, lava deposits, and underground
  content can be represented without a special-case terrain surface.
- Positive: meshes and decorations can be regenerated from seed plus edits.
- Positive: renderer adapters can carry voxel source metadata and coordinate
  convention explicitly.
- Neutral: the legacy heightfield API remains temporarily for compatibility, but
  it is no longer the preferred source of truth.
