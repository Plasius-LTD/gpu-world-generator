# ADR 0006: Wavefront Scene-Source Adapters For Terrain And Proxy Outputs

## Status

Accepted

## Context

`@plasius/gpu-world-generator` already publishes explicit near, mid, far, and
horizon representation plans, but it did not yet expose a renderer-facing
adapter payload that can move terrain and proxy mesh data into the wavefront
path-tracing pipeline.

That left downstream renderer integrations guessing how chunk identity,
material ids, refresh cadence, RT participation, and proxy-vs-live update
semantics should be carried across the package boundary.

This package work inherits the parent site rollout control
`gpu-demo.scene-fidelity.enabled`, which remains the remotely controlled source
of truth for live exposure and rollback in `plasius-ltd-site`.

## Decision

`@plasius/gpu-world-generator` will publish:

- `createWorldGeneratorWavefrontSceneSourceAdapter(...)` as a stable public
  adapter for terrain, simplified geometry, RT proxy, merged proxy, and
  horizon-shell outputs;
- renderer-facing mesh metadata that preserves chunk ids, source chunk ids,
  source job keys, material ids, representation band, RT participation, shadow
  relevance, and refresh cadence;
- deterministic acceleration-structure update classes so downstream renderer
  packages can distinguish streaming, proxy, and horizon-shell updates.

## Consequences

- world-generator packages can now hand renderer integrations a typed
  scene-source contract instead of only publishing planning metadata;
- near, mid, far, and horizon outputs remain traceable back to their source
  chunk and generation jobs;
- renderer execution stays downstream, but the boundary is now testable and
  reusable across site and package consumers.
