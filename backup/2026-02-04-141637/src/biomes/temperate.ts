import { buildHexLevels, generateHexGrid } from "../hex";
import {
  MacroBiome,
  MicroFeature,
  SurfaceCover,
  TerrainBiome,
  type HexCell,
  type HexLevelSpec,
  type TerrainCell,
  type MicroFeatureId,
  type SurfaceCoverId,
} from "../types";

export interface MixedForestOptions {
  seed: number;
  radius?: number;
  topAreaKm2?: number;
  minAreaM2?: number;
  levels?: number;
}

export interface MixedForestLayer {
  levelSpec: HexLevelSpec;
  cells: HexCell[];
  terrain: TerrainCell[];
}

function hash32(x: number): number {
  let v = x >>> 0;
  v ^= v >>> 17;
  v = Math.imul(v, 0xed5ad4bb);
  v ^= v >>> 11;
  v = Math.imul(v, 0xac4c1b51);
  v ^= v >>> 15;
  v = Math.imul(v, 0x31848bab);
  v ^= v >>> 14;
  return v >>> 0;
}

function hash01(x: number): number {
  return (hash32(x) & 0x00ffffff) / 16777216;
}

function hashCell(cell: HexCell, seed: number, salt: number): number {
  const q = cell.q | 0;
  const r = cell.r | 0;
  const level = cell.level | 0;
  const mixed =
    (Math.imul(q, 1664525) ^ Math.imul(r, 1013904223) ^ Math.imul(level, 747796405) ^ seed ^ salt) >>>
    0;
  return hash01(mixed);
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function selectSurface(height: number, moisture: number, noise: number): SurfaceCoverId {
  if (height < 0.12) {
    return SurfaceCover.Water;
  }
  if (height > 0.72) {
    return SurfaceCover.Rock;
  }
  if (moisture > 0.72) {
    return SurfaceCover.Mud;
  }
  if (moisture > 0.5) {
    return noise > 0.2 ? SurfaceCover.Grass : SurfaceCover.Dirt;
  }
  return noise > 0.6 ? SurfaceCover.Gravel : SurfaceCover.Dirt;
}

function selectFeature(
  surface: SurfaceCoverId,
  height: number,
  moisture: number,
  noise: number
): MicroFeatureId | undefined {
  if (surface === SurfaceCover.Water) {
    return MicroFeature.WaterRipple;
  }
  if (surface === SurfaceCover.Rock || surface === SurfaceCover.Gravel) {
    return noise > 0.7 ? MicroFeature.Boulder : MicroFeature.Rock;
  }
  if (moisture > 0.45 && noise > 0.25) {
    return MicroFeature.Tree;
  }
  if (moisture > 0.4 && noise > 0.15) {
    return MicroFeature.Bush;
  }
  if (surface === SurfaceCover.Grass && noise > 0.1) {
    return MicroFeature.GrassTuft;
  }
  if (height > 0.6 && noise > 0.8) {
    return MicroFeature.Rock;
  }
  return undefined;
}

export function generateTemperateMixedForest(options: MixedForestOptions): MixedForestLayer {
  const seed = options.seed >>> 0;
  const levelSpecs = buildHexLevels({
    topAreaKm2: options.topAreaKm2 ?? 1000,
    minAreaM2: options.minAreaM2 ?? 10,
    levels: options.levels ?? 6,
  });
  const levelSpec = levelSpecs[levelSpecs.length - 1];
  const radius = options.radius ?? 6;
  const cells = generateHexGrid(radius, levelSpec.level);

  const terrain = cells.map((cell) => {
    const base = hashCell(cell, seed, 0x1234);
    const heatNoise = hashCell(cell, seed, 0x5345);
    const moistureNoise = hashCell(cell, seed, 0x9c9c);
    const featureNoise = hashCell(cell, seed, 0x77ab);

    const height = clamp01(Math.pow(base, 1.1));
    const heat = clamp01(0.45 + (heatNoise - 0.5) * 0.25 - height * 0.12);
    const moisture = clamp01(0.55 + (moistureNoise - 0.5) * 0.35 - height * 0.05);

    const surface = selectSurface(height, moisture, featureNoise);
    const feature = selectFeature(surface, height, moisture, featureNoise);

    const cellData: TerrainCell = {
      height,
      heat,
      moisture,
      biome: TerrainBiome.MixedForest,
      macroBiome: MacroBiome.Temperate,
      surface,
      feature,
    };

    return cellData;
  });

  return { levelSpec, cells, terrain };
}
