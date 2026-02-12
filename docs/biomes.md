# Biome Taxonomy (Earth-like)

This list defines macro biomes and their expected sub-biomes. Each sub-biome notes typical surface covers and micro features. Use these as defaults; procedural rules can blend and override locally.

Legend:
- Surfaces: ground/material layer
- Features: props, vegetation, structures

## Polar
- Ice Cap
  - Surfaces: Ice, Snowpack, Rock
  - Features: Ice spike, wind-scoured rock
- Glacier
  - Surfaces: Ice, Snowpack
  - Features: Crevasse lines, ice ridges
- Polar Desert
  - Surfaces: Snowpack, Gravel, Rock
  - Features: Sparse boulder fields
- Frozen Sea
  - Surfaces: Ice, Water (lead openings)
  - Features: Pressure ridges, cracks

## Cold Temperate
- Taiga
  - Surfaces: Snowpack, Dirt, Rock
  - Features: Conifer tree, fallen log, shrub
- Boreal Forest
  - Surfaces: Dirt, Grass, Snowpack (seasonal)
  - Features: Conifer tree, bush, moss
- Cold Steppe
  - Surfaces: Grass, Dirt, Gravel
  - Features: Grass tuft, scattered rock
- Frozen River
  - Surfaces: Ice, Water
  - Features: Ice shelf, reeds (edge)

## Temperate
- Mixed Forest
  - Surfaces: Dirt, Grass, Leaf litter
  - Features: Tree (deciduous), bush, fallen log
- Plains
  - Surfaces: Grass, Dirt
  - Features: Grass tuft, flower patch
- Meadow
  - Surfaces: Grass
  - Features: Tall grass, wildflowers
- River Valley
  - Surfaces: Grass, Mud, Water
  - Features: Reeds, riparian trees, boulders
- Hills
  - Surfaces: Grass, Rock
  - Features: Rock outcrop, shrubs

## Arid
- Desert (Sandy)
  - Surfaces: Sand, Rock
  - Features: Dunes, dry shrubs
- Desert (Rocky)
  - Surfaces: Rock, Gravel
  - Features: Boulder fields, mesas
- Savanna
  - Surfaces: Grass, Dirt
  - Features: Sparse trees, shrubs
- Badlands
  - Surfaces: Dirt, Rock, Clay
  - Features: Eroded spires, gullies
- Oasis
  - Surfaces: Water, Grass, Mud
  - Features: Palm trees, reeds
- Dry Riverbed
  - Surfaces: Gravel, Sand
  - Features: Scoured stones

## Tropical
- Jungle
  - Surfaces: Dirt, Mud, Leaf litter
  - Features: Dense trees, vines, ferns
- Tropical Forest
  - Surfaces: Grass, Dirt
  - Features: Tall canopy, shrubs
- Mangrove
  - Surfaces: Mud, Water
  - Features: Mangrove roots, reeds
- Swamp
  - Surfaces: Mud, Water
  - Features: Reeds, stumps, fallen logs
- Floodplain
  - Surfaces: Mud, Grass, Water (seasonal)
  - Features: Reeds, wetland grass

## Alpine
- Mountain Ridge
  - Surfaces: Rock, Snowpack
  - Features: Cliff faces, boulder fields
- High Meadow
  - Surfaces: Grass, Rock
  - Features: Alpine shrubs, grass tuft
- Scree
  - Surfaces: Rock, Gravel
  - Features: Loose stones, talus
- Snowline
  - Surfaces: Snowpack, Rock
  - Features: Sparse shrubs
- Glacier Valley
  - Surfaces: Ice, Snowpack, Rock
  - Features: Moraines

## Volcanic
- Lava Field
  - Surfaces: Basalt, Ash
  - Features: Lava cracks, fumaroles
- Ash Plain
  - Surfaces: Ash, Rock
  - Features: Sparse shrubs, soot drift
- Geothermal
  - Surfaces: Rock, Mud
  - Features: Steam vents, hot springs
- Obsidian Ridge
  - Surfaces: Rock (obsidian), Ash
  - Features: Jagged spires

## Freshwater
- River
  - Surfaces: Water, Gravel, Mud
  - Features: Reeds, ripples, rocks
- Lake
  - Surfaces: Water, Mud
  - Features: Shore reeds, shallow shelf
- Wetland
  - Surfaces: Water, Mud, Grass
  - Features: Reeds, shrubs
- Marsh
  - Surfaces: Mud, Water
  - Features: Tall reeds
- Bog
  - Surfaces: Mud, Water, Moss
  - Features: Stunted trees, pools

## Coastal
- Beach
  - Surfaces: Sand, Gravel
  - Features: Driftwood, tide lines
- Cliff Coast
  - Surfaces: Rock, Gravel
  - Features: Cliff faces, sea spray
- Estuary
  - Surfaces: Mud, Water
  - Features: Reeds, shallow channels
- Delta
  - Surfaces: Mud, Water, Sand
  - Features: Sandbars, channels
- Reef
  - Surfaces: Rock, Water
  - Features: Coral (if supported), shallows

## Urban
- City Core
  - Surfaces: Cobble, Road
  - Features: Buildings, walls, plazas
- Town
  - Surfaces: Road, Dirt, Grass
  - Features: Houses, fences, wells
- Village
  - Surfaces: Dirt, Grass
  - Features: Huts, gardens
- Castle
  - Surfaces: Cobble, Rock
  - Features: Walls, towers, gatehouses
- Farmland
  - Surfaces: Dirt, Grass
  - Features: Crops, irrigation channels

## Underground
- Caverns
  - Surfaces: Rock, Gravel, Mud
  - Features: Stalactite, stalagmite, cave pools
- Lava Tubes
  - Surfaces: Basalt, Ash
  - Features: Lava crust, vent glow
- Crystal Caves
  - Surfaces: Crystal, Rock
  - Features: Crystal spires, reflective shards
- Subterranean River
  - Surfaces: Water, Rock, Mud
  - Features: Underground stream, slick stones
- Fungal Groves
  - Surfaces: Mud, Dirt
  - Features: Giant fungi, spores
- Mine Shafts
  - Surfaces: Rock, Dirt
  - Features: Timber supports, rails, carts, lanterns
- Sewers
  - Surfaces: Water, Cobble, Sludge
  - Features: Grates, brick tunnels, runoff channels

## Cross-Biome Generic Types
- Rock: outcrops, boulders, cliffs, crystal spires
- Water: rivers, lakes, puddles, marsh
- Vegetation: tree, bush, grass tuft, reed
- Pathing: road, trail, bridge

## Stitching Suggestions
- Blend macro biomes over 1-2 hex rings using heat/moisture gradients.
- Sub-biomes should respect parent macro constraints (e.g., no desert inside Polar).
- Surface cover transitions should be gradual: grass -> dirt -> snowpack.
- Feature density derived from surface cover + moisture to avoid hard seams.
