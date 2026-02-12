import { generateTemperateMixedForest } from "../src/biomes/temperate.ts";
import { defaultFieldParams, sampleFieldStack } from "../src/fields.ts";
import { axialToWorld } from "../src/hex.ts";
import { MicroFeature, SurfaceCover } from "../src/types.ts";
import { createPerfMonitor } from "../src/perf-monitor.ts";
import { createMeshBuilder } from "../src/mesh.ts";
import {
  FRACTAL_SAMPLE_STRIDE,
  assetMatches,
  createFractalPrepassRunner,
  defaultFractalMandelSettings,
  parseFractalAsset,
  serializeFractalAsset,
} from "../src/fractal-prepass.ts";
import commonShaderCode from "../src/shaders/library/common.wgsl?raw";
import materialShaderCode from "../src/shaders/library/materials.wgsl?raw";
import terrainShaderCore from "../src/shaders/demo-terrain.wgsl?raw";
import treeShaderCode from "../src/shaders/demo-trees.wgsl?raw";
import waterSimShaderCode from "../src/shaders/demo-water-sim.wgsl?raw";
import fractalPrepassShaderCode from "../src/fractal-prepass.wgsl?raw";

const terrainShaderCode = [commonShaderCode, materialShaderCode, terrainShaderCore].join(
  "\n"
);

const waterQualityPresets = [
  { name: "Ultra", simRate: 90, gridSize: 96, particleCount: 9000, pressureIterations: 16 },
  { name: "High", simRate: 75, gridSize: 88, particleCount: 7500, pressureIterations: 13 },
  { name: "Balanced", simRate: 60, gridSize: 80, particleCount: 6000, pressureIterations: 11 },
  { name: "Performance", simRate: 45, gridSize: 72, particleCount: 4500, pressureIterations: 9 },
  { name: "Low", simRate: 30, gridSize: 64, particleCount: 3200, pressureIterations: 7 },
];

const performanceHooks = [];

function registerPerformanceHook(hook) {
  performanceHooks.push(hook);
}

const FRACTAL_ASSET_KEY = "plasius-fractal-asset";

const canvas = document.getElementById("view");
const statusEl = document.getElementById("status");
const modeSelect = document.getElementById("mode");
const terrainSeedInput = document.getElementById("terrainSeed");
const featureSeedInput = document.getElementById("featureSeed");
const foliageSeedInput = document.getElementById("foliageSeed");
const radiusInput = document.getElementById("radius");
const radiusValue = document.getElementById("radiusValue");
const regenBtn = document.getElementById("regen");
const bakeBtn = document.getElementById("bakeFractal");
const fpsEl = document.getElementById("fps");
const heatmapToggle = document.getElementById("heatmapToggle");

const state = {
  device: null,
  context: null,
  contextFormat: null,
  pipeline: null,
  treePipeline: null,
  waterSim: null,
  fractalPrepass: null,
  fractalAsset: null,
  uniformBuffer: null,
  treeUniformBuffer: null,
  bindGroup: null,
  treeBindGroup: null,
  depthTexture: null,
  vertexBuffer: null,
  vertexCount: 0,
  boxMinBuffer: null,
  boxMaxBuffer: null,
  boxCount: 0,
  treeInstanceBuffer: null,
  treeCount: 0,
  yaw: Math.PI / 4,
  pitch: Math.atan(1 / Math.sqrt(2)),
  radius: 20,
  orthoScale: 10,
  target: [0, 0.2, 0],
  dragging: false,
  dragMode: "orbit",
  lastX: 0,
  lastY: 0,
  fpsFrames: 0,
  fpsLast: performance.now(),
  lastSimTime: performance.now() * 0.001,
  waterSimRate: 60,
  waterSimMaxSteps: 2,
  waterSimAccumulator: 0,
  waterQualityLevel: 2,
  performance: createPerfMonitor({
    targetFps: 120,
    tolerance: 6,
    sampleSize: 90,
    minSampleFraction: 0.6,
    cooldownMs: 1200,
    qualitySlew: 0.05,
    initialBudget: 0.5,
    auto: true,
  }),
  time: 0,
  windDir: [0.85, 0, 0.52],
  windStrength: 0.35,
  windGust: 0.25,
  season: 0.2,
  wetness: 0.18,
  snow: 0.0,
  rain: 0.0,
  heatmapEnabled: false,
  heightMin: -1,
  heightMax: 1,
};

function setStatus(text) {
  if (statusEl) {
    statusEl.textContent = text;
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeSeed(rawValue, fallback) {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) {
    return fallback >>> 0;
  }
  return Math.max(1, Math.floor(Math.abs(parsed))) >>> 0;
}

function getSeedConfig() {
  const terrainSeed = normalizeSeed(terrainSeedInput?.value, 1337);
  const featureSeed = normalizeSeed(featureSeedInput?.value, terrainSeed ^ 0x9e3779b9);
  const foliageSeed = normalizeSeed(foliageSeedInput?.value, terrainSeed ^ 0x85ebca6b);
  return { terrainSeed, featureSeed, foliageSeed };
}

const Material = {
  Default: 0,
  Grass: 1,
  Water: 2,
  Rock: 3,
  Sand: 4,
  Mud: 5,
  Snow: 6,
  Foliage: 7,
};

function mat4Perspective(fovy, aspect, near, far) {
  const f = 1.0 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) * nf,
    -1,
    0,
    0,
    2 * far * near * nf,
    0,
  ]);
}

function mat4Ortho(left, right, bottom, top, near, far) {
  const lr = 1 / (left - right);
  const bt = 1 / (bottom - top);
  const nf = 1 / (near - far);
  return new Float32Array([
    -2 * lr,
    0,
    0,
    0,
    0,
    -2 * bt,
    0,
    0,
    0,
    0,
    2 * nf,
    0,
    (left + right) * lr,
    (top + bottom) * bt,
    (far + near) * nf,
    1,
  ]);
}

function mat4LookAt(eye, target, up) {
  const zx = eye[0] - target[0];
  const zy = eye[1] - target[1];
  const zz = eye[2] - target[2];
  let len = Math.hypot(zx, zy, zz);
  const z0 = len > 0 ? zx / len : 0;
  const z1 = len > 0 ? zy / len : 0;
  const z2 = len > 0 ? zz / len : 1;

  const xx = up[1] * z2 - up[2] * z1;
  const xy = up[2] * z0 - up[0] * z2;
  const xz = up[0] * z1 - up[1] * z0;
  len = Math.hypot(xx, xy, xz);
  const x0 = len > 0 ? xx / len : 1;
  const x1 = len > 0 ? xy / len : 0;
  const x2 = len > 0 ? xz / len : 0;

  const y0 = z1 * x2 - z2 * x1;
  const y1 = z2 * x0 - z0 * x2;
  const y2 = z0 * x1 - z1 * x0;

  return new Float32Array([
    x0,
    y0,
    z0,
    0,
    x1,
    y1,
    z1,
    0,
    x2,
    y2,
    z2,
    0,
    -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]),
    -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]),
    -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]),
    1,
  ]);
}

function mat4Multiply(a, b) {
  // Column-major multiplication: out = a * b
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c += 1) {
    for (let r = 0; r < 4; r += 1) {
      out[c * 4 + r] =
        a[0 * 4 + r] * b[c * 4 + 0] +
        a[1 * 4 + r] * b[c * 4 + 1] +
        a[2 * 4 + r] * b[c * 4 + 2] +
        a[3 * 4 + r] * b[c * 4 + 3];
    }
  }
  return out;
}

function normalize(vec) {
  const len = Math.hypot(vec[0], vec[1], vec[2]);
  if (len === 0) return [0, 1, 0];
  return [vec[0] / len, vec[1] / len, vec[2] / len];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function computeNormal(a, b, c) {
  const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  return normalize([
    ab[1] * ac[2] - ab[2] * ac[1],
    ab[2] * ac[0] - ab[0] * ac[2],
    ab[0] * ac[1] - ab[1] * ac[0],
  ]);
}

function shade(color, factor) {
  return [color[0] * factor, color[1] * factor, color[2] * factor];
}

function colorForSurface(surface) {
  switch (surface) {
    case SurfaceCover.Grass:
      return [0.24, 0.55, 0.26];
    case SurfaceCover.Dirt:
      return [0.45, 0.32, 0.2];
    case SurfaceCover.Mud:
      return [0.3, 0.22, 0.16];
    case SurfaceCover.Sand:
      return [0.74, 0.66, 0.42];
    case SurfaceCover.Water:
      return [0.12, 0.32, 0.62];
    case SurfaceCover.Ice:
      return [0.66, 0.78, 0.86];
    case SurfaceCover.Rock:
      return [0.5, 0.5, 0.52];
    case SurfaceCover.Gravel:
      return [0.6, 0.56, 0.5];
    case SurfaceCover.Basalt:
      return [0.32, 0.32, 0.35];
    default:
      return [0.38, 0.48, 0.32];
  }
}

function materialForSurface(surface) {
  switch (surface) {
    case SurfaceCover.Grass:
      return Material.Grass;
    case SurfaceCover.Water:
      return Material.Water;
    case SurfaceCover.Rock:
    case SurfaceCover.Gravel:
    case SurfaceCover.Basalt:
      return Material.Rock;
    case SurfaceCover.Sand:
      return Material.Sand;
    case SurfaceCover.Mud:
    case SurfaceCover.Dirt:
      return Material.Mud;
    case SurfaceCover.Ice:
      return Material.Snow;
    default:
      return Material.Default;
  }
}

function hash01(seed) {
  const s = Math.sin(seed) * 43758.5453123;
  return s - Math.floor(s);
}

function mandelbrotHeight(x, z, seed, scale = 0.17, iterations = 18) {
  const cx = x * scale + seed * 0.00037;
  const cy = z * scale - seed * 0.00021;
  let zx = 0;
  let zy = 0;
  let iter = 0;
  for (let i = 0; i < iterations; i += 1) {
    const xx = zx * zx - zy * zy + cx;
    const yy = 2 * zx * zy + cy;
    zx = xx;
    zy = yy;
    if (zx * zx + zy * zy > 4) {
      break;
    }
    iter = i + 1;
  }
  return iter / iterations;
}

function loadFractalAssetFromStorage() {
  try {
    const raw = window.localStorage.getItem(FRACTAL_ASSET_KEY);
    if (!raw) return null;
    const parsed = parseFractalAsset(JSON.parse(raw));
    return parsed;
  } catch (err) {
    console.warn("Failed to load baked fractal asset.", err);
    return null;
  }
}

function saveFractalAssetToStorage(asset) {
  try {
    const payload = serializeFractalAsset(asset);
    window.localStorage.setItem(FRACTAL_ASSET_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn("Failed to store fractal asset.", err);
  }
}

function downloadFractalAsset(asset) {
  const payload = serializeFractalAsset(asset);
  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fractal-asset-${asset.seed}-${asset.gridSize}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function loadFractalAssetFromFile() {
  try {
    const response = await fetch("./assets/fractal-height.json", { cache: "no-store" });
    if (!response.ok) return null;
    const payload = await response.json();
    return parseFractalAsset(payload);
  } catch (err) {
    return null;
  }
}

async function runFractalPrepass({ seed, extent, steps, heightScale }) {
  if (!state.device) {
    throw new Error("GPU device not ready for fractal prepass.");
  }
  const gridSize = Math.max(8, steps);
  if (!state.fractalPrepass || state.fractalPrepass.gridSize !== gridSize) {
    state.fractalPrepass = createFractalPrepassRunner({
      device: state.device,
      wgsl: fractalPrepassShaderCode,
      gridSize,
    });
  }
  return state.fractalPrepass.run({
    seed,
    extent,
    heightScale,
    mandel: defaultFractalMandelSettings,
  });
}

async function bakeFractalAsset() {
  const { terrainSeed } = getSeedConfig();
  const radius = Number(radiusInput?.value ?? 6);
  const extent = radius * 2.6;
  const steps = Math.round(clamp(radius * 16, 36, 180));
  setStatus(`Baking fractal asset (terrain ${terrainSeed})...`);
  const asset =
    state.fractalAsset &&
    assetMatches(state.fractalAsset, { seed: terrainSeed, extent, gridSize: steps })
      ? state.fractalAsset
      : await runFractalPrepass({ seed: terrainSeed, extent, steps, heightScale: 2.6 });
  state.fractalAsset = asset;
  saveFractalAssetToStorage(asset);
  downloadFractalAsset(asset);
  setStatus(`Fractal asset baked and downloaded (terrain ${terrainSeed}).`);
}

function rebuildSceneBindGroup() {
  if (!state.device || !state.pipeline || !state.uniformBuffer) return;
  if (!state.boxMinBuffer || !state.boxMaxBuffer) return;
  state.bindGroup = state.device.createBindGroup({
    layout: state.pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: state.uniformBuffer } },
      { binding: 1, resource: { buffer: state.boxMinBuffer } },
      { binding: 2, resource: { buffer: state.boxMaxBuffer } },
      {
        binding: 3,
        resource: { buffer: state.waterSim?.gridHeightBuffer ?? state.boxMinBuffer },
      },
    ],
  });
}

function qualityBudgetForLevel(level) {
  if (waterQualityPresets.length <= 1) return 1;
  return 1 - level / (waterQualityPresets.length - 1);
}

function levelForQualityBudget(budget) {
  if (waterQualityPresets.length <= 1) return 0;
  const clamped = clamp(budget, 0, 1);
  return Math.round((1 - clamped) * (waterQualityPresets.length - 1));
}

function applyWaterSoftQuality() {
  const perf = state.performance;
  if (!perf) return;
  const budget = perf.getBudget();
  const minRate = waterQualityPresets[waterQualityPresets.length - 1]?.simRate ?? 35;
  const maxRate = waterQualityPresets[0]?.simRate ?? 90;
  const iterValues = waterQualityPresets.map((preset) => preset.pressureIterations);
  const minIter = Math.min(...iterValues, 7);
  const maxIter = Math.max(...iterValues, 16);
  state.waterSimRate = Math.round(minRate + (maxRate - minRate) * budget);
  state.waterSimMaxSteps = state.waterSimRate >= 75 ? 2 : 3;
  if (state.waterSim) {
    state.waterSim.config.pressureIterations = Math.round(
      minIter + (maxIter - minIter) * budget
    );
  }
}

function applyWaterQuality(level, reason = "", options = {}) {
  const { syncBudget = true } = options;
  const nextLevel = clamp(level, 0, waterQualityPresets.length - 1);
  const preset = waterQualityPresets[nextLevel];
  state.waterQualityLevel = nextLevel;
  if (state.device) {
    state.waterSim = createWaterSimulation(state.device, preset);
    state.waterSimAccumulator = 0;
    rebuildSceneBindGroup();
  }
  if (state.performance) {
    if (syncBudget) {
      state.performance.setBudget(qualityBudgetForLevel(nextLevel));
    }
    state.performance.resetSamples();
  }
  if (reason && statusEl) {
    setStatus(`Water: ${preset.name} (${reason})`);
  }
  applyWaterSoftQuality();
  if (state.performance) {
    runPerformanceHooks({ budget: state.performance.getBudget(), reason });
  }
}

function runPerformanceHooks(context) {
  for (const hook of performanceHooks) {
    hook(context);
  }
}

function updatePerformanceGovernor(nowMs) {
  const perf = state.performance;
  if (!perf) return;
  const result = perf.update(nowMs);
  if (!result.adjusted || result.medianFps == null || result.miss == null) {
    return;
  }
  applyWaterSoftQuality();
  runPerformanceHooks({ budget: result.budget, median: result.medianFps, miss: result.miss });

  const targetLevel = levelForQualityBudget(result.budget);
  if (targetLevel !== state.waterQualityLevel) {
    applyWaterQuality(targetLevel, `auto ${Math.round(result.medianFps)}fps`, {
      syncBudget: false,
    });
  }
}

function createWaterSimulation(device, overrides = {}) {
  const config = {
    size: 16,
    gridSize: 80,
    particleCount: 6000,
    flipRatio: 0.92,
    velScale: 1000,
    weightScale: 1024,
    heightScale: 0.08,
    densityScale: 3.2,
    damping: 0.02,
    bounce: 0.35,
    pressureIterations: 11,
    ...overrides,
  };

  const origin = [-config.size * 0.5, -config.size * 0.5];
  const invSize = 1 / config.size;
  const gridCount = config.gridSize * config.gridSize;

  const paramBuffer = device.createBuffer({
    size: 16 * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const particleBuffer = device.createBuffer({
    size: config.particleCount * 4 * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const gridAccumBuffer = device.createBuffer({
    size: gridCount * 16,
    usage: GPUBufferUsage.STORAGE,
  });

  const gridVelBuffer = device.createBuffer({
    size: gridCount * 2 * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const gridVelPrevBuffer = device.createBuffer({
    size: gridCount * 2 * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const gridDivergenceBuffer = device.createBuffer({
    size: gridCount * 4,
    usage: GPUBufferUsage.STORAGE,
  });

  const gridPressureA = device.createBuffer({
    size: gridCount * 4,
    usage: GPUBufferUsage.STORAGE,
  });

  const gridPressureB = device.createBuffer({
    size: gridCount * 4,
    usage: GPUBufferUsage.STORAGE,
  });

  const gridHeightBuffer = device.createBuffer({
    size: gridCount * 4,
    usage: GPUBufferUsage.STORAGE,
  });

  const zeroVel = new Float32Array(gridCount * 2);
  device.queue.writeBuffer(gridVelBuffer, 0, zeroVel);
  device.queue.writeBuffer(gridVelPrevBuffer, 0, zeroVel);

  const module = device.createShaderModule({ code: waterSimShaderCode });
  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: "uniform" } },
      { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } },
      { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } },
      { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } },
      { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } },
      { binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } },
      { binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } },
      { binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } },
      { binding: 8, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } },
    ],
  });
  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  });
  const pipelines = {
    copyGrid: device.createComputePipeline({
      layout: pipelineLayout,
      compute: { module, entryPoint: "copy_grid" },
    }),
    clearGrid: device.createComputePipeline({
      layout: pipelineLayout,
      compute: { module, entryPoint: "clear_grid" },
    }),
    particlesToGrid: device.createComputePipeline({
      layout: pipelineLayout,
      compute: { module, entryPoint: "particles_to_grid" },
    }),
    normalizeGrid: device.createComputePipeline({
      layout: pipelineLayout,
      compute: { module, entryPoint: "normalize_grid" },
    }),
    divergence: device.createComputePipeline({
      layout: pipelineLayout,
      compute: { module, entryPoint: "compute_divergence" },
    }),
    pressure: device.createComputePipeline({
      layout: pipelineLayout,
      compute: { module, entryPoint: "pressure_jacobi" },
    }),
    project: device.createComputePipeline({
      layout: pipelineLayout,
      compute: { module, entryPoint: "project_grid" },
    }),
    updateParticles: device.createComputePipeline({
      layout: pipelineLayout,
      compute: { module, entryPoint: "update_particles" },
    }),
  };

  const entries = (pressureOut, pressureIn) => [
    { binding: 0, resource: { buffer: paramBuffer } },
    { binding: 1, resource: { buffer: particleBuffer } },
    { binding: 2, resource: { buffer: gridAccumBuffer } },
    { binding: 3, resource: { buffer: gridVelBuffer } },
    { binding: 4, resource: { buffer: gridVelPrevBuffer } },
    { binding: 5, resource: { buffer: gridDivergenceBuffer } },
    { binding: 6, resource: { buffer: pressureOut } },
    { binding: 7, resource: { buffer: pressureIn } },
    { binding: 8, resource: { buffer: gridHeightBuffer } },
  ];

  const bindGroupA = device.createBindGroup({
    layout: bindGroupLayout,
    entries: entries(gridPressureA, gridPressureB),
  });
  const bindGroupB = device.createBindGroup({
    layout: bindGroupLayout,
    entries: entries(gridPressureB, gridPressureA),
  });

  const particleData = new Float32Array(config.particleCount * 4);
  const center = [origin[0] + config.size * 0.5, origin[1] + config.size * 0.5];
  const radius = config.size * 0.45;
  for (let i = 0; i < config.particleCount; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * radius;
    const x = center[0] + Math.cos(angle) * r;
    const z = center[1] + Math.sin(angle) * r;
    const vx = (Math.random() - 0.5) * 0.15;
    const vz = (Math.random() - 0.5) * 0.15;
    const base = i * 4;
    particleData[base] = x;
    particleData[base + 1] = z;
    particleData[base + 2] = vx;
    particleData[base + 3] = vz;
  }
  device.queue.writeBuffer(particleBuffer, 0, particleData);

  const simParams = new Float32Array(16);
  const updateParams = (dt) => {
    simParams[0] = origin[0];
    simParams[1] = origin[1];
    simParams[2] = invSize;
    simParams[3] = config.gridSize;
    simParams[4] = dt;
    simParams[5] = config.flipRatio;
    simParams[6] = config.particleCount;
    simParams[7] = 0;
    simParams[8] = config.velScale;
    simParams[9] = config.weightScale;
    simParams[10] = config.heightScale;
    simParams[11] = config.densityScale;
    simParams[12] = config.damping;
    simParams[13] = config.bounce;
    simParams[14] = 0;
    simParams[15] = 0;
    device.queue.writeBuffer(paramBuffer, 0, simParams);
  };

  updateParams(0.016);

  return {
    config,
    origin,
    invSize,
    gridHeightBuffer,
    bindGroupA,
    bindGroupB,
    pipelines,
    updateParams,
    gridWorkgroups: Math.ceil(gridCount / 128),
    particleWorkgroups: Math.ceil(config.particleCount / 128),
  };
}

function isWaterSurface(surface) {
  return surface === SurfaceCover.Water;
}

function isRockySurface(surface) {
  return (
    surface === SurfaceCover.Rock ||
    surface === SurfaceCover.Gravel ||
    surface === SurfaceCover.Basalt
  );
}

function isSoftSurface(surface) {
  return (
    surface === SurfaceCover.Grass ||
    surface === SurfaceCover.Dirt ||
    surface === SurfaceCover.Mud ||
    surface === SurfaceCover.Sand
  );
}

function featureStyle(feature) {
  switch (feature) {
    case MicroFeature.Tree:
      return {
        height: 0.9,
        width: 0.18,
        color: [0.16, 0.4, 0.18],
        material: Material.Foliage,
      };
    case MicroFeature.Bush:
      return {
        height: 0.4,
        width: 0.2,
        color: [0.2, 0.5, 0.22],
        material: Material.Foliage,
      };
    case MicroFeature.GrassTuft:
      return {
        height: 0.15,
        width: 0.12,
        color: [0.3, 0.62, 0.28],
        material: Material.Foliage,
      };
    case MicroFeature.Boulder:
      return {
        height: 0.25,
        width: 0.2,
        color: [0.45, 0.45, 0.48],
        material: Material.Rock,
      };
    case MicroFeature.Rock:
      return {
        height: 0.18,
        width: 0.16,
        color: [0.52, 0.52, 0.55],
        material: Material.Rock,
      };
    case MicroFeature.Flower:
      return {
        height: 0.16,
        width: 0.1,
        color: [0.86, 0.46, 0.62],
        material: Material.Foliage,
      };
    default:
      return null;
  }
}

function buildTreeInstances(layer, seed, maxTrees = 120) {
  const instances = [];
  let count = 0;
  for (let i = 0; i < layer.cells.length; i += 1) {
    const cell = layer.cells[i];
    const terrain = layer.terrain[i];
    const base = hash01(cell.q * 13.13 + cell.r * 78.233 + seed * 0.17);
    if (terrain.feature !== MicroFeature.Tree && base < 0.82) {
      continue;
    }
    const pos = axialToWorld(cell.q, cell.r, 1);
    const height = 0.8 + hash01(base * 97.2) * 0.9;
    const canopy = 0.45 + hash01(base * 11.4) * 0.6;
    const leafiness = 0.55 + hash01(base * 43.7) * 0.45;
    const deciduous = hash01(base * 9.7) > 0.3 ? 1 : 0;
    const seedVar = hash01(base * 21.9);

    instances.push(
      pos.x,
      (terrain.height ?? 0) * 1.2,
      pos.y,
      height,
      canopy,
      seedVar,
      deciduous,
      leafiness
    );

    count += 1;
    if (count >= maxTrees) {
      break;
    }
  }
  if (instances.length === 0) {
    instances.push(0, 0, 0, 1.2, 0.6, 0.42, 1, 0.8);
  }
  return new Float32Array(instances);
}

function buildGeometry(
  layer,
  size = 1,
  heightScale = 1.2,
  seeds = { terrainSeed: 1337, featureSeed: 4242, foliageSeed: 7331 }
) {
  const terrainSeed = seeds?.terrainSeed ?? 1337;
  const foliageSeed = seeds?.foliageSeed ?? 7331;
  const heightMap = new Map();
  const ruleHeightMap = new Map();
  const surfaceMap = new Map();
  const directions = [
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, 0],
    [-1, 1],
    [0, 1],
  ];
  const cliffThreshold = 0.52 * heightScale;

  const keyFor = (q, r) => `${q},${r}`;

  layer.cells.forEach((cell, index) => {
    const height = layer.terrain[index].height * heightScale;
    heightMap.set(keyFor(cell.q, cell.r), height);
    surfaceMap.set(
      keyFor(cell.q, cell.r),
      layer.terrain[index].surface ?? SurfaceCover.Grass
    );
  });

  layer.cells.forEach((cell) => {
    const key = keyFor(cell.q, cell.r);
    const baseHeight = heightMap.get(key) ?? 0;
    const surface = surfaceMap.get(key) ?? SurfaceCover.Grass;
    let adjusted = baseHeight;

    if (isWaterSurface(surface)) {
      let minNeighbor = Infinity;
      let found = false;
      directions.forEach((dir) => {
        const neighbor = heightMap.get(keyFor(cell.q + dir[0], cell.r + dir[1]));
        if (typeof neighbor === "number") {
          minNeighbor = Math.min(minNeighbor, neighbor);
          found = true;
        }
      });
      if (found) {
        adjusted = Math.min(baseHeight, minNeighbor - 0.08 * heightScale);
        adjusted = Math.max(0, adjusted);
      }
    } else if (isRockySurface(surface)) {
      adjusted = baseHeight + 0.06 * heightScale;
    }

    ruleHeightMap.set(key, adjusted);
  });

  const smoothHeights = (source) => {
    const next = new Map();
    layer.cells.forEach((cell) => {
      const key = keyFor(cell.q, cell.r);
      const base = source.get(key) ?? 0;
      let sum = base * 1.6;
      let weight = 1.6;
      directions.forEach((dir) => {
        const h = source.get(keyFor(cell.q + dir[0], cell.r + dir[1]));
        if (typeof h === "number") {
          sum += h;
          weight += 1;
        }
      });
      next.set(key, sum / weight);
    });
    return next;
  };

  const heightMapPass1 = smoothHeights(ruleHeightMap);
  const heightMapPass2 = smoothHeights(heightMapPass1);
  const accentHeights = (source) => {
    const next = new Map();
    const invScale = 1 / Math.max(heightScale, 1e-3);
    layer.cells.forEach((cell) => {
      const key = keyFor(cell.q, cell.r);
      const base = source.get(key) ?? 0;
      const baseNorm = base * invScale;
      let sum = 0;
      let count = 0;
      directions.forEach((dir) => {
        const h = source.get(keyFor(cell.q + dir[0], cell.r + dir[1]));
        if (typeof h === "number") {
          sum += h * invScale;
          count += 1;
        }
      });
      const avg = count > 0 ? sum / count : baseNorm;
      const delta = baseNorm - avg;
      const ridge = Math.max(0, delta);
      const nextNorm = clamp(baseNorm + delta * 1.25 + ridge * 0.2, -0.2, 1.4);
      next.set(key, nextNorm * heightScale);
    });
    return next;
  };
  const heightMapFinal = accentHeights(heightMapPass2);
  let minHeight = Infinity;
  let maxHeight = -Infinity;
  for (const value of heightMapFinal.values()) {
    minHeight = Math.min(minHeight, value);
    maxHeight = Math.max(maxHeight, value);
  }
  for (const value of ruleHeightMap.values()) {
    minHeight = Math.min(minHeight, value);
    maxHeight = Math.max(maxHeight, value);
  }

  const builder = createMeshBuilder({
    size,
    defaultMaterial: Material.Default,
    foliageMaterial: Material.Foliage,
  });
  const { vertices, boxMin, boxMax, addTriangle, addQuad, addTreeMesh, addBounds } = builder;

  const addHexSurface = (cell, center, height, color, material) => {
    const corners = [];
    const innerCorners = [];
    const cornerHeights = [];
    const innerHeights = [];
    const edgeHeights = [];
    const edgeNoise = [];
    const edgeCliffs = [];
    const cellKey = keyFor(cell.q, cell.r);
    const surface = surfaceMap.get(cellKey) ?? SurfaceCover.Grass;
    const isWater = isWaterSurface(surface);
    const centerNoise = isWater
      ? 0
      : (hash01(cell.q * 19.13 + cell.r * 27.91 + terrainSeed * 0.13) - 0.5) *
        heightScale *
        0.04;

    for (let i = 0; i < 6; i += 1) {
      const dir = directions[i];
      const nq = cell.q + dir[0];
      const nr = cell.r + dir[1];
      const neighborKey = keyFor(nq, nr);
      const neighborSurface = surfaceMap.get(neighborKey) ?? surface;
      const neighborHeight =
        (isWaterSurface(neighborSurface)
          ? ruleHeightMap.get(neighborKey)
          : heightMapFinal.get(neighborKey)) ?? null;
      const waterEdge = isWaterSurface(surface) || isWaterSurface(neighborSurface);
      const rockyEdge = isRockySurface(surface) || isRockySurface(neighborSurface);
      const softEdge = isSoftSurface(surface) || isSoftSurface(neighborSurface);
      if (neighborHeight == null) {
        edgeHeights[i] = height;
      } else {
        let blend = surface === neighborSurface ? 0.55 : 0.7;
        if (waterEdge) {
          blend = rockyEdge ? 0.4 : softEdge ? 0.78 : 0.6;
        } else if (rockyEdge) {
          blend = 0.45;
        } else if (softEdge) {
          blend = 0.8;
        }
        edgeHeights[i] = height * (1 - blend) + neighborHeight * blend;
      }

      let edgeCliff = cliffThreshold;
      if (rockyEdge) {
        edgeCliff = cliffThreshold * 0.6;
      } else if (waterEdge && softEdge) {
        edgeCliff = cliffThreshold * 1.6;
      } else if (waterEdge) {
        edgeCliff = cliffThreshold * 1.4;
      } else if (softEdge) {
        edgeCliff = cliffThreshold * 1.3;
      }
      edgeCliffs[i] = edgeCliff;

      const minQ = Math.min(cell.q, nq);
      const minR = Math.min(cell.r, nr);
      const maxQ = Math.max(cell.q, nq);
      const maxR = Math.max(cell.r, nr);
      const edgeSeed =
        minQ * 127.1 +
        minR * 311.7 +
        maxQ * 74.7 +
        maxR * 19.19 +
        surface * 17.17 +
        neighborSurface * 37.31 +
        terrainSeed * 0.71 +
        i * 11.3;
      edgeNoise[i] = hash01(edgeSeed) * 2 - 1;
    }

    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      const x = center[0] + size * Math.cos(angle);
      const z = center[2] + size * Math.sin(angle);
      const cornerBlend =
        (edgeHeights[i] + edgeHeights[(i + 5) % 6]) * 0.5;
      const cornerJitter = (edgeNoise[i] + edgeNoise[(i + 5) % 6]) * 0.5;
      const cornerHeight = isWater
        ? height
        : height * 0.3 + cornerBlend * 0.7 + cornerJitter * heightScale * 0.04;
      const innerRadius = size * (0.62 + cornerJitter * 0.04);
      const innerHeight = isWater
        ? height
        : height * 0.4 + cornerBlend * 0.6 + cornerJitter * heightScale * 0.08;
      const innerX = center[0] + innerRadius * Math.cos(angle);
      const innerZ = center[2] + innerRadius * Math.sin(angle);
      corners.push([x, cornerHeight, z]);
      innerCorners.push([innerX, innerHeight, innerZ]);
      cornerHeights.push(cornerHeight);
      innerHeights.push(innerHeight);
    }

    const topCenter = [center[0], height + centerNoise, center[2]];
    for (let i = 0; i < 6; i += 1) {
      const a = topCenter;
      const b = innerCorners[i];
      const c = innerCorners[(i + 1) % 6];
      const normal = computeNormal(a, b, c);
      addTriangle(a, b, c, normal, color, 0, 0, 0, material);
    }

    for (let i = 0; i < 6; i += 1) {
      const outer0 = corners[i];
      const outer1 = corners[(i + 1) % 6];
      const inner0 = innerCorners[i];
      const inner1 = innerCorners[(i + 1) % 6];
      const normal = computeNormal(outer0, inner0, inner1);
      addQuad(outer0, inner0, inner1, outer1, normal, shade(color, 0.92), 0, 0, 0, 0, material);
    }

    for (let i = 0; i < 6; i += 1) {
      const dir = directions[i];
      const neighborKey = keyFor(cell.q + dir[0], cell.r + dir[1]);
      const neighborSurface = surfaceMap.get(neighborKey) ?? surface;
      const neighborHeight =
        (isWaterSurface(neighborSurface)
          ? ruleHeightMap.get(neighborKey)
          : heightMapFinal.get(neighborKey)) ?? null;
      const top0 = corners[i];
      const top1 = corners[(i + 1) % 6];

      if (neighborHeight == null) {
        const bottom0 = [top0[0], 0, top0[2]];
        const bottom1 = [top1[0], 0, top1[2]];
        const normal = computeNormal(top0, bottom0, bottom1);
        addQuad(top0, bottom0, bottom1, top1, normal, shade(color, 0.7), 0, 0, 0, 0, material);
        continue;
      }

      if (height > neighborHeight + edgeCliffs[i]) {
        const bottom0 = [top0[0], neighborHeight, top0[2]];
        const bottom1 = [top1[0], neighborHeight, top1[2]];
        const normal = computeNormal(top0, bottom0, bottom1);
        addQuad(top0, bottom0, bottom1, top1, normal, shade(color, 0.65), 0, 0, 0, 0, material);
      }
    }

    const maxHeight = Math.max(
      ...cornerHeights,
      ...innerHeights,
      height + centerNoise
    );
    addBounds(corners.concat(innerCorners), 0, maxHeight);
  };

  const addFeature = (center, baseHeight, feature) => {
    const style = featureStyle(feature);
    if (!style) return;

    const y0 = baseHeight;
    const y1 = baseHeight + style.height;
    const w = style.width;
    const color = style.color;
    const material = style.material ?? Material.Default;

    const quad1 = [
      [center[0] - w, y0, center[2]],
      [center[0] + w, y0, center[2]],
      [center[0] + w, y1, center[2]],
      [center[0] - w, y1, center[2]],
    ];

    const quad2 = [
      [center[0], y0, center[2] - w],
      [center[0], y0, center[2] + w],
      [center[0], y1, center[2] + w],
      [center[0], y1, center[2] - w],
    ];

    addQuad(quad1[0], quad1[1], quad1[2], quad1[3], [0, 0, 1], color, 0, 0, 0, 0, material);
    addQuad(quad2[0], quad2[1], quad2[2], quad2[3], [1, 0, 0], color, 0, 0, 0, 0, material);
  };

  layer.cells.forEach((cell, index) => {
    const terrain = layer.terrain[index];
    const pos = axialToWorld(cell.q, cell.r, size);
    const key = keyFor(cell.q, cell.r);
    const surface = terrain.surface ?? SurfaceCover.Grass;
    const baseHeight = heightMapFinal.get(key) ?? terrain.height * heightScale;
    const height = isWaterSurface(surface)
      ? ruleHeightMap.get(key) ?? baseHeight
      : baseHeight;
    const color = colorForSurface(surface);
    const material = materialForSurface(surface);
    addHexSurface(cell, [pos.x, 0, pos.y], height, color, material);
    if (terrain.feature === MicroFeature.Tree) {
      const seedValue =
        (Math.sin(cell.q * 12.989 + cell.r * 78.233 + foliageSeed * 0.173) * 43758.5453) % 1;
      addTreeMesh([pos.x, 0, pos.y], height, Math.abs(seedValue));
    } else if (terrain.feature !== undefined) {
      addFeature([pos.x, 0, pos.y], height, terrain.feature);
    }
  });

  return {
    vertices: new Float32Array(vertices),
    boxMin: new Float32Array(boxMin),
    boxMax: new Float32Array(boxMax),
    treeCount: builder.treeMeshCount,
    minHeight: Number.isFinite(minHeight) ? minHeight : 0,
    maxHeight: Number.isFinite(maxHeight) ? maxHeight : 0,
  };
}

function surfaceFromField(sample, slope, featureSignal, foliageSignal) {
  if (sample.water > 0.58 || sample.height < 0.16) {
    return SurfaceCover.Water;
  }
  if (sample.heat < 0.18 && sample.water > 0.34) {
    return SurfaceCover.Ice;
  }
  const obstacle = sample.rockiness * 0.8 + slope * 0.45 + featureSignal * 0.35;
  if (sample.heat < 0.3 && (sample.height > 0.52 || slope > 0.42)) {
    return obstacle > 0.58 ? SurfaceCover.Rock : SurfaceCover.Gravel;
  }
  if (obstacle > 0.72) {
    return SurfaceCover.Rock;
  }
  if (sample.heat > 0.7 && sample.moisture < 0.35) {
    return featureSignal > 0.6 ? SurfaceCover.Gravel : SurfaceCover.Sand;
  }
  if (sample.moisture > 0.7 && sample.height < 0.35) {
    return SurfaceCover.Mud;
  }
  if (
    foliageSignal > 0.58 &&
    sample.moisture > 0.42 &&
    sample.heat >= 0.34 &&
    sample.heat <= 0.82 &&
    slope < 0.5
  ) {
    return SurfaceCover.Grass;
  }
  if (sample.moisture > 0.58) {
    return SurfaceCover.Dirt;
  }
  return SurfaceCover.Gravel;
}

function buildFractalGeometry(options) {
  const { terrainSeed, featureSeed, foliageSeed, extent, steps, heightScale, prepass } = options;
  const params = defaultFieldParams(terrainSeed);
  const builder = createMeshBuilder({
    size: 1,
    defaultMaterial: Material.Default,
    foliageMaterial: Material.Foliage,
  });
  const { vertices, boxMin, boxMax, addTriangle, addQuad, addTreeMesh, addBounds } = builder;
  const vegetationSites = [];

  const supportsGroundPlant = (surface) =>
    surface === SurfaceCover.Grass ||
    surface === SurfaceCover.Dirt ||
    surface === SurfaceCover.Mud;
  const supportsOpenFlowers = (surface) =>
    surface === SurfaceCover.Grass || surface === SurfaceCover.Dirt;
  const supportsObstacleSurface = (surface) =>
    surface === SurfaceCover.Rock ||
    surface === SurfaceCover.Gravel ||
    surface === SurfaceCover.Basalt;

  const addBillboardFeature = (center, baseHeight, feature, seedValue = 0.5) => {
    const style = featureStyle(feature);
    if (!style) return;
    const sway = 0.18 + seedValue * 0.2;
    const height = style.height * (0.8 + seedValue * 0.4);
    const width = style.width * (0.7 + seedValue * 0.45);
    const y0 = baseHeight;
    const y1 = baseHeight + height;
    const material = style.material ?? Material.Foliage;

    const quad1 = [
      [center[0] - width, y0, center[2]],
      [center[0] + width, y0, center[2]],
      [center[0] + width, y1, center[2]],
      [center[0] - width, y1, center[2]],
    ];
    const quad2 = [
      [center[0], y0, center[2] - width],
      [center[0], y0, center[2] + width],
      [center[0], y1, center[2] + width],
      [center[0], y1, center[2] - width],
    ];
    addQuad(
      quad1[0],
      quad1[1],
      quad1[2],
      quad1[3],
      [0, 0, 1],
      style.color,
      sway * 0.2,
      sway * 0.2,
      sway,
      sway,
      material
    );
    addQuad(
      quad2[0],
      quad2[1],
      quad2[2],
      quad2[3],
      [1, 0, 0],
      style.color,
      sway * 0.2,
      sway * 0.2,
      sway,
      sway,
      material
    );

    if (feature === MicroFeature.Flower) {
      const petalY0 = y1 - height * 0.35;
      const petalY1 = y1;
      const petalW = width * 0.9;
      const petalColor = [
        0.78 + 0.2 * hash01(seedValue * 19.3 + 0.12),
        0.42 + 0.38 * hash01(seedValue * 11.1 + 0.37),
        0.5 + 0.4 * hash01(seedValue * 7.7 + 0.61),
      ].map((v) => clamp(v, 0, 1));
      addQuad(
        [center[0] - petalW, petalY0, center[2]],
        [center[0] + petalW, petalY0, center[2]],
        [center[0] + petalW, petalY1, center[2]],
        [center[0] - petalW, petalY1, center[2]],
        [0, 0, 1],
        petalColor,
        sway,
        sway,
        sway,
        sway,
        material
      );
    }
  };
  const mandelSettings = {
    scale: defaultFractalMandelSettings.scale,
    iterations: 18,
    strength: defaultFractalMandelSettings.strength,
    rockBoost: defaultFractalMandelSettings.rockBoost,
  };
  const gridSize = prepass?.gridSize ?? Math.max(8, steps);
  const effectiveHeightScale =
    prepass && Number.isFinite(prepass.heightScale) ? prepass.heightScale : heightScale;
  const step = (extent * 2) / gridSize;
  const heights = Array.from({ length: gridSize + 1 }, () => new Array(gridSize + 1));
  const heightValues = Array.from({ length: gridSize + 1 }, () => new Array(gridSize + 1));
  const samples = Array.from({ length: gridSize + 1 }, () => new Array(gridSize + 1));

  if (prepass && prepass.samples) {
    const gridPoints = gridSize + 1;
    for (let i = 0; i <= gridSize; i += 1) {
      for (let j = 0; j <= gridSize; j += 1) {
        const x = -extent + i * step;
        const z = -extent + j * step;
        const featureSignal = mandelbrotHeight(
          x + 17.3,
          z - 11.6,
          featureSeed,
          0.14,
          14
        );
        const foliageSignal = mandelbrotHeight(
          x - 9.4,
          z + 15.2,
          foliageSeed,
          0.12,
          16
        );
        const base = (j * gridPoints + i) * FRACTAL_SAMPLE_STRIDE;
        const heightValue = prepass.samples[base];
        const heat = prepass.samples[base + 1];
        const moisture = prepass.samples[base + 2];
        const rockiness = prepass.samples[base + 3];
        const water = prepass.samples[base + 4];
        samples[i][j] = {
          height: heightValue,
          heat,
          moisture,
          rockiness,
          water,
          roughness: rockiness,
          ridge: prepass.samples[base + 5],
          base: prepass.samples[base + 6],
          detail: prepass.samples[base + 7],
          featureSignal,
          foliageSignal,
        };
        heightValues[i][j] = heightValue;
        heights[i][j] = heightValue * effectiveHeightScale;
      }
    }
  } else {
    for (let i = 0; i <= gridSize; i += 1) {
      const x = -extent + i * step;
      for (let j = 0; j <= gridSize; j += 1) {
        const z = -extent + j * step;
        const sample = sampleFieldStack(x, z, params);
        const mandel = mandelbrotHeight(
          x,
          z,
          terrainSeed,
          mandelSettings.scale,
          mandelSettings.iterations
        );
        const featureSignal = mandelbrotHeight(
          x + 17.3,
          z - 11.6,
          featureSeed,
          0.14,
          14
        );
        const foliageSignal = mandelbrotHeight(
          x - 9.4,
          z + 15.2,
          foliageSeed,
          0.12,
          16
        );
        const mandelBias = (mandel - 0.5) * mandelSettings.strength;
        const rawHeight = clamp(sample.height + mandelBias, params.heightMin, params.heightMax);
        const height01 = clamp(rawHeight, 0, 1);
        const rockiness = clamp(
          sample.rockiness + Math.max(0, mandel - 0.55) * mandelSettings.rockBoost,
          0,
          1
        );
        const water = clamp(
          (0.32 - height01) * 3.0 + (sample.moisture - 0.5) * 0.2,
          0,
          1
        );
        samples[i][j] = {
          ...sample,
          height: rawHeight,
          rockiness,
          water,
          featureSignal,
          foliageSignal,
        };
        heightValues[i][j] = rawHeight;
        heights[i][j] = rawHeight * effectiveHeightScale;
      }
    }
  }

  let minHeight = Infinity;
  let maxHeight = -Infinity;
  for (let i = 0; i <= gridSize; i += 1) {
    for (let j = 0; j <= gridSize; j += 1) {
      const h = heights[i][j];
      minHeight = Math.min(minHeight, h);
      maxHeight = Math.max(maxHeight, h);
    }
  }

  for (let i = 0; i < gridSize; i += 1) {
    const x0 = -extent + i * step;
    const x1 = x0 + step;
    for (let j = 0; j < gridSize; j += 1) {
      const z0 = -extent + j * step;
      const z1 = z0 + step;
      const h00 = heights[i][j];
      const h10 = heights[i + 1][j];
      const h01 = heights[i][j + 1];
      const h11 = heights[i + 1][j + 1];
      const maxDelta = Math.max(
        Math.abs(h10 - h00),
        Math.abs(h01 - h00),
        Math.abs(h11 - h10),
        Math.abs(h11 - h01)
      );
      const slope = clamp(maxDelta / Math.max(step, 0.001), 0, 1);
      const s00 = samples[i][j];
      const s10 = samples[i + 1][j];
      const s01 = samples[i][j + 1];
      const s11 = samples[i + 1][j + 1];
      const avgSample = {
        height: (s00.height + s10.height + s01.height + s11.height) * 0.25,
        heat: (s00.heat + s10.heat + s01.heat + s11.heat) * 0.25,
        moisture: (s00.moisture + s10.moisture + s01.moisture + s11.moisture) * 0.25,
        rockiness: (s00.rockiness + s10.rockiness + s01.rockiness + s11.rockiness) * 0.25,
        water: (s00.water + s10.water + s01.water + s11.water) * 0.25,
        featureSignal:
          (s00.featureSignal + s10.featureSignal + s01.featureSignal + s11.featureSignal) * 0.25,
        foliageSignal:
          (s00.foliageSignal + s10.foliageSignal + s01.foliageSignal + s11.foliageSignal) * 0.25,
      };
      const surface = surfaceFromField(
        avgSample,
        slope,
        avgSample.featureSignal,
        avgSample.foliageSignal
      );
      const color = colorForSurface(surface);
      const material = materialForSurface(surface);

      const p00 = [x0, h00, z0];
      const p10 = [x1, h10, z0];
      const p11 = [x1, h11, z1];
      const p01 = [x0, h01, z1];

      const n0 = computeNormal(p00, p10, p11);
      const n1 = computeNormal(p11, p01, p00);
      addTriangle(p00, p10, p11, n0, color, 0, 0, 0, material);
      addTriangle(p11, p01, p00, n1, color, 0, 0, 0, material);

      const maxY = Math.max(h00, h10, h01, h11);
      addBounds([p00, p10, p11, p01], 0, maxY);
      const centerX = (x0 + x1) * 0.5;
      const centerZ = (z0 + z1) * 0.5;
      vegetationSites.push({
        i,
        j,
        centerX,
        centerZ,
        baseHeight: (h00 + h10 + h01 + h11) * 0.25,
        slope,
        surface,
        sample: avgSample,
      });
    }
  }

  const treeAnchorGrid = Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => false));
  const treeAnchors = [];
  const maxTreeCount = Math.max(24, Math.floor(gridSize * gridSize * 0.02));
  for (const site of vegetationSites) {
    if (treeAnchors.length >= maxTreeCount) {
      break;
    }
    if (!supportsGroundPlant(site.surface)) {
      continue;
    }
    if (site.sample.water > 0.2 || site.slope > 0.55) {
      continue;
    }
    if (site.sample.heat < 0.28 || site.sample.heat > 0.82 || site.sample.moisture < 0.4) {
      continue;
    }
    const treeChance = clamp(
      0.008 +
        site.sample.foliageSignal * 0.028 +
        Math.max(0, site.sample.moisture - 0.45) * 0.035 -
        site.slope * 0.02,
      0.004,
      0.055
    );
    const treeRoll = hash01(
      (site.i + 1) * 37.9 +
        (site.j + 1) * 71.3 +
        foliageSeed * 0.17 +
        terrainSeed * 0.031
    );
    if (treeRoll < treeChance) {
      treeAnchorGrid[site.i][site.j] = true;
      treeAnchors.push(site);
      addTreeMesh([site.centerX, 0, site.centerZ], site.baseHeight, treeRoll);
    }
  }

  const obstacleAnchorGrid = Array.from(
    { length: gridSize },
    () => Array.from({ length: gridSize }, () => false)
  );
  for (const site of vegetationSites) {
    if (
      supportsObstacleSurface(site.surface) ||
      site.sample.rockiness > 0.58 ||
      site.sample.featureSignal > 0.66
    ) {
      obstacleAnchorGrid[site.i][site.j] = true;
    }
  }

  const nearestAnchorInfo = (anchorGrid, i, j, maxRadius = 4) => {
    let nearest = Number.POSITIVE_INFINITY;
    let count = 0;
    for (let dx = -maxRadius; dx <= maxRadius; dx += 1) {
      const ix = i + dx;
      if (ix < 0 || ix >= gridSize) continue;
      for (let dy = -maxRadius; dy <= maxRadius; dy += 1) {
        const jy = j + dy;
        if (jy < 0 || jy >= gridSize) continue;
        if (!anchorGrid[ix][jy]) continue;
        const dist = Math.hypot(dx, dy);
        nearest = Math.min(nearest, dist);
        count += 1;
      }
    }
    return { nearest, count };
  };

  let foliageCount = 0;
  const maxFoliageCount = Math.floor(gridSize * gridSize * 0.2);
  for (const site of vegetationSites) {
    if (foliageCount >= maxFoliageCount) {
      break;
    }
    if (treeAnchorGrid[site.i][site.j]) {
      continue;
    }
    if (!supportsGroundPlant(site.surface)) {
      continue;
    }
    const treeProximity = nearestAnchorInfo(treeAnchorGrid, site.i, site.j);
    const obstacleProximity = nearestAnchorInfo(obstacleAnchorGrid, site.i, site.j, 5);
    const nearTree = treeProximity.nearest <= 2.0;
    const underCanopy = treeProximity.nearest <= 1.2;
    const openArea = !Number.isFinite(treeProximity.nearest) || treeProximity.nearest >= 3.0;
    const nearObstacle = obstacleProximity.nearest <= 2.5;
    const obstacleFalloff = Number.isFinite(obstacleProximity.nearest)
      ? clamp((3.5 - obstacleProximity.nearest) / 3.5, 0, 1)
      : 0;
    const obstacleCluster = clamp(obstacleProximity.count / 18, 0, 1);
    const snowLikeGrassDeposit = obstacleFalloff * 0.68 + obstacleCluster * 0.32;
    const baseSeed = hash01(
      (site.i + 1) * 29.7 +
        (site.j + 1) * 53.1 +
        featureSeed * 0.13 +
        foliageSeed * 0.07 +
        site.sample.featureSignal * 17.3 -
        site.sample.foliageSignal * 9.1
    );

    if (
      nearTree &&
      site.sample.moisture > 0.38 &&
      site.sample.foliageSignal > 0.4 &&
      site.sample.heat > 0.3 &&
      site.sample.heat < 0.82
    ) {
      const bushChance = clamp(
        0.08 + site.sample.foliageSignal * 0.2 - site.slope * 0.1,
        0.03,
        0.34
      );
      if (baseSeed < bushChance) {
        const understoryFeature =
          site.surface === SurfaceCover.Mud
            ? MicroFeature.Bush
            : underCanopy
              ? MicroFeature.Bush
              : MicroFeature.GrassTuft;
        addBillboardFeature(
          [site.centerX, 0, site.centerZ],
          site.baseHeight,
          understoryFeature,
          baseSeed
        );
        foliageCount += 1;
        continue;
      }
    }

    if (
      openArea &&
      obstacleProximity.nearest > 2.2 &&
      supportsOpenFlowers(site.surface) &&
      site.sample.moisture > 0.3 &&
      site.sample.moisture < 0.78 &&
      site.sample.heat > 0.32 &&
      site.sample.heat < 0.84 &&
      site.sample.water < 0.12
    ) {
      const flowerChance = clamp(
        0.012 + (1 - site.sample.featureSignal) * 0.03 + site.sample.foliageSignal * 0.02,
        0.008,
        0.06
      );
      if (baseSeed < flowerChance) {
        addBillboardFeature(
          [site.centerX, 0, site.centerZ],
          site.baseHeight,
          MicroFeature.Flower,
          baseSeed
        );
        foliageCount += 1;
        continue;
      }
    }

    if (
      supportsGroundPlant(site.surface) &&
      site.sample.heat > 0.3 &&
      site.sample.heat < 0.86 &&
      site.sample.moisture > 0.28 &&
      site.sample.moisture < 0.9 &&
      site.sample.water < 0.24 &&
      (site.surface !== SurfaceCover.Mud || site.sample.moisture < 0.82)
    ) {
      const grassChance = clamp(
        0.01 +
          site.sample.foliageSignal * 0.03 +
          snowLikeGrassDeposit * 0.18 +
          (nearObstacle ? 0.04 : 0) -
          site.slope * 0.035,
        0.008,
        0.3
      );
      if (baseSeed < grassChance) {
        addBillboardFeature(
          [site.centerX, 0, site.centerZ],
          site.baseHeight,
          MicroFeature.GrassTuft,
          baseSeed
        );
        foliageCount += 1;
      }
    }
  }

  return {
    vertices: new Float32Array(vertices),
    boxMin: new Float32Array(boxMin),
    boxMax: new Float32Array(boxMax),
    treeCount: builder.treeMeshCount,
    minHeight: Number.isFinite(minHeight) ? minHeight : 0,
    maxHeight: Number.isFinite(maxHeight) ? maxHeight : 0,
  };
}

function createPipeline(device, format) {
  const module = device.createShaderModule({ code: terrainShaderCode });
  return device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module,
      entryPoint: "vs_main",
      buffers: [
        {
          arrayStride: 11 * 4,
          attributes: [
            { shaderLocation: 0, offset: 0, format: "float32x3" },
            { shaderLocation: 1, offset: 3 * 4, format: "float32x3" },
            { shaderLocation: 2, offset: 6 * 4, format: "float32x3" },
            { shaderLocation: 3, offset: 9 * 4, format: "float32" },
            { shaderLocation: 4, offset: 10 * 4, format: "float32" },
          ],
        },
      ],
    },
    fragment: {
      module,
      entryPoint: "fs_main",
      targets: [{ format }],
    },
    primitive: {
      topology: "triangle-list",
      cullMode: "none",
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: "less",
      format: "depth24plus",
    },
  });
}

function createTreePipeline(device, format) {
  const module = device.createShaderModule({ code: treeShaderCode });
  return device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module,
      entryPoint: "vs_main",
    },
    fragment: {
      module,
      entryPoint: "fs_main",
      targets: [{ format }],
    },
    primitive: {
      topology: "triangle-list",
      cullMode: "none",
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: "less",
      format: "depth24plus",
    },
  });
}

function updateUniforms() {
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const scale = state.orthoScale ?? 10;
  const projection = mat4Ortho(
    -scale * aspect,
    scale * aspect,
    -scale,
    scale,
    -80,
    80
  );
  const target = state.target ?? [0, 0.2, 0];
  const eye = [
    target[0] + state.radius * Math.cos(state.pitch) * Math.sin(state.yaw),
    target[1] + state.radius * Math.sin(state.pitch),
    target[2] + state.radius * Math.cos(state.pitch) * Math.cos(state.yaw),
  ];
  const view = mat4LookAt(eye, target, [0, 1, 0]);
  const viewProj = mat4Multiply(projection, view);

  const uniformData = new Float32Array(44);
  uniformData.set(viewProj, 0);
  const lightPos = [scale * 0.4, scale * 1.4, scale * 0.6, 1.95];
  uniformData.set(lightPos, 16);
  uniformData.set([eye[0], eye[1], eye[2], 1], 20);
  uniformData.set([state.boxCount, state.windStrength, state.windGust, 0], 24);
  const windDir = normalize(state.windDir);
  uniformData.set([windDir[0], windDir[1], windDir[2], state.time], 28);
  uniformData.set([state.season, state.wetness, state.snow, state.rain], 32);
  if (state.waterSim) {
    uniformData.set(
      [
        state.waterSim.origin[0],
        state.waterSim.origin[1],
        state.waterSim.invSize,
        state.waterSim.config.gridSize,
      ],
      36
    );
  } else {
    uniformData.set([0, 0, 1, 1], 36);
  }
  uniformData.set(
    [
      state.heatmapEnabled ? 1 : 0,
      state.heightMin,
      state.heightMax,
      0,
    ],
    40
  );
  state.device.queue.writeBuffer(state.uniformBuffer, 0, uniformData);
  if (state.treeUniformBuffer) {
    updateTreeUniforms(view, viewProj, eye);
  }
}

function updateTreeUniforms(view, viewProj, eye) {
  const uniformData = new Float32Array(36);
  uniformData.set(viewProj, 0);
  uniformData.set([eye[0], eye[1], eye[2], 1], 16);
  uniformData.set([view[0], view[1], view[2], 0], 20);
  uniformData.set([view[4], view[5], view[6], 0], 24);
  uniformData.set([state.season, state.windStrength, state.windGust, 0], 28);
  const windDir = normalize(state.windDir);
  uniformData.set([windDir[0], windDir[1], windDir[2], state.time], 32);
  state.device.queue.writeBuffer(state.treeUniformBuffer, 0, uniformData);
}

function resize() {
  const ratio = window.devicePixelRatio || 1;
  const width = Math.floor(canvas.clientWidth * ratio);
  const height = Math.floor(canvas.clientHeight * ratio);
  if (canvas.width === width && canvas.height === height) return;

  canvas.width = width;
  canvas.height = height;
  state.context.configure({
    device: state.device,
    format: state.contextFormat,
    alphaMode: "opaque",
  });
  state.depthTexture = state.device.createTexture({
    size: [width, height],
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });
}

function updateFps(now) {
  state.fpsFrames += 1;
  const elapsed = now - state.fpsLast;
  if (elapsed >= 500) {
    const fps = Math.round((state.fpsFrames * 1000) / elapsed);
    if (fpsEl) {
      fpsEl.textContent = `FPS: ${fps}`;
    }
    state.fpsFrames = 0;
    state.fpsLast = now;
  }
}

function simulateWater(encoder, dt) {
  const sim = state.waterSim;
  if (!sim) return;
  sim.updateParams(dt);
  const pass = encoder.beginComputePass();

  pass.setPipeline(sim.pipelines.copyGrid);
  pass.setBindGroup(0, sim.bindGroupA);
  pass.dispatchWorkgroups(sim.gridWorkgroups);

  pass.setPipeline(sim.pipelines.clearGrid);
  pass.setBindGroup(0, sim.bindGroupA);
  pass.dispatchWorkgroups(sim.gridWorkgroups);

  pass.setPipeline(sim.pipelines.particlesToGrid);
  pass.setBindGroup(0, sim.bindGroupA);
  pass.dispatchWorkgroups(sim.particleWorkgroups);

  pass.setPipeline(sim.pipelines.normalizeGrid);
  pass.setBindGroup(0, sim.bindGroupA);
  pass.dispatchWorkgroups(sim.gridWorkgroups);

  pass.setPipeline(sim.pipelines.divergence);
  pass.setBindGroup(0, sim.bindGroupA);
  pass.dispatchWorkgroups(sim.gridWorkgroups);

  pass.setPipeline(sim.pipelines.pressure);
  for (let i = 0; i < sim.config.pressureIterations; i += 1) {
    const group = i % 2 === 0 ? sim.bindGroupA : sim.bindGroupB;
    pass.setBindGroup(0, group);
    pass.dispatchWorkgroups(sim.gridWorkgroups);
  }

  const pressureOnA = sim.config.pressureIterations % 2 === 1;
  const finalGroup = pressureOnA ? sim.bindGroupA : sim.bindGroupB;

  pass.setPipeline(sim.pipelines.project);
  pass.setBindGroup(0, finalGroup);
  pass.dispatchWorkgroups(sim.gridWorkgroups);

  pass.setPipeline(sim.pipelines.updateParticles);
  pass.setBindGroup(0, finalGroup);
  pass.dispatchWorkgroups(sim.particleWorkgroups);

  pass.end();
}

function render(time = performance.now()) {
  if (!state.device || !state.pipeline || !state.bindGroup || !state.vertexBuffer) return;
  state.time = time * 0.001;
  const frameDtSeconds = Math.min(Math.max(state.time - state.lastSimTime, 0.0), 0.2);
  const perf = state.performance;
  if (frameDtSeconds > 0 && perf) {
    perf.sampleFrame(frameDtSeconds);
  }
  updateFps(time);
  updatePerformanceGovernor(time);
  resize();
  updateUniforms();

  const encoder = state.device.createCommandEncoder();
  const frameDt = Math.min(Math.max(state.time - state.lastSimTime, 0.0), 0.05);
  state.lastSimTime = state.time;
  const simDt = 1 / Math.max(state.waterSimRate, 1);
  if (state.waterSim) {
    state.waterSimAccumulator = Math.min(
      state.waterSimAccumulator + frameDt,
      simDt * state.waterSimMaxSteps
    );
    let steps = 0;
    while (state.waterSimAccumulator >= simDt && steps < state.waterSimMaxSteps) {
      simulateWater(encoder, simDt);
      state.waterSimAccumulator -= simDt;
      steps += 1;
    }
  }
  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: state.context.getCurrentTexture().createView(),
        clearValue: { r: 0.05, g: 0.06, b: 0.08, a: 1 },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
    depthStencilAttachment: {
      view: state.depthTexture.createView(),
      depthClearValue: 1.0,
      depthLoadOp: "clear",
      depthStoreOp: "store",
    },
  });

  pass.setPipeline(state.pipeline);
  pass.setBindGroup(0, state.bindGroup);
  pass.setVertexBuffer(0, state.vertexBuffer);
  pass.draw(state.vertexCount);

  if (state.treePipeline && state.treeBindGroup && state.treeCount > 0) {
    pass.setPipeline(state.treePipeline);
    pass.setBindGroup(0, state.treeBindGroup);
    pass.draw(60, state.treeCount, 0, 0);
  }
  pass.end();

  state.device.queue.submit([encoder.finish()]);
  requestAnimationFrame(render);
}

function truckCamera(dx, dy) {
  const target = state.target ?? [0, 0.2, 0];
  const eye = [
    target[0] + state.radius * Math.cos(state.pitch) * Math.sin(state.yaw),
    target[1] + state.radius * Math.sin(state.pitch),
    target[2] + state.radius * Math.cos(state.pitch) * Math.cos(state.yaw),
  ];
  const viewDir = normalize([target[0] - eye[0], target[1] - eye[1], target[2] - eye[2]]);
  const right = normalize(cross(viewDir, [0, 1, 0]));
  const up = normalize(cross(right, viewDir));
  const height = Math.max(1, canvas.clientHeight);
  const panScale = (state.orthoScale * 2) / height;
  const moveX = -dx * panScale;
  const moveY = dy * panScale;
  target[0] += right[0] * moveX + up[0] * moveY;
  target[1] += right[1] * moveX + up[1] * moveY;
  target[2] += right[2] * moveX + up[2] * moveY;
  state.target = target;
}

async function rebuildScene() {
  const seeds = getSeedConfig();
  const { terrainSeed, featureSeed, foliageSeed } = seeds;
  const radius = Number(radiusInput?.value ?? 6);
  if (radiusValue) radiusValue.textContent = String(radius);

  const mode = modeSelect?.value ?? "fractal";
  if (bakeBtn) {
    bakeBtn.disabled = mode !== "fractal";
  }
  let geometry;
  let statusPrefix = "";
  if (mode === "fractal") {
    const extent = radius * 2.6;
    const steps = Math.round(clamp(radius * 16, 36, 180));
    let prepass = state.fractalAsset;
    if (!assetMatches(prepass, { seed: terrainSeed, extent, gridSize: steps })) {
      prepass = loadFractalAssetFromStorage();
    }
    if (!assetMatches(prepass, { seed: terrainSeed, extent, gridSize: steps })) {
      prepass = await loadFractalAssetFromFile();
    }
    if (!assetMatches(prepass, { seed: terrainSeed, extent, gridSize: steps })) {
      try {
        prepass = await runFractalPrepass({
          seed: terrainSeed,
          extent,
          steps,
          heightScale: 2.6,
        });
        state.fractalAsset = prepass;
      } catch (err) {
        console.warn("Fractal GPU prepass failed, falling back to CPU.", err);
        prepass = null;
      }
    } else {
      state.fractalAsset = prepass;
    }
    geometry = buildFractalGeometry({
      terrainSeed,
      featureSeed,
      foliageSeed,
      extent,
      steps,
      heightScale: 2.6,
      prepass,
    });
    state.orthoScale = clamp(extent * 0.95, 6, 40);
    state.radius = clamp(extent * 1.7, 12, 60);
    statusPrefix = `Fractal ${steps}x${steps} (T:${terrainSeed} F:${featureSeed} G:${foliageSeed})`;
  } else {
    const layer = generateTemperateMixedForest({
      terrainSeed,
      featureSeed,
      foliageSeed,
      radius,
    });
    geometry = buildGeometry(layer, 1, 1.2, seeds);
    state.orthoScale = clamp(radius * 1.8, 6, 30);
    state.radius = clamp(radius * 2.4, 10, 40);
    statusPrefix = `Hex Cells: ${layer.cells.length} (T:${terrainSeed} F:${featureSeed} G:${foliageSeed})`;
  }

  const vertices = geometry.vertices;
  state.vertexCount = vertices.length / 11;
  state.boxCount = geometry.boxMin.length / 4;
  state.heightMin = geometry.minHeight ?? 0;
  state.heightMax = geometry.maxHeight ?? 0;

  state.treeCount = 0;
  state.treeBindGroup = null;
  state.treeInstanceBuffer = null;

  state.vertexBuffer = state.device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  state.device.queue.writeBuffer(state.vertexBuffer, 0, vertices);

  state.boxMinBuffer = state.device.createBuffer({
    size: geometry.boxMin.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  state.boxMaxBuffer = state.device.createBuffer({
    size: geometry.boxMax.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  state.device.queue.writeBuffer(state.boxMinBuffer, 0, geometry.boxMin);
  state.device.queue.writeBuffer(state.boxMaxBuffer, 0, geometry.boxMax);

  rebuildSceneBindGroup();

  const heightRange =
    Number.isFinite(state.heightMin) && Number.isFinite(state.heightMax)
      ? `${state.heightMin.toFixed(2)}..${state.heightMax.toFixed(2)}`
      : "n/a";
  setStatus(
    `${statusPrefix} | Vertices: ${state.vertexCount} | Tree meshes: ${geometry.treeCount} | Height: ${heightRange}`
  );
}

async function init() {
  try {
    if (!canvas) {
      setStatus("Canvas element not found.");
      return;
    }
    if (!navigator.gpu) {
      setStatus("WebGPU not available in this browser.");
      return;
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      setStatus("No compatible GPU adapter found.");
      return;
    }

    state.device = await adapter.requestDevice();
    state.context = canvas.getContext("webgpu");
    if (!state.context) {
      setStatus("WebGPU context unavailable on this canvas.");
      return;
    }
    state.contextFormat = navigator.gpu.getPreferredCanvasFormat();
    state.pipeline = createPipeline(state.device, state.contextFormat);
    state.treePipeline = createTreePipeline(state.device, state.contextFormat);

    state.uniformBuffer = state.device.createBuffer({
      size: 44 * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    state.treeUniformBuffer = state.device.createBuffer({
      size: 36 * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    applyWaterQuality(state.waterQualityLevel);
    rebuildScene().catch((err) => {
      console.error(err);
      setStatus(`Rebuild failed: ${err?.message ?? err}`);
    });
    requestAnimationFrame(render);

    canvas.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
    canvas.addEventListener("mousedown", (event) => {
      event.preventDefault();
      state.dragging = true;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      state.dragMode =
        event.shiftKey || event.button === 1 || event.button === 2 ? "truck" : "orbit";
    });
    window.addEventListener("mouseup", () => {
      state.dragging = false;
    });
    window.addEventListener("mousemove", (event) => {
      if (!state.dragging) return;
      const dx = event.clientX - state.lastX;
      const dy = event.clientY - state.lastY;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      if (state.dragMode === "truck") {
        truckCamera(dx, dy);
      } else {
        state.yaw += dx * 0.005;
        state.pitch = clamp(state.pitch + dy * 0.005, -0.1, 1.3);
      }
    });

    canvas.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        const zoomFactor = Math.pow(1.0015, event.deltaY);
        state.orthoScale = clamp(state.orthoScale * zoomFactor, 6, 40);
      },
      { passive: false }
    );

    if (radiusInput) {
      radiusInput.addEventListener("input", () => {
        if (radiusValue) radiusValue.textContent = radiusInput.value;
      });
    }

    if (modeSelect) {
      modeSelect.addEventListener("change", () => {
        rebuildScene().catch((err) => {
          console.error(err);
          setStatus(`Rebuild failed: ${err?.message ?? err}`);
        });
      });
    }

    if (regenBtn) {
      regenBtn.addEventListener("click", () => {
        rebuildScene().catch((err) => {
          console.error(err);
          setStatus(`Rebuild failed: ${err?.message ?? err}`);
        });
      });
    }

    if (heatmapToggle) {
      heatmapToggle.addEventListener("change", () => {
        state.heatmapEnabled = heatmapToggle.checked;
        updateUniforms();
      });
    }

    if (bakeBtn) {
      bakeBtn.addEventListener("click", () => {
        bakeFractalAsset().catch((err) => {
          console.error(err);
          setStatus(`Bake failed: ${err?.message ?? err}`);
        });
      });
    }

    if (heatmapToggle) {
      heatmapToggle.checked = state.heatmapEnabled;
    }

    setStatus("Ready.");
  } catch (err) {
    console.error(err);
    setStatus(`Init failed: ${err?.message ?? err}`);
  }
}

init();
