# ADR-0005: Render Representation Tiers and Proxy Outputs

## Status

Accepted

## Context

The world architecture no longer assumes that every chunk is rendered from the
same live representation. Near, mid, far, and horizon content should be able to
use different visual and ray-tracing representations so the world scales in a
predictable way.

`@plasius/gpu-world-generator` already owns chunk and voxel generation, so it is
the natural package to plan how world chunks will expose render-oriented
representation tiers and proxy outputs before implementation begins.

## Decision

`@plasius/gpu-world-generator` will plan around formal representation tiers for
rendering and RT preparation:

- `near`: full live chunk output
- `mid`: simplified live chunk output
- `far`: HLOD, impostor, or proxy-driven chunk output
- `horizon`: shell, skyline, or large-scale background representation

The package should eventually be able to provide metadata or assets for:

- chunk-local full geometry
- simplified geometry or material reductions
- RT proxy or reduced-fidelity instance data
- merged or impostor-oriented distant proxies
- low-refresh far-field or horizon assets

## Consequences

- Positive: distant rendering becomes a formal output tier instead of an
  ad-hoc optimization.
- Positive: renderer and world packages can coordinate around explicit chunk
  representation bands.
- Positive: RT proxy planning can start from generated world assets instead of
  being recreated in a later stage.
- Neutral: this ADR does not yet prescribe the final file format or buffer
  layout for each proxy type.

## Follow-On Work

- Define the technical contract for chunk representation metadata and proxy
  refresh policy.
- Add test-first contract and unit specs before implementing new proxy outputs.
