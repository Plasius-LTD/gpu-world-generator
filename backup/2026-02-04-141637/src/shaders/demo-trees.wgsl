struct TreeUniforms {
  viewProj: mat4x4<f32>,
  cameraPos: vec4<f32>,
  cameraRight: vec4<f32>,
  cameraUp: vec4<f32>,
  season: vec4<f32>,
  wind: vec4<f32>,
};

struct TreeInstance {
  posHeight: vec4<f32>,
  canopySeed: vec4<f32>,
};

struct VSOut {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
  @location(1) baseColor: vec3<f32>,
  @location(2) trunkColor: vec3<f32>,
  @location(3) height: f32,
  @location(4) leafiness: f32,
  @location(5) deciduous: f32,
  @location(6) lod: f32,
  @location(7) worldPos: vec3<f32>,
  @location(8) seed: f32,
};

@group(0) @binding(0) var<uniform> scene: TreeUniforms;
@group(0) @binding(1) var<storage, read> trees: array<TreeInstance>;

fn quad_uv(vid: u32) -> vec2<f32> {
  let uv = array<vec2<f32>, 6>(
    vec2<f32>(0.0, 0.0),
    vec2<f32>(1.0, 0.0),
    vec2<f32>(1.0, 1.0),
    vec2<f32>(0.0, 0.0),
    vec2<f32>(1.0, 1.0),
    vec2<f32>(0.0, 1.0)
  );
  return uv[vid];
}

fn mandelbrot(c: vec2<f32>, iterations: u32) -> f32 {
  var z = vec2<f32>(0.0);
  var i: u32 = 0u;
  loop {
    if (i >= iterations) {
      break;
    }
    let x = z.x * z.x - z.y * z.y + c.x;
    let y = 2.0 * z.x * z.y + c.y;
    z = vec2<f32>(x, y);
    if (dot(z, z) > 4.0) {
      break;
    }
    i = i + 1u;
  }
  return f32(i) / f32(iterations);
}

@vertex
fn vs_main(@builtin(vertex_index) vid: u32, @builtin(instance_index) iid: u32) -> VSOut {
  let data = trees[iid];
  let pos = data.posHeight.xyz;
  let height = data.posHeight.w;
  let canopy = data.canopySeed.x;
  let seed = data.canopySeed.y;
  let deciduous = data.canopySeed.z;
  let leafiness = data.canopySeed.w;

  let quadIndex = vid / 6u;
  let localVid = vid % 6u;
  let uv = quad_uv(localVid);
  let right = scene.cameraRight.xyz;
  let up = scene.cameraUp.xyz;
  let forward = normalize(cross(right, up));
  let diag = normalize(right + forward);
  let anti = normalize(right - forward);
  var basis = right;
  if (quadIndex == 1u) {
    basis = forward;
  } else if (quadIndex == 2u) {
    basis = diag;
  } else if (quadIndex == 3u) {
    basis = anti;
  }

  let dist = length(scene.cameraPos.xyz - pos);
  let lod = clamp((dist - 6.0) / 20.0, 0.0, 1.0);
  let lodScale = mix(1.0, 0.6, lod);

  let partIndex = quadIndex / 4u;
  var localY = uv.y;
  if (partIndex == 0u) {
    localY = uv.y * 0.55;
  } else if (partIndex == 1u) {
    localY = 0.5 + uv.y * 0.45;
  } else {
    localY = 0.78 + uv.y * 0.35;
  }
  let canopyScale = mix(0.5, 1.0, f32(partIndex) / 2.0);

  var out: VSOut;
  let basePos = pos + basis * (uv.x - 0.5) * canopy * 1.2 * canopyScale * lodScale + up * (localY) * height * lodScale;
  let windDir = normalize(scene.wind.xyz);
  let time = scene.wind.w;
  let windStrength = scene.season.y;
  let gustiness = scene.season.z;
  let heightFactor = clamp(localY, 0.0, 1.0);
  let swayBase = smoothstep(0.15, 0.95, heightFactor);
  let sway = sin(time * (0.6 + gustiness) + seed * 6.1 + uv.y * 2.1) * windStrength * swayBase;
  let flutter = sin(time * 1.7 + seed * 3.3 + uv.x * 6.0) * windStrength * 0.2 * leafiness;
  let windOffset = windDir * (sway + flutter) * (1.0 - lod * 0.6);
  let worldPos = basePos + windOffset;
  out.position = scene.viewProj * vec4<f32>(worldPos, 1.0);
  out.uv = uv;
  out.baseColor = vec3<f32>(0.18, 0.48, 0.2);
  out.trunkColor = vec3<f32>(0.25, 0.16, 0.08);
  out.height = height;
  out.leafiness = leafiness;
  out.deciduous = deciduous;
  out.lod = lod;
  out.worldPos = worldPos;
  out.seed = seed;
  return out;
}

@fragment
fn fs_main(input: VSOut) -> @location(0) vec4<f32> {
  let uv = input.uv;
  let trunkHeight = 0.42;
  let trunkWidth = mix(0.18, 0.08, uv.y / trunkHeight);
  let centerX = abs(uv.x - 0.5);

  if (uv.y <= trunkHeight && centerX < trunkWidth) {
    return vec4<f32>(input.trunkColor, 1.0);
  }

  if (uv.y > trunkHeight && uv.y < 0.7) {
    let branchWave = sin((uv.y + input.seed * 1.7) * 12.0) * 0.5 + 0.5;
    let branchOffset = (branchWave - 0.5) * 0.35;
    let branchWidth = mix(0.12, 0.04, uv.y);
    if (abs(uv.x - (0.5 + branchOffset)) < branchWidth) {
      return vec4<f32>(input.trunkColor * 0.9, 1.0);
    }
  }

  let canopyCenter = vec2<f32>(0.5, 0.7);
  let rel = uv - canopyCenter;
  let radius = length(rel);

  let iterCount = u32(round(mix(20.0, 6.0, input.lod)));
  let c = rel * 2.2 + vec2<f32>(input.seed * 0.35, input.seed * -0.22);
  let fract = mandelbrot(c, iterCount);
  let leafMask = smoothstep(0.85, 0.35, radius + fract * 0.2);

  let season = scene.season.x;
  var leafAlpha = leafMask * input.leafiness * mix(1.0, 0.6, input.lod);
  if (input.deciduous > 0.5) {
    leafAlpha = leafAlpha * mix(1.0, 0.35, season);
  }

  if (leafAlpha < 0.02) {
    discard;
  }

  let summer = vec3<f32>(0.2, 0.55, 0.24);
  let autumn = vec3<f32>(0.72, 0.38, 0.18);
  let leafColor = mix(summer, autumn, season * input.deciduous);

  return vec4<f32>(leafColor, leafAlpha);
}
