# LOD Zoning (Hex Rings)

## Goal
Use hexagons only for streaming and LOD control around the viewport, not for generation. The world surface is continuous; hexes partition which areas get higher sampling density and richer features.

## Ring Layout
- Center ring: highest resolution (small step size, full features).
- Mid ring: medium resolution (reduced step size, fewer features).
- Far ring: low resolution (coarse step size, minimal features).

## Sampling Strategy
- Each ring defines a sampling step (meters per sample).
- The same procedural field functions are evaluated at different step sizes.
- Cross-fade between rings to reduce popping.

## Caching
- Cache generated tiles per ring with a key `(ringId, q, r, seed)`.
- Evict far tiles based on camera movement thresholds.

## Determinism
- The same input field functions must be used across rings.
- Only the sampling step and feature density change by ring.
