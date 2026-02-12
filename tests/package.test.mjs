import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
);

test("package metadata exposes published entry points", () => {
  assert.equal(pkg.name, "@plasius/gpu-world-generator");
  assert.ok(pkg.exports["."], "root export must be present");
  assert.ok(pkg.exports["./terrain.wgsl"], "terrain shader export must be present");
  assert.ok(pkg.exports["./field.wgsl"], "field shader export must be present");
  assert.ok(
    pkg.exports["./fractal-prepass.wgsl"],
    "fractal prepass shader export must be present"
  );
});
