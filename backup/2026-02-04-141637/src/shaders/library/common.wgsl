const PI: f32 = 3.1415926535;

fn hash12(p: vec2<f32>) -> f32 {
  let h = dot(p, vec2<f32>(127.1, 311.7));
  return fract(sin(h) * 43758.5453123);
}

fn noise2(p: vec2<f32>) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let a = hash12(i);
  let b = hash12(i + vec2<f32>(1.0, 0.0));
  let c = hash12(i + vec2<f32>(0.0, 1.0));
  let d = hash12(i + vec2<f32>(1.0, 1.0));
  let u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

fn fbm2(p: vec2<f32>) -> f32 {
  var value = 0.0;
  var amp = 0.5;
  var freq = 1.0;
  var coord = p;
  value = value + amp * noise2(coord * freq);
  amp = amp * 0.5;
  freq = freq * 2.0;
  coord = coord + vec2<f32>(1.7, 9.2);
  value = value + amp * noise2(coord * freq);
  amp = amp * 0.5;
  freq = freq * 2.0;
  coord = coord + vec2<f32>(8.3, 2.8);
  value = value + amp * noise2(coord * freq);
  return value;
}

fn clamp01(v: f32) -> f32 {
  return clamp(v, 0.0, 1.0);
}
