import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  FRACTAL_ASSET_VERSION,
  FRACTAL_SAMPLE_STRIDE,
  assetMatches,
  createFractalPrepassRunner,
  fieldWgslUrl,
  fractalPrepassWgslUrl,
  loadFieldWgsl,
  loadFractalPrepassWgsl,
  loadTerrainWgsl,
  parseFractalAsset,
  serializeFractalAsset,
  terrainWgslUrl,
} from "../dist/index.js";

function setGpuGlobals() {
  const previousUsage = globalThis.GPUBufferUsage;
  const previousMapMode = globalThis.GPUMapMode;
  globalThis.GPUBufferUsage = {
    UNIFORM: 1,
    COPY_DST: 2,
    STORAGE: 4,
    COPY_SRC: 8,
    MAP_READ: 16,
  };
  globalThis.GPUMapMode = { READ: 1 };
  return () => {
    if (previousUsage === undefined) {
      delete globalThis.GPUBufferUsage;
    } else {
      globalThis.GPUBufferUsage = previousUsage;
    }
    if (previousMapMode === undefined) {
      delete globalThis.GPUMapMode;
    } else {
      globalThis.GPUMapMode = previousMapMode;
    }
  };
}

function createMockDevice() {
  const queue = {
    writeBuffer(buffer, offset, data) {
      const view =
        data instanceof ArrayBuffer
          ? new Uint8Array(data)
          : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
      new Uint8Array(buffer.data).set(view, offset);
    },
    submit() {},
  };

  const createBuffer = ({ size }) => ({
    size,
    data: new ArrayBuffer(size),
    async mapAsync() {},
    getMappedRange() {
      return this.data;
    },
    unmap() {},
  });

  const createCommandEncoder = () => ({
    beginComputePass() {
      return {
        setPipeline() {},
        setBindGroup() {},
        dispatchWorkgroups() {},
        end() {},
      };
    },
    copyBufferToBuffer(source, sourceOffset, dest, destOffset, size) {
      const sourceView = new Uint8Array(source.data, sourceOffset, size);
      new Uint8Array(dest.data).set(sourceView, destOffset);
    },
    finish() {
      return {};
    },
  });

  return {
    createBuffer,
    createShaderModule() {
      return {};
    },
    createComputePipeline() {
      return {
        getBindGroupLayout() {
          return {};
        },
      };
    },
    createBindGroup() {
      return {};
    },
    createCommandEncoder,
    queue,
  };
}

test("WGSL loaders read from file URLs and custom fetchers", async () => {
  const terrain = await loadTerrainWgsl({ fetcher: null });
  const field = await loadFieldWgsl({ fetcher: null });
  const fractal = await loadFractalPrepassWgsl({ fetcher: null });
  assert.equal(terrain, readFileSync(fileURLToPath(terrainWgslUrl), "utf8"));
  assert.equal(field, readFileSync(fileURLToPath(fieldWgslUrl), "utf8"));
  assert.equal(fractal, readFileSync(fileURLToPath(fractalPrepassWgslUrl), "utf8"));

  const fakeFetch = async (url) => ({
    ok: true,
    text: async () => `wgsl:${url}`,
  });
  const terrainRemote = await loadTerrainWgsl({
    url: new URL("https://example.invalid/terrain.wgsl"),
    fetcher: fakeFetch,
  });
  const fieldRemote = await loadFieldWgsl({
    url: new URL("https://example.invalid/field.wgsl"),
    fetcher: fakeFetch,
  });
  const fractalRemote = await loadFractalPrepassWgsl({
    url: new URL("https://example.invalid/fractal.wgsl"),
    fetcher: fakeFetch,
  });
  assert.equal(terrainRemote, "wgsl:https://example.invalid/terrain.wgsl");
  assert.equal(fieldRemote, "wgsl:https://example.invalid/field.wgsl");
  assert.equal(fractalRemote, "wgsl:https://example.invalid/fractal.wgsl");
});

test("WGSL loaders throw for non-ok responses", async () => {
  const brokenFetch = async () => ({
    ok: false,
    status: 503,
    statusText: "Unavailable",
    text: async () => "error",
  });
  await assert.rejects(
    loadTerrainWgsl({
      url: new URL("https://example.invalid/fail-terrain.wgsl"),
      fetcher: brokenFetch,
    }),
    /Failed to load WGSL \(503 Unavailable\)/
  );
  await assert.rejects(
    loadFieldWgsl({
      url: new URL("https://example.invalid/fail-field.wgsl"),
      fetcher: brokenFetch,
    }),
    /Failed to load WGSL \(503 Unavailable\)/
  );
  await assert.rejects(
    loadFractalPrepassWgsl({
      url: new URL("https://example.invalid/fail-fractal.wgsl"),
      fetcher: brokenFetch,
    }),
    /Failed to load WGSL \(503 Unavailable\)/
  );
});

test("fractal asset serialization validates shape and metadata", () => {
  const sampleCount = (2 + 1) * (2 + 1) * FRACTAL_SAMPLE_STRIDE;
  const samples = new Float32Array(sampleCount);
  for (let i = 0; i < samples.length; i += 1) {
    samples[i] = i / 10;
  }
  const asset = {
    seed: 77,
    extent: 24,
    gridSize: 2,
    heightScale: 1.5,
    samples,
  };
  const payload = serializeFractalAsset(asset);
  assert.equal(payload.version, FRACTAL_ASSET_VERSION);
  assert.equal(payload.sampleStride, FRACTAL_SAMPLE_STRIDE);
  assert.equal(payload.samples.length, sampleCount);

  const parsed = parseFractalAsset(payload);
  assert.ok(parsed);
  assert.equal(parsed.seed, asset.seed);
  assert.equal(parsed.extent, asset.extent);
  assert.equal(parsed.gridSize, asset.gridSize);
  assert.equal(parsed.heightScale, asset.heightScale);
  assert.deepEqual(Array.from(parsed.samples), Array.from(samples));

  assert.equal(parseFractalAsset({ ...payload, version: payload.version + 1 }), null);
  assert.equal(parseFractalAsset({ ...payload, sampleStride: 1 }), null);
  assert.equal(parseFractalAsset({ ...payload, samples: [1, 2, 3] }), null);
  assert.equal(parseFractalAsset(null), null);
});

test("assetMatches validates seed/extent/grid/sample consistency", () => {
  const sampleCount = (3 + 1) * (3 + 1) * FRACTAL_SAMPLE_STRIDE;
  const asset = {
    seed: 12,
    extent: 32,
    gridSize: 3,
    heightScale: 1,
    samples: new Float32Array(sampleCount),
  };
  assert.equal(assetMatches(asset, { seed: 12, extent: 32, gridSize: 3 }), true);
  assert.equal(assetMatches(asset, { seed: 12, extent: 33, gridSize: 3 }), false);
  assert.equal(assetMatches(asset, { seed: 13, extent: 32, gridSize: 3 }), false);
  assert.equal(assetMatches(asset, { seed: 12, extent: 32, gridSize: 4 }), false);
  assert.equal(assetMatches(null, { seed: 12, extent: 32, gridSize: 3 }), false);
});

test("createFractalPrepassRunner requires WebGPU globals", () => {
  const previousUsage = globalThis.GPUBufferUsage;
  const previousMapMode = globalThis.GPUMapMode;
  delete globalThis.GPUBufferUsage;
  delete globalThis.GPUMapMode;
  try {
    assert.throws(
      () =>
        createFractalPrepassRunner({
          device: {},
          wgsl: "",
          gridSize: 4,
        }),
      /WebGPU globals not available/
    );
  } finally {
    if (previousUsage === undefined) {
      delete globalThis.GPUBufferUsage;
    } else {
      globalThis.GPUBufferUsage = previousUsage;
    }
    if (previousMapMode === undefined) {
      delete globalThis.GPUMapMode;
    } else {
      globalThis.GPUMapMode = previousMapMode;
    }
  }
});

test("createFractalPrepassRunner runs end-to-end with a mock GPU device", async () => {
  const restore = setGpuGlobals();
  try {
    const moduleWithGpuGlobals = await import(
      `../dist/index.js?gpu-mock=${Date.now()}`
    );
    const device = createMockDevice();
    const runner = moduleWithGpuGlobals.createFractalPrepassRunner({
      device,
      wgsl: "@compute @workgroup_size(1) fn main() {}",
      gridSize: 3,
    });
    assert.equal(runner.gridSize, 3);
    assert.equal(runner.gridPoints, 4);
    assert.equal(runner.sampleCount, 16);

    const asset = await runner.run({
      seed: 91,
      extent: 16,
      heightScale: 2,
      fieldParams: {
        iterations: 20,
        detailIterations: 12,
      },
      mandel: {
        scale: 0.2,
      },
    });
    assert.equal(asset.seed, 91);
    assert.equal(asset.extent, 16);
    assert.equal(asset.gridSize, 3);
    assert.equal(asset.heightScale, 2);
    assert.equal(asset.samples.length, runner.sampleCount * FRACTAL_SAMPLE_STRIDE);
  } finally {
    restore();
  }
});
