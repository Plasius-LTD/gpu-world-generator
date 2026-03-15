# TDR-0002: Render Representation Tier Contract

## Status

Proposed

## Goal

Define the future contract for render and RT-oriented chunk representation tiers
in `@plasius/gpu-world-generator`.

## Planned Tier Outputs

Each chunk or region should eventually be able to describe one or more of:

- full live geometry output
- simplified live geometry output
- RT proxy output
- merged HLOD or impostor output
- horizon-shell or skyline output

## Planned Metadata

Representation descriptors should be able to carry:

- chunk or region identifier
- representation tier:
  - `near`
  - `mid`
  - `far`
  - `horizon`
- refresh policy or expected update cadence
- RT participation policy
- shadow relevance policy
- suggested ownership for renderer and worker scheduling

## Planned Tests

Contract tests should prove that:

- chunk descriptors can distinguish near, mid, far, and horizon output tiers
- proxy outputs can declare RT and shadow participation separately from the
  live geometry output
- refresh expectations are explicit for far and horizon content

Unit tests should prove that:

- world-generation manifests can describe merged or impostor-driven far-field
  outputs without losing chunk identity
- horizon representations can be low-frequency and still remain valid render
  products
- RT proxy descriptors can differ from the raster-facing representation tier
