import assert from "node:assert/strict";
import test from "node:test";
import {
  SlopeBand,
  computeNormal,
  createMeshBuilder,
  createPerfMonitor,
  generateTemperateMixedForest,
  normalize,
  shade,
} from "../dist/index.js";

function approx(actual, expected, epsilon = 1e-6) {
  return Math.abs(actual - expected) <= epsilon;
}

test("createPerfMonitor adjusts budget based on sustained misses", () => {
  const monitor = createPerfMonitor({
    targetFps: 60,
    tolerance: 2,
    sampleSize: 10,
    minSampleFraction: 0.5,
    cooldownMs: 0,
    qualitySlew: 0.1,
    initialBudget: 0.8,
  });

  for (let i = 0; i < 10; i += 1) {
    monitor.sampleFps(40);
  }
  const dropped = monitor.update(1000);
  assert.equal(dropped.adjusted, true);
  assert.ok(dropped.budget < 0.8);

  monitor.resetSamples();
  for (let i = 0; i < 10; i += 1) {
    monitor.sampleFrame(1 / 120);
  }
  const raised = monitor.update(2000);
  assert.equal(raised.adjusted, true);
  assert.ok(raised.budget > dropped.budget);

  monitor.setBudget(-2);
  assert.equal(monitor.getBudget(), 0);
  monitor.setBudget(2);
  assert.equal(monitor.getBudget(), 1);

  monitor.setAuto(false);
  const manual = monitor.update(3000);
  assert.equal(manual.stable, true);
  assert.equal(manual.medianFps, null);
  assert.equal(manual.miss, null);
});

test("mesh builder emits vertices, bounds, and tree meshes", () => {
  const unit = normalize([0, 0, 0]);
  assert.deepEqual(unit, [0, 1, 0]);
  const normal = computeNormal([0, 0, 0], [1, 0, 0], [0, 0, 1]);
  assert.ok(approx(Math.hypot(normal[0], normal[1], normal[2]), 1));
  assert.deepEqual(shade([0.6, 0.5, 0.4], 0.5), [0.3, 0.25, 0.2]);

  const builder = createMeshBuilder({
    size: 2,
    includeGeomorph: true,
    defaultMaterial: 3,
    foliageMaterial: 9,
  });
  builder.addTriangle(
    [0, 0, 0],
    [1, 0, 0],
    [0, 0, 1],
    [0, 1, 0],
    [0.2, 0.3, 0.4],
    0.1,
    0.2,
    0.3,
    4,
    { targetY: 0.1, weight: 0.2 },
    { targetY: 0.2, weight: 0.3 },
    { targetY: 0.3, weight: 0.4 }
  );
  builder.addQuad(
    [0, 0, 0],
    [1, 0, 0],
    [1, 0, 1],
    [0, 0, 1],
    [0, 1, 0],
    [0.5, 0.6, 0.7]
  );
  builder.addTreeMesh([0, 0, 0], 0.2, 0.5, 7);
  builder.addBounds(
    [
      [-1, -0.25, -2],
      [1, 2.5, 2],
      [0, 0.1, 0],
    ],
    -0.5,
    3
  );

  assert.equal(builder.includeGeomorph, true);
  assert.equal(builder.vertexStride, 13);
  assert.equal(builder.vertices.length % builder.vertexStride, 0);
  assert.equal(builder.treeMeshCount, 1);
  assert.deepEqual(builder.boxMin, [-1, -0.5, -2, 0]);
  assert.deepEqual(builder.boxMax, [1, 3, 2, 0]);

  const materials = [];
  for (let i = 10; i < builder.vertices.length; i += builder.vertexStride) {
    materials.push(builder.vertices[i]);
  }
  assert.ok(materials.includes(7), "tree trunk material should exist");
  assert.ok(materials.includes(9), "foliage material should exist");

  const simple = createMeshBuilder();
  assert.equal(simple.vertexStride, 11);
});

test("temperate biome generation is deterministic and bounded", () => {
  const options = {
    seed: 12345,
    radius: 2,
    topAreaKm2: 4,
    minAreaM2: 10,
    levels: 4,
  };
  const a = generateTemperateMixedForest(options);
  const b = generateTemperateMixedForest(options);

  assert.equal(a.cells.length, b.cells.length);
  assert.equal(a.terrain.length, a.cells.length);
  assert.deepEqual(a.terrain, b.terrain);

  for (const cell of a.terrain) {
    assert.ok(cell.height >= 0 && cell.height <= 1);
    assert.ok(cell.heat >= 0 && cell.heat <= 1);
    assert.ok(cell.moisture >= 0 && cell.moisture <= 1);
    assert.ok(cell.obstacle === undefined || (cell.obstacle >= 0 && cell.obstacle <= 1));
    assert.ok(cell.foliage === undefined || (cell.foliage >= 0 && cell.foliage <= 1));
    assert.ok(
      cell.slopeBand === undefined ||
        [SlopeBand.Downward, SlopeBand.Flat, SlopeBand.Upward].includes(cell.slopeBand)
    );
  }
});
