const MATERIAL_DEFAULT: u32 = 0u;
const MATERIAL_GRASS: u32 = 1u;
const MATERIAL_WATER: u32 = 2u;
const MATERIAL_ROCK: u32 = 3u;
const MATERIAL_SAND: u32 = 4u;
const MATERIAL_MUD: u32 = 5u;
const MATERIAL_SNOW: u32 = 6u;
const MATERIAL_FOLIAGE: u32 = 7u;

struct MaterialResponse {
  albedo: vec3<f32>,
  normal: vec3<f32>,
  specular: f32,
  emission: vec3<f32>,
};

fn make_material(albedo: vec3<f32>, normal: vec3<f32>) -> MaterialResponse {
  return MaterialResponse(albedo, normal, 0.08, vec3<f32>(0.0));
}

fn apply_grass(base: vec3<f32>, normal: vec3<f32>, world_pos: vec3<f32>, wind: vec4<f32>) -> MaterialResponse {
  let wind_dir = normalize(vec3<f32>(wind.x, 0.0, wind.z));
  let time = wind.w;
  let wave = sin(dot(world_pos.xz, wind_dir.xz) * 2.2 + time * 1.3);
  let detail = fbm2(world_pos.xz * 1.6 + vec2<f32>(time * 0.08, time * 0.04));
  let bend = (wave * 0.14 + detail * 0.12);
  let perturbed = normalize(vec3<f32>(
    normal.x + bend * wind_dir.x,
    normal.y + bend * 0.4,
    normal.z + bend * wind_dir.z
  ));
  let tint = base * (0.92 + wave * 0.06);
  var out = make_material(tint, perturbed);
  out.specular = 0.12;
  return out;
}

fn apply_water(
  base: vec3<f32>,
  normal: vec3<f32>,
  world_pos: vec3<f32>,
  wind: vec4<f32>,
  view_dir: vec3<f32>,
  view_dist: f32
) -> MaterialResponse {
  let time = wind.w;
  let wind2 = normalize(vec2<f32>(wind.x, wind.z) + vec2<f32>(1e-3, 0.0));
  let dir0 = wind2;
  let dir1 = normalize(vec2<f32>(-wind2.y, wind2.x));
  let dir2 = normalize(mix(wind2, vec2<f32>(0.7, 0.7), 0.35));

  let detail = clamp01(1.0 - (view_dist - 6.0) / 25.0);
  let detail2 = detail * detail;

  let k0 = 1.6;
  let k1 = 3.2;
  let k2 = 6.4;
  let a0 = 0.12;
  let a1 = 0.05 * detail;
  let a2 = 0.02 * detail2;

  let p0 = dot(world_pos.xz, dir0) * k0 + time * 1.1;
  let p1 = dot(world_pos.xz, dir1) * k1 + time * 1.7;
  let p2 = dot(world_pos.xz, dir2) * k2 + time * 2.4;

  let h0 = a0 * sin(p0);
  let h1 = a1 * sin(p1);
  let h2 = a2 * sin(p2);

  var dHd = vec2<f32>(
    a0 * k0 * cos(p0) * dir0.x + a1 * k1 * cos(p1) * dir1.x + a2 * k2 * cos(p2) * dir2.x,
    a0 * k0 * cos(p0) * dir0.y + a1 * k1 * cos(p1) * dir1.y + a2 * k2 * cos(p2) * dir2.y
  );

  let ripple_phase = dot(world_pos.xz, vec2<f32>(12.7, 9.3)) + time * 3.5;
  let ripple_amp = 0.006 * detail2;
  let ripple = sin(ripple_phase) * ripple_amp;
  dHd = dHd + vec2<f32>(12.7, 9.3) * cos(ripple_phase) * ripple_amp;

  let wave_height = h0 + h1 + h2 + ripple;
  let wave_normal = normalize(vec3<f32>(-dHd.x, 1.0, -dHd.y));
  let water_normal = normalize(mix(normal, wave_normal, 0.85));

  let ndv = clamp(dot(water_normal, view_dir), 0.0, 1.0);
  let fresnel = 0.02 + (1.0 - 0.02) * pow(1.0 - ndv, 5.0);

  let deep = vec3<f32>(0.02, 0.08, 0.14);
  let tint = mix(base, deep, 0.55 + wave_height * 0.2);

  let sky_low = vec3<f32>(0.05, 0.1, 0.16);
  let sky_high = vec3<f32>(0.2, 0.35, 0.55);
  let sky = mix(sky_low, sky_high, clamp01(view_dir.y * 0.5 + 0.5));

  let steepness = length(dHd);
  let foam_noise = fbm2(world_pos.xz * 0.8 + vec2<f32>(time * 0.05, time * 0.04));
  let foam = smoothstep(0.35, 0.75, steepness) * (0.6 + 0.4 * foam_noise) * detail;

  var out = make_material(tint * 0.6, water_normal);
  out.albedo = mix(out.albedo, vec3<f32>(0.92, 0.94, 0.98), foam);
  out.specular = mix(0.35, 0.95, fresnel);
  out.emission = sky * fresnel * (0.35 + 0.65 * detail);
  return out;
}

fn apply_rock(base: vec3<f32>, normal: vec3<f32>, world_pos: vec3<f32>) -> MaterialResponse {
  let grain = fbm2(world_pos.xz * 2.4);
  let tint = base * (0.85 + grain * 0.25);
  var out = make_material(tint, normal);
  out.specular = 0.18;
  return out;
}

fn apply_sand(base: vec3<f32>, normal: vec3<f32>, world_pos: vec3<f32>) -> MaterialResponse {
  let grain = noise2(world_pos.xz * 3.5);
  let tint = base * (0.95 + grain * 0.12);
  var out = make_material(tint, normal);
  out.specular = 0.12;
  return out;
}

fn apply_mud(base: vec3<f32>, normal: vec3<f32>, world_pos: vec3<f32>) -> MaterialResponse {
  let ooze = fbm2(world_pos.xz * 2.0);
  let tint = base * (0.78 + ooze * 0.1);
  var out = make_material(tint, normal);
  out.specular = 0.22;
  return out;
}

fn apply_surface_material(
  material_id: u32,
  base_color: vec3<f32>,
  normal: vec3<f32>,
  world_pos: vec3<f32>,
  wind: vec4<f32>,
  weather: vec4<f32>,
  view_dir: vec3<f32>,
  view_dist: f32
) -> MaterialResponse {
  let season = clamp01(weather.x);
  let wetness = clamp01(weather.y + weather.w * 0.5);
  var snow = clamp01(weather.z + season * 0.2);

  var result = make_material(base_color, normal);
  if (material_id == MATERIAL_GRASS || material_id == MATERIAL_FOLIAGE) {
    result = apply_grass(base_color, normal, world_pos, wind);
  } else if (material_id == MATERIAL_WATER) {
    result = apply_water(base_color, normal, world_pos, wind, view_dir, view_dist);
  } else if (material_id == MATERIAL_ROCK) {
    result = apply_rock(base_color, normal, world_pos);
  } else if (material_id == MATERIAL_SAND) {
    result = apply_sand(base_color, normal, world_pos);
  } else if (material_id == MATERIAL_MUD) {
    result = apply_mud(base_color, normal, world_pos);
  }

  if (material_id == MATERIAL_SNOW) {
    snow = max(snow, 0.7);
  }

  if (material_id != MATERIAL_WATER) {
    let snow_mask = snow * smoothstep(0.35, 0.92, result.normal.y);
    result.albedo = mix(result.albedo, vec3<f32>(0.88, 0.9, 0.95), snow_mask);
    result.specular = max(result.specular, snow_mask * 0.22);
  }

  if (material_id != MATERIAL_WATER) {
    let flatness = smoothstep(0.55, 0.96, result.normal.y);
    let puddle_noise = fbm2(world_pos.xz * 0.7 + vec2<f32>(wind.w * 0.03, wind.w * 0.02));
    let puddle = wetness * flatness * smoothstep(0.45, 0.8, puddle_noise);
    result.albedo = mix(result.albedo, result.albedo * 0.78, wetness * 0.35);
    result.specular = max(result.specular, puddle * 0.65);
  }

  return result;
}
