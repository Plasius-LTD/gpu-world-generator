import { axialToWorld, buildHexLevels, generateHexGrid } from "../hex";
import { defaultFieldParams, sampleFieldStack, type FieldSample } from "../fields";
import {
  MacroBiome,
  MicroFeature,
  SlopeBand,
  SurfaceCover,
  TerrainBiome,
  type HexCell,
  type HexLevelSpec,
  type TerrainCell,
  type MacroBiomeId,
  type MicroFeatureId,
  type TerrainBiomeId,
  type SurfaceCoverId,
} from "../types";

export interface MixedForestOptions {
  seed?: number;
  terrainSeed?: number;
  featureSeed?: number;
  foliageSeed?: number;
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

function createBiomeFieldParams(seed: number) {
  const params = defaultFieldParams(seed);
  params.heatBias = -0.02;
  params.moistureBias = 0.08;
  return params;
}

function selectSurface(sample: FieldSample): SurfaceCoverId {
  if (sample.water > 0.58 || sample.cumulativeHeight < 0.14) {
    return SurfaceCover.Water;
  }
  if (sample.heat < 0.18 && sample.water > 0.36) {
    return SurfaceCover.Ice;
  }
  if (
    sample.heat < 0.3 &&
    (sample.slopeBand === SlopeBand.Upward || sample.cumulativeHeight > 0.52)
  ) {
    return sample.obstacleMask > 0.58 ? SurfaceCover.Rock : SurfaceCover.Gravel;
  }
  if (sample.slopeBand === SlopeBand.Downward && sample.moisture > 0.52) {
    return SurfaceCover.Mud;
  }
  if (sample.obstacleMask > 0.72 || sample.slopeBand === SlopeBand.Upward) {
    return sample.heat > 0.72 ? SurfaceCover.Basalt : SurfaceCover.Rock;
  }
  if (sample.heat > 0.74 && sample.moisture < 0.32) {
    return SurfaceCover.Sand;
  }
  const grassCapable =
    sample.heat >= 0.32 &&
    sample.heat <= 0.82 &&
    sample.moisture >= 0.34 &&
    sample.moisture <= 0.88 &&
    sample.slopeBand === SlopeBand.Flat;
  if (grassCapable && sample.foliageMask > 0.4) {
    return SurfaceCover.Grass;
  }
  if (sample.moisture > 0.6) {
    return SurfaceCover.Dirt;
  }
  return sample.obstacleMask > 0.5 ? SurfaceCover.Gravel : SurfaceCover.Dirt;
}

function supportsGroundFoliage(surface: SurfaceCoverId): boolean {
  return (
    surface === SurfaceCover.Grass ||
    surface === SurfaceCover.Dirt ||
    surface === SurfaceCover.Mud
  );
}

function supportsObstacleSurface(surface: SurfaceCoverId): boolean {
  return (
    surface === SurfaceCover.Rock ||
    surface === SurfaceCover.Gravel ||
    surface === SurfaceCover.Basalt
  );
}

function axialDistance(a: HexCell, b: HexCell): number {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) * 0.5;
}

function selectFeature(
  surface: SurfaceCoverId,
  sample: FieldSample,
  variation: number,
  nearestTreeDistance: number,
  nearestObstacleDistance: number,
  nearbyObstacleRatio: number,
  isTreeAnchor: boolean
): MicroFeatureId | undefined {
  if (isTreeAnchor) {
    return MicroFeature.Tree;
  }
  if (surface === SurfaceCover.Water) {
    return variation > 0.88 && sample.moisture > 0.64 ? MicroFeature.Reed : MicroFeature.WaterRipple;
  }
  if (surface === SurfaceCover.Ice && variation > 0.45) {
    return MicroFeature.IceSpike;
  }
  if (
    surface === SurfaceCover.Rock ||
    surface === SurfaceCover.Gravel ||
    surface === SurfaceCover.Basalt
  ) {
    return sample.obstacleMask > 0.85 ? MicroFeature.Boulder : MicroFeature.Rock;
  }
  if (surface === SurfaceCover.Mud && variation > 0.78) {
    return MicroFeature.Reed;
  }
  const nearTree = nearestTreeDistance <= 2.0;
  const underCanopy = nearestTreeDistance <= 1.2;

  if (nearTree && sample.foliageMask > 0.48 && sample.moisture > 0.42 && variation > 0.36) {
    if (surface === SurfaceCover.Mud) {
      return MicroFeature.Bush;
    }
    if (variation > 0.7 || underCanopy) {
      return MicroFeature.Bush;
    }
    return MicroFeature.GrassTuft;
  }

  const openArea =
    nearestTreeDistance >= 3.0 &&
    nearestObstacleDistance >= 2.2 &&
    (surface === SurfaceCover.Grass || surface === SurfaceCover.Dirt);
  if (
    openArea &&
    sample.moisture > 0.32 &&
    sample.moisture < 0.76 &&
    sample.heat > 0.28 &&
    sample.heat < 0.82 &&
    variation > 0.9
  ) {
    return MicroFeature.Flower;
  }

  const obstacleFalloff = Number.isFinite(nearestObstacleDistance)
    ? clamp01((3.5 - nearestObstacleDistance) / 3.5)
    : 0;
  const snowLikeGrassDeposit = clamp01(obstacleFalloff * 0.7 + nearbyObstacleRatio * 0.3);

  if (
    supportsGroundFoliage(surface) &&
    sample.heat >= 0.3 &&
    sample.heat <= 0.84 &&
    sample.moisture >= 0.28 &&
    sample.moisture <= 0.9 &&
    sample.water < 0.24 &&
    variation < 0.96
  ) {
    const depositThreshold = clamp01(
      0.44 -
        snowLikeGrassDeposit * 0.24 -
        sample.foliageMask * 0.08 +
        Math.max(0, sample.moisture - 0.75) * 0.1
    );
    if (variation > depositThreshold) {
      return MicroFeature.GrassTuft;
    }
  }

  if (sample.slopeBand === SlopeBand.Upward && sample.obstacleMask > 0.6 && variation > 0.94) {
    return MicroFeature.Ruin;
  }

  return undefined;
}

function selectBiome(surface: SurfaceCoverId, sample: FieldSample): TerrainBiomeId {
  if (surface === SurfaceCover.Water) {
    return sample.heat < 0.25 ? TerrainBiome.Ice : TerrainBiome.River;
  }
  if (surface === SurfaceCover.Ice) {
    return TerrainBiome.Ice;
  }
  if (sample.slopeBand === SlopeBand.Upward && sample.obstacleMask > 0.68) {
    return sample.heat > 0.72 ? TerrainBiome.Volcanic : TerrainBiome.Mountainous;
  }
  if (sample.heat < 0.3) {
    return TerrainBiome.Tundra;
  }
  if (sample.heat > 0.74 && sample.moisture < 0.33) {
    return TerrainBiome.Savanna;
  }
  if (sample.foliageMask > 0.55 && sample.moisture > 0.45) {
    return TerrainBiome.MixedForest;
  }
  return TerrainBiome.Plains;
}

function selectMacroBiome(sample: FieldSample): MacroBiomeId {
  if (sample.water > 0.62) {
    return MacroBiome.Freshwater;
  }
  if (sample.slopeBand === SlopeBand.Upward && sample.obstacleMask > 0.68) {
    return MacroBiome.Alpine;
  }
  if (sample.heat > 0.74 && sample.moisture < 0.33) {
    return MacroBiome.Arid;
  }
  if (sample.heat < 0.3) {
    return MacroBiome.ColdTemperate;
  }
  return MacroBiome.Temperate;
}

export function generateTemperateMixedForest(options: MixedForestOptions): MixedForestLayer {
  const terrainSeed = (options.terrainSeed ?? options.seed ?? 1337) >>> 0;
  const featureSeed = (options.featureSeed ?? terrainSeed ^ 0x9e3779b9) >>> 0;
  const foliageSeed = (options.foliageSeed ?? terrainSeed ^ 0x85ebca6b) >>> 0;
  const levelSpecs = buildHexLevels({
    topAreaKm2: options.topAreaKm2 ?? 1000,
    minAreaM2: options.minAreaM2 ?? 10,
    levels: options.levels ?? 6,
  });
  const levelSpec = levelSpecs[levelSpecs.length - 1];
  const radius = options.radius ?? 6;
  const cells = generateHexGrid(radius, levelSpec.level);
  const terrainParams = createBiomeFieldParams(terrainSeed);
  const featureParams = createBiomeFieldParams(featureSeed);
  const foliageParams = createBiomeFieldParams(foliageSeed);

  const candidates = cells.map((cell) => {
    const world = axialToWorld(cell.q, cell.r, 1);
    const terrainSample = sampleFieldStack(world.x, world.y, terrainParams);
    const featureSample = sampleFieldStack(world.x, world.y, featureParams);
    const foliageSample = sampleFieldStack(world.x, world.y, foliageParams);
    const sample: FieldSample = {
      ...terrainSample,
      featureMask: featureSample.featureMask,
      obstacleMask: featureSample.obstacleMask,
      foliageMask: foliageSample.foliageMask,
    };
    const featureNoise = hashCell(cell, featureSeed, 0x77ab);
    const foliageNoise = hashCell(cell, foliageSeed, 0x51ac);
    const variation = clamp01(featureNoise * 0.65 + foliageNoise * 0.35);
    const surface = selectSurface(sample);
    const biome = selectBiome(surface, sample);
    return {
      cell,
      sample,
      variation,
      surface,
      biome,
      macroBiome: selectMacroBiome(sample),
    };
  });

  const treeAnchorIndexes: number[] = [];
  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    if (!supportsGroundFoliage(candidate.surface)) {
      continue;
    }
    const treeChance = clamp01(
      0.008 +
        candidate.sample.foliageMask * 0.03 +
        Math.max(0, candidate.sample.moisture - 0.45) * 0.04 -
        candidate.sample.obstacleMask * 0.02
    );
    const treeRoll = hashCell(candidate.cell, foliageSeed, 0xa11c);
    if (
      candidate.sample.heat > 0.24 &&
      candidate.sample.heat < 0.82 &&
      candidate.sample.moisture > 0.42 &&
      candidate.sample.water < 0.2 &&
      treeRoll < treeChance
    ) {
      treeAnchorIndexes.push(i);
    }
  }

  const treeAnchorSet = new Set<number>(treeAnchorIndexes);
  const obstacleAnchorIndexes: number[] = [];
  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    if (supportsObstacleSurface(candidate.surface) || candidate.sample.obstacleMask > 0.72) {
      obstacleAnchorIndexes.push(i);
    }
  }
  const obstacleRadius = 4;

  const terrain = candidates.map((candidate, index) => {
    const isTreeAnchor = treeAnchorSet.has(index);
    let nearestTreeDistance = Number.POSITIVE_INFINITY;
    if (isTreeAnchor) {
      nearestTreeDistance = 0;
    } else {
      for (const treeIndex of treeAnchorIndexes) {
        const distance = axialDistance(candidate.cell, candidates[treeIndex].cell);
        if (distance < nearestTreeDistance) {
          nearestTreeDistance = distance;
        }
      }
    }

    let nearestObstacleDistance = Number.POSITIVE_INFINITY;
    let nearbyObstacleCount = 0;
    for (const obstacleIndex of obstacleAnchorIndexes) {
      const distance = axialDistance(candidate.cell, candidates[obstacleIndex].cell);
      if (distance < nearestObstacleDistance) {
        nearestObstacleDistance = distance;
      }
      if (distance <= obstacleRadius) {
        nearbyObstacleCount += 1;
      }
    }
    const nearbyObstacleRatio = clamp01(nearbyObstacleCount / 12);

    const feature = selectFeature(
      candidate.surface,
      candidate.sample,
      candidate.variation,
      nearestTreeDistance,
      nearestObstacleDistance,
      nearbyObstacleRatio,
      isTreeAnchor
    );

    const cellData: TerrainCell = {
      height: clamp01(candidate.sample.height),
      heat: candidate.sample.heat,
      moisture: candidate.sample.moisture,
      biome: candidate.biome,
      macroBiome: candidate.macroBiome,
      surface: candidate.surface,
      feature,
      obstacle: candidate.sample.obstacleMask,
      foliage: candidate.sample.foliageMask,
      slopeBand: candidate.sample.slopeBand,
    };

    return cellData;
  });

  return { levelSpec, cells, terrain };
}
