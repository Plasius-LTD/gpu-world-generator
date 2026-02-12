# Subsurface Resources (Below Terrain)

This defines what a player might find when digging below the surface. The goal is to generate a resource profile per hex cell based on macro biome, sub-biome, and depth bands.

## Depth Bands (Suggested)
- 0-1 m: Litter/topsoil (organic debris, roots)
- 1-5 m: Subsoil (clay, compacted dirt, small stones)
- 5-30 m: Soft rock/strata (limestone, sandstone, shale)
- 30-200 m: Hard rock (granite, basalt, metamorphic)
- 200+ m: Deep strata (rare ores, geothermal pockets)

## Resource Categories
- Soil/organic: topsoil, peat, compost
- Stone/common: limestone, sandstone, shale, granite, basalt
- Metals/common: iron, copper, tin
- Metals/rare: silver, gold, platinum
- Crystals/minerals: quartz, crystal clusters, geodes
- Volatiles: coal, sulfur, gas pockets
- Water: aquifers, underground rivers, brine
- Special: relics, ruins, lost tech (gameplay-dependent)

## Resource Rules (High-Level)
- Each hex cell has a resource profile per depth band (density + rarity).
- Macro biome influences baseline probability (e.g., Volcanic -> basalt/sulfur; Arid -> sandstone; Polar -> permafrost/ice lenses).
- Sub-biome refines (e.g., River -> aquifers; Mountainous -> ore veins; Urban -> ruins/utility tunnels).
- Height + heat + moisture bias ore types and water tables.

## Example Resource Bias by Macro Biome
- Polar: ice lenses, permafrost, low metal density.
- Cold Temperate: iron + copper pockets, shallow aquifers.
- Temperate: balanced stone + water, moderate metal density.
- Arid: sandstone, salt, deep water.
- Tropical: rich organic topsoil, shallow water, softer rock.
- Alpine: high ore density, hard rock, sparse water.
- Volcanic: basalt, sulfur, obsidian, geothermal pockets.
- Freshwater: high water tables, sedimentary rock.
- Coastal: brine, sand/clay layers.
- Urban: utility tunnels, debris layers, old foundations.
- Underground: mineral-rich, crystal clusters, cave water.

## Generation Approach (Per Cell)
1. Compute base strata material via (q, r, depth) noise.
2. Apply macro biome bias table (weights per resource category).
3. Apply sub-biome overrides (e.g., river -> water table upshift).
4. Run ore vein placement (3D noise thresholds + connected blobs).
5. Output per-depth resource layers (density, rarity, type).

## Data Model (Proposed)
- ResourceLayer: { depthStartM, depthEndM, materialType, density, rarity }
- VeinNode: { center, radiusM, resourceType, richness }
- Aquifer: { depthM, thicknessM, saturation }

## Stitching Notes
- Blend resource profiles across hex edges to avoid sudden changes.
- Ensure veins can cross neighboring hexes (connected components).
