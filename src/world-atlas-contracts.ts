import type {
  ModelAssetRef,
  ModelBoundsMetres,
  ModelTransform,
} from "@plasius/asset-contracts";

/** Stored rollout flag shared by every persistent-atlas consumer. */
export const PERSISTENT_WORLD_ATLAS_FEATURE_FLAG =
  "world.persistent-atlas.enabled" as const;

/** Version carried by every v1 persistent-atlas payload. */
export const WORLD_ATLAS_SCHEMA_VERSION = 1 as const;

/** Version carried by every v1 persistent world edit. */
export const WORLD_EDIT_SCHEMA_VERSION = 1 as const;

/** Maximum neighbouring sample distance invalidated by a local edit. */
export const WORLD_LOCAL_ZONE_SAMPLING_HALO_M = 1 as const;

/** Fixed finite-world dimensions for origin-shard. */
export const ORIGIN_SHARD_ATLAS_SPEC = Object.freeze({
  schemaVersion: WORLD_ATLAS_SCHEMA_VERSION,
  worldId: "origin-shard",
  widthM: 100_000,
  heightM: 50_000,
  tileSizeM: 1_000,
  zoneSizeM: 100,
  localZoneSizeM: 10,
  slabHeightM: 32,
  minYM: -1_024,
  maxYM: 2_560,
  seaLevelM: 0,
  wrapX: true,
} as const);

/** Exact address counts implied by {@link ORIGIN_SHARD_ATLAS_SPEC}. */
export const WORLD_ATLAS_COUNTS = Object.freeze({
  tilesX: 100,
  tilesZ: 50,
  tileCount: 5_000,
  zonesPerTileAxis: 10,
  zoneCount: 500_000,
  localZonesPerZoneAxis: 10,
  localZoneCount: 50_000_000,
  slabCount: 112,
} as const);

/** Atlas dimensions and topology pinned by a manifest. */
export type WorldAtlasSpec = typeof ORIGIN_SHARD_ATLAS_SPEC;

/** Canonical one-kilometre tile address. */
export interface WorldTileKey {
  readonly tx: number;
  readonly tz: number;
}

/** Canonical 100 m zone address within a tile. */
export interface WorldZoneAddress {
  readonly tile: WorldTileKey;
  readonly zx: number;
  readonly zz: number;
}

/** Canonical 10 m local-zone address within a zone. */
export interface WorldLocalZoneAddress {
  readonly zone: WorldZoneAddress;
  readonly lx: number;
  readonly lz: number;
}

/** Materialization identity for one local-zone vertical slab. */
export interface WorldLocalZoneChunkKey {
  readonly worldId: string;
  readonly atlasRevision: string;
  readonly localZone: WorldLocalZoneAddress;
  readonly metresPerVoxel: 0.5 | 1;
  readonly slabY: number;
  readonly editRevision: number;
}

/** Horizontal half-open bounds in world metres. */
export interface WorldHorizontalBounds {
  readonly minX: number;
  readonly minZ: number;
  readonly maxX: number;
  readonly maxZ: number;
}

/** Full address resolved from one normalized world position. */
export interface WorldAtlasAddress {
  readonly tile: WorldTileKey;
  readonly zone: WorldZoneAddress;
  readonly localZone: WorldLocalZoneAddress;
}

/** Stable surface-water classification for a macro zone. */
export type WorldWaterKind = "land" | "ocean" | "lake" | "river";

/** Stable binary order for {@link WorldWaterKind}. */
export const WORLD_WATER_KINDS = Object.freeze([
  "land",
  "ocean",
  "lake",
  "river",
] as const);

/** Persisted drainage role derived from deterministic flow and stream order. */
export type WorldHydrologyClass =
  | "none"
  | "ocean"
  | "lake"
  | "headwater"
  | "tributary"
  | "main-channel"
  | "floodplain"
  | "delta";

/** Stable binary order for {@link WorldHydrologyClass}. */
export const WORLD_HYDROLOGY_CLASSES = Object.freeze([
  "none",
  "ocean",
  "lake",
  "headwater",
  "tributary",
  "main-channel",
  "floodplain",
  "delta",
] as const);

/** Stable geological bedrock classes used by local material sampling. */
export type WorldBedrockId =
  | "granite"
  | "basalt"
  | "limestone"
  | "sandstone"
  | "shale";

/** Stable binary order for {@link WorldBedrockId}. */
export const WORLD_BEDROCK_IDS = Object.freeze([
  "granite",
  "basalt",
  "limestone",
  "sandstone",
  "shale",
] as const);

/** Stable v1 biome identifiers. */
export type WorldBiomeId =
  | "polar-desert"
  | "tundra"
  | "boreal-forest"
  | "temperate-forest"
  | "temperate-grassland"
  | "subtropical-desert"
  | "tropical-forest"
  | "wetland"
  | "alpine"
  | "freshwater"
  | "ocean";

/** Stable binary order for {@link WorldBiomeId}. */
export const WORLD_BIOME_IDS = Object.freeze([
  "polar-desert",
  "tundra",
  "boreal-forest",
  "temperate-forest",
  "temperate-grassland",
  "subtropical-desert",
  "tropical-forest",
  "wetland",
  "alpine",
  "freshwater",
  "ocean",
] as const);

/** Stable flora reconstruction profiles. */
export type WorldFloraProfileId =
  | "none"
  | "tundra-low"
  | "boreal"
  | "temperate-mixed"
  | "grassland"
  | "desert-sparse"
  | "tropical-dense"
  | "wetland-reeds"
  | "alpine-sparse";

/** Stable binary order for {@link WorldFloraProfileId}. */
export const WORLD_FLORA_PROFILE_IDS = Object.freeze([
  "none",
  "tundra-low",
  "boreal",
  "temperate-mixed",
  "grassland",
  "desert-sparse",
  "tropical-dense",
  "wetland-reeds",
  "alpine-sparse",
] as const);

/** All persisted macro fields for one 100 m zone. */
export interface WorldMacroZoneV1 {
  readonly elevationM: number;
  readonly temperatureC: number;
  readonly precipitationMm: number;
  readonly moisture: number;
  readonly windX: number;
  readonly windZ: number;
  readonly oceanInfluence: number;
  readonly slope: number;
  readonly flowDirection: number;
  readonly flowAccumulation: number;
  readonly streamOrder: number;
  readonly waterKind: WorldWaterKind;
  readonly riverDepthM: number;
  readonly floodplain: number;
  readonly hydrologyClass: WorldHydrologyClass;
  /** Water surface height; ignored when `waterKind` is `land`. */
  readonly waterSurfaceElevationM: number;
  readonly bedrock: WorldBedrockId;
  readonly soilDepthM: number;
  readonly sedimentDepthM: number;
  readonly waterTableDepthM: number;
  readonly aquifer: number;
  readonly riverbedGravelDepthM: number;
  readonly floodplainSiltDepthM: number;
  readonly floodplainClayDepthM: number;
  readonly alluvialDepthM: number;
  readonly biome: WorldBiomeId;
  readonly floraProfile: WorldFloraProfileId;
  readonly floraSeed: number;
  readonly mountainous: boolean;
}

/** Canonically owned spatial model that may intersect several tiles. */
export interface WorldSpatialModelInstanceV1 {
  readonly schemaVersion: typeof WORLD_ATLAS_SCHEMA_VERSION;
  readonly instanceId: string;
  readonly ownerTile: WorldTileKey;
  readonly intersectingTiles: readonly WorldTileKey[];
  readonly assetRef: ModelAssetRef;
  readonly transform: ModelTransform;
  readonly boundsMetres: ModelBoundsMetres;
  readonly lodDistancesM: readonly number[];
}

/** Decoded macro data owned by one atlas tile. */
export interface WorldTileMacroDataV1 {
  readonly schemaVersion: typeof WORLD_ATLAS_SCHEMA_VERSION;
  readonly worldId: string;
  readonly atlasRevision: string;
  readonly seed: number;
  readonly key: WorldTileKey;
  readonly zones: readonly WorldMacroZoneV1[];
  readonly spatialModels: readonly WorldSpatialModelInstanceV1[];
}

/** Immutable content-addressed atlas asset reference. */
export interface WorldAtlasAssetReferenceV1 {
  readonly path: string;
  readonly contentHash: string;
  readonly byteLength: number;
  readonly contentType: string;
}

/** Versioned finite-world manifest. */
export interface WorldAtlasManifestV1 {
  readonly schemaVersion: typeof WORLD_ATLAS_SCHEMA_VERSION;
  readonly worldId: string;
  readonly atlasRevision: string;
  readonly generatorVersion: string;
  readonly seed: number;
  readonly spec: WorldAtlasSpec;
  readonly tileCount: typeof WORLD_ATLAS_COUNTS.tileCount;
  readonly overview: WorldAtlasAssetReferenceV1;
  readonly tileIndex: WorldAtlasAssetReferenceV1;
  readonly atlasChecksum: string;
}

/** One tile entry in the immutable atlas content index. */
export interface WorldTileIndexEntryV1 {
  readonly key: WorldTileKey;
  readonly path: string;
  readonly contentHash: string;
  readonly byteLength: number;
}

/** One-kilometre diagnostic and far-view summary. */
export interface WorldAtlasOverviewCellV1 {
  readonly key: WorldTileKey;
  readonly meanElevationM: number;
  readonly meanTemperatureC: number;
  readonly meanPrecipitationMm: number;
  readonly oceanFraction: number;
  readonly mountainFraction: number;
  readonly riverZoneCount: number;
  readonly dominantBiome: WorldBiomeId;
}

/** Deterministic bake diagnostics used by qualification and CI. */
export interface WorldAtlasDiagnostics {
  readonly oceanCoverage: number;
  readonly mountainCoverage: number;
  readonly riverZoneCount: number;
  readonly lakeZoneCount: number;
  readonly flowCycleCount: number;
  readonly invalidDrainageTerminationCount: number;
}

/** Immutable plan for a complete atlas bake. */
export interface WorldAtlasBakePlan {
  readonly schemaVersion: typeof WORLD_ATLAS_SCHEMA_VERSION;
  readonly worldId: string;
  readonly atlasRevision: string;
  readonly generatorVersion: string;
  readonly seed: number;
  readonly spec: WorldAtlasSpec;
  readonly tileKeys: readonly WorldTileKey[];
}

/** One encoded tile emitted to a caller-owned storage writer. */
export interface WorldAtlasTileBakeOutput {
  readonly key: WorldTileKey;
  readonly tile: WorldTileMacroDataV1;
  readonly binary: ArrayBuffer;
  readonly contentHash: string;
  readonly path: string;
}

/** Options for complete or resumable partial atlas bakes. */
export interface WorldAtlasBakeOptions {
  readonly tileKeys?: readonly WorldTileKey[];
  /** Apply shipped-seed landform qualification to a custom seed as well. */
  readonly requireQualification?: boolean;
  readonly writeTile?: (
    output: WorldAtlasTileBakeOutput,
  ) => void | Promise<void>;
  readonly writeOverview?: (
    bytes: Uint8Array,
    reference: WorldAtlasAssetReferenceV1,
  ) => void | Promise<void>;
  readonly writeTileIndex?: (
    bytes: Uint8Array,
    reference: WorldAtlasAssetReferenceV1,
  ) => void | Promise<void>;
  readonly writeManifest?: (
    manifest: WorldAtlasManifestV1,
  ) => void | Promise<void>;
}

/** Result returned by a complete or partial atlas bake. */
export interface WorldAtlasBakeResult {
  readonly complete: boolean;
  readonly manifest?: WorldAtlasManifestV1;
  readonly overview: readonly WorldAtlasOverviewCellV1[];
  readonly tileIndex: readonly WorldTileIndexEntryV1[];
  readonly diagnostics: WorldAtlasDiagnostics;
  readonly checksum: string;
}

/** Hard CPU/GPU and concurrency limits selected by the host device profile. */
export interface WorldResidencyBudget {
  readonly profile: "low" | "standard" | "high";
  readonly maxCpuBytes: number;
  readonly maxGpuBytes: number;
  readonly maxGenerationJobs: number;
}

/** Runtime representation planned for a world address. */
export type WorldRepresentation =
  | "voxel-0.5m"
  | "voxel-1m"
  | "zone-5m"
  | "tile-25m"
  | "overview-100m";

/** View-planning output implemented by the streaming Task. */
export interface WorldViewPlan {
  readonly schemaVersion: typeof WORLD_ATLAS_SCHEMA_VERSION;
  readonly requiredTiles: readonly WorldTileKey[];
  readonly prefetchTiles: readonly WorldTileKey[];
  readonly localChunks: readonly WorldLocalZoneChunkKey[];
  readonly representations: readonly Readonly<{
    address: WorldLocalZoneAddress | WorldZoneAddress | WorldTileKey;
    representation: WorldRepresentation;
    distanceM: number;
    workKey: string;
    fallback?: WorldRepresentation;
  }>[];
  readonly workKeys: readonly string[];
  readonly obsoleteWorkKeys: readonly string[];
  readonly budget: WorldResidencyBudget;
}

/** Bounded v1 density edit. */
export interface WorldDensityDeltaOperationV1 {
  readonly kind: "densityDelta";
  readonly center: readonly [number, number, number];
  readonly radiusM: number;
  readonly densityDelta: number;
  readonly materialDensityKgM3: number;
}

/** Bounded v1 material paint edit. */
export interface WorldMaterialPaintOperationV1 {
  readonly kind: "materialPaint";
  readonly center: readonly [number, number, number];
  readonly radiusM: number;
  readonly materialId: number;
}

/** Deterministic v1 flora placement. */
export interface WorldFloraPlaceOperationV1 {
  readonly kind: "floraPlace";
  readonly position: readonly [number, number, number];
  readonly instanceId: string;
  readonly assetRef: ModelAssetRef;
}

/** Bounded v1 base-flora suppression. */
export interface WorldFloraSuppressOperationV1 {
  readonly kind: "floraSuppress";
  readonly center: readonly [number, number, number];
  readonly radiusM: number;
}

/** Supported persistent world operation union. */
export type WorldEditOperationV1 =
  | WorldDensityDeltaOperationV1
  | WorldMaterialPaintOperationV1
  | WorldFloraPlaceOperationV1
  | WorldFloraSuppressOperationV1;

/** Ordered edit envelope shared by persistence and local reconstruction. */
export interface WorldEditV1 {
  readonly schemaVersion: typeof WORLD_EDIT_SCHEMA_VERSION;
  readonly id: string;
  readonly worldId: string;
  readonly atlasRevision: string;
  readonly operations: readonly WorldEditOperationV1[];
}

/** Addresses invalidated by an ordered world edit. */
export interface WorldEditDirtyAddresses {
  readonly tiles: readonly WorldTileKey[];
  readonly zones: readonly WorldZoneAddress[];
  readonly localZones: readonly WorldLocalZoneAddress[];
}

/** Conservation terms persisted with a density edit transaction. */
export interface WorldEditMassDelta {
  readonly worldDeltaKg: number;
  readonly ledgerDeltaKg: number;
}

const SOUTH_CLAMP_EPSILON_M = 0.000001;

function positiveModulo(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be finite`);
  }
}

function assertIntegerRange(
  value: number,
  minimum: number,
  maximum: number,
  name: string,
): void {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} must be an integer from ${minimum} to ${maximum}`);
  }
}

/** Normalize a world X/Z position into the finite atlas. */
export function normalizeWorldAtlasPosition(
  x: number,
  z: number,
): Readonly<{ x: number; z: number }> {
  assertFinite(x, "x");
  assertFinite(z, "z");
  return {
    x: positiveModulo(x, ORIGIN_SHARD_ATLAS_SPEC.widthM),
    z: Math.min(
      Math.max(z, 0),
      ORIGIN_SHARD_ATLAS_SPEC.heightM - SOUTH_CLAMP_EPSILON_M,
    ),
  };
}

/** Resolve a world position to its canonical tile, zone, and local zone. */
export function worldPositionToWorldAddress(
  x: number,
  z: number,
): WorldAtlasAddress {
  const normalized = normalizeWorldAtlasPosition(x, z);
  const tx = Math.floor(normalized.x / ORIGIN_SHARD_ATLAS_SPEC.tileSizeM);
  const tz = Math.floor(normalized.z / ORIGIN_SHARD_ATLAS_SPEC.tileSizeM);
  const tile = { tx, tz };
  const tileLocalX = normalized.x - tx * ORIGIN_SHARD_ATLAS_SPEC.tileSizeM;
  const tileLocalZ = normalized.z - tz * ORIGIN_SHARD_ATLAS_SPEC.tileSizeM;
  const zx = Math.floor(tileLocalX / ORIGIN_SHARD_ATLAS_SPEC.zoneSizeM);
  const zz = Math.floor(tileLocalZ / ORIGIN_SHARD_ATLAS_SPEC.zoneSizeM);
  const zone = { tile, zx, zz };
  const zoneLocalX = tileLocalX - zx * ORIGIN_SHARD_ATLAS_SPEC.zoneSizeM;
  const zoneLocalZ = tileLocalZ - zz * ORIGIN_SHARD_ATLAS_SPEC.zoneSizeM;
  return {
    tile,
    zone,
    localZone: {
      zone,
      lx: Math.floor(zoneLocalX / ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM),
      lz: Math.floor(zoneLocalZ / ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM),
    },
  };
}

/** Return logical latitude, including exact north/south boundary values. */
export function worldLatitudeDegrees(z: number): number {
  assertFinite(z, "z");
  const bounded = Math.min(Math.max(z, 0), ORIGIN_SHARD_ATLAS_SPEC.heightM);
  return 90 - (bounded / ORIGIN_SHARD_ATLAS_SPEC.heightM) * 180;
}

/** Return the half-open bounds for a tile. */
export function worldTileBounds(key: WorldTileKey): WorldHorizontalBounds {
  assertIntegerRange(key.tx, 0, WORLD_ATLAS_COUNTS.tilesX - 1, "tile.tx");
  assertIntegerRange(key.tz, 0, WORLD_ATLAS_COUNTS.tilesZ - 1, "tile.tz");
  const minX = key.tx * ORIGIN_SHARD_ATLAS_SPEC.tileSizeM;
  const minZ = key.tz * ORIGIN_SHARD_ATLAS_SPEC.tileSizeM;
  return {
    minX,
    minZ,
    maxX: minX + ORIGIN_SHARD_ATLAS_SPEC.tileSizeM,
    maxZ: minZ + ORIGIN_SHARD_ATLAS_SPEC.tileSizeM,
  };
}

/** Return the half-open bounds for a 100 m zone. */
export function worldZoneBounds(address: WorldZoneAddress): WorldHorizontalBounds {
  const tile = worldTileBounds(address.tile);
  assertIntegerRange(
    address.zx,
    0,
    WORLD_ATLAS_COUNTS.zonesPerTileAxis - 1,
    "zone.zx",
  );
  assertIntegerRange(
    address.zz,
    0,
    WORLD_ATLAS_COUNTS.zonesPerTileAxis - 1,
    "zone.zz",
  );
  const minX = tile.minX + address.zx * ORIGIN_SHARD_ATLAS_SPEC.zoneSizeM;
  const minZ = tile.minZ + address.zz * ORIGIN_SHARD_ATLAS_SPEC.zoneSizeM;
  return {
    minX,
    minZ,
    maxX: minX + ORIGIN_SHARD_ATLAS_SPEC.zoneSizeM,
    maxZ: minZ + ORIGIN_SHARD_ATLAS_SPEC.zoneSizeM,
  };
}

/** Return the half-open bounds for a 10 m local zone. */
export function worldLocalZoneBounds(
  address: WorldLocalZoneAddress,
): WorldHorizontalBounds {
  const zone = worldZoneBounds(address.zone);
  assertIntegerRange(
    address.lx,
    0,
    WORLD_ATLAS_COUNTS.localZonesPerZoneAxis - 1,
    "localZone.lx",
  );
  assertIntegerRange(
    address.lz,
    0,
    WORLD_ATLAS_COUNTS.localZonesPerZoneAxis - 1,
    "localZone.lz",
  );
  const minX = zone.minX + address.lx * ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM;
  const minZ = zone.minZ + address.lz * ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM;
  return {
    minX,
    minZ,
    maxX: minX + ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM,
    maxZ: minZ + ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM,
  };
}

/** Validate a tile key and return a frozen normalized copy. */
export function normalizeWorldTileKey(key: WorldTileKey): WorldTileKey {
  assertIntegerRange(key.tx, 0, WORLD_ATLAS_COUNTS.tilesX - 1, "tile.tx");
  assertIntegerRange(key.tz, 0, WORLD_ATLAS_COUNTS.tilesZ - 1, "tile.tz");
  return Object.freeze({ tx: key.tx, tz: key.tz });
}

/** Validate mass closure without applying an edit. */
export function validateWorldEditMassClosure(
  delta: WorldEditMassDelta,
  toleranceKg = 0.000001,
): Readonly<{ closed: boolean; residualKg: number }> {
  assertFinite(delta.worldDeltaKg, "worldDeltaKg");
  assertFinite(delta.ledgerDeltaKg, "ledgerDeltaKg");
  assertFinite(toleranceKg, "toleranceKg");
  if (toleranceKg < 0) {
    throw new Error("toleranceKg must be non-negative");
  }
  const rawResidual = delta.worldDeltaKg + delta.ledgerDeltaKg;
  const residualKg = Math.abs(rawResidual) <= Number.EPSILON ? 0 : rawResidual;
  return {
    closed: Math.abs(residualKg) <= toleranceKg,
    residualKg,
  };
}

function operationBounds(
  operation: Exclude<WorldEditOperationV1, WorldFloraPlaceOperationV1>,
): WorldHorizontalBounds {
  if (!Number.isFinite(operation.radiusM) || operation.radiusM <= 0) {
    throw new Error(`${operation.kind}.radiusM must be positive and finite`);
  }
  return {
    minX: operation.center[0] - operation.radiusM,
    minZ: operation.center[2] - operation.radiusM,
    maxX: operation.center[0] + operation.radiusM,
    maxZ: operation.center[2] + operation.radiusM,
  };
}

function addAddressAtPosition(
  x: number,
  z: number,
  tileMap: Map<string, WorldTileKey>,
  zoneMap: Map<string, WorldZoneAddress>,
  localMap: Map<string, WorldLocalZoneAddress>,
): void {
  const address = worldPositionToWorldAddress(x, z);
  tileMap.set(`${address.tile.tx}:${address.tile.tz}`, address.tile);
  zoneMap.set(
    `${address.tile.tx}:${address.tile.tz}:${address.zone.zx}:${address.zone.zz}`,
    address.zone,
  );
  localMap.set(
    `${address.tile.tx}:${address.tile.tz}:${address.zone.zx}:${address.zone.zz}:${address.localZone.lx}:${address.localZone.lz}`,
    address.localZone,
  );
}

/** Derive every tile, zone, and local zone touched by an edit envelope. */
export function getWorldEditDirtyAddresses(
  edit: WorldEditV1,
): WorldEditDirtyAddresses {
  if (edit.schemaVersion !== WORLD_EDIT_SCHEMA_VERSION) {
    throw new Error("Unsupported world edit schemaVersion");
  }
  if (edit.worldId !== ORIGIN_SHARD_ATLAS_SPEC.worldId) {
    throw new Error("Unsupported worldId");
  }
  if (
    !edit.id ||
    !edit.atlasRevision ||
    edit.operations.length === 0 ||
    edit.operations.length > 64
  ) {
    throw new Error(
      "World edit id, atlasRevision, and between 1 and 64 operations are required",
    );
  }

  const tiles = new Map<string, WorldTileKey>();
  const zones = new Map<string, WorldZoneAddress>();
  const localZones = new Map<string, WorldLocalZoneAddress>();

  for (const operation of edit.operations) {
    if (operation.kind === "floraPlace") {
      addAddressAtPosition(
        operation.position[0],
        operation.position[2],
        tiles,
        zones,
        localZones,
      );
      continue;
    }
    const bounds = operationBounds(operation);
    const minLocalX = Math.floor(
      (bounds.minX - WORLD_LOCAL_ZONE_SAMPLING_HALO_M) /
        ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM,
    );
    const maxLocalX =
      Math.ceil(
        (bounds.maxX + WORLD_LOCAL_ZONE_SAMPLING_HALO_M) /
          ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM,
      ) - 1;
    const minLocalZ = Math.max(
      0,
      Math.floor(
        (bounds.minZ - WORLD_LOCAL_ZONE_SAMPLING_HALO_M) /
          ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM,
      ),
    );
    const maxLocalZ = Math.min(
      WORLD_ATLAS_COUNTS.tilesZ * 100 - 1,
      Math.ceil(
        (bounds.maxZ + WORLD_LOCAL_ZONE_SAMPLING_HALO_M) /
          ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM,
      ) - 1,
    );
    for (let gridZ = minLocalZ; gridZ <= maxLocalZ; gridZ += 1) {
      for (let gridX = minLocalX; gridX <= maxLocalX; gridX += 1) {
        addAddressAtPosition(
          gridX * ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM +
            ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM * 0.5,
          gridZ * ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM +
            ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM * 0.5,
          tiles,
          zones,
          localZones,
        );
      }
    }
  }

  const tileSort = (a: WorldTileKey, b: WorldTileKey) =>
    a.tz - b.tz || a.tx - b.tx;
  const zoneSort = (a: WorldZoneAddress, b: WorldZoneAddress) =>
    tileSort(a.tile, b.tile) || a.zz - b.zz || a.zx - b.zx;
  const localSort = (a: WorldLocalZoneAddress, b: WorldLocalZoneAddress) =>
    zoneSort(a.zone, b.zone) || a.lz - b.lz || a.lx - b.lx;

  return {
    tiles: [...tiles.values()].sort(tileSort),
    zones: [...zones.values()].sort(zoneSort),
    localZones: [...localZones.values()].sort(localSort),
  };
}
