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
};

struct TerrainParams {
  seed: u32,
  cell_count: u32,
  heat_bias: f32,
  height_scale: f32,
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
const BIOME_SNOW: u32 = 7u;
const BIOME_MOUNTAINOUS: u32 = 8u;
const BIOME_VOLCANIC: u32 = 9u;
const BIOME_ROAD: u32 = 10u;
const BIOME_TOWN: u32 = 11u;
const BIOME_CASTLE: u32 = 12u;
const BIOME_MIXED_FOREST: u32 = 13u;

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

fn hash_cell(cell: HexCell, seed: u32, salt: u32) -> f32 {
  let q = u32(bitcast<u32>(cell.q));
  let r = u32(bitcast<u32>(cell.r));
  let lvl = u32(bitcast<u32>(cell.level));
  let mixed = q * 1664525u ^ r * 1013904223u ^ lvl * 747796405u ^ seed ^ salt;
  return hash01(mixed);
}

fn classify_biome(height: f32, heat: f32, moisture: f32, cell: HexCell) -> u32 {
  if (heat > 0.35 && heat < 0.7 && moisture > 0.45 && moisture < 0.85 && height > 0.2 && height < 0.75) {
    return BIOME_MIXED_FOREST;
  }
  if (height > 0.85 && heat > 0.7) {
    return BIOME_VOLCANIC;
  }
  if (height > 0.78) {
    return BIOME_MOUNTAINOUS;
  }
  if (height < 0.18 && heat < 0.2) {
    return BIOME_ICE;
  }
  if (height < 0.2 && heat < 0.35) {
    return BIOME_SNOW;
  }
  if (height < 0.22 && moisture > 0.7) {
    return BIOME_RIVER;
  }
  if (heat > 0.75 && moisture < 0.35) {
    return BIOME_SAVANNA;
  }
  if (heat < 0.3) {
    return BIOME_TUNDRA;
  }

  return BIOME_PLAINS;
}

fn maybe_settlement(current: u32, height: f32, heat: f32, cell: HexCell, seed: u32) -> u32 {
  let settlement = hash_cell(cell, seed, 0x9e3779b9u);
  let level = cell.level;

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
  let base = hash_cell(cell, params.seed, 0x1234u);
  let heatRaw = hash_cell(cell, params.seed, 0x5345u);
  let moistRaw = hash_cell(cell, params.seed, 0x9c9cu);

  let height = pow(base, 1.15) * params.height_scale;
  let heat = clamp(heatRaw + params.heat_bias - height * 0.25, 0.0, 1.0);
  let moisture = clamp(moistRaw + (1.0 - height) * 0.2, 0.0, 1.0);

  var biome = classify_biome(height, heat, moisture, cell);
  biome = maybe_settlement(biome, height, heat, cell, params.seed);

  terrain[job_index].height = height;
  terrain[job_index].heat = heat;
  terrain[job_index].moisture = moisture;
  terrain[job_index].biome = biome;
}
