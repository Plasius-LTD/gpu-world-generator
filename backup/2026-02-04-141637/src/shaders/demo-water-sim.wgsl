struct SimParams {
  sim0: vec4<f32>, // origin.x, origin.z, invSize, gridSize
  sim1: vec4<f32>, // dt, flipRatio, particleCount, pad
  sim2: vec4<f32>, // velScale, weightScale, heightScale, densityScale
  sim3: vec4<f32>, // damping, bounce, pad, pad
};

struct GridAccum {
  velX: atomic<i32>,
  velY: atomic<i32>,
  weight: atomic<i32>,
  pad: atomic<i32>,
};

@group(0) @binding(0) var<uniform> params: SimParams;
@group(0) @binding(1) var<storage, read_write> particles: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read_write> gridAccum: array<GridAccum>;
@group(0) @binding(3) var<storage, read_write> gridVel: array<vec2<f32>>;
@group(0) @binding(4) var<storage, read_write> gridVelPrev: array<vec2<f32>>;
@group(0) @binding(5) var<storage, read_write> gridDivergence: array<f32>;
@group(0) @binding(6) var<storage, read_write> gridPressure: array<f32>;
@group(0) @binding(7) var<storage, read_write> gridPressurePrev: array<f32>;
@group(0) @binding(8) var<storage, read_write> gridHeight: array<f32>;

fn grid_size() -> i32 {
  return i32(params.sim0.w);
}

fn grid_count() -> i32 {
  let size = grid_size();
  return size * size;
}

fn grid_index(ix: i32, iy: i32, size: i32) -> i32 {
  return iy * size + ix;
}

fn clamp_cell(ix: i32, size: i32) -> i32 {
  return clamp(ix, 0, size - 1);
}

fn sample_grid_vel_current(uv: vec2<f32>) -> vec2<f32> {
  let size = grid_size();
  let grid_max = f32(size - 1);
  let gx = uv.x * grid_max;
  let gy = uv.y * grid_max;
  let ix = i32(floor(gx));
  let iy = i32(floor(gy));
  let fx = fract(gx);
  let fy = fract(gy);
  let ix0 = clamp(ix, 0, size - 1);
  let iy0 = clamp(iy, 0, size - 1);
  let ix1 = clamp(ix + 1, 0, size - 1);
  let iy1 = clamp(iy + 1, 0, size - 1);
  let idx00 = grid_index(ix0, iy0, size);
  let idx10 = grid_index(ix1, iy0, size);
  let idx01 = grid_index(ix0, iy1, size);
  let idx11 = grid_index(ix1, iy1, size);
  let v00 = gridVel[idx00];
  let v10 = gridVel[idx10];
  let v01 = gridVel[idx01];
  let v11 = gridVel[idx11];
  let vx0 = mix(v00, v10, fx);
  let vx1 = mix(v01, v11, fx);
  return mix(vx0, vx1, fy);
}

fn sample_grid_vel_prev(uv: vec2<f32>) -> vec2<f32> {
  let size = grid_size();
  let grid_max = f32(size - 1);
  let gx = uv.x * grid_max;
  let gy = uv.y * grid_max;
  let ix = i32(floor(gx));
  let iy = i32(floor(gy));
  let fx = fract(gx);
  let fy = fract(gy);
  let ix0 = clamp(ix, 0, size - 1);
  let iy0 = clamp(iy, 0, size - 1);
  let ix1 = clamp(ix + 1, 0, size - 1);
  let iy1 = clamp(iy + 1, 0, size - 1);
  let idx00 = grid_index(ix0, iy0, size);
  let idx10 = grid_index(ix1, iy0, size);
  let idx01 = grid_index(ix0, iy1, size);
  let idx11 = grid_index(ix1, iy1, size);
  let v00 = gridVelPrev[idx00];
  let v10 = gridVelPrev[idx10];
  let v01 = gridVelPrev[idx01];
  let v11 = gridVelPrev[idx11];
  let vx0 = mix(v00, v10, fx);
  let vx1 = mix(v01, v11, fx);
  return mix(vx0, vx1, fy);
}

fn particle_uv(pos: vec2<f32>) -> vec2<f32> {
  let origin = params.sim0.xy;
  let invSize = params.sim0.z;
  return clamp((pos - origin) * invSize, vec2<f32>(0.0), vec2<f32>(1.0));
}

@compute @workgroup_size(128)
fn copy_grid(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = i32(gid.x);
  let count = grid_count();
  if (idx >= count) {
    return;
  }
  gridVelPrev[idx] = gridVel[idx];
}

@compute @workgroup_size(128)
fn clear_grid(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = i32(gid.x);
  let count = grid_count();
  if (idx >= count) {
    return;
  }
  atomicStore(&gridAccum[idx].velX, 0);
  atomicStore(&gridAccum[idx].velY, 0);
  atomicStore(&gridAccum[idx].weight, 0);
  atomicStore(&gridAccum[idx].pad, 0);
  gridVel[idx] = vec2<f32>(0.0);
  gridDivergence[idx] = 0.0;
  gridPressure[idx] = 0.0;
  gridPressurePrev[idx] = 0.0;
  gridHeight[idx] = 0.0;
}

@compute @workgroup_size(128)
fn particles_to_grid(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = i32(gid.x);
  let count = i32(params.sim1.z);
  if (idx >= count) {
    return;
  }
  let pos = particles[idx].xy;
  let vel = particles[idx].zw;
  let size = grid_size();
  let grid_max = f32(size - 1);
  let uv = particle_uv(pos);
  let gx = uv.x * grid_max;
  let gy = uv.y * grid_max;
  let ix = i32(floor(gx));
  let iy = i32(floor(gy));
  let fx = fract(gx);
  let fy = fract(gy);
  let ix0 = clamp(ix, 0, size - 2);
  let iy0 = clamp(iy, 0, size - 2);
  let ix1 = ix0 + 1;
  let iy1 = iy0 + 1;

  let w00 = (1.0 - fx) * (1.0 - fy);
  let w10 = fx * (1.0 - fy);
  let w01 = (1.0 - fx) * fy;
  let w11 = fx * fy;

  let velScale = params.sim2.x;
  let weightScale = params.sim2.y;

  let v00x = i32(round(vel.x * velScale * w00));
  let v00y = i32(round(vel.y * velScale * w00));
  let v10x = i32(round(vel.x * velScale * w10));
  let v10y = i32(round(vel.y * velScale * w10));
  let v01x = i32(round(vel.x * velScale * w01));
  let v01y = i32(round(vel.y * velScale * w01));
  let v11x = i32(round(vel.x * velScale * w11));
  let v11y = i32(round(vel.y * velScale * w11));

  let w00i = i32(round(weightScale * w00));
  let w10i = i32(round(weightScale * w10));
  let w01i = i32(round(weightScale * w01));
  let w11i = i32(round(weightScale * w11));

  let idx00 = grid_index(ix0, iy0, size);
  let idx10 = grid_index(ix1, iy0, size);
  let idx01 = grid_index(ix0, iy1, size);
  let idx11 = grid_index(ix1, iy1, size);

  atomicAdd(&gridAccum[idx00].velX, v00x);
  atomicAdd(&gridAccum[idx00].velY, v00y);
  atomicAdd(&gridAccum[idx00].weight, w00i);

  atomicAdd(&gridAccum[idx10].velX, v10x);
  atomicAdd(&gridAccum[idx10].velY, v10y);
  atomicAdd(&gridAccum[idx10].weight, w10i);

  atomicAdd(&gridAccum[idx01].velX, v01x);
  atomicAdd(&gridAccum[idx01].velY, v01y);
  atomicAdd(&gridAccum[idx01].weight, w01i);

  atomicAdd(&gridAccum[idx11].velX, v11x);
  atomicAdd(&gridAccum[idx11].velY, v11y);
  atomicAdd(&gridAccum[idx11].weight, w11i);
}

@compute @workgroup_size(128)
fn normalize_grid(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = i32(gid.x);
  let count = grid_count();
  if (idx >= count) {
    return;
  }
  let weightScale = params.sim2.y;
  let velScale = params.sim2.x;
  let damping = params.sim3.x;
  let heightScale = params.sim2.z;
  let densityScale = max(params.sim2.w, 1e-3);

  let w = f32(atomicLoad(&gridAccum[idx].weight)) / weightScale;
  var vel = vec2<f32>(0.0);
  if (w > 0.0) {
    let vx = f32(atomicLoad(&gridAccum[idx].velX)) / (velScale * w);
    let vy = f32(atomicLoad(&gridAccum[idx].velY)) / (velScale * w);
    vel = vec2<f32>(vx, vy);
  }
  vel = vel * (1.0 - damping);
  gridVel[idx] = vel;
  let height = clamp(w / densityScale, 0.0, 1.0) * heightScale;
  gridHeight[idx] = height;
}

@compute @workgroup_size(128)
fn compute_divergence(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = i32(gid.x);
  let size = grid_size();
  let count = size * size;
  if (idx >= count) {
    return;
  }
  let ix = idx % size;
  let iy = idx / size;
  let invCell = params.sim0.z * (f32(size - 1));

  var left = vec2<f32>(0.0);
  var right = vec2<f32>(0.0);
  var down = vec2<f32>(0.0);
  var up = vec2<f32>(0.0);
  if (ix > 0) {
    left = gridVel[grid_index(ix - 1, iy, size)];
  }
  if (ix < size - 1) {
    right = gridVel[grid_index(ix + 1, iy, size)];
  }
  if (iy > 0) {
    down = gridVel[grid_index(ix, iy - 1, size)];
  }
  if (iy < size - 1) {
    up = gridVel[grid_index(ix, iy + 1, size)];
  }

  let div = (right.x - left.x + up.y - down.y) * 0.5 * invCell;
  gridDivergence[idx] = div;
}

@compute @workgroup_size(128)
fn pressure_jacobi(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = i32(gid.x);
  let size = grid_size();
  let count = size * size;
  if (idx >= count) {
    return;
  }
  let ix = idx % size;
  let iy = idx / size;

  var pL = 0.0;
  var pR = 0.0;
  var pB = 0.0;
  var pT = 0.0;
  if (ix > 0) {
    pL = gridPressurePrev[grid_index(ix - 1, iy, size)];
  }
  if (ix < size - 1) {
    pR = gridPressurePrev[grid_index(ix + 1, iy, size)];
  }
  if (iy > 0) {
    pB = gridPressurePrev[grid_index(ix, iy - 1, size)];
  }
  if (iy < size - 1) {
    pT = gridPressurePrev[grid_index(ix, iy + 1, size)];
  }
  let div = gridDivergence[idx];
  gridPressure[idx] = (pL + pR + pB + pT - div) * 0.25;
}

@compute @workgroup_size(128)
fn project_grid(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = i32(gid.x);
  let size = grid_size();
  let count = size * size;
  if (idx >= count) {
    return;
  }
  let ix = idx % size;
  let iy = idx / size;
  let invCell = params.sim0.z * (f32(size - 1));

  var pL = 0.0;
  var pR = 0.0;
  var pB = 0.0;
  var pT = 0.0;
  if (ix > 0) {
    pL = gridPressure[grid_index(ix - 1, iy, size)];
  }
  if (ix < size - 1) {
    pR = gridPressure[grid_index(ix + 1, iy, size)];
  }
  if (iy > 0) {
    pB = gridPressure[grid_index(ix, iy - 1, size)];
  }
  if (iy < size - 1) {
    pT = gridPressure[grid_index(ix, iy + 1, size)];
  }
  var vel = gridVel[idx];
  vel.x = vel.x - (pR - pL) * 0.5 * invCell;
  vel.y = vel.y - (pT - pB) * 0.5 * invCell;
  gridVel[idx] = vel;
}

@compute @workgroup_size(128)
fn update_particles(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = i32(gid.x);
  let count = i32(params.sim1.z);
  if (idx >= count) {
    return;
  }
  let dt = params.sim1.x;
  let flipRatio = params.sim1.y;
  let bounce = params.sim3.y;
  let origin = params.sim0.xy;
  let size = 1.0 / params.sim0.z;

  var pos = particles[idx].xy;
  var vel = particles[idx].zw;
  let uv = particle_uv(pos);

  let pic = sample_grid_vel_current(uv);
  let prev = sample_grid_vel_prev(uv);
  let flip = vel + (pic - prev);
  vel = mix(pic, flip, flipRatio);

  pos = pos + vel * dt;

  let minPos = origin;
  let maxPos = origin + vec2<f32>(size);
  if (pos.x < minPos.x) {
    pos.x = minPos.x;
    vel.x = -vel.x * bounce;
  } else if (pos.x > maxPos.x) {
    pos.x = maxPos.x;
    vel.x = -vel.x * bounce;
  }
  if (pos.y < minPos.y) {
    pos.y = minPos.y;
    vel.y = -vel.y * bounce;
  } else if (pos.y > maxPos.y) {
    pos.y = maxPos.y;
    vel.y = -vel.y * bounce;
  }

  particles[idx] = vec4<f32>(pos, vel);
}
