import assert from "node:assert/strict";
import test from "node:test";
import {
  TILE_ASSET_VERSION,
  bakeTileAsset,
  parseTileAssetBinary,
  parseTileAssetJson,
  serializeTileAssetBinary,
  serializeTileAssetBinaryFromJson,
  serializeTileAssetJson,
  serializeTileAssetJsonFromBinary,
  validateTileAssetPayload,
} from "../dist/index.js";

function createTileAsset(overrides = {}) {
  return {
    key: {
      seed: 123,
      tx: -2,
      tz: 5,
      level: 3,
      tileSizeWorld: 64,
    },
    gridSize: 1,
    heightScale: 2,
    height: new Float32Array([0, 0.25, 0.5, 0.75]),
    fields: new Float32Array([0.1, 0.2, 0.3, 0.4]),
    fieldStride: 2,
    materials: new Uint8Array([1, 2, 3, 4]),
    materialStride: 1,
    features: new Float32Array([0.7, 0.8, 0.9, 1.0]),
    featureStride: 2,
    ...overrides,
  };
}

test("validateTileAssetPayload reports malformed payload issues", () => {
  const payload = {
    version: TILE_ASSET_VERSION,
    key: { seed: 1, tx: 0, tz: 0, level: 0 },
    gridSize: 1,
    heightScale: 1,
    height: [0],
    materials: [1, 2, 3],
    materialStride: 2,
    fields: [0.1, 0.2, 0.3],
    fieldStride: 2,
  };

  const errors = validateTileAssetPayload(payload);
  assert.ok(errors.some((error) => error.includes("height length must be")));
  assert.ok(errors.some((error) => error.includes("materials length must be divisible")));
  assert.ok(errors.some((error) => error.includes("fields length must be divisible")));
});

test("parseTileAssetJson validates payload", () => {
  assert.throws(
    () =>
      parseTileAssetJson({
        version: TILE_ASSET_VERSION,
        key: { seed: 1, tx: 0, tz: 0, level: 0 },
        gridSize: 1,
        heightScale: 1,
        height: [1],
      }),
    /Invalid tile asset payload/
  );
});

test("tile asset JSON and binary round-trip preserves typed data", () => {
  const asset = createTileAsset();
  const payload = serializeTileAssetJson(asset);
  const reparsed = parseTileAssetJson(payload);
  assert.deepEqual(Array.from(reparsed.height), Array.from(asset.height));
  assert.deepEqual(Array.from(reparsed.fields ?? []), Array.from(asset.fields ?? []));
  assert.deepEqual(Array.from(reparsed.materials ?? []), Array.from(asset.materials ?? []));
  assert.deepEqual(Array.from(reparsed.features ?? []), Array.from(asset.features ?? []));
  assert.equal(reparsed.materialStride, 1);

  const binary = serializeTileAssetBinary(asset);
  const decoded = parseTileAssetBinary(binary);
  assert.equal(decoded.key.seed, asset.key.seed);
  assert.equal(decoded.key.tx, asset.key.tx);
  assert.equal(decoded.key.tz, asset.key.tz);
  assert.equal(decoded.key.level, asset.key.level);
  assert.equal(decoded.key.tileSizeWorld, asset.key.tileSizeWorld);
  assert.equal(decoded.gridSize, asset.gridSize);
  assert.equal(decoded.heightScale, asset.heightScale);
  assert.deepEqual(Array.from(decoded.height), Array.from(asset.height));
  assert.deepEqual(Array.from(decoded.fields ?? []), Array.from(asset.fields ?? []));
  assert.deepEqual(Array.from(decoded.materials ?? []), Array.from(asset.materials ?? []));
  assert.deepEqual(Array.from(decoded.features ?? []), Array.from(asset.features ?? []));
});

test("tile asset conversion helpers convert between JSON and binary", () => {
  const payload = serializeTileAssetJson(createTileAsset());
  const binary = serializeTileAssetBinaryFromJson(payload);
  const restored = serializeTileAssetJsonFromBinary(binary);
  assert.equal(restored.version, TILE_ASSET_VERSION);
  assert.deepEqual(restored.key, payload.key);
  assert.deepEqual(restored.height, payload.height);
  assert.deepEqual(restored.materials, payload.materials);
});

test("parseTileAssetBinary guards against corrupted headers", () => {
  const asset = createTileAsset();
  const binary = serializeTileAssetBinary(asset);

  const badMagic = binary.slice(0);
  new Uint8Array(badMagic)[0] = 0x00;
  assert.throws(() => parseTileAssetBinary(badMagic), /Invalid tile asset magic header/);

  const truncated = binary.slice(0, 20);
  assert.throws(
    () => parseTileAssetBinary(truncated),
    /(Buffer too small for tile asset header|Tile asset buffer is truncated)/
  );
});

test("bakeTileAsset invokes optional writer callbacks", async () => {
  const calls = [];
  const asset = createTileAsset();
  const output = await bakeTileAsset(asset, {
    writeJson(payload, source) {
      calls.push({ type: "json", sourceSeed: source.key.seed, payloadGrid: payload.gridSize });
    },
    writeBinary(binary, source, payload) {
      calls.push({
        type: "binary",
        byteLength: binary.byteLength,
        sourceLevel: source.key.level,
        payloadVersion: payload.version,
      });
    },
  });

  assert.equal(output.asset.key.seed, asset.key.seed);
  assert.ok(output.binary.byteLength > 0);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[0], {
    type: "json",
    sourceSeed: 123,
    payloadGrid: 1,
  });
  assert.equal(calls[1].type, "binary");
  assert.equal(calls[1].payloadVersion, TILE_ASSET_VERSION);
});
