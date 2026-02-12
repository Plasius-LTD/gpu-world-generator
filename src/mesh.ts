export type Vec3 = [number, number, number];

export type MeshGeomorph = {
  targetY: number;
  weight?: number;
};

export interface MeshBuilderOptions {
  size?: number;
  includeGeomorph?: boolean;
  defaultMaterial?: number;
  foliageMaterial?: number;
}

export interface MeshBuilder {
  vertices: number[];
  boxMin: number[];
  boxMax: number[];
  vertexStride: number;
  includeGeomorph: boolean;
  addTriangle: (
    a: Vec3,
    b: Vec3,
    c: Vec3,
    normal: Vec3,
    color: Vec3,
    swayA?: number,
    swayB?: number,
    swayC?: number,
    material?: number,
    morphA?: MeshGeomorph,
    morphB?: MeshGeomorph,
    morphC?: MeshGeomorph
  ) => void;
  addQuad: (
    a: Vec3,
    b: Vec3,
    c: Vec3,
    d: Vec3,
    normal: Vec3,
    color: Vec3,
    swayA?: number,
    swayB?: number,
    swayC?: number,
    swayD?: number,
    material?: number,
    morphA?: MeshGeomorph,
    morphB?: MeshGeomorph,
    morphC?: MeshGeomorph,
    morphD?: MeshGeomorph
  ) => void;
  addTreeMesh: (center: Vec3, baseHeight: number, seedValue: number, material?: number) => void;
  addBounds: (points: Vec3[], minY?: number, maxYOverride?: number) => void;
  readonly treeMeshCount: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalize(vec: Vec3): Vec3 {
  const len = Math.hypot(vec[0], vec[1], vec[2]);
  if (len === 0) return [0, 1, 0];
  return [vec[0] / len, vec[1] / len, vec[2] / len];
}

export function computeNormal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  const ab: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const ac: Vec3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  return normalize([
    ab[1] * ac[2] - ab[2] * ac[1],
    ab[2] * ac[0] - ab[0] * ac[2],
    ab[0] * ac[1] - ab[1] * ac[0],
  ]);
}

export function shade(color: Vec3, factor: number): Vec3 {
  return [color[0] * factor, color[1] * factor, color[2] * factor];
}

export function createMeshBuilder(sizeOrOptions: number | MeshBuilderOptions = 1): MeshBuilder {
  const options: MeshBuilderOptions =
    typeof sizeOrOptions === "number" ? { size: sizeOrOptions } : sizeOrOptions;
  const size = options.size ?? 1;
  const includeGeomorph = options.includeGeomorph ?? false;
  const defaultMaterial = options.defaultMaterial ?? 0;
  const foliageMaterial = options.foliageMaterial ?? defaultMaterial;
  const vertices: number[] = [];
  const boxMin: number[] = [];
  const boxMax: number[] = [];
  let treeMeshCount = 0;

  const vertexStride = includeGeomorph ? 13 : 11;

  const pushVertex = (
    pos: Vec3,
    normal: Vec3,
    color: Vec3,
    sway = 0,
    material = defaultMaterial,
    geomorph?: MeshGeomorph
  ) => {
    vertices.push(
      pos[0],
      pos[1],
      pos[2],
      normal[0],
      normal[1],
      normal[2],
      color[0],
      color[1],
      color[2],
      sway,
      material
    );
    if (includeGeomorph) {
      const targetY = geomorph?.targetY ?? pos[1];
      const weight = geomorph?.weight ?? 0;
      vertices.push(targetY, weight);
    }
  };

  const addTriangle = (
    a: Vec3,
    b: Vec3,
    c: Vec3,
    normal: Vec3,
    color: Vec3,
    swayA = 0,
    swayB = swayA,
    swayC = swayA,
    material = defaultMaterial,
    morphA?: MeshGeomorph,
    morphB?: MeshGeomorph,
    morphC?: MeshGeomorph
  ) => {
    pushVertex(a, normal, color, swayA, material, morphA);
    pushVertex(b, normal, color, swayB, material, morphB);
    pushVertex(c, normal, color, swayC, material, morphC);
  };

  const addQuad = (
    a: Vec3,
    b: Vec3,
    c: Vec3,
    d: Vec3,
    normal: Vec3,
    color: Vec3,
    swayA = 0,
    swayB = swayA,
    swayC = swayA,
    swayD = swayA,
    material = defaultMaterial,
    morphA?: MeshGeomorph,
    morphB?: MeshGeomorph,
    morphC?: MeshGeomorph,
    morphD?: MeshGeomorph
  ) => {
    addTriangle(a, b, c, normal, color, swayA, swayB, swayC, material, morphA, morphB, morphC);
    addTriangle(c, d, a, normal, color, swayC, swayD, swayA, material, morphC, morphD, morphA);
  };

  const addPrism = (
    center: Vec3,
    radius: number,
    bottom: number,
    height: number,
    color: Vec3,
    swayBase = 0,
    swayScale = 0,
    material = defaultMaterial
  ) => {
    const top: Vec3[] = [];
    const base: Vec3[] = [];
    const baseY = center[1] + bottom;
    const topY = baseY + height;
    const safeHeight = Math.max(height, 0.001);
    const swayFor = (y: number) => swayBase + swayScale * clamp((y - baseY) / safeHeight, 0, 1);
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      const x = center[0] + radius * Math.cos(angle);
      const z = center[2] + radius * Math.sin(angle);
      top.push([x, topY, z]);
      base.push([x, baseY, z]);
    }
    const topCenter: Vec3 = [center[0], topY, center[2]];
    const topSway = swayFor(topY);
    for (let i = 0; i < 6; i += 1) {
      const a = topCenter;
      const b = top[i];
      const c = top[(i + 1) % 6];
      const normal = computeNormal(a, b, c);
      addTriangle(a, b, c, normal, color, topSway, topSway, topSway, material);
    }
    for (let i = 0; i < 6; i += 1) {
      const top0 = top[i];
      const top1 = top[(i + 1) % 6];
      const bottom0 = base[i];
      const bottom1 = base[(i + 1) % 6];
      const normal = computeNormal(top0, bottom0, bottom1);
      const swayTop0 = swayFor(top0[1]);
      const swayTop1 = swayFor(top1[1]);
      const swayBottom0 = swayFor(bottom0[1]);
      const swayBottom1 = swayFor(bottom1[1]);
      addQuad(
        top0,
        bottom0,
        bottom1,
        top1,
        normal,
        shade(color, 0.85),
        swayTop0,
        swayBottom0,
        swayBottom1,
        swayTop1,
        material
      );
    }
  };

  const addTreeMesh = (
    center: Vec3,
    baseHeight: number,
    seedValue: number,
    material = defaultMaterial
  ) => {
    const trunkRadius = size * (0.12 + seedValue * 0.05);
    const trunkHeight = 0.5 + seedValue * 0.6;
    const canopyRadius = size * (0.36 + seedValue * 0.18);
    const canopyHeight = 0.6 + seedValue * 0.4;
    const trunkColor: Vec3 = [0.28, 0.18, 0.1];
    const leafColor: Vec3 = [0.18, 0.45, 0.2];

    addPrism(center, trunkRadius, baseHeight, trunkHeight, trunkColor, 0.02, 0.28, material);
    addPrism(
      [center[0], baseHeight + trunkHeight * 0.7, center[2]],
      canopyRadius,
      0,
      canopyHeight * 0.55,
      leafColor,
      0.12,
      0.9,
      foliageMaterial
    );
    addPrism(
      [center[0], baseHeight + trunkHeight + canopyHeight * 0.1, center[2]],
      canopyRadius * 0.7,
      0,
      canopyHeight * 0.35,
      shade(leafColor, 0.95),
      0.2,
      1.1,
      foliageMaterial
    );
    treeMeshCount += 1;
  };

  const addBounds = (points: Vec3[], minY = 0, maxYOverride?: number) => {
    const xs = points.map((p) => p[0]);
    const zs = points.map((p) => p[2]);
    const ys = points.map((p) => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    const maxY = typeof maxYOverride === "number" ? maxYOverride : Math.max(...ys);
    boxMin.push(minX, minY, minZ, 0);
    boxMax.push(maxX, maxY, maxZ, 0);
  };

  return {
    vertices,
    boxMin,
    boxMax,
    vertexStride,
    includeGeomorph,
    addTriangle,
    addQuad,
    addTreeMesh,
    addBounds,
    get treeMeshCount() {
      return treeMeshCount;
    },
  };
}
