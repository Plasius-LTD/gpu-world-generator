struct Scene {
  viewProj: mat4x4<f32>,
  lightPos: vec4<f32>,
  cameraPos: vec4<f32>,
  boxCount: vec4<f32>,
  wind: vec4<f32>,
  weather: vec4<f32>,
  waterSim: vec4<f32>,
  debug: vec4<f32>,
};

@group(0) @binding(0) var<uniform> scene: Scene;
@group(0) @binding(1) var<storage, read> boxMin: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> boxMax: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> waterHeight: array<f32>;

struct VertexIn {
  @location(0) position: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) color: vec3<f32>,
  @location(3) sway: f32,
  @location(4) material: f32,
};

struct VertexOut {
  @builtin(position) position: vec4<f32>,
  @location(0) normal: vec3<f32>,
  @location(1) color: vec3<f32>,
  @location(2) worldPos: vec3<f32>,
  @location(3) material: f32,
};

@vertex
fn vs_main(input: VertexIn) -> VertexOut {
  var out: VertexOut;
  let windStrength = scene.boxCount.y;
  let windGust = scene.boxCount.z;
  let windDir = normalize(scene.wind.xyz);
  let time = scene.wind.w;
  var worldPos = input.position;
  if (input.sway > 0.0001) {
    let wave = sin(time * (0.8 + windGust) + input.position.x * 0.6 + input.position.z * 0.4);
    let gust = sin(time * 1.7 + input.position.x * 0.9 + input.position.z * 1.1);
    let sway = (wave + gust * 0.35) * windStrength * input.sway;
    worldPos = worldPos + windDir * sway;
  }
  out.position = scene.viewProj * vec4<f32>(worldPos, 1.0);
  out.normal = input.normal;
  out.color = input.color;
  out.worldPos = worldPos;
  out.material = input.material;
  return out;
}

fn ray_box_intersect(origin: vec3<f32>, dir: vec3<f32>, bmin: vec3<f32>, bmax: vec3<f32>) -> f32 {
  let inv = 1.0 / dir;
  let t0 = (bmin - origin) * inv;
  let t1 = (bmax - origin) * inv;
  let tmin = max(max(min(t0.x, t1.x), min(t0.y, t1.y)), min(t0.z, t1.z));
  let tmax = min(min(max(t0.x, t1.x), max(t0.y, t1.y)), max(t0.z, t1.z));
  if (tmax >= max(tmin, 0.0)) {
    return tmin;
  }
  return -1.0;
}

fn is_occluded(pos: vec3<f32>, light_pos: vec3<f32>) -> bool {
  let to_light = light_pos - pos;
  let dist = length(to_light);
  if (dist < 1e-3) {
    return false;
  }
  let dir = to_light / dist;
  let origin = pos + dir * 0.02;
  let count = u32(scene.boxCount.x);
  let maxCount = arrayLength(&boxMin);
  for (var i: u32 = 0u; i < maxCount; i = i + 1u) {
    if (i >= count) {
      break;
    }
    let t = ray_box_intersect(origin, dir, boxMin[i].xyz, boxMax[i].xyz);
    if (t > 0.0 && t < dist) {
      return true;
    }
  }
  return false;
}

fn sample_water_height(world_pos: vec3<f32>) -> f32 {
  let gridSize = i32(scene.waterSim.w);
  if (gridSize < 2) {
    return 0.0;
  }
  let origin = scene.waterSim.xy;
  let invSize = scene.waterSim.z;
  let uv = clamp((world_pos.xz - origin) * invSize, vec2<f32>(0.0), vec2<f32>(1.0));
  let gridMax = f32(gridSize - 1);
  let gx = uv.x * gridMax;
  let gy = uv.y * gridMax;
  let ix = i32(floor(gx));
  let iy = i32(floor(gy));
  let fx = fract(gx);
  let fy = fract(gy);
  let ix0 = clamp(ix, 0, gridSize - 1);
  let iy0 = clamp(iy, 0, gridSize - 1);
  let ix1 = clamp(ix + 1, 0, gridSize - 1);
  let iy1 = clamp(iy + 1, 0, gridSize - 1);
  let idx00 = iy0 * gridSize + ix0;
  let idx10 = iy0 * gridSize + ix1;
  let idx01 = iy1 * gridSize + ix0;
  let idx11 = iy1 * gridSize + ix1;
  let h00 = waterHeight[idx00];
  let h10 = waterHeight[idx10];
  let h01 = waterHeight[idx01];
  let h11 = waterHeight[idx11];
  let hx0 = mix(h00, h10, fx);
  let hx1 = mix(h01, h11, fx);
  return mix(hx0, hx1, fy);
}

fn sample_water_normal(world_pos: vec3<f32>) -> vec3<f32> {
  let gridSize = i32(scene.waterSim.w);
  if (gridSize < 2) {
    return vec3<f32>(0.0, 1.0, 0.0);
  }
  let invSize = scene.waterSim.z;
  let cellWorld = 1.0 / max(invSize * (f32(gridSize) - 1.0), 1e-3);
  let hL = sample_water_height(world_pos + vec3<f32>(-cellWorld, 0.0, 0.0));
  let hR = sample_water_height(world_pos + vec3<f32>(cellWorld, 0.0, 0.0));
  let hB = sample_water_height(world_pos + vec3<f32>(0.0, 0.0, -cellWorld));
  let hT = sample_water_height(world_pos + vec3<f32>(0.0, 0.0, cellWorld));
  let scale = 1.2 / max(cellWorld, 1e-3);
  let dx = (hR - hL) * scale;
  let dz = (hT - hB) * scale;
  return normalize(vec3<f32>(-dx, 1.0, -dz));
}

fn heatmap_color(t: f32) -> vec3<f32> {
  let low = vec3<f32>(0.08, 0.12, 0.35);
  let mid = vec3<f32>(0.18, 0.6, 0.28);
  let high = vec3<f32>(0.95, 0.85, 0.55);
  if (t < 0.5) {
    return mix(low, mid, t * 2.0);
  }
  return mix(mid, high, (t - 0.5) * 2.0);
}

@fragment
fn fs_main(input: VertexOut) -> @location(0) vec4<f32> {
  if (scene.debug.x > 0.5) {
    let minH = scene.debug.y;
    let maxH = scene.debug.z;
    let denom = max(maxH - minH, 1e-3);
    let t = clamp((input.worldPos.y - minH) / denom, 0.0, 1.0);
    return vec4<f32>(heatmap_color(t), 1.0);
  }
  var n = normalize(input.normal);
  let to_light = scene.lightPos.xyz - input.worldPos;
  let dist = length(to_light);
  let dir = to_light / max(dist, 1e-3);
  let view_vec = scene.cameraPos.xyz - input.worldPos;
  let view_dist = length(view_vec);
  let view_dir = view_vec / max(view_dist, 1e-3);
  let material_id = u32(round(input.material));
  if (material_id == MATERIAL_WATER) {
    let sim_normal = sample_water_normal(input.worldPos);
    n = normalize(mix(n, sim_normal, 0.85));
  }
  let material = apply_surface_material(
    material_id,
    input.color,
    n,
    input.worldPos,
    scene.wind,
    scene.weather,
    view_dir,
    view_dist
  );
  let diff = max(dot(material.normal, dir), 0.0);
  let dist2 = max(dist * dist, 0.4);
  let attenuation = scene.lightPos.w / dist2;
  var shadow = 1.0;
  if (is_occluded(input.worldPos + n * 0.02, scene.lightPos.xyz)) {
    shadow = 0.25;
  }
  let ambient = 0.24;
  var color = material.albedo * (ambient + diff * attenuation * shadow);
  let half_vec = normalize(view_dir + dir);
  let spec = pow(max(dot(material.normal, half_vec), 0.0), mix(8.0, 64.0, material.specular));
  color = color + spec * material.specular * attenuation * 0.6;
  color = color + material.emission;
  return vec4<f32>(color, 1.0);
}
