import {
  WORLD_ATLAS_COUNTS,
  WORLD_ATLAS_SCHEMA_VERSION,
  WORLD_BEDROCK_IDS,
  WORLD_BIOME_IDS,
  WORLD_FLORA_PROFILE_IDS,
  WORLD_HYDROLOGY_CLASSES,
  WORLD_WATER_KINDS,
  normalizeWorldTileKey,
  type WorldMacroZoneV1,
  type WorldSpatialModelInstanceV1,
  type WorldTileMacroDataV1,
} from "./world-atlas-contracts";

const MAGIC = Object.freeze([0x50, 0x57, 0x41, 0x54] as const); // PWAT
const HEADER_BYTES = 48;
const ZONE_FIELD_COUNT = 29;
const ZONE_BYTES = ZONE_FIELD_COUNT * 4;
const MAX_TILE_BINARY_BYTES = 8 * 1024 * 1024;
const MAX_MODEL_COUNT = 4_096;
const MAX_MODEL_LOD_DISTANCE_COUNT = 16;
const SHA256_PATTERN = /^[a-f0-9]{64}$/u;
const TOKEN_PATTERN = /^[a-z0-9][a-z0-9._-]{0,127}$/u;

function align4(value: number): number {
  return (value + 3) & ~3;
}

function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be finite`);
  }
}

function assertIndex(value: number, length: number, name: string): void {
  if (!Number.isInteger(value) || value < 0 || value >= length) {
    throw new Error(`${name} is outside its stable binary enum`);
  }
}

function validateZoneValues(values: readonly number[]): void {
  if (values.length !== ZONE_FIELD_COUNT) {
    throw new Error("World macro zone has an invalid field count");
  }
  values.forEach((value, index) => assertFinite(value, `zone field ${index}`));
  assertIndex(values[11]!, WORLD_WATER_KINDS.length, "waterKind");
  assertIndex(
    values[14]!,
    WORLD_HYDROLOGY_CLASSES.length,
    "hydrologyClass",
  );
  assertIndex(values[16]!, WORLD_BEDROCK_IDS.length, "bedrock");
  assertIndex(values[25]!, WORLD_BIOME_IDS.length, "biome");
  assertIndex(values[26]!, WORLD_FLORA_PROFILE_IDS.length, "floraProfile");
  for (const [index, name, minimum, maximum] of [
    [8, "flowDirection", -1, 7],
    [9, "flowAccumulation", 1, 0xffffffff],
    [10, "streamOrder", 1, 255],
    [27, "floraSeed", 0, 0x00ffffff],
    [28, "mountainous", 0, 1],
  ] as const) {
    const value = values[index]!;
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
      throw new Error(`${name} must be an integer from ${minimum} to ${maximum}`);
    }
  }
  for (const [index, name] of [
    [3, "moisture"],
    [6, "oceanInfluence"],
    [13, "floodplain"],
    [20, "aquifer"],
  ] as const) {
    if (values[index]! < 0 || values[index]! > 1) {
      throw new Error(`${name} must be normalized`);
    }
  }
  for (const [index, name] of [
    [2, "precipitation"],
    [7, "slope"],
    [12, "riverDepth"],
    [17, "soilDepth"],
    [18, "sedimentDepth"],
    [19, "waterTableDepth"],
    [21, "riverbedGravelDepth"],
    [22, "floodplainSiltDepth"],
    [23, "floodplainClayDepth"],
    [24, "alluvialDepth"],
  ] as const) {
    if (values[index]! < 0) {
      throw new Error(`${name} must be non-negative`);
    }
  }
}

function assertToken(value: unknown, name: string): asserts value is string {
  if (typeof value !== "string" || !TOKEN_PATTERN.test(value)) {
    throw new Error(`${name} must be a bounded lowercase token`);
  }
}

function assertFiniteTuple(
  value: unknown,
  length: number,
  name: string,
): asserts value is readonly number[] {
  if (!Array.isArray(value) || value.length !== length) {
    throw new Error(`${name} must contain exactly ${length} finite numbers`);
  }
  for (const coordinate of value) {
    if (typeof coordinate !== "number" || !Number.isFinite(coordinate)) {
      throw new Error(`${name} must contain exactly ${length} finite numbers`);
    }
  }
}

function validateModels(
  value: unknown,
): asserts value is readonly WorldSpatialModelInstanceV1[] {
  if (!Array.isArray(value) || value.length > MAX_MODEL_COUNT) {
    throw new Error("spatialModels must be a bounded array");
  }
  const instanceIds = new Set<string>();
  for (const model of value) {
    if (!model || typeof model !== "object") {
      throw new Error("Each spatial model must be an object");
    }
    const candidate = model as Partial<WorldSpatialModelInstanceV1>;
    assertToken(candidate.instanceId, "spatialModels.instanceId");
    if (instanceIds.has(candidate.instanceId)) {
      throw new Error("Spatial model instance ids must be unique within a tile");
    }
    instanceIds.add(candidate.instanceId);
    if (candidate.schemaVersion !== WORLD_ATLAS_SCHEMA_VERSION) {
      throw new Error("Spatial model schemaVersion is not supported");
    }
    if (!candidate.assetRef || !SHA256_PATTERN.test(candidate.assetRef.contentHash)) {
      throw new Error("Spatial model assetRef requires a SHA-256 contentHash");
    }
    if (!candidate.ownerTile) {
      throw new Error("Spatial model ownerTile is required");
    }
    normalizeWorldTileKey(candidate.ownerTile);
    if (!Array.isArray(candidate.intersectingTiles)) {
      throw new Error("Spatial model intersectingTiles must be an array");
    }
    for (const tile of candidate.intersectingTiles) normalizeWorldTileKey(tile);
    if (
      !candidate.transform ||
      typeof candidate.transform !== "object" ||
      !candidate.boundsMetres ||
      typeof candidate.boundsMetres !== "object"
    ) {
      throw new Error("Spatial model transform and boundsMetres are required");
    }
    assertFiniteTuple(
      candidate.transform.translationMetres,
      3,
      "spatialModels.transform.translationMetres",
    );
    assertFiniteTuple(
      candidate.transform.rotationQuaternion,
      4,
      "spatialModels.transform.rotationQuaternion",
    );
    assertFiniteTuple(
      candidate.transform.scale,
      3,
      "spatialModels.transform.scale",
    );
    assertFiniteTuple(
      candidate.boundsMetres.min,
      3,
      "spatialModels.boundsMetres.min",
    );
    assertFiniteTuple(
      candidate.boundsMetres.max,
      3,
      "spatialModels.boundsMetres.max",
    );
    for (let axis = 0; axis < 3; axis += 1) {
      if (candidate.boundsMetres.min[axis]! > candidate.boundsMetres.max[axis]!) {
        throw new Error("spatialModels.boundsMetres min must not exceed max");
      }
    }
    if (
      !Array.isArray(candidate.lodDistancesM) ||
      candidate.lodDistancesM.length > MAX_MODEL_LOD_DISTANCE_COUNT
    ) {
      throw new Error("Spatial model lodDistancesM must be a bounded array");
    }
    let previousDistance = -1;
    for (const distance of candidate.lodDistancesM) {
      if (
        typeof distance !== "number" ||
        !Number.isFinite(distance) ||
        distance < 0 ||
        distance <= previousDistance
      ) {
        throw new Error(
          "Spatial model lodDistancesM must be finite, non-negative, and increasing",
        );
      }
      previousDistance = distance;
    }
  }
}

function writeZone(view: DataView, offset: number, zone: WorldMacroZoneV1): void {
  const values = [
    zone.elevationM,
    zone.temperatureC,
    zone.precipitationMm,
    zone.moisture,
    zone.windX,
    zone.windZ,
    zone.oceanInfluence,
    zone.slope,
    zone.flowDirection,
    zone.flowAccumulation,
    zone.streamOrder,
    WORLD_WATER_KINDS.indexOf(zone.waterKind),
    zone.riverDepthM,
    zone.floodplain,
    WORLD_HYDROLOGY_CLASSES.indexOf(zone.hydrologyClass),
    zone.waterSurfaceElevationM,
    WORLD_BEDROCK_IDS.indexOf(zone.bedrock),
    zone.soilDepthM,
    zone.sedimentDepthM,
    zone.waterTableDepthM,
    zone.aquifer,
    zone.riverbedGravelDepthM,
    zone.floodplainSiltDepthM,
    zone.floodplainClayDepthM,
    zone.alluvialDepthM,
    WORLD_BIOME_IDS.indexOf(zone.biome),
    WORLD_FLORA_PROFILE_IDS.indexOf(zone.floraProfile),
    zone.floraSeed,
    zone.mountainous ? 1 : 0,
  ];
  validateZoneValues(values);
  for (let index = 0; index < values.length; index += 1) {
    view.setFloat32(offset + index * 4, values[index]!, true);
  }
}

function readZone(view: DataView, offset: number): WorldMacroZoneV1 {
  const values = Array.from({ length: ZONE_FIELD_COUNT }, (_, index) =>
    view.getFloat32(offset + index * 4, true),
  );
  validateZoneValues(values);
  const waterIndex = values[11]!;
  const hydrologyIndex = values[14]!;
  const bedrockIndex = values[16]!;
  const biomeIndex = values[25]!;
  const floraIndex = values[26]!;
  return Object.freeze({
    elevationM: values[0]!,
    temperatureC: values[1]!,
    precipitationMm: values[2]!,
    moisture: values[3]!,
    windX: values[4]!,
    windZ: values[5]!,
    oceanInfluence: values[6]!,
    slope: values[7]!,
    flowDirection: Math.trunc(values[8]!),
    flowAccumulation: Math.trunc(values[9]!),
    streamOrder: Math.trunc(values[10]!),
    waterKind: WORLD_WATER_KINDS[waterIndex]!,
    riverDepthM: values[12]!,
    floodplain: values[13]!,
    hydrologyClass: WORLD_HYDROLOGY_CLASSES[hydrologyIndex]!,
    waterSurfaceElevationM: values[15]!,
    bedrock: WORLD_BEDROCK_IDS[bedrockIndex]!,
    soilDepthM: values[17]!,
    sedimentDepthM: values[18]!,
    waterTableDepthM: values[19]!,
    aquifer: values[20]!,
    riverbedGravelDepthM: values[21]!,
    floodplainSiltDepthM: values[22]!,
    floodplainClayDepthM: values[23]!,
    alluvialDepthM: values[24]!,
    biome: WORLD_BIOME_IDS[biomeIndex]!,
    floraProfile: WORLD_FLORA_PROFILE_IDS[floraIndex]!,
    floraSeed: Math.trunc(values[27]!),
    mountainous: values[28] === 1,
  });
}

/** Serialize one validated macro tile into the v1 little-endian binary format. */
export function encodeWorldTile(tile: WorldTileMacroDataV1): ArrayBuffer {
  if (tile.schemaVersion !== WORLD_ATLAS_SCHEMA_VERSION) {
    throw new Error("Unsupported world tile schemaVersion");
  }
  assertToken(tile.worldId, "worldId");
  assertToken(tile.atlasRevision, "atlasRevision");
  normalizeWorldTileKey(tile.key);
  if (!Number.isInteger(tile.seed) || tile.seed < 0 || tile.seed > 0xffffffff) {
    throw new Error("World tile seed must be an unsigned 32-bit integer");
  }
  if (tile.zones.length !== 100) {
    throw new Error("World tiles must contain exactly 100 macro zones");
  }
  validateModels(tile.spatialModels);

  const encoder = new TextEncoder();
  const worldId = encoder.encode(tile.worldId);
  const revision = encoder.encode(tile.atlasRevision);
  const models = encoder.encode(JSON.stringify(tile.spatialModels));
  const fieldsOffset = align4(
    HEADER_BYTES + worldId.byteLength + revision.byteLength + models.byteLength,
  );
  const totalBytes = fieldsOffset + tile.zones.length * ZONE_BYTES;
  if (totalBytes > MAX_TILE_BINARY_BYTES) {
    throw new Error("World tile binary exceeds the maximum byte length");
  }

  const binary = new ArrayBuffer(totalBytes);
  const bytes = new Uint8Array(binary);
  const view = new DataView(binary);
  bytes.set(MAGIC, 0);
  view.setUint32(4, WORLD_ATLAS_SCHEMA_VERSION, true);
  view.setInt32(8, tile.key.tx, true);
  view.setInt32(12, tile.key.tz, true);
  view.setUint32(16, tile.seed, true);
  view.setUint32(20, tile.zones.length, true);
  view.setUint32(24, worldId.byteLength, true);
  view.setUint32(28, revision.byteLength, true);
  view.setUint32(32, models.byteLength, true);
  view.setUint32(36, fieldsOffset, true);
  view.setUint32(40, totalBytes, true);
  view.setUint32(44, ZONE_BYTES, true);

  let cursor = HEADER_BYTES;
  bytes.set(worldId, cursor);
  cursor += worldId.byteLength;
  bytes.set(revision, cursor);
  cursor += revision.byteLength;
  bytes.set(models, cursor);

  for (let index = 0; index < tile.zones.length; index += 1) {
    writeZone(view, fieldsOffset + index * ZONE_BYTES, tile.zones[index]!);
  }
  return binary;
}

/** Calculate a lowercase SHA-256 digest with the platform Web Crypto API. */
export async function sha256Hex(
  data: ArrayBuffer | ArrayBufferView,
): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("Web Crypto SHA-256 support is required");
  }
  // ArrayBufferView may be backed by SharedArrayBuffer, which Web Crypto's
  // BufferSource type intentionally rejects. Copy to a concrete ArrayBuffer.
  const bytes = new Uint8Array(data.byteLength);
  bytes.set(
    ArrayBuffer.isView(data)
      ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
      : new Uint8Array(data),
  );
  const digest = await subtle.digest("SHA-256", bytes.buffer);
  return Array.from(new Uint8Array(digest), (value) =>
    value.toString(16).padStart(2, "0"),
  ).join("");
}

/** Decode and optionally content-verify one untrusted world tile binary. */
export async function decodeWorldTile(
  binary: ArrayBuffer,
  options: Readonly<{ expectedContentHash?: string }> = {},
): Promise<WorldTileMacroDataV1> {
  if (!(binary instanceof ArrayBuffer)) {
    throw new Error("World tile binary must be an ArrayBuffer");
  }
  if (binary.byteLength < HEADER_BYTES) {
    throw new Error("World tile binary is too short");
  }
  if (binary.byteLength > MAX_TILE_BINARY_BYTES) {
    throw new Error("World tile binary exceeds the maximum byte length");
  }
  if (options.expectedContentHash !== undefined) {
    if (!SHA256_PATTERN.test(options.expectedContentHash)) {
      throw new Error("Expected content hash must be lowercase SHA-256");
    }
    const actual = await sha256Hex(binary);
    if (actual !== options.expectedContentHash) {
      throw new Error("World tile content hash does not match");
    }
  }

  const bytes = new Uint8Array(binary);
  if (MAGIC.some((value, index) => bytes[index] !== value)) {
    throw new Error("World tile magic prefix is invalid");
  }
  const view = new DataView(binary);
  if (view.getUint32(4, true) !== WORLD_ATLAS_SCHEMA_VERSION) {
    throw new Error("World tile schemaVersion is not supported");
  }
  const key = normalizeWorldTileKey({
    tx: view.getInt32(8, true),
    tz: view.getInt32(12, true),
  });
  const seed = view.getUint32(16, true);
  const zoneCount = view.getUint32(20, true);
  const worldIdBytes = view.getUint32(24, true);
  const revisionBytes = view.getUint32(28, true);
  const modelBytes = view.getUint32(32, true);
  const fieldsOffset = view.getUint32(36, true);
  const declaredBytes = view.getUint32(40, true);
  const zoneBytes = view.getUint32(44, true);
  if (zoneCount !== 100 || zoneBytes !== ZONE_BYTES) {
    throw new Error("World tile zone count or stride is invalid");
  }
  if (declaredBytes !== binary.byteLength) {
    throw new Error("World tile declared byte length does not match");
  }
  const metadataEnd =
    HEADER_BYTES + worldIdBytes + revisionBytes + modelBytes;
  if (
    fieldsOffset !== align4(metadataEnd) ||
    fieldsOffset + zoneCount * zoneBytes !== declaredBytes
  ) {
    throw new Error("World tile section offsets are invalid");
  }

  const decoder = new TextDecoder("utf-8", { fatal: true });
  let cursor = HEADER_BYTES;
  const worldId = decoder.decode(bytes.subarray(cursor, cursor + worldIdBytes));
  cursor += worldIdBytes;
  const atlasRevision = decoder.decode(
    bytes.subarray(cursor, cursor + revisionBytes),
  );
  cursor += revisionBytes;
  const modelJson = decoder.decode(bytes.subarray(cursor, cursor + modelBytes));
  assertToken(worldId, "worldId");
  assertToken(atlasRevision, "atlasRevision");
  let spatialModels: unknown;
  try {
    spatialModels = JSON.parse(modelJson) as unknown;
  } catch {
    throw new Error("World tile spatial model JSON is invalid");
  }
  validateModels(spatialModels);

  const zones: WorldMacroZoneV1[] = [];
  for (let index = 0; index < zoneCount; index += 1) {
    zones.push(readZone(view, fieldsOffset + index * zoneBytes));
  }
  return Object.freeze({
    schemaVersion: WORLD_ATLAS_SCHEMA_VERSION,
    worldId,
    atlasRevision,
    seed,
    key,
    zones: Object.freeze(zones),
    spatialModels: Object.freeze([...spatialModels]),
  });
}

/** Binary field count retained for compatibility tests and inspectors. */
export const WORLD_TILE_BINARY_LAYOUT = Object.freeze({
  magic: "PWAT",
  headerBytes: HEADER_BYTES,
  zoneFieldCount: ZONE_FIELD_COUNT,
  zoneBytes: ZONE_BYTES,
  maximumBytes: MAX_TILE_BINARY_BYTES,
  zonesPerTile: WORLD_ATLAS_COUNTS.zonesPerTileAxis ** 2,
} as const);
