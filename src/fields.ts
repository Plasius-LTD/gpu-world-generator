import { SlopeBand, type SlopeBandId } from "./types";

export const FIELD_DOWNWARD_MAX = 0.2;
export const FIELD_UPWARD_MIN = 0.8;

export type FieldParams = {
  seed: number;
  scale: number;
  warpScale: number;
  warpStrength: number;
  iterations: number;
  power: number;
  detailScale: number;
  detailIterations: number;
  detailPower: number;
  ridgePower: number;
  heatBias: number;
  moistureBias: number;
  macroScale: number;
  macroWarpStrength: number;
  styleMixStrength: number;
  terraceSteps: number;
  terraceStrength: number;
  craterStrength: number;
  craterScale: number;
  heightMin: number;
  heightMax: number;
};

export type FieldSample = {
  height: number;
  cumulativeHeight: number;
  slopeBand: SlopeBandId;
  heat: number;
  moisture: number;
  roughness: number;
  rockiness: number;
  water: number;
  featureMask: number;
  obstacleMask: number;
  foliageMask: number;
  ridge: number;
  base: number;
  detail: number;
};

export function classifySlopeBand(cumulativeHeight: number): SlopeBandId {
  if (cumulativeHeight < FIELD_DOWNWARD_MAX) {
    return SlopeBand.Downward;
  }
  if (cumulativeHeight >= FIELD_UPWARD_MIN) {
    return SlopeBand.Upward;
  }
  return SlopeBand.Flat;
}

export function defaultFieldParams(seed = 1337): FieldParams {
  return {
    seed,
    scale: 0.14,
    warpScale: 0.5,
    warpStrength: 0.75,
    iterations: 64,
    power: 2.2,
    detailScale: 3.2,
    detailIterations: 28,
    detailPower: 2.0,
    ridgePower: 1.25,
    heatBias: 0,
    moistureBias: 0,
    macroScale: 0.035,
    macroWarpStrength: 0.18,
    styleMixStrength: 1.0,
    terraceSteps: 6,
    terraceStrength: 0.35,
    craterStrength: 0.25,
    craterScale: 0.18,
    heightMin: -0.35,
    heightMax: 1.6,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function hash01(seed: number) {
  const s = Math.sin(seed) * 43758.5453123;
  return s - Math.floor(s);
}

function smoothMandelbrot(cx: number, cy: number, iterations: number, power: number) {
  let zx = 0;
  let zy = 0;
  let i = 0;
  for (; i < iterations; i += 1) {
    const r2 = zx * zx + zy * zy;
    if (r2 > 4) {
      break;
    }
    const r = Math.sqrt(r2);
    const theta = Math.atan2(zy, zx);
    const rp = Math.pow(r, power);
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

function terrace(height: number, steps: number) {
  const count = Math.max(1, Math.round(steps));
  const step = 1 / count;
  const h = clamp(height, 0, 1);
  const band = Math.floor(h / step);
  const t = (h - band * step) / step;
  const smoothed = t * t * (3 - 2 * t);
  return (band + smoothed) * step;
}

function craterField(x: number, z: number, scale: number, seed: number) {
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

export function sampleFieldStack(x: number, z: number, params: FieldParams): FieldSample {
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
  const baseHeight =
    Math.pow(base, 0.9) * Math.pow(mid, 1.05) * Math.pow(detail, 1.1);

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
    baseHeight * (1 - params.terraceStrength) +
      terraceHeight * params.terraceStrength -
      crater * params.craterStrength +
      Math.pow(ridge, 1.6) * 0.12,
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
    0.5 +
      shaped * 0.8 +
      macroOffset +
      ridgeBoost +
      upwardStrength * 0.22 -
      downwardStrength * 0.22,
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
    0.55 * detail +
      0.35 * (1 - height01) -
      (heat - 0.5) * 0.1 +
      params.moistureBias,
    0,
    1
  );
  const rockiness = clamp(roughness * 0.6 + height01 * 0.4, 0, 1);
  const water = clamp((0.32 - height01) * 3.0 + (moisture - 0.5) * 0.2, 0, 1);
  const featureMask = smoothMandelbrot(
    warpedX * params.scale * (params.detailScale + 1.25) - offX * 0.85,
    warpedZ * params.scale * (params.detailScale + 1.25) - offZ * 0.85,
    Math.max(14, Math.floor(params.detailIterations * 0.9)),
    params.detailPower + 0.15
  );
  const obstacleMask = clamp(
    featureMask * 0.58 +
      roughness * 0.25 +
      upwardStrength * 0.25 -
      moisture * 0.16 -
      water * 0.2,
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
    foliageField *
      moisture *
      (1 - water) *
      (0.35 + flatStrength * 0.65) *
      (1 - obstacleMask * 0.82),
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
    detail,
  };
}
