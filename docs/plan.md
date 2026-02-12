# GPU World Generator Plan

## Summary
A shader-first world generator that synthesizes continuous surface fields using deterministic mathematics (Mandelbrot/Julia/multibrot stacks). Materials and features are applied in post-surface rule passes (grass/trees/rocks/sand, etc). Hexagons are retained only for LOD zoning and streaming control around the viewport, not for generation.

## Core References
- `docs/procedural-surface.md` for the deterministic surface field stack (Mandelbrot + warps + blends).
- `docs/lod-zoning.md` for hex-based LOD rings around the viewport.
- `docs/biomes.md` for the Earth-like biome taxonomy and sub-biome options.
- `docs/resources.md` for subsurface resource generation below terrain.

## Surface Field Generation (Shader-First)
Inputs:
- World coordinates (x, z) mapped to the complex plane.
- Seed + global parameters (scale, height, heat, moisture, roughness).

Outputs:
- Height (0..1), heat (0..1), moisture (0..1), roughness (0..1), rockiness (0..1), water mask (0..1).
- Cumulative trend band: `0.0..0.2` downward slope, `0.2..0.8` flat, `0.8..1.0` upward slope.
- Feature/obstacle mask (0..1).
- Foliage density mask (0..1).

Shader stages (field stack):
1. Base fractal field (Mandelbrot/Julia or multibrot, smooth iteration count).
2. Domain warping to break symmetry (secondary fractal offsets).
3. Multiplicative blends to combine large/mid/small detail.
4. Ridge/valley shaping (abs/threshold transforms).
5. Optional erosion heuristics (slope/curvature approximations).

## Rule Passes (Material + Features)
1. Hydrology: water fills local minima, flattens surface, and follows flow paths.
2. Material selection: slope + height + moisture -> rock/sand/grass/mud/ice.
3. Feature placement: trees/rocks/props based on material + local noise.
4. Structural overlays: towns/roads/castles (deterministic hash rules).

## LOD Zoning (Hex Rings Around Viewport)
- Hexes define streaming and LOD rings only.
- Nearest ring: highest sample resolution (smallest step).
- Mid ring: medium resolution.
- Far ring: low resolution + simplified materials/features.
- Cross-fade or blend across ring boundaries to avoid popping.

## Biome Hierarchy (Suggested)
The same cell is classified at multiple levels. Each stage constrains the next to keep seams predictable.

See `docs/biomes.md` for the full Earth-like biome taxonomy and sub-biome options.
See `docs/resources.md` for subsurface resource generation below terrain.

### Level 0: Macro Biomes (regional)
- Polar (ice cap, glacier belt)
- Cold Temperate (taiga, boreal forest)
- Temperate (mixed forest, plains)
- Arid (desert, savanna)
- Tropical (jungle, mangrove)
- Alpine (mountainous, highlands)
- Volcanic (lava fields, ash plains)
- Freshwater (river/lake basins)
- Coastal/Marine (coastline, estuary)
- Urban (major settlement regions)
- Underground (caverns, tunnels)

### Level 1: Sub-biomes (local terrain)
Examples by macro:
- Polar: Ice, Snow, Tundra
- Cold Temperate: Tundra, Pine Forest, Frozen River
- Temperate: Plains, Mixed Forest, River, Hills
- Arid: Savanna, Desert, Oasis, Dry Riverbed
- Tropical: Jungle, Swamp, River, Mangrove
- Alpine: Mountainous, Cliff, Scree, Snowline
- Volcanic: Lava, Basalt, Ash, Geothermal
- Freshwater: River, Lake, Wetland
- Coastal/Marine: Beach, Cliffs, Reef, Estuary
- Urban: City, Town, Village, Castle

### Level 2: Surface Cover (ground/material)
- Grass, Dirt, Sand, Rock, Gravel, Snowpack, Ice, Mud, Ash, Cobble, Road
- Water surfaces: River, Lake, Coastal surf

### Level 3: Micro Features (prop/placement)
- Tree, Bush, Grass Tuft, Reed, Rock, Boulder, Water Ripple, Ice Spike
- Structures: Hut, Wall, Bridge, Gate, Tower, Ruin

### Stitching Rules
- Macro boundaries blend over 1-2 hex rings using weighted masks (heat/moisture/height).
- Sub-biomes inherit and override surface covers gradually (e.g., grass -> dirt -> snow).
- Feature density derived from surface cover and moisture to avoid hard seams.
## Terrain Targets (Initial)
- Tundra, Savanna, River, City, Village, Ice, Snow, Mountainous, Volcanic, Road, Town, Castle.
- Additional neutral base: Plains (default).

## Particle + Shader Attachments
- Tree shader: base mesh + leaf instancing.
- Particle system tags: e.g., `leaves_falling` attached to Tree biome + season.
- Local effects triggered by biome + heat/moisture (e.g., snow drift, ash fall).

## Package Deliverables
- WGSL field stack for deterministic surface generation.
- TypeScript helpers to sample fields and apply rule passes.
- LOD zoning manager (hex rings) for streaming control.

## Development Steps
1. Add deterministic fractal field stack (Mandelbrot/Julia/multibrot).
2. Add domain warp + multiplicative blending controls.
3. Implement hydrology + material rule passes.
4. Add feature placement (trees/rocks/props) based on rules.
5. Add LOD zoning manager (hex rings) and cross-fade.
6. Integrate in demo + shader tuning pass.
