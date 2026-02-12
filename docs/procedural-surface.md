# Procedural Surface (Deterministic Math)

## Goal
Generate height/heat/moisture/roughness fields from deterministic mathematics (Mandelbrot/Julia/multibrot) and then apply rule-based materials + features. The same `(x, z, seed)` input always yields the same surface, enabling reproducible worlds.

## Coordinate Mapping
- Map world `(x, z)` to complex plane `c = (u, v)`.
- Use seeded transforms to avoid symmetry:
  - `u = (x * scale + offsetX) * skewX + warpX`
  - `v = (z * scale + offsetZ) * skewZ + warpZ`
- Keep scale separate per band: large (continental), mid (regional), small (local).

## Fractal Field Stack
Each layer returns a smooth iteration count `f(x, z)` in `[0, 1]`.

1. Base set (Mandelbrot or Julia):
   - `z = 0; z = z^p + c` or `z = z^p + k` for Julia.
   - Use smooth iteration for continuity.
2. Domain warp (secondary fractal):
   - `c' = c + warpStrength * vec2(f2(x, z), f3(x, z))`.
3. Multiplicative blend:
   - `height = clamp(fA^a * fB^b * fC^c, 0, 1)`.
4. Ridged transform:
   - `ridge = 1 - abs(2 * f - 1)`.
5. Composite fields:
   - `heat = mix(fHeat1, fHeat2, ridge)`
   - `moisture = mix(fMoist1, fMoist2, fMask)`

## Derived Maps
From the height field:
- Slope (for rock exposure).
- Curvature (for valleys vs ridges).
- Flow accumulation (for rivers/wetlands).
- Roughness (for biome texture and LOD decisions).

## Style Mixing (Macro Map)
To avoid uniform terrain, use a low-frequency macro map to blend between
two different height styles per region.
- Style A: earth-like dramatic (ridged multifractal, smoother slopes).
- Style B: surreal (terracing + crater basins + sharper ridges).

`styleMask = macroMap(x, z)` → `height = mix(styleA, styleB, styleMask)`

## Signed Height Pipeline
Heights can extend outside `[0, 1]` internally (e.g. `[-0.35..1.6]`):
- `rawHeight` drives mesh elevation.
- `height01 = clamp(rawHeight, 0, 1)` is used for heat/moisture/water/biomes.

## Terraces + Craters
- **Terracing**: quantize height into steps with smooth interpolation.
- **Crater field**: hashed radial basins that carve the surface.
- These modifiers are blended in as part of style B and remain deterministic.

## Rule Passes (Post Surface)
- Water:
  - Flatten water at local minima and flow along gradients.
  - Beach/silt where slope is low and moisture high.
- Rock exposure:
  - High slope + high roughness -> rock.
- Vegetation:
  - Moisture + low slope + moderate heat -> grass/forest.
- Sand:
  - High heat + low moisture + low slope -> sand.

## Determinism
All parameters (seed, scale, warps) must be explicit.
No random calls without a seed.

## Suggested Parameters (Starter)
- Iterations: 24–96 (based on LOD band).
- Multibrot exponent `p`: 2.0–3.5.
- Warp strength: 0.05–0.25.
- Blend exponents: 0.8–1.4.
