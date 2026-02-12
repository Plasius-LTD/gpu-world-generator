const { pathToFileURL } = require("url"); const __PLASIUS_IMPORT_META_URL__ = pathToFileURL(__filename).href;
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  DEFAULT_TILE_SIZE_WORLD: () => DEFAULT_TILE_SIZE_WORLD,
  FIELD_DOWNWARD_MAX: () => FIELD_DOWNWARD_MAX,
  FIELD_UPWARD_MIN: () => FIELD_UPWARD_MIN,
  FRACTAL_ASSET_VERSION: () => FRACTAL_ASSET_VERSION,
  FRACTAL_SAMPLE_STRIDE: () => FRACTAL_SAMPLE_STRIDE,
  MacroBiome: () => MacroBiome,
  MacroBiomeLabel: () => MacroBiomeLabel,
  MicroFeature: () => MicroFeature,
  MicroFeatureLabel: () => MicroFeatureLabel,
  SlopeBand: () => SlopeBand,
  SlopeBandLabel: () => SlopeBandLabel,
  SurfaceCover: () => SurfaceCover,
  SurfaceCoverLabel: () => SurfaceCoverLabel,
  TILE_ASSET_VERSION: () => TILE_ASSET_VERSION,
  TerrainBiome: () => TerrainBiome,
  TerrainBiomeLabel: () => TerrainBiomeLabel,
  TileCache: () => TileCache,
  assetMatches: () => assetMatches,
  axialToWorld: () => axialToWorld,
  bakeTileAsset: () => bakeTileAsset,
  buildHexLevels: () => buildHexLevels,
  classifySlopeBand: () => classifySlopeBand,
  computeNormal: () => computeNormal,
  createFractalPrepassRunner: () => createFractalPrepassRunner,
  createMeshBuilder: () => createMeshBuilder,
  createPerfMonitor: () => createPerfMonitor,
  defaultFieldParams: () => defaultFieldParams,
  defaultFractalMandelSettings: () => defaultFractalMandelSettings,
  encodeTerrainParams: () => encodeTerrainParams,
  fieldWgslUrl: () => fieldWgslUrl,
  fractalPrepassWgslUrl: () => fractalPrepassWgslUrl,
  generateHexGrid: () => generateHexGrid,
  generateTemperateMixedForest: () => generateTemperateMixedForest,
  hexAreaFromSide: () => hexAreaFromSide,
  hexSideFromArea: () => hexSideFromArea,
  loadFieldWgsl: () => loadFieldWgsl,
  loadFractalPrepassWgsl: () => loadFractalPrepassWgsl,
  loadTerrainWgsl: () => loadTerrainWgsl,
  normalize: () => normalize,
  normalizeTileKey: () => normalizeTileKey,
  packHexCells: () => packHexCells,
  parseFractalAsset: () => parseFractalAsset,
  parseTileAssetBinary: () => parseTileAssetBinary,
  parseTileAssetJson: () => parseTileAssetJson,
  resolveTileSizeWorld: () => resolveTileSizeWorld,
  sampleFieldStack: () => sampleFieldStack,
  serializeFractalAsset: () => serializeFractalAsset,
  serializeTileAssetBinary: () => serializeTileAssetBinary,
  serializeTileAssetBinaryFromJson: () => serializeTileAssetBinaryFromJson,
  serializeTileAssetJson: () => serializeTileAssetJson,
  serializeTileAssetJsonFromBinary: () => serializeTileAssetJsonFromBinary,
  shade: () => shade,
  terrainWgslUrl: () => terrainWgslUrl,
  tileAssetFileStem: () => tileAssetFileStem,
  tileBoundsWorld: () => tileBoundsWorld,
  tileKeyFromWorldPosition: () => tileKeyFromWorldPosition,
  tileKeyToString: () => tileKeyToString,
  unpackTerrain: () => unpackTerrain,
  validateTileAssetPayload: () => validateTileAssetPayload
});
module.exports = __toCommonJS(index_exports);

// src/types.ts
var TerrainBiome = {
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
  MixedForest: 13
};
var TerrainBiomeLabel = {
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
  [TerrainBiome.MixedForest]: "Mixed Forest"
};
var MacroBiome = {
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
  Underground: 10
};
var MacroBiomeLabel = {
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
  [MacroBiome.Underground]: "Underground"
};
var SurfaceCover = {
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
  Sludge: 14
};
var SurfaceCoverLabel = {
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
  [SurfaceCover.Sludge]: "Sludge"
};
var MicroFeature = {
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
  Flower: 24
};
var MicroFeatureLabel = {
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
  [MicroFeature.Flower]: "Flower"
};
var SlopeBand = {
  Downward: 0,
  Flat: 1,
  Upward: 2
};
var SlopeBandLabel = {
  [SlopeBand.Downward]: "Downward",
  [SlopeBand.Flat]: "Flat",
  [SlopeBand.Upward]: "Upward"
};

// src/hex.ts
var HEX_AREA_FACTOR = 3 * Math.sqrt(3) / 2;
function hexAreaFromSide(sideMeters) {
  return HEX_AREA_FACTOR * sideMeters * sideMeters;
}
function hexSideFromArea(areaM2) {
  return Math.sqrt(areaM2 / HEX_AREA_FACTOR);
}
function axialToWorld(q, r, sizeMeters) {
  const x = sizeMeters * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
  const y = sizeMeters * (1.5 * r);
  return { x, y };
}
function generateHexGrid(radius, level = 0) {
  const cells = [];
  for (let q = -radius; q <= radius; q += 1) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r += 1) {
      cells.push({ q, r, level, flags: 0 });
    }
  }
  return cells;
}
function buildHexLevels(options = {}) {
  const topAreaKm2 = options.topAreaKm2 ?? 1e3;
  const minAreaM2 = options.minAreaM2 ?? 10;
  const levels = Math.max(2, options.levels ?? 6);
  const topAreaM2 = topAreaKm2 * 1e6;
  const ratio = Math.pow(topAreaM2 / minAreaM2, 1 / (levels - 1));
  const specs = [];
  for (let level = 0; level < levels; level += 1) {
    const areaM2 = topAreaM2 / Math.pow(ratio, level);
    const sideMeters = hexSideFromArea(areaM2);
    specs.push({
      level,
      areaM2,
      sideMeters,
      acrossFlatsMeters: sideMeters * Math.sqrt(3)
    });
  }
  return specs;
}

// src/generator.ts
function packHexCells(cells) {
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
function encodeTerrainParams(params) {
  const buffer = new ArrayBuffer(16 * 4);
  const u32 = new Uint32Array(buffer);
  const f32 = new Float32Array(buffer);
  u32[0] = params.seed >>> 0;
  u32[1] = params.cellCount >>> 0;
  f32[2] = params.heatBias ?? 0;
  f32[3] = params.heightScale ?? 1;
  f32[4] = params.macroScale ?? 0.035;
  f32[5] = params.macroWarpStrength ?? 0.18;
  f32[6] = params.styleMixStrength ?? 1;
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
function isExpandedTerrainLayout(u32) {
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
function unpackTerrain(buffer) {
  const f32 = new Float32Array(buffer);
  const u32 = new Uint32Array(buffer);
  const expanded = isExpandedTerrainLayout(u32);
  const stride = expanded ? 8 : 4;
  const count = Math.floor(f32.length / stride);
  const cells = [];
  for (let i = 0; i < count; i += 1) {
    const base = i * stride;
    const cell = {
      height: f32[base],
      heat: f32[base + 1],
      moisture: f32[base + 2],
      biome: u32[base + 3]
    };
    if (expanded) {
      const surface = u32[base + 4];
      const feature = u32[base + 5];
      const foliage = f32[base + 6];
      const slopeBand = u32[base + 7];
      if (surface <= SurfaceCover.Sludge) {
        cell.surface = surface;
      }
      if (feature <= MicroFeature.Flower) {
        cell.feature = feature;
      }
      if (Number.isFinite(foliage)) {
        cell.foliage = foliage;
      }
      if (slopeBand <= SlopeBand.Upward) {
        cell.slopeBand = slopeBand;
      }
    }
    cells.push(cell);
  }
  return cells;
}

// src/wgsl.ts
var wgslBaseUrl = typeof __PLASIUS_IMPORT_META_URL__ === "string" && __PLASIUS_IMPORT_META_URL__ ? __PLASIUS_IMPORT_META_URL__ : typeof document !== "undefined" && document.baseURI ? document.baseURI : typeof location !== "undefined" ? location.href : "file:///";
var terrainWgslUrl = new URL("./terrain.wgsl", wgslBaseUrl);
var fieldWgslUrl = new URL("./field.wgsl", wgslBaseUrl);
var fractalPrepassWgslUrl = new URL("./fractal-prepass.wgsl", wgslBaseUrl);
async function loadTerrainWgsl(options = {}) {
  const { url = terrainWgslUrl, fetcher = globalThis.fetch } = options;
  const resolved = url instanceof URL ? url : new URL(url, terrainWgslUrl);
  if (!fetcher || resolved.protocol === "file:") {
    const { readFile } = await import("fs/promises");
    const { fileURLToPath } = await import("url");
    return readFile(fileURLToPath(resolved), "utf8");
  }
  const response = await fetcher(resolved);
  if (!response.ok) {
    const statusText = response.statusText ? ` ${response.statusText}` : "";
    throw new Error(`Failed to load WGSL (${response.status}${statusText})`);
  }
  return response.text();
}
async function loadFieldWgsl(options = {}) {
  const { url = fieldWgslUrl, fetcher = globalThis.fetch } = options;
  const resolved = url instanceof URL ? url : new URL(url, fieldWgslUrl);
  if (!fetcher || resolved.protocol === "file:") {
    const { readFile } = await import("fs/promises");
    const { fileURLToPath } = await import("url");
    return readFile(fileURLToPath(resolved), "utf8");
  }
  const response = await fetcher(resolved);
  if (!response.ok) {
    const statusText = response.statusText ? ` ${response.statusText}` : "";
    throw new Error(`Failed to load WGSL (${response.status}${statusText})`);
  }
  return response.text();
}
async function loadFractalPrepassWgsl(options = {}) {
  const { url = fractalPrepassWgslUrl, fetcher = globalThis.fetch } = options;
  const resolved = url instanceof URL ? url : new URL(url, fractalPrepassWgslUrl);
  if (!fetcher || resolved.protocol === "file:") {
    const { readFile } = await import("fs/promises");
    const { fileURLToPath } = await import("url");
    return readFile(fileURLToPath(resolved), "utf8");
  }
  const response = await fetcher(resolved);
  if (!response.ok) {
    const statusText = response.statusText ? ` ${response.statusText}` : "";
    throw new Error(`Failed to load WGSL (${response.status}${statusText})`);
  }
  return response.text();
}

// src/fields.ts
var FIELD_DOWNWARD_MAX = 0.2;
var FIELD_UPWARD_MIN = 0.8;
function classifySlopeBand(cumulativeHeight) {
  if (cumulativeHeight < FIELD_DOWNWARD_MAX) {
    return SlopeBand.Downward;
  }
  if (cumulativeHeight >= FIELD_UPWARD_MIN) {
    return SlopeBand.Upward;
  }
  return SlopeBand.Flat;
}
function defaultFieldParams(seed = 1337) {
  return {
    seed,
    scale: 0.14,
    warpScale: 0.5,
    warpStrength: 0.75,
    iterations: 64,
    power: 2.2,
    detailScale: 3.2,
    detailIterations: 28,
    detailPower: 2,
    ridgePower: 1.25,
    heatBias: 0,
    moistureBias: 0,
    macroScale: 0.035,
    macroWarpStrength: 0.18,
    styleMixStrength: 1,
    terraceSteps: 6,
    terraceStrength: 0.35,
    craterStrength: 0.25,
    craterScale: 0.18,
    heightMin: -0.35,
    heightMax: 1.6
  };
}
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}
function hash01(seed) {
  const s = Math.sin(seed) * 43758.5453123;
  return s - Math.floor(s);
}
function smoothMandelbrot(cx, cy, iterations, power) {
  let zx = 0;
  let zy = 0;
  let i = 0;
  for (; i < iterations; i += 1) {
    const r2 = zx * zx + zy * zy;
    if (r2 > 4) {
      break;
    }
    const r3 = Math.sqrt(r2);
    const theta = Math.atan2(zy, zx);
    const rp = Math.pow(r3, power);
    zx = rp * Math.cos(theta * power) + cx;
    zy = rp * Math.sin(theta * power) + cy;
  }
  if (i >= iterations) {
    return 1;
  }
  const r = Math.max(Math.sqrt(zx * zx + zy * zy), 1e-6);
  const nu = Math.log2(Math.log(r));
  const smooth = (i + 1 - nu) / iterations;
  return clamp(smooth, 0, 1);
}
function terrace(height, steps) {
  const count = Math.max(1, Math.round(steps));
  const step = 1 / count;
  const h = clamp(height, 0, 1);
  const band = Math.floor(h / step);
  const t = (h - band * step) / step;
  const smoothed = t * t * (3 - 2 * t);
  return (band + smoothed) * step;
}
function craterField(x, z, scale, seed) {
  const sx = x * scale;
  const sz = z * scale;
  const cellX = Math.floor(sx);
  const cellZ = Math.floor(sz);
  const fx = sx - cellX;
  const fz = sz - cellZ;
  const baseSeed = cellX * 374761393 + cellZ * 668265263 + seed * 1442695041;
  const h0 = hash01(baseSeed * 0.17);
  const h1 = hash01(baseSeed * 0.31 + 17.13);
  const h2 = hash01(baseSeed * 0.47 + 9.2);
  const cx = h0;
  const cz = h1;
  const radius = 0.22 + 0.25 * h2;
  const dx = fx - cx;
  const dz = fz - cz;
  const dist = Math.hypot(dx, dz);
  return smoothstep(radius, radius * 0.35, dist);
}
function sampleFieldStack(x, z, params) {
  const seed = params.seed;
  const offX = hash01(seed * 0.137 + 0.11) * 4 - 2;
  const offZ = hash01(seed * 0.173 + 0.27) * 4 - 2;
  const warpOffX = hash01(seed * 0.91 + 1.1) * 6 - 3;
  const warpOffZ = hash01(seed * 1.07 + 2.2) * 6 - 3;
  const warpA = smoothMandelbrot(
    (x + warpOffX) * params.warpScale,
    (z + warpOffZ) * params.warpScale,
    Math.max(16, Math.floor(params.iterations * 0.6)),
    params.power
  );
  const warpB = smoothMandelbrot(
    (x - warpOffZ) * params.warpScale,
    (z + warpOffX) * params.warpScale,
    Math.max(16, Math.floor(params.iterations * 0.6)),
    params.power
  );
  const warpedX = x + (warpA - 0.5) * params.warpStrength;
  const warpedZ = z + (warpB - 0.5) * params.warpStrength;
  const base = smoothMandelbrot(
    warpedX * params.scale + offX,
    warpedZ * params.scale + offZ,
    params.iterations,
    params.power
  );
  const mid = smoothMandelbrot(
    warpedX * params.scale * 2.15 + offX * 0.6,
    warpedZ * params.scale * 2.15 + offZ * 0.6,
    Math.max(18, Math.floor(params.iterations * 0.7)),
    params.power + 0.2
  );
  const detail = smoothMandelbrot(
    warpedX * params.scale * params.detailScale + offX * 1.4,
    warpedZ * params.scale * params.detailScale + offZ * 1.4,
    params.detailIterations,
    params.detailPower
  );
  const ridge = 1 - Math.abs(2 * mid - 1);
  const baseHeight = Math.pow(base, 0.9) * Math.pow(mid, 1.05) * Math.pow(detail, 1.1);
  const macroIter = Math.max(12, Math.floor(params.iterations * 0.35));
  const macroA = smoothMandelbrot(
    x * params.macroScale + offX * 0.2,
    z * params.macroScale + offZ * 0.2,
    macroIter,
    params.power
  );
  const macroB = smoothMandelbrot(
    (x + offZ) * params.macroScale,
    (z - offX) * params.macroScale,
    macroIter,
    params.power + 0.35
  );
  const macroWarpX = (macroA - 0.5) * params.macroWarpStrength;
  const macroWarpZ = (macroB - 0.5) * params.macroWarpStrength;
  const macroMask = smoothMandelbrot(
    (x + macroWarpX) * params.macroScale,
    (z + macroWarpZ) * params.macroScale,
    macroIter,
    params.power
  );
  const styleMask = clamp((macroMask - 0.5) * params.styleMixStrength + 0.5, 0, 1);
  const terraceHeight = terrace(baseHeight, params.terraceSteps);
  const crater = craterField(x, z, params.craterScale, seed);
  const styleA = clamp(Math.pow(baseHeight, 0.8) + Math.pow(ridge, 1.4) * 0.2, 0, 1);
  const styleB = clamp(
    baseHeight * (1 - params.terraceStrength) + terraceHeight * params.terraceStrength - crater * params.craterStrength + Math.pow(ridge, 1.6) * 0.12,
    0,
    1
  );
  const mixed = styleA * (1 - styleMask) + styleB * styleMask;
  const cumulativeHeight = clamp(
    base * 0.38 + mid * 0.33 + detail * 0.21 + styleMask * 0.08,
    0,
    1
  );
  const slopeBand = classifySlopeBand(cumulativeHeight);
  const downwardStrength = 1 - smoothstep(0, FIELD_DOWNWARD_MAX, cumulativeHeight);
  const upwardStrength = smoothstep(FIELD_UPWARD_MIN, 1, cumulativeHeight);
  const flatStrength = clamp(1 - Math.max(downwardStrength, upwardStrength), 0, 1);
  const ridgeBoost = Math.pow(ridge, 1.35) * 0.22;
  const centered = (mixed - 0.5) * 2;
  const shaped = Math.sign(centered) * Math.pow(Math.abs(centered), 0.75);
  const macroOffset = (styleMask - 0.5) * 0.25;
  const rawHeight = clamp(
    0.5 + shaped * 0.8 + macroOffset + ridgeBoost + upwardStrength * 0.22 - downwardStrength * 0.22,
    params.heightMin,
    params.heightMax
  );
  const height01 = clamp(rawHeight, 0, 1);
  const roughness = clamp(
    Math.pow(ridge, params.ridgePower) * 0.7 + detail * 0.3,
    0,
    1
  );
  const heat = clamp(0.55 * mid + 0.35 * (1 - height01) + params.heatBias, 0, 1);
  const moisture = clamp(
    0.55 * detail + 0.35 * (1 - height01) - (heat - 0.5) * 0.1 + params.moistureBias,
    0,
    1
  );
  const rockiness = clamp(roughness * 0.6 + height01 * 0.4, 0, 1);
  const water = clamp((0.32 - height01) * 3 + (moisture - 0.5) * 0.2, 0, 1);
  const featureMask = smoothMandelbrot(
    warpedX * params.scale * (params.detailScale + 1.25) - offX * 0.85,
    warpedZ * params.scale * (params.detailScale + 1.25) - offZ * 0.85,
    Math.max(14, Math.floor(params.detailIterations * 0.9)),
    params.detailPower + 0.15
  );
  const obstacleMask = clamp(
    featureMask * 0.58 + roughness * 0.25 + upwardStrength * 0.25 - moisture * 0.16 - water * 0.2,
    0,
    1
  );
  const foliageField = smoothMandelbrot(
    warpedX * params.scale * (params.detailScale * 1.85 + 0.35) + offX * 1.9,
    warpedZ * params.scale * (params.detailScale * 1.85 + 0.35) + offZ * 1.9,
    Math.max(16, Math.floor(params.detailIterations * 1.1)),
    Math.max(1.6, params.detailPower - 0.2)
  );
  const foliageMask = clamp(
    foliageField * moisture * (1 - water) * (0.35 + flatStrength * 0.65) * (1 - obstacleMask * 0.82),
    0,
    1
  );
  return {
    height: rawHeight,
    cumulativeHeight,
    slopeBand,
    heat,
    moisture,
    roughness,
    rockiness,
    water,
    featureMask,
    obstacleMask,
    foliageMask,
    ridge,
    base,
    detail
  };
}

// src/biomes/temperate.ts
function hash32(x) {
  let v = x >>> 0;
  v ^= v >>> 17;
  v = Math.imul(v, 3982152891);
  v ^= v >>> 11;
  v = Math.imul(v, 2890668881);
  v ^= v >>> 15;
  v = Math.imul(v, 830770091);
  v ^= v >>> 14;
  return v >>> 0;
}
function hash012(x) {
  return (hash32(x) & 16777215) / 16777216;
}
function hashCell(cell, seed, salt) {
  const q = cell.q | 0;
  const r = cell.r | 0;
  const level = cell.level | 0;
  const mixed = (Math.imul(q, 1664525) ^ Math.imul(r, 1013904223) ^ Math.imul(level, 747796405) ^ seed ^ salt) >>> 0;
  return hash012(mixed);
}
function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}
function createBiomeFieldParams(seed) {
  const params = defaultFieldParams(seed);
  params.heatBias = -0.02;
  params.moistureBias = 0.08;
  return params;
}
function selectSurface(sample) {
  if (sample.water > 0.58 || sample.cumulativeHeight < 0.14) {
    return SurfaceCover.Water;
  }
  if (sample.heat < 0.18 && sample.water > 0.36) {
    return SurfaceCover.Ice;
  }
  if (sample.heat < 0.3 && (sample.slopeBand === SlopeBand.Upward || sample.cumulativeHeight > 0.52)) {
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
  const grassCapable = sample.heat >= 0.32 && sample.heat <= 0.82 && sample.moisture >= 0.34 && sample.moisture <= 0.88 && sample.slopeBand === SlopeBand.Flat;
  if (grassCapable && sample.foliageMask > 0.4) {
    return SurfaceCover.Grass;
  }
  if (sample.moisture > 0.6) {
    return SurfaceCover.Dirt;
  }
  return sample.obstacleMask > 0.5 ? SurfaceCover.Gravel : SurfaceCover.Dirt;
}
function supportsGroundFoliage(surface) {
  return surface === SurfaceCover.Grass || surface === SurfaceCover.Dirt || surface === SurfaceCover.Mud;
}
function supportsObstacleSurface(surface) {
  return surface === SurfaceCover.Rock || surface === SurfaceCover.Gravel || surface === SurfaceCover.Basalt;
}
function axialDistance(a, b) {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) * 0.5;
}
function selectFeature(surface, sample, variation, nearestTreeDistance, nearestObstacleDistance, nearbyObstacleRatio, isTreeAnchor) {
  if (isTreeAnchor) {
    return MicroFeature.Tree;
  }
  if (surface === SurfaceCover.Water) {
    return variation > 0.88 && sample.moisture > 0.64 ? MicroFeature.Reed : MicroFeature.WaterRipple;
  }
  if (surface === SurfaceCover.Ice && variation > 0.45) {
    return MicroFeature.IceSpike;
  }
  if (surface === SurfaceCover.Rock || surface === SurfaceCover.Gravel || surface === SurfaceCover.Basalt) {
    return sample.obstacleMask > 0.85 ? MicroFeature.Boulder : MicroFeature.Rock;
  }
  if (surface === SurfaceCover.Mud && variation > 0.78) {
    return MicroFeature.Reed;
  }
  const nearTree = nearestTreeDistance <= 2;
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
  const openArea = nearestTreeDistance >= 3 && nearestObstacleDistance >= 2.2 && (surface === SurfaceCover.Grass || surface === SurfaceCover.Dirt);
  if (openArea && sample.moisture > 0.32 && sample.moisture < 0.76 && sample.heat > 0.28 && sample.heat < 0.82 && variation > 0.9) {
    return MicroFeature.Flower;
  }
  const obstacleFalloff = Number.isFinite(nearestObstacleDistance) ? clamp01((3.5 - nearestObstacleDistance) / 3.5) : 0;
  const snowLikeGrassDeposit = clamp01(obstacleFalloff * 0.7 + nearbyObstacleRatio * 0.3);
  if (supportsGroundFoliage(surface) && sample.heat >= 0.3 && sample.heat <= 0.84 && sample.moisture >= 0.28 && sample.moisture <= 0.9 && sample.water < 0.24 && variation < 0.96) {
    const depositThreshold = clamp01(
      0.44 - snowLikeGrassDeposit * 0.24 - sample.foliageMask * 0.08 + Math.max(0, sample.moisture - 0.75) * 0.1
    );
    if (variation > depositThreshold) {
      return MicroFeature.GrassTuft;
    }
  }
  if (sample.slopeBand === SlopeBand.Upward && sample.obstacleMask > 0.6 && variation > 0.94) {
    return MicroFeature.Ruin;
  }
  return void 0;
}
function selectBiome(surface, sample) {
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
function selectMacroBiome(sample) {
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
function generateTemperateMixedForest(options) {
  const terrainSeed = (options.terrainSeed ?? options.seed ?? 1337) >>> 0;
  const featureSeed = (options.featureSeed ?? terrainSeed ^ 2654435769) >>> 0;
  const foliageSeed = (options.foliageSeed ?? terrainSeed ^ 2246822507) >>> 0;
  const levelSpecs = buildHexLevels({
    topAreaKm2: options.topAreaKm2 ?? 1e3,
    minAreaM2: options.minAreaM2 ?? 10,
    levels: options.levels ?? 6
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
    const sample = {
      ...terrainSample,
      featureMask: featureSample.featureMask,
      obstacleMask: featureSample.obstacleMask,
      foliageMask: foliageSample.foliageMask
    };
    const featureNoise = hashCell(cell, featureSeed, 30635);
    const foliageNoise = hashCell(cell, foliageSeed, 20908);
    const variation = clamp01(featureNoise * 0.65 + foliageNoise * 0.35);
    const surface = selectSurface(sample);
    const biome = selectBiome(surface, sample);
    return {
      cell,
      sample,
      variation,
      surface,
      biome,
      macroBiome: selectMacroBiome(sample)
    };
  });
  const treeAnchorIndexes = [];
  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    if (!supportsGroundFoliage(candidate.surface)) {
      continue;
    }
    const treeChance = clamp01(
      8e-3 + candidate.sample.foliageMask * 0.03 + Math.max(0, candidate.sample.moisture - 0.45) * 0.04 - candidate.sample.obstacleMask * 0.02
    );
    const treeRoll = hashCell(candidate.cell, foliageSeed, 41244);
    if (candidate.sample.heat > 0.24 && candidate.sample.heat < 0.82 && candidate.sample.moisture > 0.42 && candidate.sample.water < 0.2 && treeRoll < treeChance) {
      treeAnchorIndexes.push(i);
    }
  }
  const treeAnchorSet = new Set(treeAnchorIndexes);
  const obstacleAnchorIndexes = [];
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
    const cellData = {
      height: clamp01(candidate.sample.height),
      heat: candidate.sample.heat,
      moisture: candidate.sample.moisture,
      biome: candidate.biome,
      macroBiome: candidate.macroBiome,
      surface: candidate.surface,
      feature,
      obstacle: candidate.sample.obstacleMask,
      foliage: candidate.sample.foliageMask,
      slopeBand: candidate.sample.slopeBand
    };
    return cellData;
  });
  return { levelSpec, cells, terrain };
}

// src/perf-monitor.ts
var defaultOptions = {
  targetFps: 120,
  tolerance: 6,
  sampleSize: 90,
  minSampleFraction: 0.6,
  cooldownMs: 1200,
  qualitySlew: 0.05,
  initialBudget: 0.5,
  auto: true
};
function clamp2(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function clamp012(value) {
  return clamp2(value, 0, 1);
}
function median(values) {
  if (!values.length) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) * 0.5;
  }
  return sorted[mid];
}
function createPerfMonitor(options = {}) {
  const config = { ...defaultOptions, ...options };
  let budget = clamp012(config.initialBudget);
  let lastAdjust = 0;
  const samples = [];
  const sampleFps = (fps) => {
    if (!Number.isFinite(fps) || fps <= 0) return;
    samples.push(fps);
    if (samples.length > config.sampleSize) {
      samples.shift();
    }
  };
  const sampleFrame = (dtSeconds) => {
    if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) return;
    sampleFps(1 / dtSeconds);
  };
  const update = (nowMs) => {
    if (!config.auto) {
      return { budget, medianFps: null, miss: null, adjusted: false, stable: true };
    }
    if (nowMs - lastAdjust < config.cooldownMs) {
      return { budget, medianFps: null, miss: null, adjusted: false, stable: false };
    }
    if (samples.length < Math.floor(config.sampleSize * config.minSampleFraction)) {
      return { budget, medianFps: null, miss: null, adjusted: false, stable: false };
    }
    const med = median(samples);
    const miss = config.targetFps - med;
    const tol = config.tolerance;
    if (Math.abs(miss) <= tol) {
      lastAdjust = nowMs;
      return { budget, medianFps: med, miss, adjusted: false, stable: true };
    }
    const magnitude = Math.min(1, (Math.abs(miss) - tol) / tol);
    const direction = miss > 0 ? -1 : 1;
    const next = clamp012(budget + direction * magnitude * config.qualitySlew);
    const adjusted = next !== budget;
    budget = next;
    lastAdjust = nowMs;
    return { budget, medianFps: med, miss, adjusted, stable: false };
  };
  const resetSamples = () => {
    samples.length = 0;
  };
  const setBudget = (next) => {
    budget = clamp012(next);
  };
  const getBudget = () => budget;
  const setAuto = (enabled) => {
    config.auto = enabled;
  };
  const getConfig = () => ({ ...config });
  return {
    sampleFrame,
    sampleFps,
    update,
    resetSamples,
    setBudget,
    getBudget,
    setAuto,
    getConfig
  };
}

// src/fractal-prepass.ts
var GPUBufferUsage = globalThis.GPUBufferUsage;
var GPUMapMode = globalThis.GPUMapMode;
var FRACTAL_ASSET_VERSION = 2;
var FRACTAL_SAMPLE_STRIDE = 8;
var defaultFractalMandelSettings = {
  scale: 0.16,
  strength: 0.85,
  rockBoost: 0.7
};
function serializeFractalAsset(asset) {
  return {
    version: FRACTAL_ASSET_VERSION,
    seed: asset.seed,
    extent: asset.extent,
    gridSize: asset.gridSize,
    heightScale: asset.heightScale,
    sampleStride: FRACTAL_SAMPLE_STRIDE,
    samples: Array.from(asset.samples)
  };
}
function parseFractalAsset(payload) {
  if (!payload || typeof payload !== "object") return null;
  const data = payload;
  if (data.version !== FRACTAL_ASSET_VERSION) return null;
  if (!Array.isArray(data.samples)) return null;
  if (data.sampleStride !== FRACTAL_SAMPLE_STRIDE) return null;
  const gridSize = Number(data.gridSize);
  const heightScale = Number(data.heightScale);
  if (!Number.isFinite(gridSize) || gridSize <= 0) return null;
  if (!Number.isFinite(heightScale)) return null;
  const expected = (gridSize + 1) * (gridSize + 1) * FRACTAL_SAMPLE_STRIDE;
  if (data.samples.length !== expected) return null;
  return {
    seed: Number(data.seed),
    extent: Number(data.extent),
    gridSize,
    heightScale,
    samples: new Float32Array(data.samples)
  };
}
function assetMatches(asset, config) {
  if (!asset) return false;
  if (asset.seed !== config.seed) return false;
  if (asset.gridSize !== config.gridSize) return false;
  if (Math.abs(asset.extent - config.extent) > 1e-3) return false;
  if (!Number.isFinite(asset.heightScale)) return false;
  const expected = (asset.gridSize + 1) * (asset.gridSize + 1) * FRACTAL_SAMPLE_STRIDE;
  if (asset.samples.length !== expected) return false;
  return true;
}
function createFractalPrepassRunner(options) {
  if (!GPUBufferUsage || !GPUMapMode) {
    throw new Error("WebGPU globals not available. Ensure this runs in a WebGPU context.");
  }
  const { device, wgsl, gridSize } = options;
  const gridPoints = gridSize + 1;
  const sampleCount = gridPoints * gridPoints;
  const byteSize = sampleCount * FRACTAL_SAMPLE_STRIDE * 4;
  const uniformBuffer = device.createBuffer({
    size: 7 * 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  });
  const baseBuffer = device.createBuffer({
    size: byteSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
  });
  const accentBuffer = device.createBuffer({
    size: byteSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
  });
  const readbackBuffer = device.createBuffer({
    size: byteSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
  });
  const module2 = device.createShaderModule({ code: wgsl });
  const basePipeline = device.createComputePipeline({
    layout: "auto",
    compute: { module: module2, entryPoint: "main" }
  });
  const accentPipeline = device.createComputePipeline({
    layout: "auto",
    compute: { module: module2, entryPoint: "accent_heights" }
  });
  const baseBindGroup = device.createBindGroup({
    layout: basePipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: { buffer: baseBuffer } }
    ]
  });
  const accentBindGroup = device.createBindGroup({
    layout: accentPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: { buffer: accentBuffer } },
      { binding: 2, resource: { buffer: baseBuffer } }
    ]
  });
  const workgroups = Math.ceil(gridPoints / 8);
  const run = async (runOptions) => {
    const fieldDefaults = defaultFieldParams(runOptions.seed);
    const params = {
      ...fieldDefaults,
      ...runOptions.fieldParams,
      seed: runOptions.seed
    };
    const mandel = { ...defaultFractalMandelSettings, ...runOptions.mandel };
    const step = runOptions.extent * 2 / gridSize;
    const uniformData = new Float32Array(28);
    uniformData.set([gridPoints, runOptions.extent, step, runOptions.seed], 0);
    uniformData.set(
      [params.scale, params.warpScale, params.warpStrength, params.power],
      4
    );
    uniformData.set(
      [params.detailScale, params.detailPower, params.ridgePower, params.heatBias],
      8
    );
    uniformData.set(
      [params.moistureBias, mandel.scale, mandel.strength, mandel.rockBoost],
      12
    );
    uniformData.set(
      [params.iterations, params.detailIterations, params.macroScale, params.macroWarpStrength],
      16
    );
    uniformData.set(
      [
        params.styleMixStrength,
        params.terraceSteps,
        params.terraceStrength,
        params.craterStrength
      ],
      20
    );
    uniformData.set([params.craterScale, params.heightMin, params.heightMax, 0], 24);
    device.queue.writeBuffer(uniformBuffer, 0, uniformData);
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setPipeline(basePipeline);
    pass.setBindGroup(0, baseBindGroup);
    pass.dispatchWorkgroups(workgroups, workgroups);
    pass.setPipeline(accentPipeline);
    pass.setBindGroup(0, accentBindGroup);
    pass.dispatchWorkgroups(workgroups, workgroups);
    pass.end();
    encoder.copyBufferToBuffer(accentBuffer, 0, readbackBuffer, 0, byteSize);
    device.queue.submit([encoder.finish()]);
    await readbackBuffer.mapAsync(GPUMapMode.READ);
    const copy = readbackBuffer.getMappedRange();
    const data = new Float32Array(copy.slice(0));
    readbackBuffer.unmap();
    return {
      seed: runOptions.seed,
      extent: runOptions.extent,
      gridSize,
      heightScale: runOptions.heightScale,
      samples: data
    };
  };
  return {
    gridSize,
    gridPoints,
    sampleCount,
    run
  };
}

// src/tiles.ts
var TILE_ASSET_VERSION = 1;
var MAGIC_BYTES = [84, 87, 76, 68];
var HEADER_BYTES = 68;
var FLAG_HAS_TILE_SIZE = 1 << 0;
var FLAG_HAS_FIELDS = 1 << 1;
var FLAG_HAS_MATERIALS = 1 << 2;
var FLAG_HAS_FEATURES = 1 << 3;
function align4(offset) {
  return offset + 3 & ~3;
}
function expectedHeightCount(gridSize) {
  const gridPoints = gridSize + 1;
  return gridPoints * gridPoints;
}
function validateTileAssetPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== "object") {
    return ["payload must be an object"];
  }
  const key = payload.key;
  if (!key || typeof key !== "object") {
    errors.push("key is required");
  } else {
    const keyFields = ["seed", "tx", "tz", "level"];
    for (const field of keyFields) {
      const value = key[field];
      if (!Number.isFinite(value)) {
        errors.push(`key.${field} must be a number`);
      }
    }
    if (key.tileSizeWorld !== void 0 && !Number.isFinite(key.tileSizeWorld)) {
      errors.push("key.tileSizeWorld must be a number when provided");
    }
  }
  if (!Number.isFinite(payload.gridSize) || payload.gridSize < 1) {
    errors.push("gridSize must be a positive number");
  }
  if (!Number.isFinite(payload.heightScale)) {
    errors.push("heightScale must be a number");
  }
  if (!Array.isArray(payload.height)) {
    errors.push("height must be an array");
  } else {
    const expected = expectedHeightCount(payload.gridSize);
    if (payload.height.length !== expected) {
      errors.push(`height length must be ${expected} for gridSize ${payload.gridSize}`);
    }
  }
  const materialStride = payload.materialStride ?? (payload.materials ? 1 : 0);
  if (payload.materials) {
    if (!Number.isFinite(materialStride) || materialStride <= 0) {
      errors.push("materialStride must be > 0 when materials are provided");
    } else if (payload.materials.length % materialStride !== 0) {
      errors.push("materials length must be divisible by materialStride");
    }
  }
  if (payload.fields) {
    if (!Number.isFinite(payload.fieldStride) || (payload.fieldStride ?? 0) <= 0) {
      errors.push("fieldStride must be > 0 when fields are provided");
    } else if (payload.fields.length % payload.fieldStride !== 0) {
      errors.push("fields length must be divisible by fieldStride");
    }
  }
  if (payload.features) {
    if (!Number.isFinite(payload.featureStride) || (payload.featureStride ?? 0) <= 0) {
      errors.push("featureStride must be > 0 when features are provided");
    } else if (payload.features.length % payload.featureStride !== 0) {
      errors.push("features length must be divisible by featureStride");
    }
  }
  return errors;
}
function serializeTileAssetJson(asset) {
  return {
    version: TILE_ASSET_VERSION,
    key: asset.key,
    gridSize: asset.gridSize,
    heightScale: asset.heightScale,
    height: Array.from(asset.height),
    fields: asset.fields ? Array.from(asset.fields) : void 0,
    fieldStride: asset.fieldStride,
    materials: asset.materials ? Array.from(asset.materials) : void 0,
    materialStride: asset.materialStride ?? (asset.materials ? 1 : void 0),
    features: asset.features ? Array.from(asset.features) : void 0,
    featureStride: asset.featureStride
  };
}
function parseTileAssetJson(payload) {
  const errors = validateTileAssetPayload(payload);
  if (errors.length) {
    throw new Error(`Invalid tile asset payload: ${errors.join("; ")}`);
  }
  const materialStride = payload.materialStride ?? (payload.materials ? 1 : void 0);
  return {
    key: payload.key,
    gridSize: payload.gridSize,
    heightScale: payload.heightScale,
    height: Float32Array.from(payload.height),
    fields: payload.fields ? Float32Array.from(payload.fields) : void 0,
    fieldStride: payload.fieldStride,
    materials: payload.materials ? Uint8Array.from(payload.materials) : void 0,
    materialStride,
    features: payload.features ? Float32Array.from(payload.features) : void 0,
    featureStride: payload.featureStride
  };
}
async function bakeTileAsset(asset, writer) {
  const payload = serializeTileAssetJson(asset);
  const errors = validateTileAssetPayload(payload);
  if (errors.length) {
    throw new Error(`Invalid tile asset payload: ${errors.join("; ")}`);
  }
  if (writer?.writeJson) {
    await writer.writeJson(payload, asset);
  }
  const binary = serializeTileAssetBinaryFromJson(payload);
  if (writer?.writeBinary) {
    await writer.writeBinary(binary, asset, payload);
  }
  return { asset, payload, binary };
}
function serializeTileAssetBinary(asset) {
  const heightCount = asset.height.length;
  const expected = expectedHeightCount(asset.gridSize);
  if (heightCount !== expected) {
    throw new Error(`height length must be ${expected} for gridSize ${asset.gridSize}`);
  }
  const fieldStride = asset.fieldStride ?? 0;
  if (asset.fields && fieldStride <= 0) {
    throw new Error("fieldStride must be provided when fields exist");
  }
  const materialStride = asset.materialStride ?? (asset.materials ? 1 : 0);
  if (asset.materials && materialStride <= 0) {
    throw new Error("materialStride must be provided when materials exist");
  }
  const featureStride = asset.featureStride ?? 0;
  if (asset.features && featureStride <= 0) {
    throw new Error("featureStride must be provided when features exist");
  }
  const fieldCount = asset.fields ? asset.fields.length : 0;
  const materialCount = asset.materials ? asset.materials.length : 0;
  const featureCount = asset.features ? asset.features.length : 0;
  const heightBytes = heightCount * 4;
  const fieldBytes = fieldCount * 4;
  const materialBytes = materialCount;
  const featureBytes = featureCount * 4;
  let offset = HEADER_BYTES + heightBytes + fieldBytes + materialBytes;
  offset = align4(offset);
  const totalBytes = offset + featureBytes;
  const buffer = new ArrayBuffer(totalBytes);
  const view = new DataView(buffer);
  const u8 = new Uint8Array(buffer);
  u8.set(MAGIC_BYTES, 0);
  let cursor = 4;
  view.setUint32(cursor, TILE_ASSET_VERSION, true);
  cursor += 4;
  let flags = 0;
  if (asset.key.tileSizeWorld !== void 0) flags |= FLAG_HAS_TILE_SIZE;
  if (fieldCount) flags |= FLAG_HAS_FIELDS;
  if (materialCount) flags |= FLAG_HAS_MATERIALS;
  if (featureCount) flags |= FLAG_HAS_FEATURES;
  view.setUint32(cursor, flags, true);
  cursor += 4;
  view.setInt32(cursor, asset.key.tx | 0, true);
  cursor += 4;
  view.setInt32(cursor, asset.key.tz | 0, true);
  cursor += 4;
  view.setUint32(cursor, asset.key.level >>> 0, true);
  cursor += 4;
  view.setUint32(cursor, asset.key.seed >>> 0, true);
  cursor += 4;
  view.setFloat32(cursor, asset.key.tileSizeWorld ?? 0, true);
  cursor += 4;
  view.setUint32(cursor, asset.gridSize >>> 0, true);
  cursor += 4;
  view.setFloat32(cursor, asset.heightScale, true);
  cursor += 4;
  view.setUint32(cursor, heightCount >>> 0, true);
  cursor += 4;
  view.setUint32(cursor, fieldCount >>> 0, true);
  cursor += 4;
  view.setUint32(cursor, materialCount >>> 0, true);
  cursor += 4;
  view.setUint32(cursor, featureCount >>> 0, true);
  cursor += 4;
  view.setUint32(cursor, fieldStride >>> 0, true);
  cursor += 4;
  view.setUint32(cursor, materialStride >>> 0, true);
  cursor += 4;
  view.setUint32(cursor, featureStride >>> 0, true);
  cursor += 4;
  let writeOffset = HEADER_BYTES;
  new Float32Array(buffer, writeOffset, heightCount).set(asset.height);
  writeOffset += heightBytes;
  if (fieldCount) {
    new Float32Array(buffer, writeOffset, fieldCount).set(asset.fields);
    writeOffset += fieldBytes;
  }
  if (materialCount) {
    new Uint8Array(buffer, writeOffset, materialCount).set(asset.materials);
    writeOffset += materialBytes;
  }
  writeOffset = align4(writeOffset);
  if (featureCount) {
    new Float32Array(buffer, writeOffset, featureCount).set(asset.features);
  }
  return buffer;
}
function parseTileAssetBinary(input) {
  const buffer = input instanceof ArrayBuffer ? input : input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
  if (buffer.byteLength < HEADER_BYTES) {
    throw new Error("Buffer too small for tile asset header");
  }
  const u8 = new Uint8Array(buffer);
  for (let i = 0; i < MAGIC_BYTES.length; i += 1) {
    if (u8[i] !== MAGIC_BYTES[i]) {
      throw new Error("Invalid tile asset magic header");
    }
  }
  const view = new DataView(buffer);
  let cursor = 4;
  const version = view.getUint32(cursor, true);
  cursor += 4;
  if (version !== TILE_ASSET_VERSION) {
    throw new Error(`Unsupported tile asset version ${version}`);
  }
  const flags = view.getUint32(cursor, true);
  cursor += 4;
  const tx = view.getInt32(cursor, true);
  cursor += 4;
  const tz = view.getInt32(cursor, true);
  cursor += 4;
  const level = view.getUint32(cursor, true);
  cursor += 4;
  const seed = view.getUint32(cursor, true);
  cursor += 4;
  const tileSizeWorld = view.getFloat32(cursor, true);
  cursor += 4;
  const gridSize = view.getUint32(cursor, true);
  cursor += 4;
  const heightScale = view.getFloat32(cursor, true);
  cursor += 4;
  const heightCount = view.getUint32(cursor, true);
  cursor += 4;
  const fieldCount = view.getUint32(cursor, true);
  cursor += 4;
  const materialCount = view.getUint32(cursor, true);
  cursor += 4;
  const featureCount = view.getUint32(cursor, true);
  cursor += 4;
  const fieldStride = view.getUint32(cursor, true);
  cursor += 4;
  const materialStride = view.getUint32(cursor, true);
  cursor += 4;
  const featureStride = view.getUint32(cursor, true);
  cursor += 4;
  const heightBytes = heightCount * 4;
  const fieldBytes = fieldCount * 4;
  const materialBytes = materialCount;
  const featureBytes = featureCount * 4;
  let required = HEADER_BYTES + heightBytes + fieldBytes + materialBytes;
  required = align4(required) + featureBytes;
  if (buffer.byteLength < required) {
    throw new Error("Tile asset buffer is truncated");
  }
  let readOffset = HEADER_BYTES;
  const height = new Float32Array(buffer, readOffset, heightCount);
  readOffset += heightCount * 4;
  const fields = fieldCount ? new Float32Array(buffer, readOffset, fieldCount) : void 0;
  readOffset += fieldCount * 4;
  const materials = materialCount ? new Uint8Array(buffer, readOffset, materialCount) : void 0;
  readOffset += materialCount;
  readOffset = align4(readOffset);
  const features = featureCount ? new Float32Array(buffer, readOffset, featureCount) : void 0;
  const key = {
    seed,
    tx,
    tz,
    level
  };
  if (flags & FLAG_HAS_TILE_SIZE) {
    key.tileSizeWorld = tileSizeWorld;
  }
  return {
    key,
    gridSize,
    heightScale,
    height,
    fields,
    fieldStride: fieldCount ? fieldStride : void 0,
    materials,
    materialStride: materialCount ? materialStride : void 0,
    features,
    featureStride: featureCount ? featureStride : void 0
  };
}
function serializeTileAssetBinaryFromJson(payload) {
  return serializeTileAssetBinary(parseTileAssetJson(payload));
}
function serializeTileAssetJsonFromBinary(input) {
  return serializeTileAssetJson(parseTileAssetBinary(input));
}

// src/tile-cache.ts
var DEFAULT_TILE_SIZE_WORLD = 64;
function normalizeTileKey(key) {
  const tileSizeWorld = key.tileSizeWorld !== void 0 && Number.isFinite(key.tileSizeWorld) ? Number(key.tileSizeWorld) : void 0;
  return {
    seed: key.seed >>> 0,
    tx: Math.trunc(key.tx),
    tz: Math.trunc(key.tz),
    level: Math.max(0, Math.trunc(key.level)),
    tileSizeWorld
  };
}
function tileKeyToString(key) {
  const normalized = normalizeTileKey(key);
  const tileSize = normalized.tileSizeWorld === void 0 ? "default" : normalized.tileSizeWorld.toFixed(3);
  return [
    normalized.seed,
    normalized.level,
    normalized.tx,
    normalized.tz,
    tileSize
  ].join(":");
}
function resolveTileSizeWorld(key, defaultTileSizeWorld = DEFAULT_TILE_SIZE_WORLD) {
  return key.tileSizeWorld ?? defaultTileSizeWorld;
}
function tileBoundsWorld(key, defaultTileSizeWorld = DEFAULT_TILE_SIZE_WORLD) {
  const size = resolveTileSizeWorld(key, defaultTileSizeWorld);
  const minX = key.tx * size;
  const minZ = key.tz * size;
  return {
    minX,
    minZ,
    maxX: minX + size,
    maxZ: minZ + size,
    centerX: minX + size * 0.5,
    centerZ: minZ + size * 0.5,
    size
  };
}
function tileKeyFromWorldPosition(options) {
  const size = options.tileSizeWorld ?? options.defaultTileSizeWorld ?? DEFAULT_TILE_SIZE_WORLD;
  const tx = Math.floor(options.x / size);
  const tz = Math.floor(options.z / size);
  return {
    seed: options.seed,
    tx,
    tz,
    level: options.level ?? 0,
    tileSizeWorld: options.tileSizeWorld
  };
}
function tileAssetFileStem(key) {
  const normalized = normalizeTileKey(key);
  const suffix = normalized.tileSizeWorld === void 0 ? "" : `-ts${normalized.tileSizeWorld.toFixed(3)}`;
  return `tile-${normalized.seed}-${normalized.level}-${normalized.tx}-${normalized.tz}${suffix}`;
}
function estimateAssetBytes(asset, payload, binary) {
  let bytes = asset.height.length * 4;
  if (asset.fields) bytes += asset.fields.length * 4;
  if (asset.materials) bytes += asset.materials.length;
  if (asset.features) bytes += asset.features.length * 4;
  if (binary) bytes += binary.byteLength;
  if (payload) {
    bytes += payload.height.length * 4;
  }
  return bytes;
}
var TileCache = class {
  entries = /* @__PURE__ */ new Map();
  inflight = /* @__PURE__ */ new Map();
  totalBytes = 0;
  options;
  constructor(options = {}) {
    this.options = {
      maxEntries: options.maxEntries ?? 128,
      maxBytes: options.maxBytes ?? 128 * 1024 * 1024,
      keepBinary: options.keepBinary ?? true,
      keepJson: options.keepJson ?? true,
      writer: options.writer,
      now: options.now ?? (() => Date.now()),
      onEvict: options.onEvict ?? (() => {
      })
    };
  }
  getStats() {
    return {
      entries: this.entries.size,
      bytes: this.totalBytes,
      inflight: this.inflight.size
    };
  }
  has(key) {
    return this.entries.has(tileKeyToString(key));
  }
  get(key) {
    const id = tileKeyToString(key);
    const entry = this.entries.get(id);
    if (entry) {
      entry.lastAccess = this.options.now();
    }
    return entry;
  }
  async getOrCreate(key, generator) {
    const normalized = normalizeTileKey(key);
    const id = tileKeyToString(normalized);
    const cached = this.entries.get(id);
    if (cached && cached.status === "ready") {
      cached.lastAccess = this.options.now();
      return cached;
    }
    const inflight = this.inflight.get(id);
    if (inflight) {
      return inflight;
    }
    const entry = {
      key: normalized,
      status: "pending",
      bytes: 0,
      lastAccess: this.options.now()
    };
    this.entries.set(id, entry);
    const promise = (async () => {
      try {
        const asset = await generator(normalized);
        const baked = await bakeTileAsset(asset, this.options.writer);
        const payload = this.options.keepJson ? baked.payload : void 0;
        const binary = this.options.keepBinary ? baked.binary : void 0;
        const bytes = estimateAssetBytes(asset, payload, binary);
        const ready = {
          key: normalized,
          status: "ready",
          asset,
          payload,
          binary,
          bytes,
          lastAccess: this.options.now()
        };
        this.replaceEntry(id, ready);
        this.inflight.delete(id);
        this.evictIfNeeded();
        return ready;
      } catch (error) {
        const failed = {
          key: normalized,
          status: "error",
          bytes: 0,
          lastAccess: this.options.now(),
          error
        };
        this.replaceEntry(id, failed);
        this.inflight.delete(id);
        return failed;
      }
    })();
    this.inflight.set(id, promise);
    return promise;
  }
  delete(key) {
    const id = tileKeyToString(key);
    const entry = this.entries.get(id);
    if (!entry) return false;
    this.entries.delete(id);
    this.totalBytes -= entry.bytes;
    this.options.onEvict(entry);
    return true;
  }
  replaceEntry(id, entry) {
    const existing = this.entries.get(id);
    if (existing) {
      this.totalBytes -= existing.bytes;
    }
    this.entries.set(id, entry);
    this.totalBytes += entry.bytes;
  }
  evictIfNeeded() {
    const { maxEntries, maxBytes } = this.options;
    while (this.entries.size > maxEntries || this.totalBytes > maxBytes) {
      let oldestId = null;
      let oldestTime = Infinity;
      for (const [id, entry2] of this.entries) {
        if (entry2.status !== "ready") continue;
        if (entry2.lastAccess < oldestTime) {
          oldestTime = entry2.lastAccess;
          oldestId = id;
        }
      }
      if (!oldestId) {
        break;
      }
      const entry = this.entries.get(oldestId);
      if (entry) {
        this.entries.delete(oldestId);
        this.totalBytes -= entry.bytes;
        this.options.onEvict(entry);
      } else {
        break;
      }
    }
  }
};

// src/mesh.ts
function clamp3(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function normalize(vec) {
  const len = Math.hypot(vec[0], vec[1], vec[2]);
  if (len === 0) return [0, 1, 0];
  return [vec[0] / len, vec[1] / len, vec[2] / len];
}
function computeNormal(a, b, c) {
  const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  return normalize([
    ab[1] * ac[2] - ab[2] * ac[1],
    ab[2] * ac[0] - ab[0] * ac[2],
    ab[0] * ac[1] - ab[1] * ac[0]
  ]);
}
function shade(color, factor) {
  return [color[0] * factor, color[1] * factor, color[2] * factor];
}
function createMeshBuilder(sizeOrOptions = 1) {
  const options = typeof sizeOrOptions === "number" ? { size: sizeOrOptions } : sizeOrOptions;
  const size = options.size ?? 1;
  const includeGeomorph = options.includeGeomorph ?? false;
  const defaultMaterial = options.defaultMaterial ?? 0;
  const foliageMaterial = options.foliageMaterial ?? defaultMaterial;
  const vertices = [];
  const boxMin = [];
  const boxMax = [];
  let treeMeshCount = 0;
  const vertexStride = includeGeomorph ? 13 : 11;
  const pushVertex = (pos, normal, color, sway = 0, material = defaultMaterial, geomorph) => {
    vertices.push(
      pos[0],
      pos[1],
      pos[2],
      normal[0],
      normal[1],
      normal[2],
      color[0],
      color[1],
      color[2],
      sway,
      material
    );
    if (includeGeomorph) {
      const targetY = geomorph?.targetY ?? pos[1];
      const weight = geomorph?.weight ?? 0;
      vertices.push(targetY, weight);
    }
  };
  const addTriangle = (a, b, c, normal, color, swayA = 0, swayB = swayA, swayC = swayA, material = defaultMaterial, morphA, morphB, morphC) => {
    pushVertex(a, normal, color, swayA, material, morphA);
    pushVertex(b, normal, color, swayB, material, morphB);
    pushVertex(c, normal, color, swayC, material, morphC);
  };
  const addQuad = (a, b, c, d, normal, color, swayA = 0, swayB = swayA, swayC = swayA, swayD = swayA, material = defaultMaterial, morphA, morphB, morphC, morphD) => {
    addTriangle(a, b, c, normal, color, swayA, swayB, swayC, material, morphA, morphB, morphC);
    addTriangle(c, d, a, normal, color, swayC, swayD, swayA, material, morphC, morphD, morphA);
  };
  const addPrism = (center, radius, bottom, height, color, swayBase = 0, swayScale = 0, material = defaultMaterial) => {
    const top = [];
    const base = [];
    const baseY = center[1] + bottom;
    const topY = baseY + height;
    const safeHeight = Math.max(height, 1e-3);
    const swayFor = (y) => swayBase + swayScale * clamp3((y - baseY) / safeHeight, 0, 1);
    for (let i = 0; i < 6; i += 1) {
      const angle = Math.PI / 180 * (60 * i - 30);
      const x = center[0] + radius * Math.cos(angle);
      const z = center[2] + radius * Math.sin(angle);
      top.push([x, topY, z]);
      base.push([x, baseY, z]);
    }
    const topCenter = [center[0], topY, center[2]];
    const topSway = swayFor(topY);
    for (let i = 0; i < 6; i += 1) {
      const a = topCenter;
      const b = top[i];
      const c = top[(i + 1) % 6];
      const normal = computeNormal(a, b, c);
      addTriangle(a, b, c, normal, color, topSway, topSway, topSway, material);
    }
    for (let i = 0; i < 6; i += 1) {
      const top0 = top[i];
      const top1 = top[(i + 1) % 6];
      const bottom0 = base[i];
      const bottom1 = base[(i + 1) % 6];
      const normal = computeNormal(top0, bottom0, bottom1);
      const swayTop0 = swayFor(top0[1]);
      const swayTop1 = swayFor(top1[1]);
      const swayBottom0 = swayFor(bottom0[1]);
      const swayBottom1 = swayFor(bottom1[1]);
      addQuad(
        top0,
        bottom0,
        bottom1,
        top1,
        normal,
        shade(color, 0.85),
        swayTop0,
        swayBottom0,
        swayBottom1,
        swayTop1,
        material
      );
    }
  };
  const addTreeMesh = (center, baseHeight, seedValue, material = defaultMaterial) => {
    const trunkRadius = size * (0.12 + seedValue * 0.05);
    const trunkHeight = 0.5 + seedValue * 0.6;
    const canopyRadius = size * (0.36 + seedValue * 0.18);
    const canopyHeight = 0.6 + seedValue * 0.4;
    const trunkColor = [0.28, 0.18, 0.1];
    const leafColor = [0.18, 0.45, 0.2];
    addPrism(center, trunkRadius, baseHeight, trunkHeight, trunkColor, 0.02, 0.28, material);
    addPrism(
      [center[0], baseHeight + trunkHeight * 0.7, center[2]],
      canopyRadius,
      0,
      canopyHeight * 0.55,
      leafColor,
      0.12,
      0.9,
      foliageMaterial
    );
    addPrism(
      [center[0], baseHeight + trunkHeight + canopyHeight * 0.1, center[2]],
      canopyRadius * 0.7,
      0,
      canopyHeight * 0.35,
      shade(leafColor, 0.95),
      0.2,
      1.1,
      foliageMaterial
    );
    treeMeshCount += 1;
  };
  const addBounds = (points, minY = 0, maxYOverride) => {
    const xs = points.map((p) => p[0]);
    const zs = points.map((p) => p[2]);
    const ys = points.map((p) => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    const maxY = typeof maxYOverride === "number" ? maxYOverride : Math.max(...ys);
    boxMin.push(minX, minY, minZ, 0);
    boxMax.push(maxX, maxY, maxZ, 0);
  };
  return {
    vertices,
    boxMin,
    boxMax,
    vertexStride,
    includeGeomorph,
    addTriangle,
    addQuad,
    addTreeMesh,
    addBounds,
    get treeMeshCount() {
      return treeMeshCount;
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_TILE_SIZE_WORLD,
  FIELD_DOWNWARD_MAX,
  FIELD_UPWARD_MIN,
  FRACTAL_ASSET_VERSION,
  FRACTAL_SAMPLE_STRIDE,
  MacroBiome,
  MacroBiomeLabel,
  MicroFeature,
  MicroFeatureLabel,
  SlopeBand,
  SlopeBandLabel,
  SurfaceCover,
  SurfaceCoverLabel,
  TILE_ASSET_VERSION,
  TerrainBiome,
  TerrainBiomeLabel,
  TileCache,
  assetMatches,
  axialToWorld,
  bakeTileAsset,
  buildHexLevels,
  classifySlopeBand,
  computeNormal,
  createFractalPrepassRunner,
  createMeshBuilder,
  createPerfMonitor,
  defaultFieldParams,
  defaultFractalMandelSettings,
  encodeTerrainParams,
  fieldWgslUrl,
  fractalPrepassWgslUrl,
  generateHexGrid,
  generateTemperateMixedForest,
  hexAreaFromSide,
  hexSideFromArea,
  loadFieldWgsl,
  loadFractalPrepassWgsl,
  loadTerrainWgsl,
  normalize,
  normalizeTileKey,
  packHexCells,
  parseFractalAsset,
  parseTileAssetBinary,
  parseTileAssetJson,
  resolveTileSizeWorld,
  sampleFieldStack,
  serializeFractalAsset,
  serializeTileAssetBinary,
  serializeTileAssetBinaryFromJson,
  serializeTileAssetJson,
  serializeTileAssetJsonFromBinary,
  shade,
  terrainWgslUrl,
  tileAssetFileStem,
  tileBoundsWorld,
  tileKeyFromWorldPosition,
  tileKeyToString,
  unpackTerrain,
  validateTileAssetPayload
});
//# sourceMappingURL=index.cjs.map