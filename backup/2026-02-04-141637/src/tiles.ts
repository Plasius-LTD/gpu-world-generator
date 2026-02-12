export type TileKey = {
  seed: number;
  tx: number;
  tz: number;
  level: number;
  tileSizeWorld?: number;
};

export interface TileAsset {
  key: TileKey;
  gridSize: number;
  heightScale: number;
  height: Float32Array;
  fields?: Float32Array;
  fieldStride?: number;
  materials?: Uint8Array;
  materialStride?: number;
  features?: Float32Array;
  featureStride?: number;
}

export interface TileAssetPayload {
  version: number;
  key: TileKey;
  gridSize: number;
  heightScale: number;
  height: number[];
  fields?: number[];
  fieldStride?: number;
  materials?: number[];
  materialStride?: number;
  features?: number[];
  featureStride?: number;
}

export const TILE_ASSET_VERSION = 1;

const MAGIC_BYTES = [0x54, 0x57, 0x4c, 0x44]; // "TWLD"
const HEADER_BYTES = 68;

const FLAG_HAS_TILE_SIZE = 1 << 0;
const FLAG_HAS_FIELDS = 1 << 1;
const FLAG_HAS_MATERIALS = 1 << 2;
const FLAG_HAS_FEATURES = 1 << 3;

function align4(offset: number) {
  return (offset + 3) & ~3;
}

function expectedHeightCount(gridSize: number) {
  const gridPoints = gridSize + 1;
  return gridPoints * gridPoints;
}

export function validateTileAssetPayload(payload: TileAssetPayload): string[] {
  const errors: string[] = [];
  if (!payload || typeof payload !== "object") {
    return ["payload must be an object"];
  }
  const key = payload.key as TileKey;
  if (!key || typeof key !== "object") {
    errors.push("key is required");
  } else {
    const keyFields: Array<keyof TileKey> = ["seed", "tx", "tz", "level"];
    for (const field of keyFields) {
      const value = key[field];
      if (!Number.isFinite(value)) {
        errors.push(`key.${field} must be a number`);
      }
    }
    if (key.tileSizeWorld !== undefined && !Number.isFinite(key.tileSizeWorld)) {
      errors.push("key.tileSizeWorld must be a number when provided");
    }
  }

  if (!Number.isFinite(payload.gridSize) || payload.gridSize < 1) {
    errors.push("gridSize must be a positive number");
  }
  if (!Number.isFinite(payload.heightScale)) {
    errors.push("heightScale must be a number");
  }
  if (!Array.isArray(payload.height)) {
    errors.push("height must be an array");
  } else {
    const expected = expectedHeightCount(payload.gridSize);
    if (payload.height.length !== expected) {
      errors.push(`height length must be ${expected} for gridSize ${payload.gridSize}`);
    }
  }

  const materialStride =
    payload.materialStride ?? (payload.materials ? 1 : 0);
  if (payload.materials) {
    if (!Number.isFinite(materialStride) || materialStride <= 0) {
      errors.push("materialStride must be > 0 when materials are provided");
    } else if (payload.materials.length % materialStride !== 0) {
      errors.push("materials length must be divisible by materialStride");
    }
  }

  if (payload.fields) {
    if (!Number.isFinite(payload.fieldStride) || (payload.fieldStride ?? 0) <= 0) {
      errors.push("fieldStride must be > 0 when fields are provided");
    } else if (payload.fields.length % payload.fieldStride! !== 0) {
      errors.push("fields length must be divisible by fieldStride");
    }
  }

  if (payload.features) {
    if (!Number.isFinite(payload.featureStride) || (payload.featureStride ?? 0) <= 0) {
      errors.push("featureStride must be > 0 when features are provided");
    } else if (payload.features.length % payload.featureStride! !== 0) {
      errors.push("features length must be divisible by featureStride");
    }
  }

  return errors;
}

export function serializeTileAssetJson(asset: TileAsset): TileAssetPayload {
  return {
    version: TILE_ASSET_VERSION,
    key: asset.key,
    gridSize: asset.gridSize,
    heightScale: asset.heightScale,
    height: Array.from(asset.height),
    fields: asset.fields ? Array.from(asset.fields) : undefined,
    fieldStride: asset.fieldStride,
    materials: asset.materials ? Array.from(asset.materials) : undefined,
    materialStride: asset.materialStride ?? (asset.materials ? 1 : undefined),
    features: asset.features ? Array.from(asset.features) : undefined,
    featureStride: asset.featureStride,
  };
}

export function parseTileAssetJson(payload: TileAssetPayload): TileAsset {
  const errors = validateTileAssetPayload(payload);
  if (errors.length) {
    throw new Error(`Invalid tile asset payload: ${errors.join("; ")}`);
  }

  const materialStride =
    payload.materialStride ?? (payload.materials ? 1 : undefined);

  return {
    key: payload.key,
    gridSize: payload.gridSize,
    heightScale: payload.heightScale,
    height: Float32Array.from(payload.height),
    fields: payload.fields ? Float32Array.from(payload.fields) : undefined,
    fieldStride: payload.fieldStride,
    materials: payload.materials ? Uint8Array.from(payload.materials) : undefined,
    materialStride,
    features: payload.features ? Float32Array.from(payload.features) : undefined,
    featureStride: payload.featureStride,
  };
}

export interface TileBakeOutput {
  asset: TileAsset;
  payload: TileAssetPayload;
  binary: ArrayBuffer;
}

export interface TileBakeWriter {
  writeJson?: (payload: TileAssetPayload, asset: TileAsset) => void | Promise<void>;
  writeBinary?: (
    binary: ArrayBuffer,
    asset: TileAsset,
    payload: TileAssetPayload
  ) => void | Promise<void>;
}

export async function bakeTileAsset(
  asset: TileAsset,
  writer?: TileBakeWriter
): Promise<TileBakeOutput> {
  const payload = serializeTileAssetJson(asset);
  const errors = validateTileAssetPayload(payload);
  if (errors.length) {
    throw new Error(`Invalid tile asset payload: ${errors.join("; ")}`);
  }
  if (writer?.writeJson) {
    await writer.writeJson(payload, asset);
  }
  const binary = serializeTileAssetBinaryFromJson(payload);
  if (writer?.writeBinary) {
    await writer.writeBinary(binary, asset, payload);
  }
  return { asset, payload, binary };
}

export function serializeTileAssetBinary(asset: TileAsset): ArrayBuffer {
  const heightCount = asset.height.length;
  const expected = expectedHeightCount(asset.gridSize);
  if (heightCount !== expected) {
    throw new Error(`height length must be ${expected} for gridSize ${asset.gridSize}`);
  }

  const fieldStride = asset.fieldStride ?? 0;
  if (asset.fields && fieldStride <= 0) {
    throw new Error("fieldStride must be provided when fields exist");
  }
  const materialStride = asset.materialStride ?? (asset.materials ? 1 : 0);
  if (asset.materials && materialStride <= 0) {
    throw new Error("materialStride must be provided when materials exist");
  }
  const featureStride = asset.featureStride ?? 0;
  if (asset.features && featureStride <= 0) {
    throw new Error("featureStride must be provided when features exist");
  }

  const fieldCount = asset.fields ? asset.fields.length : 0;
  const materialCount = asset.materials ? asset.materials.length : 0;
  const featureCount = asset.features ? asset.features.length : 0;

  const heightBytes = heightCount * 4;
  const fieldBytes = fieldCount * 4;
  const materialBytes = materialCount;
  const featureBytes = featureCount * 4;

  let offset = HEADER_BYTES + heightBytes + fieldBytes + materialBytes;
  offset = align4(offset);
  const totalBytes = offset + featureBytes;

  const buffer = new ArrayBuffer(totalBytes);
  const view = new DataView(buffer);
  const u8 = new Uint8Array(buffer);

  u8.set(MAGIC_BYTES, 0);
  let cursor = 4;

  view.setUint32(cursor, TILE_ASSET_VERSION, true);
  cursor += 4;

  let flags = 0;
  if (asset.key.tileSizeWorld !== undefined) flags |= FLAG_HAS_TILE_SIZE;
  if (fieldCount) flags |= FLAG_HAS_FIELDS;
  if (materialCount) flags |= FLAG_HAS_MATERIALS;
  if (featureCount) flags |= FLAG_HAS_FEATURES;
  view.setUint32(cursor, flags, true);
  cursor += 4;

  view.setInt32(cursor, asset.key.tx | 0, true);
  cursor += 4;
  view.setInt32(cursor, asset.key.tz | 0, true);
  cursor += 4;
  view.setUint32(cursor, asset.key.level >>> 0, true);
  cursor += 4;
  view.setUint32(cursor, asset.key.seed >>> 0, true);
  cursor += 4;
  view.setFloat32(cursor, asset.key.tileSizeWorld ?? 0, true);
  cursor += 4;

  view.setUint32(cursor, asset.gridSize >>> 0, true);
  cursor += 4;
  view.setFloat32(cursor, asset.heightScale, true);
  cursor += 4;

  view.setUint32(cursor, heightCount >>> 0, true);
  cursor += 4;
  view.setUint32(cursor, fieldCount >>> 0, true);
  cursor += 4;
  view.setUint32(cursor, materialCount >>> 0, true);
  cursor += 4;
  view.setUint32(cursor, featureCount >>> 0, true);
  cursor += 4;
  view.setUint32(cursor, fieldStride >>> 0, true);
  cursor += 4;
  view.setUint32(cursor, materialStride >>> 0, true);
  cursor += 4;
  view.setUint32(cursor, featureStride >>> 0, true);
  cursor += 4;

  let writeOffset = HEADER_BYTES;
  new Float32Array(buffer, writeOffset, heightCount).set(asset.height);
  writeOffset += heightBytes;

  if (fieldCount) {
    new Float32Array(buffer, writeOffset, fieldCount).set(asset.fields!);
    writeOffset += fieldBytes;
  }

  if (materialCount) {
    new Uint8Array(buffer, writeOffset, materialCount).set(asset.materials!);
    writeOffset += materialBytes;
  }

  writeOffset = align4(writeOffset);

  if (featureCount) {
    new Float32Array(buffer, writeOffset, featureCount).set(asset.features!);
  }

  return buffer;
}

export function parseTileAssetBinary(input: ArrayBuffer | ArrayBufferView): TileAsset {
  const buffer =
    input instanceof ArrayBuffer
      ? input
      : input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);

  if (buffer.byteLength < HEADER_BYTES) {
    throw new Error("Buffer too small for tile asset header");
  }

  const u8 = new Uint8Array(buffer);
  for (let i = 0; i < MAGIC_BYTES.length; i += 1) {
    if (u8[i] !== MAGIC_BYTES[i]) {
      throw new Error("Invalid tile asset magic header");
    }
  }

  const view = new DataView(buffer);
  let cursor = 4;
  const version = view.getUint32(cursor, true);
  cursor += 4;
  if (version !== TILE_ASSET_VERSION) {
    throw new Error(`Unsupported tile asset version ${version}`);
  }

  const flags = view.getUint32(cursor, true);
  cursor += 4;
  const tx = view.getInt32(cursor, true);
  cursor += 4;
  const tz = view.getInt32(cursor, true);
  cursor += 4;
  const level = view.getUint32(cursor, true);
  cursor += 4;
  const seed = view.getUint32(cursor, true);
  cursor += 4;
  const tileSizeWorld = view.getFloat32(cursor, true);
  cursor += 4;

  const gridSize = view.getUint32(cursor, true);
  cursor += 4;
  const heightScale = view.getFloat32(cursor, true);
  cursor += 4;

  const heightCount = view.getUint32(cursor, true);
  cursor += 4;
  const fieldCount = view.getUint32(cursor, true);
  cursor += 4;
  const materialCount = view.getUint32(cursor, true);
  cursor += 4;
  const featureCount = view.getUint32(cursor, true);
  cursor += 4;
  const fieldStride = view.getUint32(cursor, true);
  cursor += 4;
  const materialStride = view.getUint32(cursor, true);
  cursor += 4;
  const featureStride = view.getUint32(cursor, true);
  cursor += 4;

  const heightBytes = heightCount * 4;
  const fieldBytes = fieldCount * 4;
  const materialBytes = materialCount;
  const featureBytes = featureCount * 4;
  let required = HEADER_BYTES + heightBytes + fieldBytes + materialBytes;
  required = align4(required) + featureBytes;
  if (buffer.byteLength < required) {
    throw new Error("Tile asset buffer is truncated");
  }

  let readOffset = HEADER_BYTES;
  const height = new Float32Array(buffer, readOffset, heightCount);
  readOffset += heightCount * 4;

  const fields = fieldCount
    ? new Float32Array(buffer, readOffset, fieldCount)
    : undefined;
  readOffset += fieldCount * 4;

  const materials = materialCount
    ? new Uint8Array(buffer, readOffset, materialCount)
    : undefined;
  readOffset += materialCount;
  readOffset = align4(readOffset);

  const features = featureCount
    ? new Float32Array(buffer, readOffset, featureCount)
    : undefined;

  const key: TileKey = {
    seed,
    tx,
    tz,
    level,
  };
  if (flags & FLAG_HAS_TILE_SIZE) {
    key.tileSizeWorld = tileSizeWorld;
  }

  return {
    key,
    gridSize,
    heightScale,
    height,
    fields,
    fieldStride: fieldCount ? fieldStride : undefined,
    materials,
    materialStride: materialCount ? materialStride : undefined,
    features,
    featureStride: featureCount ? featureStride : undefined,
  };
}

export function serializeTileAssetBinaryFromJson(payload: TileAssetPayload): ArrayBuffer {
  return serializeTileAssetBinary(parseTileAssetJson(payload));
}

export function serializeTileAssetJsonFromBinary(
  input: ArrayBuffer | ArrayBufferView
): TileAssetPayload {
  return serializeTileAssetJson(parseTileAssetBinary(input));
}
