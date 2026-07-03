import {
  ClimateBands,
  VoxelMaterial,
  VoxelMaterialLabel,
  applyVoxelEditJournal,
  buildVoxelCollisionMesh,
  buildVoxelRenderSurfaces,
  createVoxelFluidSimulationInputs,
  createVoxelEditJournal,
  materializeVoxelChunk,
} from "../src/voxels.ts";
import "./styles.css";

const root = document.getElementById("app");
if (!root) {
  throw new Error("World generator demo root element was not found.");
}

const materialColors = new Map([
  [VoxelMaterial.Air, "#101820"],
  [VoxelMaterial.Soil, "#6f5638"],
  [VoxelMaterial.Grass, "#4f8f43"],
  [VoxelMaterial.LeafLitter, "#6b4f28"],
  [VoxelMaterial.Roots, "#51391f"],
  [VoxelMaterial.Rock, "#727577"],
  [VoxelMaterial.Gravel, "#8c8a83"],
  [VoxelMaterial.Sand, "#d6bd77"],
  [VoxelMaterial.Clay, "#a65f3d"],
  [VoxelMaterial.Mud, "#514032"],
  [VoxelMaterial.Moss, "#446735"],
  [VoxelMaterial.Water, "#246aa3"],
  [VoxelMaterial.Ice, "#9ed5de"],
  [VoxelMaterial.Snowpack, "#e7edf0"],
  [VoxelMaterial.Basalt, "#2d3033"],
  [VoxelMaterial.Ash, "#6a665f"],
  [VoxelMaterial.Lava, "#e44824"],
  [VoxelMaterial.Crystal, "#71d8d0"],
  [VoxelMaterial.Sludge, "#3e4b2d"],
  [VoxelMaterial.Cobble, "#77716a"],
  [VoxelMaterial.Road, "#4e4a43"],
  [VoxelMaterial.Ore, "#b98c43"],
]);

const decorationGlyphs = new Map([
  ["tree", "♣"],
  ["shrub", "•"],
  ["grass", "〃"],
  ["reed", "∥"],
  ["flower", "✦"],
  ["fallen-log", "━"],
  ["rock", "●"],
  ["boulder", "⬢"],
  ["snow-patch", "◇"],
  ["water-ripple", "≈"],
  ["lava-crack", "∿"],
  ["steam-vent", "⌁"],
  ["fungi", "◐"],
  ["crystal", "◆"],
]);

const spec = Object.freeze({ sizeX: 32, sizeY: 32, sizeZ: 32, voxelSize: 1 });
const state = {
  seed: 20260702,
  climate: "temperate",
  tool: "mine",
  debug: "materials",
  lod: "live",
  showWorld: true,
  showDecorative: true,
  edits: [],
  chunk: null,
  mesh: null,
  renderSurfaces: null,
  fluidInputs: null,
  collider: null,
  decorations: null,
};

root.innerHTML = `
  <main class="shell">
    <header class="toolbar">
      <div>
        <p class="eyebrow">@plasius/gpu-world-generator</p>
        <h1>Voxel World Generator</h1>
      </div>
      <div class="metrics" id="metrics"></div>
    </header>
    <section class="workbench">
      <aside class="controls" aria-label="Voxel world controls">
        <label>
          <span>Climate</span>
          <select id="climate"></select>
        </label>
        <label>
          <span>Seed</span>
          <input id="seed" type="number" min="1" max="4294967295" step="1" />
        </label>
        <label>
          <span>Tool</span>
          <select id="tool">
            <option value="mine">Mine</option>
            <option value="sinkhole">Sinkhole</option>
            <option value="volcano">Volcano</option>
            <option value="water">Water</option>
            <option value="crystal">Crystal</option>
          </select>
        </label>
        <label>
          <span>View</span>
          <select id="debug">
            <option value="materials">Materials</option>
            <option value="density">Density</option>
            <option value="height">Height</option>
          </select>
        </label>
        <label>
          <span>LOD</span>
          <select id="lod">
            <option value="live">Live</option>
            <option value="proxy">Proxy</option>
            <option value="horizon">Horizon</option>
          </select>
        </label>
        <label class="check">
          <input id="showWorld" type="checkbox" />
          <span>World</span>
        </label>
        <label class="check">
          <input id="showDecorative" type="checkbox" />
          <span>Decorative</span>
        </label>
        <button class="button" id="reset" type="button">Reset</button>
      </aside>
      <div class="canvas-wrap">
        <canvas id="world" width="1280" height="760"></canvas>
        <div class="legend" id="legend"></div>
      </div>
    </section>
  </main>
`;

const climateInput = document.getElementById("climate");
const seedInput = document.getElementById("seed");
const toolInput = document.getElementById("tool");
const debugInput = document.getElementById("debug");
const lodInput = document.getElementById("lod");
const showWorldInput = document.getElementById("showWorld");
const showDecorativeInput = document.getElementById("showDecorative");
const resetButton = document.getElementById("reset");
const metrics = document.getElementById("metrics");
const legend = document.getElementById("legend");
const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

for (const climate of ClimateBands) {
  const option = document.createElement("option");
  option.value = climate;
  option.textContent = climate.replaceAll("-", " ");
  climateInput.append(option);
}

function syncControls() {
  climateInput.value = state.climate;
  seedInput.value = String(state.seed);
  toolInput.value = state.tool;
  debugInput.value = state.debug;
  lodInput.value = state.lod;
  showWorldInput.checked = state.showWorld;
  showDecorativeInput.checked = state.showDecorative;
}

function regenerate() {
  const base = materializeVoxelChunk({
    key: { seed: state.seed >>> 0, cx: 0, cy: 0, cz: 0 },
    spec,
    climate: state.climate,
  });
  const journal = createVoxelEditJournal(base.key, state.edits);
  const edited = applyVoxelEditJournal(base, journal);
  state.chunk = edited.chunk;
  state.renderSurfaces = buildVoxelRenderSurfaces(edited.chunk, { journals: [journal], maxInstances: 420 });
  state.fluidInputs = createVoxelFluidSimulationInputs(edited.chunk, { journals: [journal] });
  state.mesh = state.renderSurfaces.terrain;
  state.collider = buildVoxelCollisionMesh(edited.chunk);
  state.decorations = state.renderSurfaces.decorations;
  draw();
}

function surfaceSamples() {
  const samples = [];
  const { chunk } = state;
  const { sizeX, sizeY, sizeZ } = chunk.spec;
  for (let z = 0; z < sizeZ; z += 1) {
    for (let x = 0; x < sizeX; x += 1) {
      let material = VoxelMaterial.Air;
      let density = -1;
      let y = 0;
      for (let yy = sizeY - 1; yy >= 0; yy -= 1) {
        const index = x + sizeX * (z + sizeZ * yy);
        const candidate = chunk.materials[index];
        if (
          candidate !== VoxelMaterial.Air &&
          candidate !== VoxelMaterial.Water &&
          candidate !== VoxelMaterial.Lava &&
          candidate !== VoxelMaterial.Sludge
        ) {
          material = candidate;
          density = chunk.density[index];
          y = yy;
          break;
        }
      }
      if (material !== VoxelMaterial.Air) {
        samples.push({ x, y, z, top: y + 1, material, density });
      }
    }
  }
  return samples;
}

function shadeColor(hex, amount) {
  const value = Number.parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (value >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((value >> 8) & 255) + amount));
  const b = Math.max(0, Math.min(255, (value & 255) + amount));
  return `rgb(${r}, ${g}, ${b})`;
}

function project(x, y, z) {
  const scale = state.lod === "horizon" ? 11 : state.lod === "proxy" ? 15 : 19;
  const originX = canvas.width * 0.5;
  const originY = 96;
  return {
    x: originX + (x - z) * scale,
    y: originY + (x + z) * scale * 0.48 - y * scale * 0.42,
    scale,
  };
}

function projectCorner(corner) {
  return project(corner[0] - spec.sizeX / 2, corner[1], corner[2] - spec.sizeZ / 2);
}

function materialColor(material, y, density = 0) {
  let color = materialColors.get(material) ?? "#ff00ff";
  if (state.debug === "density") {
    const t = Math.max(0, Math.min(1, (density + 2) / 8));
    color = `rgb(${Math.round(30 + t * 200)}, ${Math.round(40 + t * 160)}, ${Math.round(60 + t * 100)})`;
  } else if (state.debug === "height") {
    const t = y / spec.sizeY;
    color = `rgb(${Math.round(40 + t * 190)}, ${Math.round(70 + t * 130)}, ${Math.round(85 + t * 90)})`;
  }
  return color;
}

function shaded(color, amount) {
  return color.startsWith("#") ? shadeColor(color, amount) : color;
}

function drawFace(corners, color, stroke = "rgba(16, 24, 32, 0.2)") {
  const points = corners.map(projectCorner);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index].x, points[index].y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawDecorations() {
  const instances = state.decorations?.instances ?? [];
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const instance of instances) {
    if (instance.category === "world" && !state.showWorld) continue;
    if (instance.category === "decorative" && !state.showDecorative) continue;
    const p = project(
      instance.position[0] - spec.sizeX / 2,
      instance.position[1],
      instance.position[2] - spec.sizeZ / 2
    );
    const glyph = decorationGlyphs.get(instance.family) ?? "•";
    ctx.font = `${Math.max(11, p.scale * (instance.family === "tree" ? 1.15 : 0.85))}px system-ui`;
    ctx.fillStyle = instance.category === "world" ? "rgba(32, 28, 24, 0.82)" : "rgba(10, 40, 20, 0.82)";
    ctx.fillText(glyph, p.x, p.y - Math.min(34, instance.height * p.scale * 0.22));
  }
}

function vertexAt(index) {
  const offset = index * 3;
  return [
    state.mesh.positions[offset],
    state.mesh.positions[offset + 1],
    state.mesh.positions[offset + 2],
  ];
}

function normalAt(index) {
  const offset = index * 3;
  return [
    state.mesh.normals[offset],
    state.mesh.normals[offset + 1],
    state.mesh.normals[offset + 2],
  ];
}

function drawMeshSurface() {
  const triangles = [];
  for (let index = 0; index < state.mesh.indices.length; index += 3) {
    const ia = state.mesh.indices[index];
    const ib = state.mesh.indices[index + 1];
    const ic = state.mesh.indices[index + 2];
    const a = vertexAt(ia);
    const b = vertexAt(ib);
    const c = vertexAt(ic);
    const na = normalAt(ia);
    const nb = normalAt(ib);
    const nc = normalAt(ic);
    const normalY = (na[1] + nb[1] + nc[1]) / 3;
    const averageY = (a[1] + b[1] + c[1]) / 3;
    const material = state.mesh.vertexMaterials[ia] ?? VoxelMaterial.Rock;
    triangles.push({
      corners: [a, b, c],
      material,
      averageY,
      normalY,
      depth: (a[0] + b[0] + c[0] + a[2] + b[2] + c[2]) / 3 - averageY * 0.18,
    });
  }
  triangles.sort((a, b) => a.depth - b.depth);
  for (const triangle of triangles) {
    const light = Math.round(18 + triangle.normalY * 34 + (triangle.averageY - 12) * 2);
    drawFace(
      triangle.corners,
      shaded(materialColor(triangle.material, triangle.averageY, triangle.normalY * 4), light),
      "rgba(16, 24, 32, 0.12)"
    );
  }
}

function drawFluidSurfaces() {
  const fluidSurfaces = state.renderSurfaces?.fluids ?? [];
  const triangles = [];
  for (const surface of fluidSurfaces) {
    if (surface.indices.length === 0) continue;
    for (let index = 0; index < surface.indices.length; index += 3) {
      const ia = surface.indices[index] * 3;
      const ib = surface.indices[index + 1] * 3;
      const ic = surface.indices[index + 2] * 3;
      const a = [surface.positions[ia], surface.positions[ia + 1], surface.positions[ia + 2]];
      const b = [surface.positions[ib], surface.positions[ib + 1], surface.positions[ib + 2]];
      const c = [surface.positions[ic], surface.positions[ic + 1], surface.positions[ic + 2]];
      const averageY = (a[1] + b[1] + c[1]) / 3;
      triangles.push({
        corners: [a, b, c],
        material: surface.material,
        averageY,
        depth: (a[0] + b[0] + c[0] + a[2] + b[2] + c[2]) / 3 - averageY * 0.2,
      });
    }
  }
  triangles.sort((a, b) => a.depth - b.depth);
  for (const triangle of triangles) {
    const color =
      triangle.material === "lava"
        ? "rgba(244, 72, 28, 0.78)"
        : triangle.material === "sludge"
          ? "rgba(54, 70, 36, 0.72)"
          : "rgba(56, 132, 180, 0.58)";
    drawFace(triangle.corners, color, triangle.material === "lava" ? "rgba(255, 192, 88, 0.35)" : "rgba(214, 238, 246, 0.28)");
  }
}

function draw() {
  if (!ctx || !state.chunk) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#d7e6ee");
  gradient.addColorStop(0.55, "#aab9b4");
  gradient.addColorStop(1, "#263033");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawMeshSurface();
  drawFluidSurfaces();
  drawDecorations();
  const materials = new Map();
  for (const value of state.chunk.materials) {
    if (value === VoxelMaterial.Air) continue;
    materials.set(value, (materials.get(value) ?? 0) + 1);
  }
  const fluidVolumes = state.fluidInputs?.fluidVolumes ?? [];
  const fluidCells = fluidVolumes
    .map((volume) => [
      volume.material,
      Array.from(volume.volumeFraction).filter((value) => value > 0).length,
    ])
    .filter(([, count]) => count > 0);
  const materialEntries = [...materials.entries()]
    .filter(([material]) => material !== VoxelMaterial.Water && material !== VoxelMaterial.Lava && material !== VoxelMaterial.Sludge)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);
  legend.replaceChildren(
    ...materialEntries.map(([material]) => {
      const item = document.createElement("span");
      item.className = "swatch";
      item.style.background = materialColors.get(material);
      item.textContent = VoxelMaterialLabel[material];
      return item;
    })
  );
  metrics.textContent = `${state.climate.replaceAll("-", " ")} · ${state.mesh.indices.length / 3} terrain tris · ${
    state.renderSurfaces.fluids.reduce((sum, surface) => sum + surface.indices.length / 3, 0)
  } fluid tris · ${
    state.collider.exposedFaceCount
  } collider faces · ${fluidCells.length} active fluids · ${state.decorations.instances.length} props · ${state.edits.length} edits`;
}

function canvasToWorld(event) {
  const rect = canvas.getBoundingClientRect();
  const sx = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const sy = ((event.clientY - rect.top) / rect.height) * canvas.height;
  let best = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const sample of surfaceSamples()) {
    const p = project(sample.x + 0.5 - spec.sizeX / 2, sample.top, sample.z + 0.5 - spec.sizeZ / 2);
    const distance = Math.hypot(sx - p.x, sy - p.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = sample;
    }
  }
  if (!best) return [16, 10, 16];
  return [best.x + 0.5, best.y + 0.5, best.z + 0.5];
}

canvas.addEventListener("pointerdown", (event) => {
  const center = canvasToWorld(event);
  const id = `${state.tool}-${state.edits.length + 1}`;
  if (state.tool === "mine") {
    state.edits.push({ id, kind: "subtractBrush", brush: { center, radius: 3.2, strength: 1 } });
  } else if (state.tool === "sinkhole") {
    state.edits.push({ id, kind: "collapseSinkhole", brush: { center, radius: 4.2, strength: 1 }, collapseDepth: 5 });
  } else if (state.tool === "volcano") {
    state.edits.push({ id, kind: "volcanicDeposit", brush: { center, radius: 4.2, strength: 1 }, heat: 1 });
  } else if (state.tool === "water") {
    state.edits.push({
      id,
      kind: "addMaterialBrush",
      material: VoxelMaterial.Water,
      density: 0.2,
      brush: { center, radius: 3.2, strength: 1 },
    });
  } else if (state.tool === "crystal") {
    state.edits.push({
      id,
      kind: "replaceMaterialBrush",
      material: VoxelMaterial.Crystal,
      density: 1.5,
      brush: { center, radius: 2.6, strength: 1 },
    });
  }
  regenerate();
});

climateInput.addEventListener("change", () => {
  state.climate = climateInput.value;
  state.edits = [];
  regenerate();
});
seedInput.addEventListener("change", () => {
  state.seed = Number(seedInput.value) >>> 0;
  state.edits = [];
  regenerate();
});
toolInput.addEventListener("change", () => {
  state.tool = toolInput.value;
});
debugInput.addEventListener("change", () => {
  state.debug = debugInput.value;
  draw();
});
lodInput.addEventListener("change", () => {
  state.lod = lodInput.value;
  draw();
});
showWorldInput.addEventListener("change", () => {
  state.showWorld = showWorldInput.checked;
  draw();
});
showDecorativeInput.addEventListener("change", () => {
  state.showDecorative = showDecorativeInput.checked;
  draw();
});
resetButton.addEventListener("click", () => {
  state.edits = [];
  regenerate();
});

syncControls();
regenerate();
