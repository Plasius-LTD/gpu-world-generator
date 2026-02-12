import {
  MicroFeature,
  SlopeBand,
  SurfaceCover,
  type HexCell,
  type MicroFeatureId,
  type SlopeBandId,
  type SurfaceCoverId,
  type TerrainBiomeId,
  type TerrainCell,
  type TerrainParams,
} from "./types";

export function packHexCells(cells: HexCell[]): Int32Array {
  const data = new Int32Array(cells.length * 4);
  cells.forEach((cell, i) => {
    const base = i * 4;
    data[base] = cell.q | 0;
    data[base + 1] = cell.r | 0;
    data[base + 2] = cell.level | 0;
    data[base + 3] = cell.flags ?? 0;
  });
  return data;
}

export function encodeTerrainParams(params: TerrainParams): ArrayBuffer {
  const buffer = new ArrayBuffer(16 * 4);
  const u32 = new Uint32Array(buffer);
  const f32 = new Float32Array(buffer);
  u32[0] = params.seed >>> 0;
  u32[1] = params.cellCount >>> 0;
  f32[2] = params.heatBias ?? 0;
  f32[3] = params.heightScale ?? 1;
  f32[4] = params.macroScale ?? 0.035;
  f32[5] = params.macroWarpStrength ?? 0.18;
  f32[6] = params.styleMixStrength ?? 1.0;
  f32[7] = params.terraceSteps ?? 6;
  f32[8] = params.terraceStrength ?? 0.35;
  f32[9] = params.craterStrength ?? 0.25;
  f32[10] = params.craterScale ?? 0.18;
  f32[11] = params.heightMin ?? -0.35;
  f32[12] = params.heightMax ?? 1.6;
  f32[13] = params.slopeDownMax ?? 0.2;
  f32[14] = params.slopeUpMin ?? 0.8;
  f32[15] = 0;
  return buffer;
}

function isExpandedTerrainLayout(u32: Uint32Array): boolean {
  if (u32.length % 8 !== 0) {
    return false;
  }
  const count = u32.length / 8;
  if (count === 0) {
    return false;
  }
  const sampleCount = Math.min(16, count);
  let valid = 0;
  for (let i = 0; i < sampleCount; i += 1) {
    const base = i * 8;
    const surface = u32[base + 4];
    const slopeBand = u32[base + 7];
    if (surface <= SurfaceCover.Sludge && slopeBand <= SlopeBand.Upward) {
      valid += 1;
    }
  }
  return valid >= Math.max(1, Math.floor(sampleCount * 0.8));
}

export function unpackTerrain(buffer: ArrayBuffer): TerrainCell[] {
  const f32 = new Float32Array(buffer);
  const u32 = new Uint32Array(buffer);
  const expanded = isExpandedTerrainLayout(u32);
  const stride = expanded ? 8 : 4;
  const count = Math.floor(f32.length / stride);
  const cells: TerrainCell[] = [];
  for (let i = 0; i < count; i += 1) {
    const base = i * stride;
    const cell: TerrainCell = {
      height: f32[base],
      heat: f32[base + 1],
      moisture: f32[base + 2],
      biome: u32[base + 3] as TerrainBiomeId,
    };
    if (expanded) {
      const surface = u32[base + 4];
      const feature = u32[base + 5];
      const foliage = f32[base + 6];
      const slopeBand = u32[base + 7];
      if (surface <= SurfaceCover.Sludge) {
        cell.surface = surface as SurfaceCoverId;
      }
      if (feature <= MicroFeature.Flower) {
        cell.feature = feature as MicroFeatureId;
      }
      if (Number.isFinite(foliage)) {
        cell.foliage = foliage;
      }
      if (slopeBand <= SlopeBand.Upward) {
        cell.slopeBand = slopeBand as SlopeBandId;
      }
    }
    cells.push(cell);
  }
  return cells;
}
