export const TerrainBiome = {
  Plains: 0,
  Tundra: 1,
  Savanna: 2,
  River: 3,
  City: 4,
  Village: 5,
  Ice: 6,
  Snow: 7,
  Mountainous: 8,
  Volcanic: 9,
  Road: 10,
  Town: 11,
  Castle: 12,
  MixedForest: 13,
} as const;

export type TerrainBiomeId = (typeof TerrainBiome)[keyof typeof TerrainBiome];

export const TerrainBiomeLabel: Record<TerrainBiomeId, string> = {
  [TerrainBiome.Plains]: "Plains",
  [TerrainBiome.Tundra]: "Tundra",
  [TerrainBiome.Savanna]: "Savanna",
  [TerrainBiome.River]: "River",
  [TerrainBiome.City]: "City",
  [TerrainBiome.Village]: "Village",
  [TerrainBiome.Ice]: "Ice",
  [TerrainBiome.Snow]: "Snow",
  [TerrainBiome.Mountainous]: "Mountainous",
  [TerrainBiome.Volcanic]: "Volcanic",
  [TerrainBiome.Road]: "Road",
  [TerrainBiome.Town]: "Town",
  [TerrainBiome.Castle]: "Castle",
  [TerrainBiome.MixedForest]: "Mixed Forest",
};

export const MacroBiome = {
  Polar: 0,
  ColdTemperate: 1,
  Temperate: 2,
  Arid: 3,
  Tropical: 4,
  Alpine: 5,
  Volcanic: 6,
  Freshwater: 7,
  Coastal: 8,
  Urban: 9,
  Underground: 10,
} as const;

export type MacroBiomeId = (typeof MacroBiome)[keyof typeof MacroBiome];

export const MacroBiomeLabel: Record<MacroBiomeId, string> = {
  [MacroBiome.Polar]: "Polar",
  [MacroBiome.ColdTemperate]: "Cold Temperate",
  [MacroBiome.Temperate]: "Temperate",
  [MacroBiome.Arid]: "Arid",
  [MacroBiome.Tropical]: "Tropical",
  [MacroBiome.Alpine]: "Alpine",
  [MacroBiome.Volcanic]: "Volcanic",
  [MacroBiome.Freshwater]: "Freshwater",
  [MacroBiome.Coastal]: "Coastal",
  [MacroBiome.Urban]: "Urban",
  [MacroBiome.Underground]: "Underground",
};

export const SurfaceCover = {
  Grass: 0,
  Dirt: 1,
  Sand: 2,
  Rock: 3,
  Gravel: 4,
  Snowpack: 5,
  Ice: 6,
  Mud: 7,
  Ash: 8,
  Cobble: 9,
  Road: 10,
  Water: 11,
  Basalt: 12,
  Crystal: 13,
  Sludge: 14,
} as const;

export type SurfaceCoverId = (typeof SurfaceCover)[keyof typeof SurfaceCover];

export const SurfaceCoverLabel: Record<SurfaceCoverId, string> = {
  [SurfaceCover.Grass]: "Grass",
  [SurfaceCover.Dirt]: "Dirt",
  [SurfaceCover.Sand]: "Sand",
  [SurfaceCover.Rock]: "Rock",
  [SurfaceCover.Gravel]: "Gravel",
  [SurfaceCover.Snowpack]: "Snowpack",
  [SurfaceCover.Ice]: "Ice",
  [SurfaceCover.Mud]: "Mud",
  [SurfaceCover.Ash]: "Ash",
  [SurfaceCover.Cobble]: "Cobble",
  [SurfaceCover.Road]: "Road",
  [SurfaceCover.Water]: "Water",
  [SurfaceCover.Basalt]: "Basalt",
  [SurfaceCover.Crystal]: "Crystal",
  [SurfaceCover.Sludge]: "Sludge",
};

export const MicroFeature = {
  Tree: 0,
  Bush: 1,
  GrassTuft: 2,
  Reed: 3,
  Rock: 4,
  Boulder: 5,
  WaterRipple: 6,
  IceSpike: 7,
  Hut: 8,
  Wall: 9,
  Bridge: 10,
  Gate: 11,
  Tower: 12,
  Ruin: 13,
  Stalactite: 14,
  Stalagmite: 15,
  CrystalSpire: 16,
  Mushroom: 17,
  TimberSupport: 18,
  Rail: 19,
  Cart: 20,
  Lantern: 21,
  Grate: 22,
  BrickTunnel: 23,
  Flower: 24,
} as const;

export type MicroFeatureId = (typeof MicroFeature)[keyof typeof MicroFeature];

export const MicroFeatureLabel: Record<MicroFeatureId, string> = {
  [MicroFeature.Tree]: "Tree",
  [MicroFeature.Bush]: "Bush",
  [MicroFeature.GrassTuft]: "Grass Tuft",
  [MicroFeature.Reed]: "Reed",
  [MicroFeature.Rock]: "Rock",
  [MicroFeature.Boulder]: "Boulder",
  [MicroFeature.WaterRipple]: "Water Ripple",
  [MicroFeature.IceSpike]: "Ice Spike",
  [MicroFeature.Hut]: "Hut",
  [MicroFeature.Wall]: "Wall",
  [MicroFeature.Bridge]: "Bridge",
  [MicroFeature.Gate]: "Gate",
  [MicroFeature.Tower]: "Tower",
  [MicroFeature.Ruin]: "Ruin",
  [MicroFeature.Stalactite]: "Stalactite",
  [MicroFeature.Stalagmite]: "Stalagmite",
  [MicroFeature.CrystalSpire]: "Crystal Spire",
  [MicroFeature.Mushroom]: "Mushroom",
  [MicroFeature.TimberSupport]: "Timber Support",
  [MicroFeature.Rail]: "Rail",
  [MicroFeature.Cart]: "Cart",
  [MicroFeature.Lantern]: "Lantern",
  [MicroFeature.Grate]: "Grate",
  [MicroFeature.BrickTunnel]: "Brick Tunnel",
  [MicroFeature.Flower]: "Flower",
};

export interface HexCell {
  q: number;
  r: number;
  level: number;
  flags?: number;
}

export const SlopeBand = {
  Downward: 0,
  Flat: 1,
  Upward: 2,
} as const;

export type SlopeBandId = (typeof SlopeBand)[keyof typeof SlopeBand];

export const SlopeBandLabel: Record<SlopeBandId, string> = {
  [SlopeBand.Downward]: "Downward",
  [SlopeBand.Flat]: "Flat",
  [SlopeBand.Upward]: "Upward",
};

export interface TerrainCell {
  height: number;
  heat: number;
  moisture: number;
  biome: TerrainBiomeId;
  macroBiome?: MacroBiomeId;
  surface?: SurfaceCoverId;
  feature?: MicroFeatureId;
  obstacle?: number;
  foliage?: number;
  slopeBand?: SlopeBandId;
}

export interface TerrainParams {
  seed: number;
  cellCount: number;
  heatBias?: number;
  heightScale?: number;
  macroScale?: number;
  macroWarpStrength?: number;
  styleMixStrength?: number;
  terraceSteps?: number;
  terraceStrength?: number;
  craterStrength?: number;
  craterScale?: number;
  heightMin?: number;
  heightMax?: number;
  slopeDownMax?: number;
  slopeUpMin?: number;
}

export interface HexLevelSpec {
  level: number;
  areaM2: number;
  sideMeters: number;
  acrossFlatsMeters: number;
}
