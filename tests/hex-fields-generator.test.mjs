import assert from "node:assert/strict";
import test from "node:test";
import {
  MicroFeature,
  SlopeBand,
  SurfaceCover,
  axialToWorld,
  buildHexLevels,
  classifySlopeBand,
  defaultFieldParams,
  encodeTerrainParams,
  generateHexGrid,
  hexAreaFromSide,
  hexSideFromArea,
  packHexCells,
  sampleFieldStack,
  unpackTerrain,
} from "../dist/index.js";

function approx(actual, expected, epsilon = 1e-6) {
  return Math.abs(actual - expected) <= epsilon;
}

test("hex geometry helpers round-trip area and side length", () => {
  const side = 12.5;
  const area = hexAreaFromSide(side);
  const restored = hexSideFromArea(area);
  assert.ok(approx(restored, side), `expected ${restored} ~= ${side}`);
});

test("generateHexGrid uses canonical hex cell count", () => {
  const radius = 2;
  const level = 3;
  const cells = generateHexGrid(radius, level);
  assert.equal(cells.length, 3 * radius * (radius + 1) + 1);
  assert.ok(cells.every((cell) => cell.level === level));
});

test("buildHexLevels produces descending level specs", () => {
  const levels = buildHexLevels({ topAreaKm2: 2, minAreaM2: 8, levels: 4 });
  assert.equal(levels.length, 4);
  assert.equal(levels[0].level, 0);
  for (let i = 1; i < levels.length; i += 1) {
    assert.ok(levels[i].areaM2 < levels[i - 1].areaM2);
  }
  for (const spec of levels) {
    assert.ok(approx(spec.acrossFlatsMeters, spec.sideMeters * Math.sqrt(3)));
  }
});

test("axialToWorld maps axial hex coordinates", () => {
  const world = axialToWorld(2, -1, 5);
  assert.ok(approx(world.x, 12.99038105676658));
  assert.ok(approx(world.y, -7.5));
});

test("classifySlopeBand handles threshold boundaries", () => {
  assert.equal(classifySlopeBand(0.1999), SlopeBand.Downward);
  assert.equal(classifySlopeBand(0.2), SlopeBand.Flat);
  assert.equal(classifySlopeBand(0.7999), SlopeBand.Flat);
  assert.equal(classifySlopeBand(0.8), SlopeBand.Upward);
});

test("sampleFieldStack is deterministic and returns bounded channels", () => {
  const params = defaultFieldParams(99);
  const a = sampleFieldStack(1.25, -2.75, params);
  const b = sampleFieldStack(1.25, -2.75, params);
  assert.deepEqual(a, b);

  assert.ok(Number.isFinite(a.height));
  assert.ok(a.cumulativeHeight >= 0 && a.cumulativeHeight <= 1);
  assert.ok(a.heat >= 0 && a.heat <= 1);
  assert.ok(a.moisture >= 0 && a.moisture <= 1);
  assert.ok(a.roughness >= 0 && a.roughness <= 1);
  assert.ok(a.rockiness >= 0 && a.rockiness <= 1);
  assert.ok(a.water >= 0 && a.water <= 1);
  assert.ok(a.featureMask >= 0 && a.featureMask <= 1);
  assert.ok(a.obstacleMask >= 0 && a.obstacleMask <= 1);
  assert.ok(a.foliageMask >= 0 && a.foliageMask <= 1);
  assert.ok([SlopeBand.Downward, SlopeBand.Flat, SlopeBand.Upward].includes(a.slopeBand));
});

test("packHexCells flattens q/r/level/flags in order", () => {
  const packed = packHexCells([
    { q: 1, r: -2, level: 4, flags: 7 },
    { q: -3, r: 5, level: 6 },
  ]);
  assert.deepEqual(Array.from(packed), [1, -2, 4, 7, -3, 5, 6, 0]);
});

test("encodeTerrainParams writes seed, count, and optional defaults", () => {
  const encoded = encodeTerrainParams({ seed: 7, cellCount: 24, heatBias: 0.3 });
  const u32 = new Uint32Array(encoded);
  const f32 = new Float32Array(encoded);
  assert.equal(u32[0], 7);
  assert.equal(u32[1], 24);
  assert.ok(approx(f32[2], 0.3));
  assert.ok(approx(f32[3], 1));
  assert.ok(approx(f32[14], 0.8));
});

test("unpackTerrain supports legacy and expanded layouts", () => {
  const legacyBuffer = new ArrayBuffer(2 * 4 * 4);
  const legacyF32 = new Float32Array(legacyBuffer);
  const legacyU32 = new Uint32Array(legacyBuffer);
  legacyF32[0] = 0.1;
  legacyF32[1] = 0.2;
  legacyF32[2] = 0.3;
  legacyU32[3] = 5;
  legacyF32[4] = 0.4;
  legacyF32[5] = 0.5;
  legacyF32[6] = 0.6;
  legacyU32[7] = 8;
  const legacyCells = unpackTerrain(legacyBuffer);
  assert.equal(legacyCells.length, 2);
  assert.equal(legacyCells[0].biome, 5);
  assert.equal(legacyCells[1].biome, 8);
  assert.equal(legacyCells[0].surface, undefined);

  const expandedBuffer = new ArrayBuffer(2 * 8 * 4);
  const expandedF32 = new Float32Array(expandedBuffer);
  const expandedU32 = new Uint32Array(expandedBuffer);

  expandedF32[0] = 0.12;
  expandedF32[1] = 0.22;
  expandedF32[2] = 0.32;
  expandedU32[3] = 1;
  expandedU32[4] = SurfaceCover.Grass;
  expandedU32[5] = MicroFeature.Tree;
  expandedF32[6] = 0.42;
  expandedU32[7] = SlopeBand.Flat;

  expandedF32[8] = 0.52;
  expandedF32[9] = 0.62;
  expandedF32[10] = 0.72;
  expandedU32[11] = 2;
  expandedU32[12] = SurfaceCover.Sludge + 1;
  expandedU32[13] = MicroFeature.Flower + 1;
  expandedF32[14] = Number.NaN;
  expandedU32[15] = SlopeBand.Upward + 1;

  const expandedCells = unpackTerrain(expandedBuffer);
  assert.equal(expandedCells.length, 2);
  assert.equal(expandedCells[0].surface, SurfaceCover.Grass);
  assert.equal(expandedCells[0].feature, MicroFeature.Tree);
  assert.equal(expandedCells[0].slopeBand, SlopeBand.Flat);
  assert.equal(expandedCells[1].surface, undefined);
  assert.equal(expandedCells[1].feature, undefined);
  assert.equal(expandedCells[1].slopeBand, undefined);
});
