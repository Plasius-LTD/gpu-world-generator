import type { ModelAssetRef } from "@plasius/asset-contracts";

import {
  ORIGIN_SHARD_ATLAS_SPEC,
  WORLD_ATLAS_COUNTS,
  WORLD_ATLAS_SCHEMA_VERSION,
  WORLD_LOCAL_ZONE_SAMPLING_HALO_M,
  normalizeWorldAtlasPosition,
  worldLocalZoneBounds,
  worldPositionToWorldAddress,
  worldZoneBounds,
  type WorldEditV1,
  type WorldFloraProfileId,
  type WorldHorizontalBounds,
  type WorldLocalZoneAddress,
  type WorldLocalZoneChunkKey,
  type WorldMacroZoneV1,
  type WorldRepresentation,
  type WorldResidencyBudget,
  type WorldSpatialModelInstanceV1,
  type WorldTileKey,
  type WorldTileMacroDataV1,
  type WorldViewPlan,
  type WorldZoneAddress,
} from "./world-atlas-contracts";
import { VoxelMaterial } from "./voxels";

const MIB = 1024 * 1024;
const REPRESENTATIONS = Object.freeze([
  "voxel-0.5m",
  "voxel-1m",
  "zone-5m",
  "tile-25m",
  "overview-100m",
] as const satisfies readonly WorldRepresentation[]);
const REPRESENTATION_BOUNDARIES_M = Object.freeze([8, 32, 150, 1_000] as const);
const HYSTERESIS_FACTOR = 0.2;
const EPSILON_M = 0.000001;

/** Exact hard residency profiles shared by atlas hosts. */
export const WORLD_RESIDENCY_BUDGETS = Object.freeze({
  low: Object.freeze({
    profile: "low",
    maxCpuBytes: 128 * MIB,
    maxGpuBytes: 192 * MIB,
    maxGenerationJobs: 2,
  }),
  standard: Object.freeze({
    profile: "standard",
    maxCpuBytes: 256 * MIB,
    maxGpuBytes: 384 * MIB,
    maxGenerationJobs: 4,
  }),
  high: Object.freeze({
    profile: "high",
    maxCpuBytes: 512 * MIB,
    maxGpuBytes: 768 * MIB,
    maxGenerationJobs: 8,
  }),
} as const satisfies Record<WorldResidencyBudget["profile"], WorldResidencyBudget>);

/** Viewpoint accepted by the finite-atlas planner. */
export interface WorldViewpoint {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/** Horizontal velocity used for one directional prefetch ring. */
export interface WorldViewVelocity {
  readonly x: number;
  readonly z: number;
}

/** Inputs for deterministic view and cancellation planning. */
export interface PlanWorldViewOptions {
  readonly worldId: string;
  readonly atlasRevision: string;
  readonly editRevision: number;
  readonly viewpoint: WorldViewpoint;
  readonly velocity?: WorldViewVelocity;
  readonly budget?: WorldResidencyBudget | WorldResidencyBudget["profile"];
  readonly viewDistanceM?: number;
  readonly surfaceElevationM?: number;
  readonly previousPlan?: WorldViewPlan;
  readonly cancelObsoleteWork?: (workKey: string) => void;
}

interface PlannedRepresentation {
  readonly address: WorldLocalZoneAddress | WorldZoneAddress | WorldTileKey;
  readonly representation: WorldRepresentation;
  readonly distanceM: number;
  readonly workKey: string;
  readonly fallback?: WorldRepresentation;
}

function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be finite`);
  }
}

function assertNonNegativeInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
}

function tileId(key: WorldTileKey): string {
  return `${key.tx}:${key.tz}`;
}

function sameTile(left: WorldTileKey, right: WorldTileKey): boolean {
  return left.tx === right.tx && left.tz === right.tz;
}

function positiveModulo(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

function distance2d(
  left: Readonly<{ x: number; z: number }>,
  right: Readonly<{ x: number; z: number }>,
): number {
  const directX = Math.abs(left.x - right.x);
  const wrappedX = Math.min(
    directX,
    ORIGIN_SHARD_ATLAS_SPEC.widthM - directX,
  );
  return Math.hypot(wrappedX, left.z - right.z);
}

function fallbackFor(
  representation: WorldRepresentation,
): WorldRepresentation | undefined {
  const index = REPRESENTATIONS.indexOf(representation);
  return REPRESENTATIONS[index + 1];
}

function baseRepresentationIndex(distanceM: number): number {
  for (let index = 0; index < REPRESENTATION_BOUNDARIES_M.length; index += 1) {
    if (distanceM < REPRESENTATION_BOUNDARIES_M[index]!) return index;
  }
  return REPRESENTATIONS.length - 1;
}

/** Select a representation with a 20% transition margin around prior state. */
export function selectWorldRepresentation(
  distanceM: number,
  previous?: WorldRepresentation,
): WorldRepresentation {
  assertFinite(distanceM, "distanceM");
  if (distanceM < 0) throw new Error("distanceM must be non-negative");
  const baseIndex = baseRepresentationIndex(distanceM);
  if (previous === undefined) return REPRESENTATIONS[baseIndex]!;
  const previousIndex = REPRESENTATIONS.indexOf(previous);
  if (previousIndex < 0 || previousIndex === baseIndex) {
    return REPRESENTATIONS[baseIndex]!;
  }
  if (baseIndex > previousIndex) {
    const exitBoundary = REPRESENTATION_BOUNDARIES_M[previousIndex];
    if (
      exitBoundary !== undefined &&
      distanceM < exitBoundary * (1 + HYSTERESIS_FACTOR)
    ) {
      return previous;
    }
  } else {
    const entryBoundary = REPRESENTATION_BOUNDARIES_M[previousIndex - 1];
    if (
      entryBoundary !== undefined &&
      distanceM >= entryBoundary * (1 - HYSTERESIS_FACTOR)
    ) {
      return previous;
    }
  }
  return REPRESENTATIONS[baseIndex]!;
}

function addressId(
  address: WorldLocalZoneAddress | WorldZoneAddress | WorldTileKey,
): string {
  if ("zone" in address) {
    return `l:${address.zone.tile.tx}:${address.zone.tile.tz}:${address.zone.zx}:${address.zone.zz}:${address.lx}:${address.lz}`;
  }
  if ("tile" in address) {
    return `z:${address.tile.tx}:${address.tile.tz}:${address.zx}:${address.zz}`;
  }
  return `t:${address.tx}:${address.tz}`;
}

function workKey(
  worldId: string,
  atlasRevision: string,
  editRevision: number,
  representation: WorldRepresentation,
  address: WorldLocalZoneAddress | WorldZoneAddress | WorldTileKey,
): string {
  return `${worldId}/${atlasRevision}/${editRevision}/${representation}/${addressId(address)}`;
}

function tileFromUnboundedIndices(tx: number, tz: number): WorldTileKey | null {
  if (tz < 0 || tz >= WORLD_ATLAS_COUNTS.tilesZ) return null;
  return {
    tx: positiveModulo(tx, WORLD_ATLAS_COUNTS.tilesX),
    tz,
  };
}

function localZoneAtUnboundedIndices(
  globalLx: number,
  globalLz: number,
): WorldLocalZoneAddress | null {
  const localsX = ORIGIN_SHARD_ATLAS_SPEC.widthM /
    ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM;
  const localsZ = ORIGIN_SHARD_ATLAS_SPEC.heightM /
    ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM;
  if (globalLz < 0 || globalLz >= localsZ) return null;
  const wrappedLx = positiveModulo(globalLx, localsX);
  return worldPositionToWorldAddress(
    wrappedLx * ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM,
    globalLz * ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM,
  ).localZone;
}

function zoneAtUnboundedIndices(
  globalZx: number,
  globalZz: number,
): WorldZoneAddress | null {
  const zonesX = ORIGIN_SHARD_ATLAS_SPEC.widthM /
    ORIGIN_SHARD_ATLAS_SPEC.zoneSizeM;
  const zonesZ = ORIGIN_SHARD_ATLAS_SPEC.heightM /
    ORIGIN_SHARD_ATLAS_SPEC.zoneSizeM;
  if (globalZz < 0 || globalZz >= zonesZ) return null;
  const wrappedZx = positiveModulo(globalZx, zonesX);
  return worldPositionToWorldAddress(
    wrappedZx * ORIGIN_SHARD_ATLAS_SPEC.zoneSizeM,
    globalZz * ORIGIN_SHARD_ATLAS_SPEC.zoneSizeM,
  ).zone;
}

function previousRepresentations(plan: WorldViewPlan | undefined): Map<string, WorldRepresentation> {
  const result = new Map<string, WorldRepresentation>();
  for (const entry of plan?.representations ?? []) {
    result.set(addressId(entry.address), entry.representation);
  }
  return result;
}

function addTile(map: Map<string, WorldTileKey>, key: WorldTileKey): void {
  map.set(tileId(key), Object.freeze({ tx: key.tx, tz: key.tz }));
}

function sortTileKeys(keys: Iterable<WorldTileKey>): readonly WorldTileKey[] {
  return Object.freeze(
    [...keys].sort((left, right) => left.tz - right.tz || left.tx - right.tx),
  );
}

function requiredTileKeysForBounds(
  bounds: WorldHorizontalBounds,
  haloM: number,
): readonly WorldTileKey[] {
  const minX = bounds.minX - haloM;
  const maxX = bounds.maxX + haloM;
  const minZ = Math.max(0, bounds.minZ - haloM);
  const maxZ = Math.min(ORIGIN_SHARD_ATLAS_SPEC.heightM, bounds.maxZ + haloM);
  const firstTx = Math.floor(minX / ORIGIN_SHARD_ATLAS_SPEC.tileSizeM);
  const lastTx = Math.floor((maxX - EPSILON_M) / ORIGIN_SHARD_ATLAS_SPEC.tileSizeM);
  const firstTz = Math.floor(minZ / ORIGIN_SHARD_ATLAS_SPEC.tileSizeM);
  const lastTz = Math.floor((maxZ - EPSILON_M) / ORIGIN_SHARD_ATLAS_SPEC.tileSizeM);
  const keys = new Map<string, WorldTileKey>();
  for (let tz = firstTz; tz <= lastTz; tz += 1) {
    for (let tx = firstTx; tx <= lastTx; tx += 1) {
      const key = tileFromUnboundedIndices(tx, tz);
      if (key !== null) addTile(keys, key);
    }
  }
  return sortTileKeys(keys.values());
}

/** Plan detailed work, fallbacks, cancellation, and one velocity-biased ring. */
export function planWorldView(options: PlanWorldViewOptions): WorldViewPlan {
  if (options.worldId.length === 0 || options.atlasRevision.length === 0) {
    throw new Error("worldId and atlasRevision are required");
  }
  assertNonNegativeInteger(options.editRevision, "editRevision");
  assertFinite(options.viewpoint.x, "viewpoint.x");
  assertFinite(options.viewpoint.y, "viewpoint.y");
  assertFinite(options.viewpoint.z, "viewpoint.z");
  const viewDistanceM = options.viewDistanceM ?? 2_000;
  assertFinite(viewDistanceM, "viewDistanceM");
  if (viewDistanceM < 1_000) {
    throw new Error("viewDistanceM must be at least 1,000 m");
  }
  const viewpoint = normalizeWorldAtlasPosition(
    options.viewpoint.x,
    options.viewpoint.z,
  );
  const budget = typeof options.budget === "object"
    ? Object.freeze({ ...options.budget })
    : WORLD_RESIDENCY_BUDGETS[options.budget ?? "standard"];
  if (
    budget.maxCpuBytes <= 0 ||
    budget.maxGpuBytes <= 0 ||
    !Number.isInteger(budget.maxGenerationJobs) ||
    budget.maxGenerationJobs <= 0
  ) {
    throw new Error("budget limits must be positive");
  }

  const previous = previousRepresentations(options.previousPlan);
  const representationMap = new Map<string, PlannedRepresentation>();
  const requiredTiles = new Map<string, WorldTileKey>();
  const localChunks: WorldLocalZoneChunkKey[] = [];
  const addRepresentation = (
    address: WorldLocalZoneAddress | WorldZoneAddress | WorldTileKey,
    representation: WorldRepresentation,
    distanceM: number,
  ): void => {
    const key = workKey(
      options.worldId,
      options.atlasRevision,
      options.editRevision,
      representation,
      address,
    );
    representationMap.set(key, Object.freeze({
      address,
      representation,
      distanceM,
      workKey: key,
      fallback: fallbackFor(representation),
    }));
  };

  const centerLocalX = Math.floor(viewpoint.x / ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM);
  const centerLocalZ = Math.floor(viewpoint.z / ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM);
  const localRadius = Math.ceil(32 * (1 + HYSTERESIS_FACTOR) /
    ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM);
  const slabY = Math.floor(
    (options.surfaceElevationM ?? options.viewpoint.y) /
      ORIGIN_SHARD_ATLAS_SPEC.slabHeightM,
  );
  for (let dz = -localRadius; dz <= localRadius; dz += 1) {
    for (let dx = -localRadius; dx <= localRadius; dx += 1) {
      const address = localZoneAtUnboundedIndices(centerLocalX + dx, centerLocalZ + dz);
      if (address === null) continue;
      const bounds = worldLocalZoneBounds(address);
      const center = {
        x: positiveModulo((bounds.minX + bounds.maxX) / 2, ORIGIN_SHARD_ATLAS_SPEC.widthM),
        z: (bounds.minZ + bounds.maxZ) / 2,
      };
      const distanceM = distance2d(viewpoint, center);
      const representation = selectWorldRepresentation(
        distanceM,
        previous.get(addressId(address)),
      );
      if (representation !== "voxel-0.5m" && representation !== "voxel-1m") continue;
      addRepresentation(address, representation, distanceM);
      localChunks.push(Object.freeze({
        worldId: options.worldId,
        atlasRevision: options.atlasRevision,
        localZone: address,
        metresPerVoxel: representation === "voxel-0.5m" ? 0.5 : 1,
        slabY,
        editRevision: options.editRevision,
      }));
      for (const key of requiredTileKeysForBounds(
        bounds,
        WORLD_LOCAL_ZONE_SAMPLING_HALO_M,
      )) addTile(requiredTiles, key);
    }
  }

  const centerZoneX = Math.floor(viewpoint.x / ORIGIN_SHARD_ATLAS_SPEC.zoneSizeM);
  const centerZoneZ = Math.floor(viewpoint.z / ORIGIN_SHARD_ATLAS_SPEC.zoneSizeM);
  const zoneRadius = Math.ceil(150 * (1 + HYSTERESIS_FACTOR) /
    ORIGIN_SHARD_ATLAS_SPEC.zoneSizeM);
  for (let dz = -zoneRadius; dz <= zoneRadius; dz += 1) {
    for (let dx = -zoneRadius; dx <= zoneRadius; dx += 1) {
      const address = zoneAtUnboundedIndices(centerZoneX + dx, centerZoneZ + dz);
      if (address === null) continue;
      const bounds = worldZoneBounds(address);
      const distanceM = distance2d(viewpoint, {
        x: positiveModulo((bounds.minX + bounds.maxX) / 2, ORIGIN_SHARD_ATLAS_SPEC.widthM),
        z: (bounds.minZ + bounds.maxZ) / 2,
      });
      const representation = selectWorldRepresentation(
        distanceM,
        previous.get(addressId(address)),
      );
      if (representation !== "zone-5m") continue;
      addRepresentation(address, representation, distanceM);
      for (const key of requiredTileKeysForBounds(
        bounds,
        WORLD_LOCAL_ZONE_SAMPLING_HALO_M,
      )) addTile(requiredTiles, key);
    }
  }

  const currentTile = worldPositionToWorldAddress(viewpoint.x, viewpoint.z).tile;
  const tileRadius = Math.ceil(viewDistanceM / ORIGIN_SHARD_ATLAS_SPEC.tileSizeM) + 1;
  for (let dz = -tileRadius; dz <= tileRadius; dz += 1) {
    for (let dx = -tileRadius; dx <= tileRadius; dx += 1) {
      const address = tileFromUnboundedIndices(currentTile.tx + dx, currentTile.tz + dz);
      if (address === null) continue;
      const center = {
        x: positiveModulo(
          address.tx * ORIGIN_SHARD_ATLAS_SPEC.tileSizeM +
            ORIGIN_SHARD_ATLAS_SPEC.tileSizeM / 2,
          ORIGIN_SHARD_ATLAS_SPEC.widthM,
        ),
        z: address.tz * ORIGIN_SHARD_ATLAS_SPEC.tileSizeM +
          ORIGIN_SHARD_ATLAS_SPEC.tileSizeM / 2,
      };
      const distanceM = distance2d(viewpoint, center);
      if (distanceM > viewDistanceM) continue;
      const representation = selectWorldRepresentation(
        distanceM,
        previous.get(addressId(address)),
      );
      if (representation !== "tile-25m" && representation !== "overview-100m") continue;
      addRepresentation(address, representation, distanceM);
      addTile(requiredTiles, address);
    }
  }

  const velocity = options.velocity ?? { x: 0, z: 0 };
  assertFinite(velocity.x, "velocity.x");
  assertFinite(velocity.z, "velocity.z");
  const prefetchTiles: WorldTileKey[] = [];
  if (velocity.x !== 0 || velocity.z !== 0) {
    const useX = Math.abs(velocity.x) >= Math.abs(velocity.z);
    const prefetch = tileFromUnboundedIndices(
      currentTile.tx + (useX ? Math.sign(velocity.x) : 0),
      currentTile.tz + (useX ? 0 : Math.sign(velocity.z)),
    );
    if (prefetch !== null && !sameTile(prefetch, currentTile)) {
      prefetchTiles.push(Object.freeze(prefetch));
      addTile(requiredTiles, prefetch);
    }
  }

  const representations = [...representationMap.values()];
  representations.sort((left, right) =>
    left.distanceM - right.distanceM || left.workKey.localeCompare(right.workKey));
  const workKeys = Object.freeze(representations.map(({ workKey: key }) => key));
  const currentWork = new Set(workKeys);
  const obsoleteWorkKeys = Object.freeze(
    (options.previousPlan?.workKeys ?? []).filter((key) => !currentWork.has(key)),
  );
  for (const key of obsoleteWorkKeys) options.cancelObsoleteWork?.(key);

  return Object.freeze({
    schemaVersion: WORLD_ATLAS_SCHEMA_VERSION,
    requiredTiles: sortTileKeys(requiredTiles.values()),
    prefetchTiles: Object.freeze(prefetchTiles),
    localChunks: Object.freeze(localChunks),
    representations: Object.freeze(representations),
    workKeys,
    obsoleteWorkKeys,
    budget,
  });
}

/** Stable flora assets available to deterministic profile reconstruction. */
export type WorldFloraAssetCatalog = Partial<
  Readonly<Record<WorldFloraProfileId, readonly ModelAssetRef[]>>
>;

/** Reconstructed base or explicitly placed flora instance. */
export interface WorldFloraInstanceV1 {
  readonly instanceId: string;
  readonly assetRef: ModelAssetRef;
  readonly position: readonly [number, number, number];
  readonly scale: number;
  readonly source: "base" | "edit";
}

/** Materialized samples for one 10 m by 10 m by 32 m local slab. */
export interface WorldLocalZoneMaterializationV1 {
  readonly schemaVersion: typeof WORLD_ATLAS_SCHEMA_VERSION;
  readonly key: WorldLocalZoneChunkKey;
  readonly bounds: Readonly<{
    min: readonly [number, number, number];
    max: readonly [number, number, number];
  }>;
  readonly dimensions: Readonly<{ x: number; y: number; z: number }>;
  readonly density: Float32Array;
  readonly materials: Uint16Array;
  readonly floraInstances: readonly WorldFloraInstanceV1[];
  readonly cpuBytes: number;
  readonly gpuBytes: number;
}

/** Inputs for one deterministic local-zone slab reconstruction. */
export interface MaterializeWorldLocalZoneOptions {
  readonly key: WorldLocalZoneChunkKey;
  readonly tiles: readonly WorldTileMacroDataV1[];
  readonly edits?: readonly WorldEditV1[];
  readonly floraAssets?: WorldFloraAssetCatalog;
  readonly signal?: AbortSignal;
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (!signal?.aborted) return;
  const error = new Error("World streaming work was aborted");
  error.name = "AbortError";
  throw error;
}

function createTileMap(
  tiles: readonly WorldTileMacroDataV1[],
  worldId?: string,
  atlasRevision?: string,
): Map<string, WorldTileMacroDataV1> {
  const result = new Map<string, WorldTileMacroDataV1>();
  for (const tile of tiles) {
    if (tile.zones.length !== 100) {
      throw new Error(`Tile ${tileId(tile.key)} must contain exactly 100 macro zones`);
    }
    if (worldId !== undefined && tile.worldId !== worldId) {
      throw new Error(`Tile ${tileId(tile.key)} belongs to a different world`);
    }
    if (atlasRevision !== undefined && tile.atlasRevision !== atlasRevision) {
      throw new Error(`Tile ${tileId(tile.key)} belongs to a different atlas revision`);
    }
    const id = tileId(tile.key);
    if (result.has(id)) throw new Error(`Duplicate source tile ${id}`);
    result.set(id, tile);
  }
  return result;
}

function assertRequiredTiles(
  tileMap: ReadonlyMap<string, WorldTileMacroDataV1>,
  keys: readonly WorldTileKey[],
): void {
  for (const key of keys) {
    if (!tileMap.has(tileId(key))) {
      throw new Error(`Missing required owner tile ${tileId(key)}`);
    }
  }
}

function macroAt(
  tileMap: ReadonlyMap<string, WorldTileMacroDataV1>,
  x: number,
  z: number,
): WorldMacroZoneV1 {
  const address = worldPositionToWorldAddress(x, z);
  const tile = tileMap.get(tileId(address.tile));
  if (tile === undefined) {
    throw new Error(`Missing required owner tile ${tileId(address.tile)}`);
  }
  return tile.zones[
    address.zone.zz * WORLD_ATLAS_COUNTS.zonesPerTileAxis + address.zone.zx
  ]!;
}

function surfaceElevation(
  tileMap: ReadonlyMap<string, WorldTileMacroDataV1>,
  x: number,
  z: number,
): number {
  const normalized = normalizeWorldAtlasPosition(x, z);
  const macro = macroAt(tileMap, normalized.x, normalized.z);
  const seed = tileMap.values().next().value?.seed ?? 0;
  const phase = (seed % 8192) / 8192 * Math.PI * 2;
  const micro = Math.sin(
    normalized.x * Math.PI * 2 / 40 + phase,
  ) * Math.cos(normalized.z * Math.PI * 2 / 43 - phase) * 0.45;
  return macro.elevationM + micro * (0.25 + macro.slope * 0.75);
}

function hash32(...values: number[]): number {
  let hash = 0x811c9dc5;
  for (const value of values) {
    hash ^= Math.trunc(value) >>> 0;
    hash = Math.imul(hash, 0x01000193);
    hash ^= hash >>> 16;
  }
  return hash >>> 0;
}

function unitHash(...values: number[]): number {
  return hash32(...values) / 0x100000000;
}

function validateEdits(
  edits: readonly WorldEditV1[],
  worldId: string,
  atlasRevision: string,
): void {
  for (const edit of edits) {
    if (edit.worldId !== worldId || edit.atlasRevision !== atlasRevision) {
      throw new Error(`Edit ${edit.id} belongs to a different world or atlas revision`);
    }
    if (edit.schemaVersion !== 1 || edit.id.length === 0 || edit.operations.length > 64) {
      throw new Error("World edits require schema version 1, an id, and at most 64 operations");
    }
    for (const operation of edit.operations) {
      const position = operation.kind === "floraPlace"
        ? operation.position
        : operation.center;
      for (const [index, coordinate] of position.entries()) {
        assertFinite(coordinate, `${operation.kind}.position[${index}]`);
      }
      if (operation.kind === "floraPlace") {
        if (operation.instanceId.length === 0) {
          throw new Error("floraPlace.instanceId is required");
        }
        continue;
      }
      assertFinite(operation.radiusM, `${operation.kind}.radiusM`);
      if (operation.radiusM <= 0) {
        throw new Error(`${operation.kind}.radiusM must be positive`);
      }
      if (operation.kind === "densityDelta") {
        assertFinite(operation.densityDelta, "densityDelta.densityDelta");
        assertFinite(operation.materialDensityKgM3, "densityDelta.materialDensityKgM3");
      } else if (
        operation.kind === "materialPaint" &&
        (!Number.isInteger(operation.materialId) || operation.materialId < 0 || operation.materialId > 0xffff)
      ) {
        throw new Error("materialPaint.materialId must be an unsigned 16-bit integer");
      }
    }
  }
}

function operationDistance(
  x: number,
  y: number,
  z: number,
  center: readonly [number, number, number],
): number {
  const directX = Math.abs(
    positiveModulo(
      x - center[0] + ORIGIN_SHARD_ATLAS_SPEC.widthM / 2,
      ORIGIN_SHARD_ATLAS_SPEC.widthM,
    ) - ORIGIN_SHARD_ATLAS_SPEC.widthM / 2,
  );
  const wrappedX = directX;
  return Math.hypot(wrappedX, y - center[1], z - center[2]);
}

function operationIntersectsHorizontalBounds(
  center: readonly [number, number, number],
  radiusM: number,
  bounds: WorldHorizontalBounds,
): boolean {
  const normalizedX = positiveModulo(center[0], ORIGIN_SHARD_ATLAS_SPEC.widthM);
  let xDistance = Number.POSITIVE_INFINITY;
  for (const candidateX of [
    normalizedX - ORIGIN_SHARD_ATLAS_SPEC.widthM,
    normalizedX,
    normalizedX + ORIGIN_SHARD_ATLAS_SPEC.widthM,
  ]) {
    xDistance = Math.min(
      xDistance,
      candidateX < bounds.minX
        ? bounds.minX - candidateX
        : candidateX > bounds.maxX
          ? candidateX - bounds.maxX
          : 0,
    );
  }
  const zDistance = center[2] < bounds.minZ
    ? bounds.minZ - center[2]
    : center[2] > bounds.maxZ
      ? center[2] - bounds.maxZ
      : 0;
  return Math.hypot(xDistance, zDistance) <= radiusM;
}

function baseMaterial(macro: WorldMacroZoneV1, depthM: number): number {
  const looseDepth = macro.soilDepthM + macro.sedimentDepthM + macro.alluvialDepthM;
  if (depthM > looseDepth) {
    return macro.bedrock === "basalt" ? VoxelMaterial.Basalt : VoxelMaterial.Rock;
  }
  if (macro.riverbedGravelDepthM > 0 && depthM <= macro.riverbedGravelDepthM) {
    return VoxelMaterial.Gravel;
  }
  if (macro.floodplainClayDepthM > 0 && depthM <= macro.floodplainClayDepthM) {
    return VoxelMaterial.Clay;
  }
  if (macro.floodplainSiltDepthM > 0 || macro.waterKind === "river") {
    return VoxelMaterial.Mud;
  }
  if (macro.waterKind === "ocean") return VoxelMaterial.Sand;
  if (macro.biome === "alpine" || macro.biome === "polar-desert") {
    return VoxelMaterial.Rock;
  }
  return depthM <= 0.3 ? VoxelMaterial.Grass : VoxelMaterial.Soil;
}

function sampleDensityAndMaterial(
  tileMap: ReadonlyMap<string, WorldTileMacroDataV1>,
  edits: readonly WorldEditV1[],
  x: number,
  y: number,
  z: number,
): Readonly<{ density: number; material: number }> {
  const macro = macroAt(tileMap, x, z);
  const surface = surfaceElevation(tileMap, x, z);
  let density = surface - y;
  let material = density >= 0
    ? baseMaterial(macro, Math.max(0, surface - y))
    : y <= macro.waterSurfaceElevationM && macro.waterKind !== "land"
      ? macro.temperatureC < -1 ? VoxelMaterial.Ice : VoxelMaterial.Water
      : VoxelMaterial.Air;
  for (const edit of edits) {
    for (const operation of edit.operations) {
      if (operation.kind === "densityDelta") {
        const distance = operationDistance(x, y, z, operation.center);
        if (distance <= operation.radiusM) {
          density += operation.densityDelta * (1 - distance / operation.radiusM);
        }
      } else if (operation.kind === "materialPaint") {
        if (operationDistance(x, y, z, operation.center) <= operation.radiusM) {
          material = operation.materialId;
        }
      }
    }
  }
  return { density, material };
}

const FLORA_DENSITY: Readonly<Record<WorldFloraProfileId, number>> = Object.freeze({
  none: 0,
  "tundra-low": 1,
  boreal: 3,
  "temperate-mixed": 3,
  grassland: 2,
  "desert-sparse": 1,
  "tropical-dense": 5,
  "wetland-reeds": 4,
  "alpine-sparse": 1,
});

function reconstructFlora(
  key: WorldLocalZoneChunkKey,
  bounds: WorldHorizontalBounds,
  tileMap: ReadonlyMap<string, WorldTileMacroDataV1>,
  edits: readonly WorldEditV1[],
  assets: WorldFloraAssetCatalog | undefined,
): readonly WorldFloraInstanceV1[] {
  const result: WorldFloraInstanceV1[] = [];
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerZ = (bounds.minZ + bounds.maxZ) / 2;
  const macro = macroAt(tileMap, centerX, centerZ);
  const profileAssets = assets?.[macro.floraProfile] ?? [];
  const localGlobalX = Math.floor(bounds.minX / ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM);
  const localGlobalZ = Math.floor(bounds.minZ / ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM);
  if (macro.waterKind === "land" && profileAssets.length > 0) {
    const count = FLORA_DENSITY[macro.floraProfile];
    for (let index = 0; index < count; index += 1) {
      const x = bounds.minX + 0.5 + unitHash(macro.floraSeed, localGlobalX, localGlobalZ, index, 1) * 9;
      const z = bounds.minZ + 0.5 + unitHash(macro.floraSeed, localGlobalX, localGlobalZ, index, 2) * 9;
      const y = surfaceElevation(tileMap, x, z);
      const suppressed = edits.some((edit) => edit.operations.some((operation) =>
        operation.kind === "floraSuppress" &&
        operationDistance(x, y, z, operation.center) <= operation.radiusM));
      if (suppressed) continue;
      result.push(Object.freeze({
        instanceId: `${key.atlasRevision}:flora:${localGlobalX}:${localGlobalZ}:${index}`,
        assetRef: profileAssets[index % profileAssets.length]!,
        position: Object.freeze([x, y, z] as const),
        scale: 0.85 + unitHash(macro.floraSeed, index, 3) * 0.3,
        source: "base",
      }));
    }
  }
  for (const edit of edits) {
    for (const operation of edit.operations) {
      if (
        operation.kind === "floraPlace" &&
        operation.position[0] >= bounds.minX &&
        operation.position[0] < bounds.maxX &&
        operation.position[2] >= bounds.minZ &&
        operation.position[2] < bounds.maxZ
      ) {
        result.push(Object.freeze({
          instanceId: operation.instanceId,
          assetRef: operation.assetRef,
          position: operation.position,
          scale: 1,
          source: "edit",
        }));
      }
    }
  }
  return Object.freeze(result.sort((left, right) =>
    left.instanceId.localeCompare(right.instanceId)));
}

function slabIntersectsFeatures(
  bounds: WorldHorizontalBounds,
  slabMinY: number,
  slabMaxY: number,
  tileMap: ReadonlyMap<string, WorldTileMacroDataV1>,
  edits: readonly WorldEditV1[],
): boolean {
  const horizontalSamples = [
    [bounds.minX, bounds.minZ],
    [bounds.maxX, bounds.minZ],
    [bounds.minX, bounds.maxZ],
    [bounds.maxX, bounds.maxZ],
    [(bounds.minX + bounds.maxX) / 2, (bounds.minZ + bounds.maxZ) / 2],
  ] as const;
  let minimum = Number.POSITIVE_INFINITY;
  let maximum = Number.NEGATIVE_INFINITY;
  for (const [x, z] of horizontalSamples) {
    const surface = surfaceElevation(tileMap, x, z);
    const macro = macroAt(tileMap, x, z);
    minimum = Math.min(minimum, surface);
    maximum = Math.max(
      maximum,
      surface,
      macro.waterKind === "land" ? surface : macro.waterSurfaceElevationM,
    );
  }
  for (const edit of edits) {
    for (const operation of edit.operations) {
      if (operation.kind === "floraPlace") continue;
      if (!operationIntersectsHorizontalBounds(
        operation.center,
        operation.radiusM,
        bounds,
      )) continue;
      minimum = Math.min(minimum, operation.center[1] - operation.radiusM);
      maximum = Math.max(maximum, operation.center[1] + operation.radiusM);
    }
  }
  return maximum >= slabMinY && minimum <= slabMaxY;
}

/** Materialize a surface/fluid/edit-intersecting local slab on demand. */
export function materializeWorldLocalZone(
  options: MaterializeWorldLocalZoneOptions,
): WorldLocalZoneMaterializationV1 | null {
  throwIfAborted(options.signal);
  const { key } = options;
  if (key.worldId.length === 0 || key.atlasRevision.length === 0) {
    throw new Error("Local-zone chunk identity is incomplete");
  }
  if (key.metresPerVoxel !== 0.5 && key.metresPerVoxel !== 1) {
    throw new Error("metresPerVoxel must be 0.5 or 1");
  }
  assertNonNegativeInteger(key.editRevision, "editRevision");
  const minimumSlab = ORIGIN_SHARD_ATLAS_SPEC.minYM /
    ORIGIN_SHARD_ATLAS_SPEC.slabHeightM;
  const maximumSlab = ORIGIN_SHARD_ATLAS_SPEC.maxYM /
    ORIGIN_SHARD_ATLAS_SPEC.slabHeightM;
  if (!Number.isInteger(key.slabY) || key.slabY < minimumSlab || key.slabY >= maximumSlab) {
    throw new Error(`slabY must be an integer from ${minimumSlab} to ${maximumSlab - 1}`);
  }
  const bounds = worldLocalZoneBounds(key.localZone);
  const requiredTiles = requiredTileKeysForBounds(
    bounds,
    WORLD_LOCAL_ZONE_SAMPLING_HALO_M,
  );
  const tileMap = createTileMap(options.tiles, key.worldId, key.atlasRevision);
  assertRequiredTiles(tileMap, requiredTiles);
  const edits = options.edits ?? [];
  validateEdits(edits, key.worldId, key.atlasRevision);
  const slabMinY = key.slabY * ORIGIN_SHARD_ATLAS_SPEC.slabHeightM;
  const slabMaxY = slabMinY + ORIGIN_SHARD_ATLAS_SPEC.slabHeightM;
  if (!slabIntersectsFeatures(bounds, slabMinY, slabMaxY, tileMap, edits)) {
    return null;
  }

  const dimensions = Object.freeze({
    x: Math.round(ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM / key.metresPerVoxel) + 1,
    y: Math.round(ORIGIN_SHARD_ATLAS_SPEC.slabHeightM / key.metresPerVoxel) + 1,
    z: Math.round(ORIGIN_SHARD_ATLAS_SPEC.localZoneSizeM / key.metresPerVoxel) + 1,
  });
  const sampleCount = dimensions.x * dimensions.y * dimensions.z;
  const density = new Float32Array(sampleCount);
  const materials = new Uint16Array(sampleCount);
  let offset = 0;
  for (let zIndex = 0; zIndex < dimensions.z; zIndex += 1) {
    const z = bounds.minZ + zIndex * key.metresPerVoxel;
    for (let yIndex = 0; yIndex < dimensions.y; yIndex += 1) {
      const y = slabMinY + yIndex * key.metresPerVoxel;
      for (let xIndex = 0; xIndex < dimensions.x; xIndex += 1) {
        if ((offset & 4095) === 0) throwIfAborted(options.signal);
        const x = bounds.minX + xIndex * key.metresPerVoxel;
        const sample = sampleDensityAndMaterial(tileMap, edits, x, y, z);
        density[offset] = sample.density;
        materials[offset] = sample.material;
        offset += 1;
      }
    }
  }
  const floraInstances = reconstructFlora(
    key,
    bounds,
    tileMap,
    edits,
    options.floraAssets,
  );
  const cpuBytes = density.byteLength + materials.byteLength;
  return Object.freeze({
    schemaVersion: WORLD_ATLAS_SCHEMA_VERSION,
    key,
    bounds: Object.freeze({
      min: Object.freeze([bounds.minX, slabMinY, bounds.minZ] as const),
      max: Object.freeze([bounds.maxX, slabMaxY, bounds.maxZ] as const),
    }),
    dimensions,
    density,
    materials,
    floraInstances,
    cpuBytes,
    gpuBytes: cpuBytes,
  });
}

/** One clipped terrain or fluid indexed mesh. */
export interface WorldZoneMeshV1 {
  readonly positions: Float32Array;
  readonly indices: Uint32Array;
}

/** One canonical model rendered through destination clip planes. */
export interface WorldClippedSpatialModelV1 {
  readonly instance: WorldSpatialModelInstanceV1;
  readonly clipBounds: WorldHorizontalBounds;
  readonly clipPlanes: readonly (readonly [number, number, number, number])[];
}

/** Destination-owned terrain, fluid, and canonical model geometry. */
export interface WorldZoneGeometryV1 {
  readonly schemaVersion: typeof WORLD_ATLAS_SCHEMA_VERSION;
  readonly destination: WorldZoneAddress;
  readonly clipBounds: WorldHorizontalBounds;
  readonly requiredTiles: readonly WorldTileKey[];
  readonly terrain: WorldZoneMeshV1;
  readonly fluid: WorldZoneMeshV1;
  readonly models: readonly WorldClippedSpatialModelV1[];
}

/** Inputs for exact half-open destination zone assembly. */
export interface AssembleWorldZoneGeometryOptions {
  readonly destination: WorldZoneAddress;
  readonly tiles: readonly WorldTileMacroDataV1[];
  readonly metresPerCell: 5 | 25;
  readonly sourceHaloM?: number;
  readonly signal?: AbortSignal;
}

function createGridIndices(divisions: number): Uint32Array {
  const result = new Uint32Array(divisions * divisions * 6);
  let offset = 0;
  const stride = divisions + 1;
  for (let z = 0; z < divisions; z += 1) {
    for (let x = 0; x < divisions; x += 1) {
      const topLeft = z * stride + x;
      result[offset] = topLeft;
      result[offset + 1] = topLeft + stride;
      result[offset + 2] = topLeft + 1;
      result[offset + 3] = topLeft + 1;
      result[offset + 4] = topLeft + stride;
      result[offset + 5] = topLeft + stride + 1;
      offset += 6;
    }
  }
  return result;
}

function modelFingerprint(instance: WorldSpatialModelInstanceV1): string {
  return JSON.stringify({
    ownerTile: instance.ownerTile,
    intersectingTiles: instance.intersectingTiles,
    assetRef: instance.assetRef,
    transform: instance.transform,
    boundsMetres: instance.boundsMetres,
    lodDistancesM: instance.lodDistancesM,
  });
}

function rangesIntersect(
  leftMin: number,
  leftMax: number,
  rightMin: number,
  rightMax: number,
): boolean {
  return leftMax >= rightMin && leftMin <= rightMax;
}

function wrappedModelXIntersectsBounds(
  modelMinX: number,
  modelMaxX: number,
  bounds: WorldHorizontalBounds,
): boolean {
  const widthM = ORIGIN_SHARD_ATLAS_SPEC.widthM;
  const spanM = Math.max(0, modelMaxX - modelMinX);
  if (spanM >= widthM) return true;
  const normalizedMinX = positiveModulo(modelMinX, widthM);
  const normalizedMaxX = normalizedMinX + spanM;
  return rangesIntersect(
    normalizedMinX,
    normalizedMaxX,
    bounds.minX,
    bounds.maxX,
  ) || rangesIntersect(
    normalizedMinX - widthM,
    normalizedMaxX - widthM,
    bounds.minX,
    bounds.maxX,
  );
}

function modelIntersectsBounds(
  model: WorldSpatialModelInstanceV1,
  bounds: WorldHorizontalBounds,
): boolean {
  return wrappedModelXIntersectsBounds(
    model.boundsMetres.min[0],
    model.boundsMetres.max[0],
    bounds,
  ) && rangesIntersect(
    model.boundsMetres.min[2],
    model.boundsMetres.max[2],
    bounds.minZ,
    bounds.maxZ,
  );
}

/** Assemble source-owner data into one exactly clipped destination zone. */
export function assembleWorldZoneGeometry(
  options: AssembleWorldZoneGeometryOptions,
): WorldZoneGeometryV1 {
  throwIfAborted(options.signal);
  if (options.metresPerCell !== 5 && options.metresPerCell !== 25) {
    throw new Error("metresPerCell must be 5 or 25");
  }
  const sourceHaloM = options.sourceHaloM ?? WORLD_LOCAL_ZONE_SAMPLING_HALO_M;
  assertFinite(sourceHaloM, "sourceHaloM");
  if (sourceHaloM < WORLD_LOCAL_ZONE_SAMPLING_HALO_M) {
    throw new Error(`sourceHaloM must be at least ${WORLD_LOCAL_ZONE_SAMPLING_HALO_M}`);
  }
  const bounds = Object.freeze(worldZoneBounds(options.destination));
  const initialRequiredTiles = requiredTileKeysForBounds(bounds, sourceHaloM);
  const firstTile = options.tiles[0];
  if (firstTile === undefined) throw new Error("At least one source tile is required");
  const tileMap = createTileMap(options.tiles, firstTile.worldId, firstTile.atlasRevision);
  assertRequiredTiles(tileMap, initialRequiredTiles);
  const requiredTileMap = new Map<string, WorldTileKey>();
  for (const key of initialRequiredTiles) addTile(requiredTileMap, key);
  for (const key of initialRequiredTiles) {
    const descriptor = tileMap.get(tileId(key))!;
    for (const model of descriptor.spatialModels) {
      if (!modelIntersectsBounds(model, bounds)) continue;
      addTile(requiredTileMap, model.ownerTile);
      for (const intersectingTile of model.intersectingTiles) {
        addTile(requiredTileMap, intersectingTile);
      }
    }
  }
  const requiredTiles = sortTileKeys(requiredTileMap.values());
  assertRequiredTiles(tileMap, requiredTiles);
  const divisions = ORIGIN_SHARD_ATLAS_SPEC.zoneSizeM / options.metresPerCell;
  const positions = new Float32Array((divisions + 1) * (divisions + 1) * 3);
  const fluidPositions = new Float32Array(positions.length);
  let hasFluid = false;
  let offset = 0;
  for (let zIndex = 0; zIndex <= divisions; zIndex += 1) {
    const z = bounds.minZ + zIndex * options.metresPerCell;
    for (let xIndex = 0; xIndex <= divisions; xIndex += 1) {
      throwIfAborted(options.signal);
      const x = bounds.minX + xIndex * options.metresPerCell;
      const surface = surfaceElevation(tileMap, x, z);
      const macro = macroAt(tileMap, x, z);
      positions[offset] = x;
      positions[offset + 1] = surface;
      positions[offset + 2] = z;
      fluidPositions[offset] = x;
      fluidPositions[offset + 1] = macro.waterKind === "land"
        ? surface
        : Math.max(surface, macro.waterSurfaceElevationM);
      fluidPositions[offset + 2] = z;
      hasFluid ||= macro.waterKind !== "land" && macro.waterSurfaceElevationM > surface;
      offset += 3;
    }
  }
  const indices = createGridIndices(divisions);
  const clipPlanes = Object.freeze([
    Object.freeze([1, 0, 0, -bounds.minX] as const),
    Object.freeze([-1, 0, 0, bounds.maxX] as const),
    Object.freeze([0, 0, 1, -bounds.minZ] as const),
    Object.freeze([0, 0, -1, bounds.maxZ] as const),
  ]);
  const candidates = new Map<string, WorldSpatialModelInstanceV1>();
  const fingerprints = new Map<string, string>();
  for (const tile of options.tiles) {
    for (const model of tile.spatialModels) {
      if (!modelIntersectsBounds(model, bounds)) continue;
      const fingerprint = modelFingerprint(model);
      const existing = fingerprints.get(model.instanceId);
      if (existing !== undefined && existing !== fingerprint) {
        throw new Error(`Conflicting spatial model instance ${model.instanceId}`);
      }
      fingerprints.set(model.instanceId, fingerprint);
      candidates.set(model.instanceId, model);
    }
  }
  const models: WorldClippedSpatialModelV1[] = [];
  for (const model of candidates.values()) {
    const owner = tileMap.get(tileId(model.ownerTile));
    if (owner === undefined || !owner.spatialModels.some(({ instanceId }) =>
      instanceId === model.instanceId)) {
      throw new Error(`Spatial model ${model.instanceId} is missing its canonical owner`);
    }
    models.push(Object.freeze({ instance: model, clipBounds: bounds, clipPlanes }));
  }
  models.sort((left, right) => left.instance.instanceId.localeCompare(right.instance.instanceId));
  return Object.freeze({
    schemaVersion: WORLD_ATLAS_SCHEMA_VERSION,
    destination: options.destination,
    clipBounds: bounds,
    requiredTiles,
    terrain: Object.freeze({ positions, indices }),
    fluid: Object.freeze({
      positions: hasFluid ? fluidPositions : new Float32Array(0),
      indices: hasFluid ? indices.slice() : new Uint32Array(0),
    }),
    models: Object.freeze(models),
  });
}

/** Resource categories in required deterministic eviction order. */
export type WorldResourceCategory =
  | "far-detail"
  | "mid-distance"
  | "local-zone"
  | "tile-descriptor"
  | "model";

/** Caller-owned resident resource accounted against CPU/GPU hard limits. */
export interface WorldResidentResource {
  readonly id: string;
  readonly category: WorldResourceCategory;
  readonly cpuBytes: number;
  readonly gpuBytes: number;
  readonly distanceM: number;
  readonly pinned?: boolean;
  readonly referenceCount?: number;
  readonly dispose: () => void;
}

/** Immutable residency metrics for diagnostics and acceptance tests. */
export interface WorldResidencySnapshot {
  readonly budget: WorldResidencyBudget;
  readonly cpuBytes: number;
  readonly gpuBytes: number;
  readonly resourceCount: number;
  readonly inFlightGenerationJobs: number;
}

interface ResidentEntry extends WorldResidentResource {
  readonly sequence: number;
  disposed: boolean;
  pinned: boolean;
  referenceCount: number;
}

const EVICTION_ORDER: Readonly<Record<WorldResourceCategory, number>> = Object.freeze({
  "far-detail": 0,
  "mid-distance": 1,
  "local-zone": 2,
  "tile-descriptor": 3,
  model: 4,
});

/** Hard-budget resource coordinator with deterministic exact-once disposal. */
export class WorldResourceResidencyManager {
  readonly #budget: WorldResidencyBudget;
  readonly #resources = new Map<string, ResidentEntry>();
  readonly #generationJobs = new Set<string>();
  #cpuBytes = 0;
  #gpuBytes = 0;
  #sequence = 0;

  public constructor(budget: WorldResidencyBudget) {
    if (
      budget.maxCpuBytes <= 0 ||
      budget.maxGpuBytes <= 0 ||
      !Number.isInteger(budget.maxGenerationJobs) ||
      budget.maxGenerationJobs <= 0
    ) {
      throw new Error("World residency budget limits must be positive");
    }
    this.#budget = Object.freeze({ ...budget });
  }

  public has(id: string): boolean {
    return this.#resources.has(id);
  }

  public upsert(resource: WorldResidentResource): readonly string[] {
    if (resource.id.length === 0) throw new Error("Resource id is required");
    for (const [value, name] of [
      [resource.cpuBytes, "cpuBytes"],
      [resource.gpuBytes, "gpuBytes"],
      [resource.distanceM, "distanceM"],
    ] as const) {
      assertFinite(value, name);
      if (value < 0) throw new Error(`${name} must be non-negative`);
    }
    assertNonNegativeInteger(resource.referenceCount ?? 0, "referenceCount");
    const existing = this.#resources.get(resource.id);
    if (existing !== undefined) this.#evictEntry(existing);
    const entry: ResidentEntry = {
      ...resource,
      sequence: this.#sequence,
      disposed: false,
      pinned: resource.pinned ?? false,
      referenceCount: resource.referenceCount ?? 0,
    };
    this.#sequence += 1;
    this.#resources.set(entry.id, entry);
    this.#cpuBytes += entry.cpuBytes;
    this.#gpuBytes += entry.gpuBytes;
    const evicted = this.#enforceBudget();
    if (this.#overBudget()) {
      const inserted = this.#resources.get(entry.id);
      if (inserted !== undefined) this.#evictEntry(inserted);
      throw new Error("Pinned or referenced resources exceed the residency budget");
    }
    return Object.freeze(evicted);
  }

  public pin(id: string, pinned = true): void {
    const entry = this.#required(id);
    entry.pinned = pinned;
  }

  public retain(id: string): number {
    const entry = this.#required(id);
    entry.referenceCount += 1;
    return entry.referenceCount;
  }

  public release(id: string): number {
    const entry = this.#required(id);
    if (entry.referenceCount === 0) {
      throw new Error(`Resource ${id} has no retained references`);
    }
    entry.referenceCount -= 1;
    return entry.referenceCount;
  }

  public remove(id: string): boolean {
    const entry = this.#resources.get(id);
    if (entry === undefined) return false;
    this.#evictEntry(entry);
    return true;
  }

  public tryBeginGeneration(id: string): boolean {
    if (id.length === 0) throw new Error("Generation job id is required");
    if (this.#generationJobs.has(id)) return true;
    if (this.#generationJobs.size >= this.#budget.maxGenerationJobs) return false;
    this.#generationJobs.add(id);
    return true;
  }

  public endGeneration(id: string): boolean {
    return this.#generationJobs.delete(id);
  }

  public snapshot(): WorldResidencySnapshot {
    return Object.freeze({
      budget: this.#budget,
      cpuBytes: this.#cpuBytes,
      gpuBytes: this.#gpuBytes,
      resourceCount: this.#resources.size,
      inFlightGenerationJobs: this.#generationJobs.size,
    });
  }

  #required(id: string): ResidentEntry {
    const entry = this.#resources.get(id);
    if (entry === undefined) throw new Error(`Unknown resident resource ${id}`);
    return entry;
  }

  #overBudget(): boolean {
    return this.#cpuBytes > this.#budget.maxCpuBytes ||
      this.#gpuBytes > this.#budget.maxGpuBytes;
  }

  #enforceBudget(): string[] {
    const evicted: string[] = [];
    while (this.#overBudget()) {
      const candidate = [...this.#resources.values()]
        .filter((entry) => !entry.pinned && entry.referenceCount === 0)
        .sort((left, right) =>
          EVICTION_ORDER[left.category] - EVICTION_ORDER[right.category] ||
          right.distanceM - left.distanceM ||
          left.sequence - right.sequence)[0];
      if (candidate === undefined) break;
      evicted.push(candidate.id);
      this.#evictEntry(candidate);
    }
    return evicted;
  }

  #evictEntry(entry: ResidentEntry): void {
    if (!this.#resources.delete(entry.id)) return;
    this.#cpuBytes -= entry.cpuBytes;
    this.#gpuBytes -= entry.gpuBytes;
    if (!entry.disposed) {
      entry.disposed = true;
      entry.dispose();
    }
  }
}
