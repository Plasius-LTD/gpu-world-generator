struct FractalParams {
  grid: vec4<f32>,   // grid_points, extent, step, seed
  field0: vec4<f32>, // scale, warp_scale, warp_strength, power
  field1: vec4<f32>, // detail_scale, detail_power, ridge_power, heat_bias
  field2: vec4<f32>, // moisture_bias, mandel_scale, mandel_strength, mandel_rock_boost
  field3: vec4<f32>, // iterations, detail_iterations, macro_scale, macro_warp_strength
  field4: vec4<f32>, // style_mix_strength, terrace_steps, terrace_strength, crater_strength
  field5: vec4<f32>, // crater_scale, height_min, height_max, pad
};

struct Sample {
  data0: vec4<f32>, // height, heat, moisture, rockiness
  data1: vec4<f32>, // water, ridge, base, detail
};

@group(0) @binding(0) var<uniform> params: FractalParams;
@group(0) @binding(1) var<storage, read_write> samples_out: array<Sample>;
@group(0) @binding(2) var<storage, read> samples_in: array<Sample>;

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

fn macro_map(p: vec2<f32>, iterations: u32, power: f32, scale: f32, warp_strength: f32, mix_strength: f32) -> f32 {
  let macro_iter = max(12u, iterations / 3u);
  let macroA = smooth_mandelbrot(p.x * scale, p.y * scale, macro_iter, power);
  let macroB = smooth_mandelbrot((p.x + 13.7) * scale, (p.y - 9.2) * scale, macro_iter, power + 0.35);
  let warp = vec2<f32>(macroA - 0.5, macroB - 0.5) * warp_strength;
  let macroC = smooth_mandelbrot((p.x + warp.x) * scale, (p.y + warp.y) * scale, macro_iter, power);
  return clamp((macroC - 0.5) * mix_strength + 0.5, 0.0, 1.0);
}

fn sample_field(p: vec2<f32>) -> Sample {
  let seed = u32(params.grid.w);
  let iterations = u32(params.field3.x);
  let detail_iterations = u32(params.field3.y);
  let macro_scale = params.field3.z;
  let macro_warp_strength = params.field3.w;
  let style_mix_strength = params.field4.x;
  let terrace_steps = params.field4.y;
  let terrace_strength = params.field4.z;
  let crater_strength = params.field4.w;
  let crater_scale = params.field5.x;
  let height_min = params.field5.y;
  let height_max = params.field5.z;
  let scale = params.field0.x;
  let warp_scale = params.field0.y;
  let warp_strength = params.field0.z;
  let power = params.field0.w;
  let detail_scale = params.field1.x;
  let detail_power = params.field1.y;
  let ridge_power = params.field1.z;
  let heat_bias = params.field1.w;
  let moisture_bias = params.field2.x;

  let offX = hash01(seed ^ 0x7f4a7c15u) * 4.0 - 2.0;
  let offZ = hash01(seed ^ 0xa9d84d2bu) * 4.0 - 2.0;
  let warpOffX = hash01(seed ^ 0x8c2f1d3bu) * 6.0 - 3.0;
  let warpOffZ = hash01(seed ^ 0x5d2c79e9u) * 6.0 - 3.0;

  let warpIter = max(16u, iterations * 6u / 10u);
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
    max(18u, iterations * 7u / 10u),
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

  let styleMask = macro_map(warped, iterations, power, macro_scale, macro_warp_strength, style_mix_strength);
  let terrace = terrace_height(baseHeight, terrace_steps);
  let crater = crater_field(warped, crater_scale, seed);

  let styleA = clamp(pow(baseHeight, 0.8) + pow(ridge, 1.4) * 0.2, 0.0, 1.0);
  let styleB = clamp(
    baseHeight * (1.0 - terrace_strength) +
      terrace * terrace_strength -
      crater * crater_strength +
      pow(ridge, 1.6) * 0.12,
    0.0,
    1.0
  );
  let mixed = mix(styleA, styleB, styleMask);
  let ridgeBoost = pow(ridge, 1.35) * 0.22;
  let centered = (mixed - 0.5) * 2.0;
  let shaped = sign(centered) * pow(abs(centered), 0.75);
  let macroOffset = (styleMask - 0.5) * 0.25;
  let rawHeight = clamp(0.5 + shaped * 0.8 + macroOffset + ridgeBoost, height_min, height_max);
  let height01 = clamp(rawHeight, 0.0, 1.0);

  let roughness = clamp(pow(ridge, ridge_power) * 0.7 + detail * 0.3, 0.0, 1.0);
  let heat = clamp(0.55 * mid + 0.35 * (1.0 - height01) + heat_bias, 0.0, 1.0);
  let moisture = clamp(
    0.55 * detail + 0.35 * (1.0 - height01) - (heat - 0.5) * 0.1 + moisture_bias,
    0.0,
    1.0
  );
  let rockiness = clamp(roughness * 0.6 + height01 * 0.4, 0.0, 1.0);
  let water = clamp((0.32 - height01) * 3.0 + (moisture - 0.5) * 0.2, 0.0, 1.0);

  return Sample(
    vec4<f32>(rawHeight, heat, moisture, rockiness),
    vec4<f32>(water, ridge, base, detail)
  );
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let grid_points = u32(params.grid.x);
  if (gid.x >= grid_points || gid.y >= grid_points) {
    return;
  }
  let extent = params.grid.y;
  let step = params.grid.z;
  let x = -extent + f32(gid.x) * step;
  let z = -extent + f32(gid.y) * step;

  var sample = sample_field(vec2<f32>(x, z));

  let mandel_scale = params.field2.y;
  let mandel_strength = params.field2.z;
  let mandel_rock = params.field2.w;
  let height_min = params.field5.y;
  let height_max = params.field5.z;
  let mandel = smooth_mandelbrot(x * mandel_scale, z * mandel_scale, 24u, 2.0);
  let mandel_bias = (mandel - 0.5) * mandel_strength;
  let rawHeight = clamp(sample.data0.x + mandel_bias, height_min, height_max);
  let height01 = clamp(rawHeight, 0.0, 1.0);
  let rockiness = clamp(sample.data0.w + max(0.0, mandel - 0.55) * mandel_rock, 0.0, 1.0);
  let water = clamp((0.32 - height01) * 3.0 + (sample.data0.z - 0.5) * 0.2, 0.0, 1.0);

  sample.data0.x = rawHeight;
  sample.data0.w = rockiness;
  sample.data1.x = water;

  let index = gid.y * grid_points + gid.x;
  samples_out[index] = sample;
}

fn height_at(ix: i32, iy: i32, size: i32) -> f32 {
  let x = clamp(ix, 0, size - 1);
  let y = clamp(iy, 0, size - 1);
  let idx = y * size + x;
  return samples_in[idx].data0.x;
}

@compute @workgroup_size(8, 8)
fn accent_heights(@builtin(global_invocation_id) gid: vec3<u32>) {
  let grid_points = i32(params.grid.x);
  let ix = i32(gid.x);
  let iy = i32(gid.y);
  if (ix >= grid_points || iy >= grid_points) {
    return;
  }
  let idx = iy * grid_points + ix;
  let center = samples_in[idx];
  var sum = 0.0;
  var count = 0.0;
  for (var dx = -1; dx <= 1; dx = dx + 1) {
    for (var dy = -1; dy <= 1; dy = dy + 1) {
      if (dx == 0 && dy == 0) {
        continue;
      }
      sum = sum + height_at(ix + dx, iy + dy, grid_points);
      count = count + 1.0;
    }
  }
  let avg = select(center.data0.x, sum / count, count > 0.0);
  let delta = center.data0.x - avg;
  let signed = sign(delta) * pow(abs(delta), 0.8);
  let ridge = max(0.0, delta);
  let accentStrength = 1.6;
  let ridgeStrength = 0.35;
  let macroStrength = 0.25;
  let minHeight = params.field5.y;
  let maxHeight = params.field5.z;
  let macroOffset = (avg - 0.5) * macroStrength;
  let rawHeight = clamp(
    avg + signed * accentStrength + ridge * ridgeStrength + macroOffset,
    minHeight,
    maxHeight
  );
  let clampedHeight = clamp(rawHeight, 0.0, 1.0);

  var out = center;
  out.data0.x = rawHeight;
  out.data0.w = clamp(out.data0.w + max(0.0, clampedHeight - 0.65) * 0.5, 0.0, 1.0);
  out.data1.x = clamp((0.32 - clampedHeight) * 3.0 + (out.data0.z - 0.5) * 0.2, 0.0, 1.0);
  samples_out[idx] = out;
}
