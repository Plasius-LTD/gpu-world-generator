struct HexCell {
  q: i32,
  r: i32,
  level: i32,
  flags: i32,
};

struct TerrainCell {
  height: f32,
  heat: f32,
  moisture: f32,
  biome: u32,
  surface: u32,
  feature: u32,
  foliage: f32,
  slope_band: u32,
};

struct TerrainParams {
  seed: u32,
  cell_count: u32,
  heat_bias: f32,
  height_scale: f32,
  macro_scale: f32,
  macro_warp_strength: f32,
  style_mix_strength: f32,
  terrace_steps: f32,
  terrace_strength: f32,
  crater_strength: f32,
  crater_scale: f32,
  height_min: f32,
  height_max: f32,
  slope_low: f32,
  slope_high: f32,
  pad0: f32,
};

@group(1) @binding(0) var<storage, read> cells: array<HexCell>;
@group(1) @binding(1) var<storage, read_write> terrain: array<TerrainCell>;
@group(1) @binding(2) var<uniform> params: TerrainParams;

const BIOME_PLAINS: u32 = 0u;
const BIOME_TUNDRA: u32 = 1u;
const BIOME_SAVANNA: u32 = 2u;
const BIOME_RIVER: u32 = 3u;
const BIOME_CITY: u32 = 4u;
const BIOME_VILLAGE: u32 = 5u;
const BIOME_ICE: u32 = 6u;
const BIOME_MOUNTAINOUS: u32 = 8u;
const BIOME_VOLCANIC: u32 = 9u;
const BIOME_ROAD: u32 = 10u;
const BIOME_TOWN: u32 = 11u;
const BIOME_CASTLE: u32 = 12u;
const BIOME_MIXED_FOREST: u32 = 13u;

const SURFACE_GRASS: u32 = 0u;
const SURFACE_DIRT: u32 = 1u;
const SURFACE_SAND: u32 = 2u;
const SURFACE_ROCK: u32 = 3u;
const SURFACE_GRAVEL: u32 = 4u;
const SURFACE_ICE: u32 = 6u;
const SURFACE_MUD: u32 = 7u;
const SURFACE_WATER: u32 = 11u;
const SURFACE_BASALT: u32 = 12u;

const FEATURE_TREE: u32 = 0u;
const FEATURE_BUSH: u32 = 1u;
const FEATURE_GRASS_TUFT: u32 = 2u;
const FEATURE_REED: u32 = 3u;
const FEATURE_ROCK: u32 = 4u;
const FEATURE_BOULDER: u32 = 5u;
const FEATURE_WATER_RIPPLE: u32 = 6u;
const FEATURE_ICE_SPIKE: u32 = 7u;
const FEATURE_RUIN: u32 = 13u;
const FEATURE_NONE: u32 = 4294967295u;

const SLOPE_DOWNWARD: u32 = 0u;
const SLOPE_FLAT: u32 = 1u;
const SLOPE_UPWARD: u32 = 2u;

fn hash32(x: u32) -> u32 {
  var v = x;
  v ^= v >> 17u;
  v *= 0xed5ad4bbu;
  v ^= v >> 11u;
  v *= 0xac4c1b51u;
  v ^= v >> 15u;
  v *= 0x31848babu;
  v ^= v >> 14u;
  return v;
}

fn hash01(x: u32) -> f32 {
  let v = hash32(x) & 0x00ffffffu;
  return f32(v) / 16777216.0;
}

fn smooth_mandelbrot(cx: f32, cy: f32, iterations: u32, power: f32) -> f32 {
  var zx = 0.0;
  var zy = 0.0;
  var i: u32 = 0u;
  loop {
    if (i >= iterations) {
      break;
    }
    let r2 = zx * zx + zy * zy;
    if (r2 > 4.0) {
      break;
    }
    let r = sqrt(r2);
    let theta = atan2(zy, zx);
    let rp = pow(r, power);
    zx = rp * cos(theta * power) + cx;
    zy = rp * sin(theta * power) + cy;
    i = i + 1u;
  }
  if (i >= iterations) {
    return 1.0;
  }
  let r = max(sqrt(zx * zx + zy * zy), 1e-6);
  let nu = log2(log(r));
  let smoothVal = (f32(i) + 1.0 - nu) / f32(iterations);
  return clamp(smoothVal, 0.0, 1.0);
}

fn terrace_height(h: f32, steps: f32) -> f32 {
  let count = max(1.0, steps);
  let step = 1.0 / count;
  let clamped = clamp(h, 0.0, 1.0);
  let band = floor(clamped / step);
  let t = fract(clamped / step);
  let blend = t * t * (3.0 - 2.0 * t);
  return (band + blend) * step;
}

fn crater_field(p: vec2<f32>, scale: f32, seed: u32) -> f32 {
  let sp = p * scale;
  let cell = floor(sp);
  let local = sp - cell;
  let cx = i32(cell.x);
  let cz = i32(cell.y);
  let hx = u32(bitcast<u32>(cx));
  let hz = u32(bitcast<u32>(cz));
  let h0 = hash01((hx * 374761393u) ^ (hz * 668265263u) ^ seed ^ 0x9e3779b9u);
  let h1 = hash01((hx * 2246822519u) ^ (hz * 3266489917u) ^ seed ^ 0x85ebca6bu);
  let h2 = hash01((hx * 1597334677u) ^ (hz * 3812015801u) ^ seed ^ 0xc2b2ae35u);
  let center = vec2<f32>(h0, h1);
  let radius = 0.22 + 0.25 * h2;
  let dist = distance(local, center);
  return smoothstep(radius, radius * 0.35, dist);
}

fn macro_map(p: vec2<f32>, iterations: u32, power: f32) -> f32 {
  let macro_iter = max(10u, iterations / 3u);
  let macroA = smooth_mandelbrot(p.x * params.macro_scale, p.y * params.macro_scale, macro_iter, power);
  let macroB = smooth_mandelbrot(
    (p.x + 13.7) * params.macro_scale,
    (p.y - 9.2) * params.macro_scale,
    macro_iter,
    power + 0.35
  );
  let warp = vec2<f32>(macroA - 0.5, macroB - 0.5) * params.macro_warp_strength;
  let macroC = smooth_mandelbrot(
    (p.x + warp.x) * params.macro_scale,
    (p.y + warp.y) * params.macro_scale,
    macro_iter,
    power
  );
  return clamp((macroC - 0.5) * params.style_mix_strength + 0.5, 0.0, 1.0);
}

fn hash_cell(cell: HexCell, seed: u32, salt: u32) -> f32 {
  let q = u32(bitcast<u32>(cell.q));
  let r = u32(bitcast<u32>(cell.r));
  let lvl = u32(bitcast<u32>(cell.level));
  let mixed = q * 1664525u ^ r * 1013904223u ^ lvl * 747796405u ^ seed ^ salt;
  return hash01(mixed);
}

fn classify_slope(cumulative_height: f32, low: f32, high: f32) -> u32 {
  if (cumulative_height < low) {
    return SLOPE_DOWNWARD;
  }
  if (cumulative_height >= high) {
    return SLOPE_UPWARD;
  }
  return SLOPE_FLAT;
}

fn classify_biome(
  heat: f32,
  moisture: f32,
  surface: u32,
  slope_band: u32,
  obstacle: f32,
  foliage: f32
) -> u32 {
  if (surface == SURFACE_WATER) {
    if (heat < 0.25) {
      return BIOME_ICE;
    }
    return BIOME_RIVER;
  }
  if (surface == SURFACE_ICE) {
    return BIOME_ICE;
  }
  if (slope_band == SLOPE_UPWARD && obstacle > 0.68) {
    if (heat > 0.72) {
      return BIOME_VOLCANIC;
    }
    return BIOME_MOUNTAINOUS;
  }
  if (heat < 0.3) {
    return BIOME_TUNDRA;
  }
  if (heat > 0.74 && moisture < 0.33) {
    return BIOME_SAVANNA;
  }
  if (foliage > 0.55 && moisture > 0.45) {
    return BIOME_MIXED_FOREST;
  }
  return BIOME_PLAINS;
}

fn maybe_settlement(current: u32, height: f32, cell: HexCell, seed: u32, obstacle: f32) -> u32 {
  let settlement = hash_cell(cell, seed, 0x9e3779b9u);
  let level = cell.level;
  if (obstacle > 0.8) {
    return current;
  }
  if (height > 0.6 && settlement > 0.997) {
    return BIOME_CASTLE;
  }
  if (level <= 0 && settlement > 0.994) {
    return BIOME_CITY;
  }
  if (level <= 1 && settlement > 0.992) {
    return BIOME_TOWN;
  }
  if (level <= 2 && settlement > 0.988) {
    return BIOME_VILLAGE;
  }
  let roadNoise = hash_cell(cell, seed, 0x6c8e9cf5u);
  if (level >= 2 && roadNoise > 0.996) {
    return BIOME_ROAD;
  }
  return current;
}

fn process_job(job_index: u32, job_type: u32, payload_words: u32) {
  if (job_index >= params.cell_count) {
    return;
  }

  let cell = cells[job_index];
  let p = vec2<f32>(f32(cell.q), f32(cell.r));
  let seed = params.seed;

  let scale = 0.14;
  let warp_scale = 0.5;
  let warp_strength = 0.75;
  let power = 2.2;
  let detail_scale = 3.2;
  let detail_power = 2.0;
  let iterations = 24u;
  let detail_iterations = 14u;

  let offX = hash01(seed ^ 0x7f4a7c15u) * 4.0 - 2.0;
  let offZ = hash01(seed ^ 0xa9d84d2bu) * 4.0 - 2.0;
  let warpOffX = hash01(seed ^ 0x8c2f1d3bu) * 6.0 - 3.0;
  let warpOffZ = hash01(seed ^ 0x5d2c79e9u) * 6.0 - 3.0;

  let warpIter = max(12u, iterations * 6u / 10u);
  let warpA = smooth_mandelbrot(
    (p.x + warpOffX) * warp_scale,
    (p.y + warpOffZ) * warp_scale,
    warpIter,
    power
  );
  let warpB = smooth_mandelbrot(
    (p.x - warpOffZ) * warp_scale,
    (p.y + warpOffX) * warp_scale,
    warpIter,
    power
  );
  let warped = vec2<f32>(
    p.x + (warpA - 0.5) * warp_strength,
    p.y + (warpB - 0.5) * warp_strength
  );

  let base = smooth_mandelbrot(
    warped.x * scale + offX,
    warped.y * scale + offZ,
    iterations,
    power
  );
  let mid = smooth_mandelbrot(
    warped.x * scale * 2.15 + offX * 0.6,
    warped.y * scale * 2.15 + offZ * 0.6,
    max(14u, iterations * 7u / 10u),
    power + 0.2
  );
  let detail = smooth_mandelbrot(
    warped.x * scale * detail_scale + offX * 1.4,
    warped.y * scale * detail_scale + offZ * 1.4,
    detail_iterations,
    detail_power
  );

  let ridge = 1.0 - abs(2.0 * mid - 1.0);
  let baseHeight = pow(base, 0.9) * pow(mid, 1.05) * pow(detail, 1.1);
  let styleMask = macro_map(warped, iterations, power);
  let terrace = terrace_height(baseHeight, params.terrace_steps);
  let crater = crater_field(warped, params.crater_scale, seed);

  let styleA = clamp(pow(baseHeight, 0.8) + pow(ridge, 1.4) * 0.2, 0.0, 1.0);
  let styleB = clamp(
    baseHeight * (1.0 - params.terrace_strength) +
      terrace * params.terrace_strength -
      crater * params.crater_strength +
      pow(ridge, 1.6) * 0.12,
    0.0,
    1.0
  );
  let mixed = mix(styleA, styleB, styleMask);
  let cumulative_height = clamp(
    base * 0.38 + mid * 0.33 + detail * 0.21 + styleMask * 0.08,
    0.0,
    1.0
  );
  let slopeLow = clamp(params.slope_low, 0.01, 0.49);
  let slopeHigh = clamp(max(slopeLow + 0.01, params.slope_high), 0.5, 0.99);
  let slopeBand = classify_slope(cumulative_height, slopeLow, slopeHigh);
  let downwardStrength = 1.0 - smoothstep(0.0, slopeLow, cumulative_height);
  let upwardStrength = smoothstep(slopeHigh, 1.0, cumulative_height);
  let flatStrength = clamp(1.0 - max(downwardStrength, upwardStrength), 0.0, 1.0);

  let ridgeBoost = pow(ridge, 1.35) * 0.22;
  let centered = (mixed - 0.5) * 2.0;
  let shaped = sign(centered) * pow(abs(centered), 0.75);
  let macroOffset = (styleMask - 0.5) * 0.25;
  let rawHeight = clamp(
    0.5 +
      shaped * 0.8 +
      macroOffset +
      ridgeBoost +
      upwardStrength * 0.22 -
      downwardStrength * 0.22,
    params.height_min,
    params.height_max
  );
  let height01 = clamp(rawHeight, 0.0, 1.0);

  let roughness = clamp(pow(ridge, 1.25) * 0.7 + detail * 0.3, 0.0, 1.0);
  let heat = clamp(0.55 * mid + 0.35 * (1.0 - height01) + params.heat_bias, 0.0, 1.0);
  let moisture = clamp(
    0.55 * detail + 0.35 * (1.0 - height01) - (heat - 0.5) * 0.1,
    0.0,
    1.0
  );
  let rockiness = clamp(roughness * 0.6 + height01 * 0.4, 0.0, 1.0);
  let water = clamp((0.32 - height01) * 3.0 + (moisture - 0.5) * 0.2, 0.0, 1.0);

  let feature_mask = smooth_mandelbrot(
    warped.x * scale * (detail_scale + 1.25) - offX * 0.85,
    warped.y * scale * (detail_scale + 1.25) - offZ * 0.85,
    max(12u, detail_iterations),
    detail_power + 0.15
  );
  let obstacle = clamp(
    feature_mask * 0.58 +
      roughness * 0.25 +
      upwardStrength * 0.25 -
      moisture * 0.16 -
      water * 0.2,
    0.0,
    1.0
  );
  let foliage_field = smooth_mandelbrot(
    warped.x * scale * (detail_scale * 1.85 + 0.35) + offX * 1.9,
    warped.y * scale * (detail_scale * 1.85 + 0.35) + offZ * 1.9,
    max(16u, detail_iterations + 2u),
    max(1.6, detail_power - 0.2)
  );
  let foliage = clamp(
    foliage_field * moisture * (1.0 - water) * (0.35 + flatStrength * 0.65) * (1.0 - obstacle * 0.82),
    0.0,
    1.0
  );

  var surface = SURFACE_DIRT;
  if (water > 0.58 || cumulative_height < 0.14) {
    surface = SURFACE_WATER;
  } else if (heat < 0.2 && water > 0.42) {
    surface = SURFACE_ICE;
  } else if (slopeBand == SLOPE_DOWNWARD && moisture > 0.52) {
    surface = SURFACE_MUD;
  } else if (obstacle > 0.72 || slopeBand == SLOPE_UPWARD) {
    surface = SURFACE_ROCK;
    if (heat > 0.72) {
      surface = SURFACE_BASALT;
    }
  } else if (heat > 0.74 && moisture < 0.32) {
    surface = SURFACE_SAND;
  } else if (foliage > 0.45 && moisture > 0.42) {
    surface = SURFACE_GRASS;
  } else if (moisture > 0.6) {
    surface = SURFACE_DIRT;
  } else if (obstacle > 0.5) {
    surface = SURFACE_GRAVEL;
  }

  let featureNoise = hash_cell(cell, seed, 0x77abu);
  var feature = FEATURE_NONE;
  if (surface == SURFACE_WATER) {
    feature = FEATURE_WATER_RIPPLE;
  } else if (surface == SURFACE_ICE && featureNoise > 0.45) {
    feature = FEATURE_ICE_SPIKE;
  } else if (
    surface == SURFACE_ROCK ||
    surface == SURFACE_GRAVEL ||
    surface == SURFACE_BASALT
  ) {
    feature = FEATURE_ROCK;
    if (obstacle > 0.85) {
      feature = FEATURE_BOULDER;
    }
  } else if (surface == SURFACE_MUD && featureNoise > 0.75) {
    feature = FEATURE_REED;
  } else if (foliage > 0.72 && moisture > 0.55 && featureNoise > 0.35) {
    feature = FEATURE_TREE;
  } else if (foliage > 0.5 && featureNoise > 0.28) {
    feature = FEATURE_BUSH;
  } else if (surface == SURFACE_GRASS && foliage > 0.3 && featureNoise > 0.15) {
    feature = FEATURE_GRASS_TUFT;
  } else if (slopeBand == SLOPE_UPWARD && obstacle > 0.6 && featureNoise > 0.94) {
    feature = FEATURE_RUIN;
  }

  var biome = classify_biome(heat, moisture, surface, slopeBand, obstacle, foliage);
  biome = maybe_settlement(biome, height01, cell, params.seed, obstacle);

  terrain[job_index].height = rawHeight * params.height_scale;
  terrain[job_index].heat = heat;
  terrain[job_index].moisture = moisture;
  terrain[job_index].biome = biome;
  terrain[job_index].surface = surface;
  terrain[job_index].feature = feature;
  terrain[job_index].foliage = foliage;
  terrain[job_index].slope_band = slopeBand;
}
