import {
  ORIGIN_SHARD_ATLAS_SPEC,
  WORLD_ATLAS_COUNTS,
  WORLD_ATLAS_SCHEMA_VERSION,
  normalizeWorldTileKey,
  type WorldAtlasAssetReferenceV1,
  type WorldAtlasBakeOptions,
  type WorldAtlasBakePlan,
  type WorldAtlasBakeResult,
  type WorldAtlasDiagnostics,
  type WorldAtlasManifestV1,
  type WorldTileIndexEntryV1,
  type WorldTileKey,
} from "./world-atlas-contracts";
import { encodeWorldTile, sha256Hex } from "./world-atlas-codec";
import {
  createWorldAtlasOverview,
  generateWorldAtlasMacroGrid,
  worldTileFromMacroGrid,
} from "./world-atlas-generation";

/** Curated seed used by the first origin-shard atlas revision. */
export const ORIGIN_SHARD_ATLAS_SEED = 0x4f524947 as const;

/** Default immutable atlas revision used by v1 consumers. */
export const ORIGIN_SHARD_ATLAS_REVISION =
  "origin-shard-2026-07-v1" as const;

/** Options that select a deterministic immutable atlas identity. */
export interface CreateWorldAtlasBakePlanOptions {
  readonly seed?: number;
  readonly atlasRevision?: string;
  readonly generatorVersion?: string;
}

const TOKEN_PATTERN = /^[a-z0-9][a-z0-9._-]{0,127}$/u;

function assertToken(value: string, name: string): void {
  if (!TOKEN_PATTERN.test(value)) {
    throw new Error(`${name} must be a bounded lowercase token`);
  }
}

function tileKeyString(key: WorldTileKey): string {
  return `${key.tx}:${key.tz}`;
}

function stableJsonBytes(value: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(value));
}

function assetPath(
  plan: WorldAtlasBakePlan,
  suffix: string,
): string {
  return `worlds/${plan.worldId}/${plan.atlasRevision}/${suffix}`;
}

/** Create the immutable, complete 5,000-tile bake plan for origin-shard. */
export function createWorldAtlasBakePlan(
  options: CreateWorldAtlasBakePlanOptions = {},
): WorldAtlasBakePlan {
  const seed = options.seed ?? ORIGIN_SHARD_ATLAS_SEED;
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) {
    throw new Error("seed must be an unsigned 32-bit integer");
  }
  const atlasRevision =
    options.atlasRevision ?? ORIGIN_SHARD_ATLAS_REVISION;
  const generatorVersion = options.generatorVersion ?? "0.0.26";
  assertToken(atlasRevision, "atlasRevision");
  assertToken(generatorVersion, "generatorVersion");

  const tileKeys: WorldTileKey[] = [];
  for (let tz = 0; tz < WORLD_ATLAS_COUNTS.tilesZ; tz += 1) {
    for (let tx = 0; tx < WORLD_ATLAS_COUNTS.tilesX; tx += 1) {
      tileKeys.push(Object.freeze({ tx, tz }));
    }
  }
  return Object.freeze({
    schemaVersion: WORLD_ATLAS_SCHEMA_VERSION,
    worldId: ORIGIN_SHARD_ATLAS_SPEC.worldId,
    atlasRevision,
    generatorVersion,
    seed,
    spec: ORIGIN_SHARD_ATLAS_SPEC,
    tileKeys: Object.freeze(tileKeys),
  });
}

function normalizeSelection(
  plan: WorldAtlasBakePlan,
  selection: readonly WorldTileKey[] | undefined,
): readonly WorldTileKey[] {
  if (selection === undefined) return plan.tileKeys;
  if (selection.length === 0 || selection.length > plan.tileKeys.length) {
    throw new Error("tileKeys selection must contain between 1 and 5,000 tiles");
  }
  const seen = new Set<string>();
  return Object.freeze(
    selection.map((candidate) => {
      const key = normalizeWorldTileKey(candidate);
      const id = tileKeyString(key);
      if (seen.has(id)) {
        throw new Error(`Duplicate tile key ${id} in bake selection`);
      }
      seen.add(id);
      return key;
    }).sort((left, right) => left.tz - right.tz || left.tx - right.tx),
  );
}

function assertSupportedBakePlan(plan: WorldAtlasBakePlan): void {
  if (
    plan.schemaVersion !== WORLD_ATLAS_SCHEMA_VERSION ||
    plan.worldId !== ORIGIN_SHARD_ATLAS_SPEC.worldId ||
    plan.tileKeys.length !== WORLD_ATLAS_COUNTS.tileCount
  ) {
    throw new Error("World atlas bake plan is not a supported complete v1 plan");
  }
  if (!Number.isInteger(plan.seed) || plan.seed < 0 || plan.seed > 0xffffffff) {
    throw new Error("World atlas bake plan seed must be an unsigned 32-bit integer");
  }
  assertToken(plan.atlasRevision, "atlasRevision");
  assertToken(plan.generatorVersion, "generatorVersion");
  for (const [name, expected] of Object.entries(ORIGIN_SHARD_ATLAS_SPEC)) {
    if (plan.spec[name as keyof typeof plan.spec] !== expected) {
      throw new Error(`World atlas bake plan spec.${name} does not match v1`);
    }
  }
  for (let index = 0; index < plan.tileKeys.length; index += 1) {
    const expectedTx = index % WORLD_ATLAS_COUNTS.tilesX;
    const expectedTz = Math.floor(index / WORLD_ATLAS_COUNTS.tilesX);
    const key = plan.tileKeys[index]!;
    if (key.tx !== expectedTx || key.tz !== expectedTz) {
      throw new Error(
        `World atlas bake plan tile key ${index} is not canonical row-major order`,
      );
    }
  }
}

/** Assert the curated shipped-seed coverage and hydrology invariants. */
export function assertWorldAtlasQualification(
  diagnostics: WorldAtlasDiagnostics,
): void {
  if (
    diagnostics.oceanCoverage < 0.4 ||
    diagnostics.oceanCoverage > 0.5
  ) {
    throw new Error("Shipped atlas ocean coverage must remain between 40% and 50%");
  }
  if (
    Math.abs(diagnostics.mountainCoverage - diagnostics.oceanCoverage) > 0.1
  ) {
    throw new Error(
      "Shipped atlas mountain coverage must remain within ten percentage points of ocean coverage",
    );
  }
  if (
    diagnostics.flowCycleCount !== 0 ||
    diagnostics.invalidDrainageTerminationCount !== 0
  ) {
    throw new Error("Shipped atlas drainage invariants failed");
  }
}

async function createJsonAssetReference(
  plan: WorldAtlasBakePlan,
  assetName: string,
  bytes: Uint8Array,
): Promise<WorldAtlasAssetReferenceV1> {
  const contentHash = await sha256Hex(bytes);
  return Object.freeze({
    path: assetPath(plan, `${assetName}.${contentHash}.v1.json`),
    contentHash,
    byteLength: bytes.byteLength,
    contentType: "application/json",
  });
}

/**
 * Bake a complete atlas or a resumable tile selection.
 *
 * A partial result deliberately omits the publishable manifest. Callers may use
 * partial bakes for distributed/resumable work, but only a complete result may
 * become the current atlas revision.
 */
export async function bakeWorldAtlas(
  plan: WorldAtlasBakePlan,
  options: WorldAtlasBakeOptions = {},
): Promise<WorldAtlasBakeResult> {
  assertSupportedBakePlan(plan);
  const selectedKeys = normalizeSelection(plan, options.tileKeys);
  const complete = selectedKeys.length === WORLD_ATLAS_COUNTS.tileCount;
  const grid = generateWorldAtlasMacroGrid(plan);
  const qualificationRequired =
    plan.seed === ORIGIN_SHARD_ATLAS_SEED ||
    options.requireQualification === true;
  if (complete && qualificationRequired) {
    assertWorldAtlasQualification(grid.diagnostics);
  }
  const overview = createWorldAtlasOverview(grid);
  const tileIndex: WorldTileIndexEntryV1[] = [];

  for (const key of selectedKeys) {
    const tile = worldTileFromMacroGrid(plan, grid, key);
    const binary = encodeWorldTile(tile);
    const contentHash = await sha256Hex(binary);
    const path = assetPath(plan, `tiles/${key.tx}-${key.tz}.${contentHash}.pwat`);
    const output = Object.freeze({ key, tile, binary, contentHash, path });
    tileIndex.push(
      Object.freeze({
        key,
        path,
        contentHash,
        byteLength: binary.byteLength,
      }),
    );
    await options.writeTile?.(output);
  }

  const overviewBytes = stableJsonBytes(overview);
  const tileIndexBytes = stableJsonBytes(tileIndex);
  const overviewReference = await createJsonAssetReference(
    plan,
    "overview",
    overviewBytes,
  );
  const tileIndexReference = await createJsonAssetReference(
    plan,
    "tile-index",
    tileIndexBytes,
  );
  if (complete) {
    await options.writeOverview?.(overviewBytes, overviewReference);
    await options.writeTileIndex?.(tileIndexBytes, tileIndexReference);
  }

  const checksum = await sha256Hex(
    stableJsonBytes({
      schemaVersion: WORLD_ATLAS_SCHEMA_VERSION,
      worldId: plan.worldId,
      atlasRevision: plan.atlasRevision,
      generatorVersion: plan.generatorVersion,
      seed: plan.seed,
      spec: plan.spec,
      diagnostics: grid.diagnostics,
      overviewHash: overviewReference.contentHash,
      tileIndexHash: tileIndexReference.contentHash,
    }),
  );
  let manifest: WorldAtlasManifestV1 | undefined;
  if (complete) {
    manifest = Object.freeze({
      schemaVersion: WORLD_ATLAS_SCHEMA_VERSION,
      worldId: plan.worldId,
      atlasRevision: plan.atlasRevision,
      generatorVersion: plan.generatorVersion,
      seed: plan.seed,
      spec: plan.spec,
      tileCount: WORLD_ATLAS_COUNTS.tileCount,
      overview: overviewReference,
      tileIndex: tileIndexReference,
      atlasChecksum: checksum,
    });
    await options.writeManifest?.(manifest);
  }

  return Object.freeze({
    complete,
    ...(manifest ? { manifest } : {}),
    overview,
    tileIndex: Object.freeze(tileIndex),
    diagnostics: grid.diagnostics,
    checksum,
  });
}

export * from "./world-atlas-contracts";
export * from "./world-atlas-codec";
export * from "./world-atlas-generation";
