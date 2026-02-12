import { defaultFieldParams, type FieldParams } from "./fields";

const GPUBufferUsage = (globalThis as any).GPUBufferUsage;
const GPUMapMode = (globalThis as any).GPUMapMode;

type GPUDeviceLike = any;

export const FRACTAL_ASSET_VERSION = 2;
export const FRACTAL_SAMPLE_STRIDE = 8;

export type FractalMandelSettings = {
  scale: number;
  strength: number;
  rockBoost: number;
};

export const defaultFractalMandelSettings: FractalMandelSettings = {
  scale: 0.16,
  strength: 0.85,
  rockBoost: 0.7,
};

export type FractalAsset = {
  seed: number;
  extent: number;
  gridSize: number;
  heightScale: number;
  samples: Float32Array;
};

export type FractalAssetPayload = {
  version: number;
  seed: number;
  extent: number;
  gridSize: number;
  heightScale: number;
  sampleStride: number;
  samples: number[];
};

export type FractalPrepassRunOptions = {
  seed: number;
  extent: number;
  heightScale: number;
  fieldParams?: Partial<FieldParams>;
  mandel?: Partial<FractalMandelSettings>;
};

export type FractalPrepassRunner = {
  gridSize: number;
  gridPoints: number;
  sampleCount: number;
  run: (options: FractalPrepassRunOptions) => Promise<FractalAsset>;
};

export function serializeFractalAsset(asset: FractalAsset): FractalAssetPayload {
  return {
    version: FRACTAL_ASSET_VERSION,
    seed: asset.seed,
    extent: asset.extent,
    gridSize: asset.gridSize,
    heightScale: asset.heightScale,
    sampleStride: FRACTAL_SAMPLE_STRIDE,
    samples: Array.from(asset.samples),
  };
}

export function parseFractalAsset(payload: unknown): FractalAsset | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as FractalAssetPayload;
  if (data.version !== FRACTAL_ASSET_VERSION) return null;
  if (!Array.isArray(data.samples)) return null;
  if (data.sampleStride !== FRACTAL_SAMPLE_STRIDE) return null;
  const gridSize = Number(data.gridSize);
  const heightScale = Number(data.heightScale);
  if (!Number.isFinite(gridSize) || gridSize <= 0) return null;
  if (!Number.isFinite(heightScale)) return null;
  const expected = (gridSize + 1) * (gridSize + 1) * FRACTAL_SAMPLE_STRIDE;
  if (data.samples.length !== expected) return null;
  return {
    seed: Number(data.seed),
    extent: Number(data.extent),
    gridSize,
    heightScale,
    samples: new Float32Array(data.samples),
  };
}

export function assetMatches(
  asset: FractalAsset | null,
  config: { seed: number; extent: number; gridSize: number }
) {
  if (!asset) return false;
  if (asset.seed !== config.seed) return false;
  if (asset.gridSize !== config.gridSize) return false;
  if (Math.abs(asset.extent - config.extent) > 1e-3) return false;
  if (!Number.isFinite(asset.heightScale)) return false;
  const expected = (asset.gridSize + 1) * (asset.gridSize + 1) * FRACTAL_SAMPLE_STRIDE;
  if (asset.samples.length !== expected) return false;
  return true;
}

export function createFractalPrepassRunner(options: {
  device: GPUDeviceLike;
  wgsl: string;
  gridSize: number;
}): FractalPrepassRunner {
  if (!GPUBufferUsage || !GPUMapMode) {
    throw new Error("WebGPU globals not available. Ensure this runs in a WebGPU context.");
  }
  const { device, wgsl, gridSize } = options;
  const gridPoints = gridSize + 1;
  const sampleCount = gridPoints * gridPoints;
  const byteSize = sampleCount * FRACTAL_SAMPLE_STRIDE * 4;

  const uniformBuffer = device.createBuffer({
    size: 7 * 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const baseBuffer = device.createBuffer({
    size: byteSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  const accentBuffer = device.createBuffer({
    size: byteSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  const readbackBuffer = device.createBuffer({
    size: byteSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });

  const module = device.createShaderModule({ code: wgsl });
  const basePipeline = device.createComputePipeline({
    layout: "auto",
    compute: { module, entryPoint: "main" },
  });
  const accentPipeline = device.createComputePipeline({
    layout: "auto",
    compute: { module, entryPoint: "accent_heights" },
  });

  const baseBindGroup = device.createBindGroup({
    layout: basePipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: { buffer: baseBuffer } },
    ],
  });
  const accentBindGroup = device.createBindGroup({
    layout: accentPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: { buffer: accentBuffer } },
      { binding: 2, resource: { buffer: baseBuffer } },
    ],
  });

  const workgroups = Math.ceil(gridPoints / 8);

  const run = async (runOptions: FractalPrepassRunOptions): Promise<FractalAsset> => {
    const fieldDefaults = defaultFieldParams(runOptions.seed);
    const params: FieldParams = {
      ...fieldDefaults,
      ...runOptions.fieldParams,
      seed: runOptions.seed,
    };
    const mandel = { ...defaultFractalMandelSettings, ...runOptions.mandel };
    const step = (runOptions.extent * 2) / gridSize;

    const uniformData = new Float32Array(28);
    uniformData.set([gridPoints, runOptions.extent, step, runOptions.seed], 0);
    uniformData.set(
      [params.scale, params.warpScale, params.warpStrength, params.power],
      4
    );
    uniformData.set(
      [params.detailScale, params.detailPower, params.ridgePower, params.heatBias],
      8
    );
    uniformData.set(
      [params.moistureBias, mandel.scale, mandel.strength, mandel.rockBoost],
      12
    );
    uniformData.set(
      [params.iterations, params.detailIterations, params.macroScale, params.macroWarpStrength],
      16
    );
    uniformData.set(
      [
        params.styleMixStrength,
        params.terraceSteps,
        params.terraceStrength,
        params.craterStrength,
      ],
      20
    );
    uniformData.set([params.craterScale, params.heightMin, params.heightMax, 0], 24);

    device.queue.writeBuffer(uniformBuffer, 0, uniformData);

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setPipeline(basePipeline);
    pass.setBindGroup(0, baseBindGroup);
    pass.dispatchWorkgroups(workgroups, workgroups);
    pass.setPipeline(accentPipeline);
    pass.setBindGroup(0, accentBindGroup);
    pass.dispatchWorkgroups(workgroups, workgroups);
    pass.end();
    encoder.copyBufferToBuffer(accentBuffer, 0, readbackBuffer, 0, byteSize);
    device.queue.submit([encoder.finish()]);

    await readbackBuffer.mapAsync(GPUMapMode.READ);
    const copy = readbackBuffer.getMappedRange();
    const data = new Float32Array(copy.slice(0));
    readbackBuffer.unmap();

    return {
      seed: runOptions.seed,
      extent: runOptions.extent,
      gridSize,
      heightScale: runOptions.heightScale,
      samples: data,
    };
  };

  return {
    gridSize,
    gridPoints,
    sampleCount,
    run,
  };
}
