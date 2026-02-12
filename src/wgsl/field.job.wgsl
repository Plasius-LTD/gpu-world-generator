struct FieldParams {
  seed: u32,
  sample_count: u32,
  scale: f32,
  warp_scale: f32,
  warp_strength: f32,
  iterations: u32,
  power: f32,
  detail_scale: f32,
  detail_iterations: u32,
  detail_power: f32,
  ridge_power: f32,
  heat_bias: f32,
  moisture_bias: f32,
  macro_scale: f32,
  macro_warp_strength: f32,
  style_mix_strength: f32,
  terrace_steps: f32,
  terrace_strength: f32,
  crater_strength: f32,
  crater_scale: f32,
  height_min: f32,
  height_max: f32,
};

struct FieldSample {
  height: f32,
  heat: f32,
  moisture: f32,
  roughness: f32,
  rockiness: f32,
  water: f32,
  ridge: f32,
  base: f32,
  detail: f32,
};

@group(1) @binding(0) var<storage, read> points: array<vec2<f32>>;
@group(1) @binding(1) var<storage, read_write> samples: array<FieldSample>;
@group(1) @binding(2) var<uniform> params: FieldParams;

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
  let macro_iter = max(12u, iterations / 3u);
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

fn sample_field(p: vec2<f32>) -> FieldSample {
  let seed = params.seed;
  let offX = hash01(seed ^ 0x7f4a7c15u) * 4.0 - 2.0;
  let offZ = hash01(seed ^ 0xa9d84d2bu) * 4.0 - 2.0;
  let warpOffX = hash01(seed ^ 0x8c2f1d3bu) * 6.0 - 3.0;
  let warpOffZ = hash01(seed ^ 0x5d2c79e9u) * 6.0 - 3.0;

  let warpIter = max(16u, params.iterations * 6u / 10u);
  let warpA = smooth_mandelbrot(
    (p.x + warpOffX) * params.warp_scale,
    (p.y + warpOffZ) * params.warp_scale,
    warpIter,
    params.power
  );
  let warpB = smooth_mandelbrot(
    (p.x - warpOffZ) * params.warp_scale,
    (p.y + warpOffX) * params.warp_scale,
    warpIter,
    params.power
  );

  let warped = vec2<f32>(
    p.x + (warpA - 0.5) * params.warp_strength,
    p.y + (warpB - 0.5) * params.warp_strength
  );

  let base = smooth_mandelbrot(
    warped.x * params.scale + offX,
    warped.y * params.scale + offZ,
    params.iterations,
    params.power
  );
  let mid = smooth_mandelbrot(
    warped.x * params.scale * 2.15 + offX * 0.6,
    warped.y * params.scale * 2.15 + offZ * 0.6,
    max(18u, params.iterations * 7u / 10u),
    params.power + 0.2
  );
  let detail = smooth_mandelbrot(
    warped.x * params.scale * params.detail_scale + offX * 1.4,
    warped.y * params.scale * params.detail_scale + offZ * 1.4,
    params.detail_iterations,
    params.detail_power
  );

  let ridge = 1.0 - abs(2.0 * mid - 1.0);
  let baseHeight = pow(base, 0.9) * pow(mid, 1.05) * pow(detail, 1.1);

  let styleMask = macro_map(p, params.iterations, params.power);
  let terrace = terrace_height(baseHeight, params.terrace_steps);
  let crater = crater_field(p, params.crater_scale, seed);

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
  let ridgeBoost = pow(ridge, 1.35) * 0.22;
  let centered = (mixed - 0.5) * 2.0;
  let shaped = sign(centered) * pow(abs(centered), 0.75);
  let macroOffset = (styleMask - 0.5) * 0.25;
  let rawHeight = clamp(
    0.5 + shaped * 0.8 + macroOffset + ridgeBoost,
    params.height_min,
    params.height_max
  );
  let height01 = clamp(rawHeight, 0.0, 1.0);

  let roughness = clamp(pow(ridge, params.ridge_power) * 0.7 + detail * 0.3, 0.0, 1.0);
  let heat = clamp(0.55 * mid + 0.35 * (1.0 - height01) + params.heat_bias, 0.0, 1.0);
  let moisture = clamp(
    0.55 * detail + 0.35 * (1.0 - height01) - (heat - 0.5) * 0.1 + params.moisture_bias,
    0.0,
    1.0
  );
  let rockiness = clamp(roughness * 0.6 + height01 * 0.4, 0.0, 1.0);
  let water = clamp((0.32 - height01) * 3.0 + (moisture - 0.5) * 0.2, 0.0, 1.0);

  return FieldSample(rawHeight, heat, moisture, roughness, rockiness, water, ridge, base, detail);
}

fn process_job(job_index: u32, job_type: u32, payload_words: u32) {
  if (job_index >= params.sample_count) {
    return;
  }
  let p = points[job_index];
  samples[job_index] = sample_field(p);
}
