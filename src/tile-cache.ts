import type { TileAsset, TileAssetPayload, TileBakeWriter, TileKey } from "./tiles";
import { bakeTileAsset } from "./tiles";

export type TileCacheStatus = "pending" | "ready" | "error";

export interface TileCacheEntry {
  key: TileKey;
  status: TileCacheStatus;
  asset?: TileAsset;
  payload?: TileAssetPayload;
  binary?: ArrayBuffer;
  bytes: number;
  lastAccess: number;
  error?: unknown;
}

export type TileGenerator = (key: TileKey) => TileAsset | Promise<TileAsset>;

export interface TileCacheOptions {
  maxEntries?: number;
  maxBytes?: number;
  keepBinary?: boolean;
  keepJson?: boolean;
  writer?: TileBakeWriter;
  now?: () => number;
  onEvict?: (entry: TileCacheEntry) => void;
}

export const DEFAULT_TILE_SIZE_WORLD = 64;

export function normalizeTileKey(key: TileKey): TileKey {
  const tileSizeWorld =
    key.tileSizeWorld !== undefined && Number.isFinite(key.tileSizeWorld)
      ? Number(key.tileSizeWorld)
      : undefined;
  return {
    seed: key.seed >>> 0,
    tx: Math.trunc(key.tx),
    tz: Math.trunc(key.tz),
    level: Math.max(0, Math.trunc(key.level)),
    tileSizeWorld,
  };
}

export function tileKeyToString(key: TileKey): string {
  const normalized = normalizeTileKey(key);
  const tileSize =
    normalized.tileSizeWorld === undefined
      ? "default"
      : normalized.tileSizeWorld.toFixed(3);
  return [
    normalized.seed,
    normalized.level,
    normalized.tx,
    normalized.tz,
    tileSize,
  ].join(":");
}

export function resolveTileSizeWorld(
  key: TileKey,
  defaultTileSizeWorld = DEFAULT_TILE_SIZE_WORLD
) {
  return key.tileSizeWorld ?? defaultTileSizeWorld;
}

export function tileBoundsWorld(
  key: TileKey,
  defaultTileSizeWorld = DEFAULT_TILE_SIZE_WORLD
) {
  const size = resolveTileSizeWorld(key, defaultTileSizeWorld);
  const minX = key.tx * size;
  const minZ = key.tz * size;
  return {
    minX,
    minZ,
    maxX: minX + size,
    maxZ: minZ + size,
    centerX: minX + size * 0.5,
    centerZ: minZ + size * 0.5,
    size,
  };
}

export function tileKeyFromWorldPosition(options: {
  seed: number;
  x: number;
  z: number;
  level?: number;
  tileSizeWorld?: number;
  defaultTileSizeWorld?: number;
}): TileKey {
  const size =
    options.tileSizeWorld ?? options.defaultTileSizeWorld ?? DEFAULT_TILE_SIZE_WORLD;
  const tx = Math.floor(options.x / size);
  const tz = Math.floor(options.z / size);
  return {
    seed: options.seed,
    tx,
    tz,
    level: options.level ?? 0,
    tileSizeWorld: options.tileSizeWorld,
  };
}

export function tileAssetFileStem(key: TileKey): string {
  const normalized = normalizeTileKey(key);
  const suffix =
    normalized.tileSizeWorld === undefined
      ? ""
      : `-ts${normalized.tileSizeWorld.toFixed(3)}`;
  return `tile-${normalized.seed}-${normalized.level}-${normalized.tx}-${normalized.tz}${suffix}`;
}

function estimateAssetBytes(asset: TileAsset, payload?: TileAssetPayload, binary?: ArrayBuffer) {
  let bytes = asset.height.length * 4;
  if (asset.fields) bytes += asset.fields.length * 4;
  if (asset.materials) bytes += asset.materials.length;
  if (asset.features) bytes += asset.features.length * 4;
  if (binary) bytes += binary.byteLength;
  if (payload) {
    // Rough estimate of JSON footprint to help eviction logic.
    bytes += payload.height.length * 4;
  }
  return bytes;
}

export class TileCache {
  private entries = new Map<string, TileCacheEntry>();
  private inflight = new Map<string, Promise<TileCacheEntry>>();
  private totalBytes = 0;
  private options: Required<Omit<TileCacheOptions, "writer">> & {
    writer?: TileBakeWriter;
  };

  constructor(options: TileCacheOptions = {}) {
    this.options = {
      maxEntries: options.maxEntries ?? 128,
      maxBytes: options.maxBytes ?? 128 * 1024 * 1024,
      keepBinary: options.keepBinary ?? true,
      keepJson: options.keepJson ?? true,
      writer: options.writer,
      now: options.now ?? (() => Date.now()),
      onEvict: options.onEvict ?? (() => {}),
    };
  }

  getStats() {
    return {
      entries: this.entries.size,
      bytes: this.totalBytes,
      inflight: this.inflight.size,
    };
  }

  has(key: TileKey) {
    return this.entries.has(tileKeyToString(key));
  }

  get(key: TileKey): TileCacheEntry | undefined {
    const id = tileKeyToString(key);
    const entry = this.entries.get(id);
    if (entry) {
      entry.lastAccess = this.options.now();
    }
    return entry;
  }

  async getOrCreate(key: TileKey, generator: TileGenerator): Promise<TileCacheEntry> {
    const normalized = normalizeTileKey(key);
    const id = tileKeyToString(normalized);
    const cached = this.entries.get(id);
    if (cached && cached.status === "ready") {
      cached.lastAccess = this.options.now();
      return cached;
    }
    const inflight = this.inflight.get(id);
    if (inflight) {
      return inflight;
    }

    const entry: TileCacheEntry = {
      key: normalized,
      status: "pending",
      bytes: 0,
      lastAccess: this.options.now(),
    };
    this.entries.set(id, entry);

    const promise = (async () => {
      try {
        const asset = await generator(normalized);
        const baked = await bakeTileAsset(asset, this.options.writer);

        const payload = this.options.keepJson ? baked.payload : undefined;
        const binary = this.options.keepBinary ? baked.binary : undefined;
        const bytes = estimateAssetBytes(asset, payload, binary);

        const ready: TileCacheEntry = {
          key: normalized,
          status: "ready",
          asset,
          payload,
          binary,
          bytes,
          lastAccess: this.options.now(),
        };
        this.replaceEntry(id, ready);
        this.inflight.delete(id);
        this.evictIfNeeded();
        return ready;
      } catch (error) {
        const failed: TileCacheEntry = {
          key: normalized,
          status: "error",
          bytes: 0,
          lastAccess: this.options.now(),
          error,
        };
        this.replaceEntry(id, failed);
        this.inflight.delete(id);
        return failed;
      }
    })();

    this.inflight.set(id, promise);
    return promise;
  }

  delete(key: TileKey) {
    const id = tileKeyToString(key);
    const entry = this.entries.get(id);
    if (!entry) return false;
    this.entries.delete(id);
    this.totalBytes -= entry.bytes;
    this.options.onEvict(entry);
    return true;
  }

  private replaceEntry(id: string, entry: TileCacheEntry) {
    const existing = this.entries.get(id);
    if (existing) {
      this.totalBytes -= existing.bytes;
    }
    this.entries.set(id, entry);
    this.totalBytes += entry.bytes;
  }

  private evictIfNeeded() {
    const { maxEntries, maxBytes } = this.options;
    while (this.entries.size > maxEntries || this.totalBytes > maxBytes) {
      let oldestId: string | null = null;
      let oldestTime = Infinity;
      for (const [id, entry] of this.entries) {
        if (entry.status !== "ready") continue;
        if (entry.lastAccess < oldestTime) {
          oldestTime = entry.lastAccess;
          oldestId = id;
        }
      }
      if (!oldestId) {
        break;
      }
      const entry = this.entries.get(oldestId);
      if (entry) {
        this.entries.delete(oldestId);
        this.totalBytes -= entry.bytes;
        this.options.onEvict(entry);
      } else {
        break;
      }
    }
  }
}
