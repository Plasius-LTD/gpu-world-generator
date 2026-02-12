import assert from "node:assert/strict";
import test from "node:test";
import {
  TileCache,
  normalizeTileKey,
  tileAssetFileStem,
  tileBoundsWorld,
  tileKeyFromWorldPosition,
  tileKeyToString,
} from "../dist/index.js";

function createAssetForKey(key) {
  return {
    key,
    gridSize: 1,
    heightScale: 1,
    height: new Float32Array([0, 0.1, 0.2, 0.3]),
  };
}

test("tile key helpers normalize and derive paths/bounds", () => {
  const normalized = normalizeTileKey({
    seed: -1,
    tx: 1.9,
    tz: -2.2,
    level: -3,
    tileSizeWorld: 32.1234,
  });
  assert.equal(normalized.seed, 0xffffffff);
  assert.equal(normalized.tx, 1);
  assert.equal(normalized.tz, -2);
  assert.equal(normalized.level, 0);
  assert.equal(normalized.tileSizeWorld, 32.1234);
  assert.equal(tileKeyToString(normalized), "4294967295:0:1:-2:32.123");
  assert.equal(
    tileAssetFileStem(normalized),
    "tile-4294967295-0-1--2-ts32.123"
  );

  const bounds = tileBoundsWorld({ seed: 1, tx: 2, tz: -1, level: 0, tileSizeWorld: 10 });
  assert.deepEqual(bounds, {
    minX: 20,
    minZ: -10,
    maxX: 30,
    maxZ: 0,
    centerX: 25,
    centerZ: -5,
    size: 10,
  });

  const fromWorld = tileKeyFromWorldPosition({
    seed: 7,
    x: 129.9,
    z: -0.1,
    level: 4,
    tileSizeWorld: 64,
  });
  assert.deepEqual(fromWorld, {
    seed: 7,
    tx: 2,
    tz: -1,
    level: 4,
    tileSizeWorld: 64,
  });
});

test("TileCache deduplicates inflight generation and serves cached entries", async () => {
  let now = 1000;
  let calls = 0;
  const cache = new TileCache({
    now: () => now,
    maxEntries: 4,
    maxBytes: 1024 * 1024,
  });
  const key = { seed: 1, tx: 0, tz: 0, level: 0 };

  const generator = async (normalizedKey) => {
    calls += 1;
    await new Promise((resolve) => setTimeout(resolve, 5));
    return createAssetForKey(normalizedKey);
  };

  const first = cache.getOrCreate(key, generator);
  const second = cache.getOrCreate({ ...key }, generator);
  const [ready] = await Promise.all([first, second]);
  assert.equal(ready.status, "ready");
  assert.equal(calls, 1);

  now += 15;
  const cached = await cache.getOrCreate(key, generator);
  assert.equal(cached.status, "ready");
  assert.equal(calls, 1);

  const stats = cache.getStats();
  assert.equal(stats.entries, 1);
  assert.equal(stats.inflight, 0);
  assert.ok(stats.bytes > 0);
});

test("TileCache keeps retention options and evicts oldest ready entries", async () => {
  const evicted = [];
  let tick = 0;
  const cache = new TileCache({
    maxEntries: 1,
    maxBytes: 1024 * 1024,
    keepBinary: false,
    keepJson: false,
    now: () => ++tick,
    onEvict(entry) {
      evicted.push(tileKeyToString(entry.key));
    },
  });

  const keyA = { seed: 3, tx: 0, tz: 0, level: 0 };
  const keyB = { seed: 3, tx: 1, tz: 0, level: 0 };

  await cache.getOrCreate(keyA, async (key) => createAssetForKey(key));
  await cache.getOrCreate(keyB, async (key) => createAssetForKey(key));

  assert.equal(cache.getStats().entries, 1);
  assert.equal(evicted.length, 1);
  assert.equal(evicted[0], tileKeyToString(keyA));

  const remaining = cache.get(keyB);
  assert.equal(remaining?.status, "ready");
  assert.equal(remaining?.payload, undefined);
  assert.equal(remaining?.binary, undefined);
});

test("TileCache stores errors and supports explicit delete", async () => {
  const cache = new TileCache();
  const key = { seed: 9, tx: 0, tz: 0, level: 0 };
  const failed = await cache.getOrCreate(key, async () => {
    throw new Error("generation failed");
  });
  assert.equal(failed.status, "error");
  assert.match(String(failed.error), /generation failed/);
  assert.equal(cache.delete(key), true);
  assert.equal(cache.delete(key), false);
});
