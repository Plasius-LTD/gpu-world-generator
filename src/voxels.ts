export const VOXEL_WORLD_FEATURE_FLAG = "gpu-world-generator.voxel-world.enabled";

export const WORLD_GENERATOR_COORDINATE_CONVENTION = Object.freeze({
  groundPlane: "xz",
  upAxis: "y",
  up: Object.freeze([0, 1, 0] as const),
  handedness: "right-handed",
});

export const VoxelMaterial = {
  Air: 0,
  Soil: 1,
  Grass: 2,
  LeafLitter: 3,
  Roots: 4,
  Rock: 5,
  Gravel: 6,
  Sand: 7,
  Clay: 8,
  Mud: 9,
  Moss: 10,
  Water: 11,
  Ice: 12,
  Snowpack: 13,
  Basalt: 14,
  Ash: 15,
  Lava: 16,
  Crystal: 17,
  Sludge: 18,
  Cobble: 19,
  Road: 20,
  Ore: 21,
} as const;

export type VoxelMaterialId = (typeof VoxelMaterial)[keyof typeof VoxelMaterial];

export const VoxelMaterialLabel: Record<VoxelMaterialId, string> = {
  [VoxelMaterial.Air]: "air",
  [VoxelMaterial.Soil]: "soil",
  [VoxelMaterial.Grass]: "grass",
  [VoxelMaterial.LeafLitter]: "leaf-litter",
  [VoxelMaterial.Roots]: "roots",
  [VoxelMaterial.Rock]: "rock",
  [VoxelMaterial.Gravel]: "gravel",
  [VoxelMaterial.Sand]: "sand",
  [VoxelMaterial.Clay]: "clay",
  [VoxelMaterial.Mud]: "mud",
  [VoxelMaterial.Moss]: "moss",
  [VoxelMaterial.Water]: "water",
  [VoxelMaterial.Ice]: "ice",
  [VoxelMaterial.Snowpack]: "snowpack",
  [VoxelMaterial.Basalt]: "basalt",
  [VoxelMaterial.Ash]: "ash",
  [VoxelMaterial.Lava]: "lava",
  [VoxelMaterial.Crystal]: "crystal",
  [VoxelMaterial.Sludge]: "sludge",
  [VoxelMaterial.Cobble]: "cobble",
  [VoxelMaterial.Road]: "road",
  [VoxelMaterial.Ore]: "ore",
};

export const VoxelMaterialIds = Object.freeze(
  Object.values(VoxelMaterial).filter((value): value is VoxelMaterialId => typeof value === "number")
);

export type ClimateBand =
  | "polar"
  | "cold-temperate"
  | "temperate"
  | "arid"
  | "tropical"
  | "alpine"
  | "volcanic"
  | "freshwater"
  | "coastal"
  | "urban"
  | "underground";

export const ClimateBands = Object.freeze([
  "polar",
  "cold-temperate",
  "temperate",
  "arid",
  "tropical",
  "alpine",
  "volcanic",
  "freshwater",
  "coastal",
  "urban",
  "underground",
] as const);

export interface SubBiomeProfile {
  readonly id: string;
  readonly label: string;
  readonly surfaceMaterials: readonly VoxelMaterialId[];
  readonly decorativeFamilies: readonly WorldDecorationFamily[];
}

export interface WorldBiomeProfile {
  readonly climate: ClimateBand;
  readonly label: string;
  readonly surfaceMaterials: readonly VoxelMaterialId[];
  readonly subsurfaceMaterials: readonly VoxelMaterialId[];
  readonly liquidMaterials: readonly VoxelMaterialId[];
  readonly decorativeFamilies: readonly WorldDecorationFamily[];
  readonly subBiomes: readonly SubBiomeProfile[];
}

export interface VoxelChunkKey {
  readonly seed: number;
  readonly cx: number;
  readonly cy: number;
  readonly cz: number;
}

export interface VoxelChunkSpec {
  readonly sizeX: number;
  readonly sizeY: number;
  readonly sizeZ: number;
  readonly voxelSize: number;
}

export interface VoxelDensityField {
  readonly density: Float32Array;
  readonly materials: Uint16Array;
}

export interface VoxelResourceLayer {
  readonly material: VoxelMaterialId;
  readonly depthStartM: number;
  readonly depthEndM: number;
  readonly density: number;
  readonly rarity: number;
}

export interface VoxelChunk {
  readonly schemaVersion: 1;
  readonly key: VoxelChunkKey;
  readonly spec: VoxelChunkSpec;
  readonly climate: ClimateBand;
  readonly biome: WorldBiomeProfile;
  readonly density: Float32Array;
  readonly materials: Uint16Array;
  readonly fields: Float32Array;
  readonly fieldStride: typeof VOXEL_FIELD_STRIDE;
  readonly resources: readonly VoxelResourceLayer[];
  readonly bounds: Readonly<{
    min: readonly [number, number, number];
    max: readonly [number, number, number];
  }>;
  readonly coordinateConvention: typeof WORLD_GENERATOR_COORDINATE_CONVENTION;
}

export type VoxelBrushShape = "sphere" | "capsule" | "box";

export interface VoxelBrush {
  readonly center: readonly [number, number, number];
  readonly radius: number;
  readonly halfExtents?: readonly [number, number, number];
  readonly end?: readonly [number, number, number];
  readonly strength?: number;
  readonly shape?: VoxelBrushShape;
}

export type VoxelEdit =
  | {
      readonly id: string;
      readonly kind: "subtractBrush";
      readonly brush: VoxelBrush;
    }
  | {
      readonly id: string;
      readonly kind: "addMaterialBrush" | "replaceMaterialBrush";
      readonly material: VoxelMaterialId;
      readonly density?: number;
      readonly brush: VoxelBrush;
    }
  | {
      readonly id: string;
      readonly kind: "collapseSinkhole";
      readonly brush: VoxelBrush;
      readonly collapseDepth?: number;
    }
  | {
      readonly id: string;
      readonly kind: "volcanicDeposit";
      readonly brush: VoxelBrush;
      readonly heat?: number;
    };

export interface VoxelEditJournal {
  readonly schemaVersion: 1;
  readonly chunkKey: VoxelChunkKey;
  readonly edits: readonly VoxelEdit[];
}

export interface VoxelChunkDelta {
  readonly chunkKey: VoxelChunkKey;
  readonly dirtyMin: readonly [number, number, number];
  readonly dirtyMax: readonly [number, number, number];
  readonly editIds: readonly string[];
  readonly collapseEvents: readonly VoxelCollapseEvent[];
}

export interface VoxelCollapseEvent {
  readonly editId: string;
  readonly center: readonly [number, number, number];
  readonly radius: number;
  readonly depth: number;
}

export type WorldDecorationFamily =
  | "tree"
  | "shrub"
  | "grass"
  | "reed"
  | "flower"
  | "fallen-log"
  | "rock"
  | "boulder"
  | "snow-patch"
  | "water-ripple"
  | "lava-crack"
  | "steam-vent"
  | "fungi"
  | "crystal";

export interface WorldDecorationInstance {
  readonly id: string;
  readonly family: WorldDecorationFamily;
  readonly category: "world" | "decorative";
  readonly climate: ClimateBand;
  readonly position: readonly [number, number, number];
  readonly normal: readonly [number, number, number];
  readonly radius: number;
  readonly height: number;
  readonly material: VoxelMaterialId;
  readonly seed: number;
}

export interface WorldDecorationLayer {
  readonly schemaVersion: 1;
  readonly chunkKey: VoxelChunkKey;
  readonly climate: ClimateBand;
  readonly instances: readonly WorldDecorationInstance[];
}

export interface VoxelSurfaceMesh {
  readonly schemaVersion: 1;
  readonly algorithm: "surface-nets";
  readonly chunkKey: VoxelChunkKey;
  readonly sourceChunkIds: readonly string[];
  readonly coordinateConvention: typeof WORLD_GENERATOR_COORDINATE_CONVENTION;
  readonly positions: readonly number[];
  readonly normals: readonly number[];
  readonly indices: readonly number[];
  readonly materialIds: readonly string[];
  readonly vertexMaterials: readonly number[];
  readonly bounds: Readonly<{
    min: readonly [number, number, number];
    max: readonly [number, number, number];
  }>;
  readonly dirtyRegion: Readonly<{
    min: readonly [number, number, number];
    max: readonly [number, number, number];
  }>;
}

export interface VoxelCollisionMesh {
  readonly schemaVersion: 1;
  readonly algorithm: "voxel-block-collider";
  readonly chunkKey: VoxelChunkKey;
  readonly sourceChunkIds: readonly string[];
  readonly coordinateConvention: typeof WORLD_GENERATOR_COORDINATE_CONVENTION;
  readonly positions: readonly number[];
  readonly normals: readonly number[];
  readonly indices: readonly number[];
  readonly materialIds: readonly string[];
  readonly vertexMaterials: readonly number[];
  readonly solidVoxelCount: number;
  readonly exposedFaceCount: number;
  readonly bounds: Readonly<{
    min: readonly [number, number, number];
    max: readonly [number, number, number];
  }>;
  readonly dirtyRegion: Readonly<{
    min: readonly [number, number, number];
    max: readonly [number, number, number];
  }>;
}

export type VoxelFluidMaterialKind = "water" | "lava" | "sludge";

export interface VoxelRenderMaterialProfile {
  readonly id: string;
  readonly material: VoxelMaterialId;
  readonly class:
    | "terrain"
    | "snow"
    | "ice"
    | "crystal"
    | "constructed"
    | "resource";
  readonly baseColor: readonly [number, number, number, number];
  readonly roughness: number;
  readonly metallic: number;
  readonly wetnessResponse: number;
  readonly normalStrength: number;
}

export interface VoxelMaterialPalette {
  readonly schemaVersion: 1;
  readonly owner: "world-generator";
  readonly id: string;
  readonly terrainMaterials: readonly VoxelRenderMaterialProfile[];
  readonly fluidMaterialIds: Readonly<Record<VoxelFluidMaterialKind, string>>;
}

export interface VoxelFluidBoundaryField {
  readonly schemaVersion: 1;
  readonly owner: "fluid";
  readonly chunkKey: Readonly<{
    fluidBodyId: string;
    cx: number;
    cy: number;
    cz: number;
  }>;
  readonly sizeX: number;
  readonly sizeY: number;
  readonly sizeZ: number;
  readonly voxelSize: number;
  readonly solid: Uint8Array;
  readonly openBoundaryMask: number;
}

export interface VoxelFluidVolumeInput {
  readonly schemaVersion: 1;
  readonly owner: "fluid";
  readonly chunkKey: VoxelFluidBoundaryField["chunkKey"];
  readonly sizeX: number;
  readonly sizeY: number;
  readonly sizeZ: number;
  readonly voxelSize: number;
  readonly material: VoxelFluidMaterialKind;
  readonly volumeFraction: Float32Array;
  readonly pressure: Float32Array;
  readonly velocity: Float32Array;
  readonly temperatureKelvin: Float32Array;
  readonly foam: Float32Array;
}

export interface VoxelFluidSourceSinkInput {
  readonly id: string;
  readonly kind: "source" | "sink";
  readonly material: VoxelFluidMaterialKind;
  readonly center: readonly [number, number, number];
  readonly radius: number;
  readonly rate: number;
  readonly temperatureKelvin?: number;
}

export interface VoxelFluidSimulationInputs {
  readonly schemaVersion: 1;
  readonly owner: "world-generator";
  readonly boundary: VoxelFluidBoundaryField;
  readonly fluidVolumes: readonly VoxelFluidVolumeInput[];
  readonly sourceSinks: readonly VoxelFluidSourceSinkInput[];
  readonly dirtyChunkKeys: readonly VoxelChunkKey[];
}

export interface VoxelFluidSurfaceMesh {
  readonly schemaVersion: 1;
  readonly owner: "fluid";
  readonly chunkKey: VoxelFluidBoundaryField["chunkKey"];
  readonly material: VoxelFluidMaterialKind;
  readonly materialId: string;
  readonly positions: readonly number[];
  readonly normals: readonly number[];
  readonly indices: readonly number[];
  readonly foam: readonly number[];
  readonly bounds: Readonly<{
    min: readonly [number, number, number];
    max: readonly [number, number, number];
  }>;
}

export interface VoxelRenderSurfaces {
  readonly schemaVersion: 1;
  readonly owner: "world-generator";
  readonly chunkKey: VoxelChunkKey;
  readonly materialPalette: VoxelMaterialPalette;
  readonly terrain: VoxelSurfaceMesh;
  readonly fluids: readonly VoxelFluidSurfaceMesh[];
  readonly overlays: readonly WorldDecorationInstance[];
  readonly decorations: WorldDecorationLayer;
}

export interface VoxelMeshingField {
  readonly schemaVersion: 1;
  readonly chunkKey: VoxelChunkKey;
  readonly spec: VoxelChunkSpec;
  readonly climate: ClimateBand;
  readonly biome: WorldBiomeProfile;
  readonly halo: number;
  readonly latticeSizeX: number;
  readonly latticeSizeY: number;
  readonly latticeSizeZ: number;
  readonly density: Float32Array;
  readonly materials: Uint16Array;
  readonly bounds: Readonly<{
    min: readonly [number, number, number];
    max: readonly [number, number, number];
  }>;
  readonly coordinateConvention: typeof WORLD_GENERATOR_COORDINATE_CONVENTION;
}

export interface VoxelChunkNeighborhood {
  readonly center: VoxelChunk;
  readonly neighbors?: readonly VoxelChunk[];
  readonly journals?: readonly VoxelEditJournal[];
}

export interface MaterializeVoxelChunkOptions {
  readonly key: VoxelChunkKey;
  readonly spec?: Partial<VoxelChunkSpec>;
  readonly climate?: ClimateBand;
}

export interface BuildVoxelSurfaceMeshOptions {
  readonly includeLiquids?: boolean;
  readonly halo?: number;
  readonly neighborhood?: VoxelChunkNeighborhood;
  readonly journals?: readonly VoxelEditJournal[];
}

export interface MaterializeVoxelMeshingFieldOptions extends BuildVoxelSurfaceMeshOptions {
  readonly chunk: VoxelChunk;
}

export interface VoxelEditDirtyChunkSet {
  readonly chunkKeys: readonly VoxelChunkKey[];
  readonly halo: number;
}

export interface GenerateWorldDecorationsOptions {
  readonly maxInstances?: number;
}

export const DEFAULT_VOXEL_CHUNK_SPEC: VoxelChunkSpec = Object.freeze({
  sizeX: 32,
  sizeY: 32,
  sizeZ: 32,
  voxelSize: 1,
});

export const VOXEL_FIELD_STRIDE = 8;

const biomeProfiles: Readonly<Record<ClimateBand, WorldBiomeProfile>> = Object.freeze({
  polar: createBiomeProfile("polar", "Polar", {
    surface: [VoxelMaterial.Ice, VoxelMaterial.Snowpack, VoxelMaterial.Rock],
    subsurface: [VoxelMaterial.Ice, VoxelMaterial.Rock, VoxelMaterial.Gravel],
    liquids: [VoxelMaterial.Water, VoxelMaterial.Ice],
    decorations: ["snow-patch", "rock", "boulder"],
    subBiomes: [
      ["ice-cap", "Ice Cap", [VoxelMaterial.Ice, VoxelMaterial.Snowpack], ["snow-patch"]],
      ["frozen-sea", "Frozen Sea", [VoxelMaterial.Ice, VoxelMaterial.Water], ["water-ripple"]],
    ],
  }),
  "cold-temperate": createBiomeProfile("cold-temperate", "Cold Temperate", {
    surface: [VoxelMaterial.Snowpack, VoxelMaterial.Soil, VoxelMaterial.Grass, VoxelMaterial.Rock],
    subsurface: [VoxelMaterial.Soil, VoxelMaterial.Roots, VoxelMaterial.Rock],
    liquids: [VoxelMaterial.Water, VoxelMaterial.Ice],
    decorations: ["tree", "shrub", "grass", "fallen-log", "snow-patch", "rock"],
    subBiomes: [
      ["taiga", "Taiga", [VoxelMaterial.Snowpack, VoxelMaterial.Soil, VoxelMaterial.Rock], ["tree", "shrub"]],
      ["boreal-forest", "Boreal Forest", [VoxelMaterial.Soil, VoxelMaterial.Grass], ["tree", "grass"]],
    ],
  }),
  temperate: createBiomeProfile("temperate", "Temperate", {
    surface: [VoxelMaterial.Grass, VoxelMaterial.Soil, VoxelMaterial.LeafLitter, VoxelMaterial.Mud, VoxelMaterial.Water],
    subsurface: [VoxelMaterial.Soil, VoxelMaterial.Roots, VoxelMaterial.Rock, VoxelMaterial.Clay],
    liquids: [VoxelMaterial.Water],
    decorations: ["tree", "shrub", "grass", "reed", "flower", "fallen-log", "rock", "boulder", "water-ripple"],
    subBiomes: [
      ["mixed-forest", "Mixed Forest", [VoxelMaterial.Grass, VoxelMaterial.LeafLitter], ["tree", "shrub", "fallen-log"]],
      ["river-valley", "River Valley", [VoxelMaterial.Grass, VoxelMaterial.Mud, VoxelMaterial.Water], ["reed", "water-ripple"]],
    ],
  }),
  arid: createBiomeProfile("arid", "Arid", {
    surface: [VoxelMaterial.Sand, VoxelMaterial.Rock, VoxelMaterial.Gravel, VoxelMaterial.Clay],
    subsurface: [VoxelMaterial.Sand, VoxelMaterial.Clay, VoxelMaterial.Rock, VoxelMaterial.Ore],
    liquids: [VoxelMaterial.Water],
    decorations: ["shrub", "grass", "rock", "boulder"],
    subBiomes: [
      ["sandy-desert", "Sandy Desert", [VoxelMaterial.Sand, VoxelMaterial.Rock], ["shrub"]],
      ["badlands", "Badlands", [VoxelMaterial.Clay, VoxelMaterial.Rock], ["rock", "boulder"]],
    ],
  }),
  tropical: createBiomeProfile("tropical", "Tropical", {
    surface: [VoxelMaterial.Mud, VoxelMaterial.LeafLitter, VoxelMaterial.Grass, VoxelMaterial.Water],
    subsurface: [VoxelMaterial.Soil, VoxelMaterial.Roots, VoxelMaterial.Clay, VoxelMaterial.Rock],
    liquids: [VoxelMaterial.Water, VoxelMaterial.Sludge],
    decorations: ["tree", "shrub", "grass", "reed", "fallen-log", "fungi", "water-ripple"],
    subBiomes: [
      ["jungle", "Jungle", [VoxelMaterial.Mud, VoxelMaterial.LeafLitter], ["tree", "shrub", "fungi"]],
      ["swamp", "Swamp", [VoxelMaterial.Mud, VoxelMaterial.Water], ["reed", "water-ripple"]],
    ],
  }),
  alpine: createBiomeProfile("alpine", "Alpine", {
    surface: [VoxelMaterial.Rock, VoxelMaterial.Snowpack, VoxelMaterial.Gravel, VoxelMaterial.Grass],
    subsurface: [VoxelMaterial.Rock, VoxelMaterial.Ore, VoxelMaterial.Gravel],
    liquids: [VoxelMaterial.Water, VoxelMaterial.Ice],
    decorations: ["shrub", "grass", "rock", "boulder", "snow-patch"],
    subBiomes: [
      ["mountain-ridge", "Mountain Ridge", [VoxelMaterial.Rock, VoxelMaterial.Snowpack], ["boulder", "snow-patch"]],
      ["high-meadow", "High Meadow", [VoxelMaterial.Grass, VoxelMaterial.Rock], ["shrub", "grass"]],
    ],
  }),
  volcanic: createBiomeProfile("volcanic", "Volcanic", {
    surface: [VoxelMaterial.Basalt, VoxelMaterial.Ash, VoxelMaterial.Lava, VoxelMaterial.Rock],
    subsurface: [VoxelMaterial.Basalt, VoxelMaterial.Rock, VoxelMaterial.Ore, VoxelMaterial.Crystal],
    liquids: [VoxelMaterial.Lava, VoxelMaterial.Water],
    decorations: ["lava-crack", "steam-vent", "rock", "boulder"],
    subBiomes: [
      ["lava-field", "Lava Field", [VoxelMaterial.Basalt, VoxelMaterial.Ash, VoxelMaterial.Lava], ["lava-crack", "steam-vent"]],
      ["obsidian-ridge", "Obsidian Ridge", [VoxelMaterial.Basalt, VoxelMaterial.Ash], ["rock", "boulder"]],
    ],
  }),
  freshwater: createBiomeProfile("freshwater", "Freshwater", {
    surface: [VoxelMaterial.Water, VoxelMaterial.Mud, VoxelMaterial.Gravel, VoxelMaterial.Grass],
    subsurface: [VoxelMaterial.Mud, VoxelMaterial.Clay, VoxelMaterial.Gravel, VoxelMaterial.Rock],
    liquids: [VoxelMaterial.Water],
    decorations: ["reed", "shrub", "grass", "water-ripple", "rock"],
    subBiomes: [
      ["river", "River", [VoxelMaterial.Water, VoxelMaterial.Gravel, VoxelMaterial.Mud], ["reed", "water-ripple"]],
      ["wetland", "Wetland", [VoxelMaterial.Water, VoxelMaterial.Mud, VoxelMaterial.Grass], ["reed", "shrub"]],
    ],
  }),
  coastal: createBiomeProfile("coastal", "Coastal", {
    surface: [VoxelMaterial.Sand, VoxelMaterial.Gravel, VoxelMaterial.Mud, VoxelMaterial.Water, VoxelMaterial.Rock],
    subsurface: [VoxelMaterial.Sand, VoxelMaterial.Gravel, VoxelMaterial.Clay, VoxelMaterial.Rock],
    liquids: [VoxelMaterial.Water],
    decorations: ["reed", "shrub", "grass", "rock", "water-ripple", "fallen-log"],
    subBiomes: [
      ["beach", "Beach", [VoxelMaterial.Sand, VoxelMaterial.Gravel], ["fallen-log"]],
      ["estuary", "Estuary", [VoxelMaterial.Mud, VoxelMaterial.Water, VoxelMaterial.Sand], ["reed", "water-ripple"]],
    ],
  }),
  urban: createBiomeProfile("urban", "Urban", {
    surface: [VoxelMaterial.Cobble, VoxelMaterial.Road, VoxelMaterial.Soil, VoxelMaterial.Grass],
    subsurface: [VoxelMaterial.Soil, VoxelMaterial.Rock, VoxelMaterial.Clay],
    liquids: [VoxelMaterial.Water, VoxelMaterial.Sludge],
    decorations: ["shrub", "grass", "rock"],
    subBiomes: [
      ["city-core", "City Core", [VoxelMaterial.Cobble, VoxelMaterial.Road], ["rock"]],
      ["farmland", "Farmland", [VoxelMaterial.Soil, VoxelMaterial.Grass], ["grass", "shrub"]],
    ],
  }),
  underground: createBiomeProfile("underground", "Underground", {
    surface: [VoxelMaterial.Rock, VoxelMaterial.Gravel, VoxelMaterial.Mud, VoxelMaterial.Crystal, VoxelMaterial.Water],
    subsurface: [VoxelMaterial.Rock, VoxelMaterial.Ore, VoxelMaterial.Crystal, VoxelMaterial.Basalt],
    liquids: [VoxelMaterial.Water, VoxelMaterial.Lava, VoxelMaterial.Sludge],
    decorations: ["fungi", "crystal", "rock", "boulder", "water-ripple", "lava-crack"],
    subBiomes: [
      ["caverns", "Caverns", [VoxelMaterial.Rock, VoxelMaterial.Gravel, VoxelMaterial.Mud], ["fungi", "rock"]],
      ["crystal-caves", "Crystal Caves", [VoxelMaterial.Crystal, VoxelMaterial.Rock], ["crystal"]],
    ],
  }),
});

function createBiomeProfile(
  climate: ClimateBand,
  label: string,
  options: {
    surface: readonly VoxelMaterialId[];
    subsurface: readonly VoxelMaterialId[];
    liquids: readonly VoxelMaterialId[];
    decorations: readonly WorldDecorationFamily[];
    subBiomes: readonly (readonly [
      string,
      string,
      readonly VoxelMaterialId[],
      readonly WorldDecorationFamily[],
    ])[];
  }
): WorldBiomeProfile {
  return Object.freeze({
    climate,
    label,
    surfaceMaterials: Object.freeze([...options.surface]),
    subsurfaceMaterials: Object.freeze([...options.subsurface]),
    liquidMaterials: Object.freeze([...options.liquids]),
    decorativeFamilies: Object.freeze([...options.decorations]),
    subBiomes: Object.freeze(
      options.subBiomes.map(([id, subLabel, surfaceMaterials, decorativeFamilies]) =>
        Object.freeze({
          id,
          label: subLabel,
          surfaceMaterials: Object.freeze([...surfaceMaterials]),
          decorativeFamilies: Object.freeze([...decorativeFamilies]),
        })
      )
    ),
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clamp01(value: number) {
  return clamp(value, 0, 1);
}

function hash32(value: number) {
  let v = value >>> 0;
  v ^= v >>> 17;
  v = Math.imul(v, 0xed5ad4bb);
  v ^= v >>> 11;
  v = Math.imul(v, 0xac4c1b51);
  v ^= v >>> 15;
  v = Math.imul(v, 0x31848bab);
  v ^= v >>> 14;
  return v >>> 0;
}

function hash01(value: number) {
  return (hash32(value) & 0x00ffffff) / 16777216;
}

function hashPoint(seed: number, x: number, y: number, z: number, salt = 0) {
  return hash01(
    Math.imul(Math.floor(x), 73856093) ^
      Math.imul(Math.floor(y), 19349663) ^
      Math.imul(Math.floor(z), 83492791) ^
      seed ^
      salt
  );
}

function valueNoise(seed: number, x: number, y: number, z: number, scale: number, salt = 0) {
  const sx = x * scale;
  const sy = y * scale;
  const sz = z * scale;
  const x0 = Math.floor(sx);
  const y0 = Math.floor(sy);
  const z0 = Math.floor(sz);
  const tx = sx - x0;
  const ty = sy - y0;
  const tz = sz - z0;
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const ux = smooth(tx);
  const uy = smooth(ty);
  const uz = smooth(tz);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const sample = (dx: number, dy: number, dz: number) =>
    hashPoint(seed, x0 + dx, y0 + dy, z0 + dz, salt);
  const x00 = lerp(sample(0, 0, 0), sample(1, 0, 0), ux);
  const x10 = lerp(sample(0, 1, 0), sample(1, 1, 0), ux);
  const x01 = lerp(sample(0, 0, 1), sample(1, 0, 1), ux);
  const x11 = lerp(sample(0, 1, 1), sample(1, 1, 1), ux);
  return lerp(lerp(x00, x10, uy), lerp(x01, x11, uy), uz);
}

function fractalNoise(seed: number, x: number, y: number, z: number, scale: number, salt = 0) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = scale;
  let total = 0;
  for (let octave = 0; octave < 4; octave += 1) {
    value += valueNoise(seed, x, y, z, frequency, salt + octave * 131) * amplitude;
    total += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return total > 0 ? value / total : 0;
}

function normalizeSpec(spec?: Partial<VoxelChunkSpec>): VoxelChunkSpec {
  const sizeX = Math.max(4, Math.floor(spec?.sizeX ?? DEFAULT_VOXEL_CHUNK_SPEC.sizeX));
  const sizeY = Math.max(4, Math.floor(spec?.sizeY ?? DEFAULT_VOXEL_CHUNK_SPEC.sizeY));
  const sizeZ = Math.max(4, Math.floor(spec?.sizeZ ?? DEFAULT_VOXEL_CHUNK_SPEC.sizeZ));
  const voxelSize = Math.max(0.1, spec?.voxelSize ?? DEFAULT_VOXEL_CHUNK_SPEC.voxelSize);
  return Object.freeze({ sizeX, sizeY, sizeZ, voxelSize });
}

function chunkId(key: VoxelChunkKey) {
  return `voxel-${key.seed}-${key.cx}-${key.cy}-${key.cz}`;
}

function chunkOrigin(key: VoxelChunkKey, spec: VoxelChunkSpec): [number, number, number] {
  return [
    key.cx * spec.sizeX * spec.voxelSize,
    key.cy * spec.sizeY * spec.voxelSize,
    key.cz * spec.sizeZ * spec.voxelSize,
  ];
}

function voxelIndex(spec: VoxelChunkSpec, x: number, y: number, z: number) {
  return x + spec.sizeX * (z + spec.sizeZ * y);
}

function isLiquid(material: VoxelMaterialId) {
  return material === VoxelMaterial.Water || material === VoxelMaterial.Lava || material === VoxelMaterial.Sludge;
}

function isValidMaterial(value: number): value is VoxelMaterialId {
  return VoxelMaterialIds.includes(value as VoxelMaterialId);
}

function chooseClimate(seed: number, key: VoxelChunkKey): ClimateBand {
  const roll = hashPoint(seed, key.cx, key.cy, key.cz, 0x51a7);
  const index = Math.min(ClimateBands.length - 1, Math.floor(roll * ClimateBands.length));
  return ClimateBands[index];
}

export function getWorldBiomeProfile(climate: ClimateBand): WorldBiomeProfile {
  return biomeProfiles[climate];
}

function climateSurfaceHeight(climate: ClimateBand, seed: number, worldX: number, worldZ: number) {
  const continental = fractalNoise(seed, worldX, 0, worldZ, 0.018, 0x1101);
  const ridge = Math.abs(fractalNoise(seed, worldX, 0, worldZ, 0.05, 0x2202) * 2 - 1);
  const detail = fractalNoise(seed, worldX, 0, worldZ, 0.16, 0x3303);
  const baseByClimate: Record<ClimateBand, number> = {
    polar: 16,
    "cold-temperate": 13,
    temperate: 11,
    arid: 10,
    tropical: 10,
    alpine: 22,
    volcanic: 14,
    freshwater: 8,
    coastal: 7,
    urban: 9,
    underground: 18,
  };
  const reliefByClimate: Record<ClimateBand, number> = {
    polar: 9,
    "cold-temperate": 8,
    temperate: 7,
    arid: 10,
    tropical: 8,
    alpine: 18,
    volcanic: 13,
    freshwater: 5,
    coastal: 5,
    urban: 4,
    underground: 12,
  };
  return (
    baseByClimate[climate] +
    (continental - 0.5) * reliefByClimate[climate] +
    Math.pow(ridge, climate === "alpine" || climate === "volcanic" ? 0.65 : 1.15) * reliefByClimate[climate] * 0.45 +
    (detail - 0.5) * 2.5
  );
}

function climateWaterLevel(climate: ClimateBand) {
  const levels: Record<ClimateBand, number> = {
    polar: 8,
    "cold-temperate": 7,
    temperate: 6,
    arid: 3,
    tropical: 7,
    alpine: 5,
    volcanic: 4,
    freshwater: 11,
    coastal: 10,
    urban: 5,
    underground: 6,
  };
  return levels[climate];
}

function densityAt(climate: ClimateBand, seed: number, worldX: number, worldY: number, worldZ: number) {
  const surface = climateSurfaceHeight(climate, seed, worldX, worldZ);
  let density = surface - worldY;
  const cave = fractalNoise(seed, worldX, worldY * 1.4, worldZ, 0.09, 0x4404);
  const tunnel = fractalNoise(seed, worldX, worldY * 0.35, worldZ, 0.045, 0x5505);
  const caveCut = Math.max(0, cave - 0.58) * 9 + Math.max(0, tunnel - 0.7) * 14;
  if (worldY < surface - 2 || climate === "underground") {
    density -= caveCut;
  }
  if (climate === "underground" && cave > 0.5) {
    density -= (cave - 0.5) * 18;
  }

  const arch = fractalNoise(seed, worldX, worldY, worldZ, 0.055, 0x6606);
  if ((climate === "arid" || climate === "alpine" || climate === "volcanic") && arch > 0.76 && worldY > surface + 1 && worldY < surface + 9) {
    density += (arch - 0.76) * 12;
  }
  if (climate === "underground") {
    density += 2.5 - Math.abs(worldY - surface * 0.55) * 0.18;
  }
  return density;
}

function materialForSample(
  climate: ClimateBand,
  seed: number,
  worldX: number,
  worldY: number,
  worldZ: number,
  density: number
): VoxelMaterialId {
  const surface = climateSurfaceHeight(climate, seed, worldX, worldZ);
  const waterLevel = climateWaterLevel(climate);
  const heat = fractalNoise(seed, worldX, 0, worldZ, 0.025, 0x7707);
  const moisture = fractalNoise(seed, worldX, 0, worldZ, 0.032, 0x8808);
  const rockiness = fractalNoise(seed, worldX, worldY, worldZ, 0.075, 0x9909);
  if (density < 0) {
    if (worldY <= waterLevel && climate !== "underground") {
      if (climate === "polar" || (climate === "cold-temperate" && worldY > waterLevel - 1)) {
        return VoxelMaterial.Ice;
      }
      return VoxelMaterial.Water;
    }
    if (climate === "volcanic" && worldY < surface - 4 && heat > 0.72) {
      return VoxelMaterial.Lava;
    }
    if (climate === "underground" && worldY < waterLevel && moisture > 0.58) {
      return VoxelMaterial.Water;
    }
    return VoxelMaterial.Air;
  }

  const depth = surface - worldY;
  if (climate === "volcanic") {
    if (worldY > surface - 0.8 && heat > 0.65) return VoxelMaterial.Ash;
    if (depth < 5) return VoxelMaterial.Basalt;
    return rockiness > 0.78 ? VoxelMaterial.Ore : VoxelMaterial.Rock;
  }
  if (climate === "polar") {
    if (depth < 2) return VoxelMaterial.Snowpack;
    return rockiness > 0.62 ? VoxelMaterial.Rock : VoxelMaterial.Ice;
  }
  if (climate === "alpine") {
    if (surface > 18 && depth < 1.6) return VoxelMaterial.Snowpack;
    return depth < 2 && moisture > 0.46 ? VoxelMaterial.Grass : VoxelMaterial.Rock;
  }
  if (climate === "arid") {
    if (depth < 2) return heat > 0.42 ? VoxelMaterial.Sand : VoxelMaterial.Clay;
    return rockiness > 0.52 ? VoxelMaterial.Rock : VoxelMaterial.Clay;
  }
  if (climate === "freshwater") {
    if (worldY <= waterLevel || moisture > 0.68) return VoxelMaterial.Mud;
    return depth < 1.5 ? VoxelMaterial.Grass : VoxelMaterial.Clay;
  }
  if (climate === "coastal") {
    if (worldY < waterLevel + 1.2) return moisture > 0.55 ? VoxelMaterial.Mud : VoxelMaterial.Sand;
    return rockiness > 0.65 ? VoxelMaterial.Rock : VoxelMaterial.Gravel;
  }
  if (climate === "urban") {
    if (depth < 0.9) return heat > 0.48 ? VoxelMaterial.Road : VoxelMaterial.Cobble;
    return depth < 4 ? VoxelMaterial.Soil : VoxelMaterial.Rock;
  }
  if (climate === "underground") {
    if (rockiness > 0.84) return VoxelMaterial.Crystal;
    if (rockiness > 0.72) return VoxelMaterial.Ore;
    return moisture > 0.7 ? VoxelMaterial.Mud : VoxelMaterial.Rock;
  }
  if (climate === "tropical") {
    if (depth < 0.9) return moisture > 0.62 ? VoxelMaterial.LeafLitter : VoxelMaterial.Grass;
    if (depth < 3.5) return moisture > 0.55 ? VoxelMaterial.Roots : VoxelMaterial.Soil;
    return rockiness > 0.78 ? VoxelMaterial.Rock : VoxelMaterial.Clay;
  }
  if (climate === "cold-temperate" && surface > 14 && depth < 1) {
    return VoxelMaterial.Snowpack;
  }
  if (depth < 0.9) return moisture > 0.42 ? VoxelMaterial.Grass : VoxelMaterial.Soil;
  if (depth < 3.5) return moisture > 0.5 ? VoxelMaterial.Roots : VoxelMaterial.Soil;
  return rockiness > 0.72 ? VoxelMaterial.Ore : VoxelMaterial.Rock;
}

function resourceLayersForClimate(climate: ClimateBand): readonly VoxelResourceLayer[] {
  const common: VoxelResourceLayer[] = [
    { material: VoxelMaterial.Rock, depthStartM: 4, depthEndM: 64, density: 0.82, rarity: 0.1 },
    { material: VoxelMaterial.Ore, depthStartM: 8, depthEndM: 96, density: climate === "alpine" || climate === "volcanic" ? 0.36 : 0.18, rarity: 0.62 },
  ];
  if (climate === "underground") {
    common.push({ material: VoxelMaterial.Crystal, depthStartM: 12, depthEndM: 96, density: 0.24, rarity: 0.72 });
  }
  if (climate === "volcanic") {
    common.push({ material: VoxelMaterial.Basalt, depthStartM: 0, depthEndM: 96, density: 0.9, rarity: 0.08 });
  }
  return Object.freeze(common.map((layer) => Object.freeze(layer)));
}

export function materializeVoxelChunk(options: MaterializeVoxelChunkOptions): VoxelChunk {
  const key = Object.freeze({ ...options.key });
  const spec = normalizeSpec(options.spec);
  const climate = options.climate ?? chooseClimate(key.seed, key);
  const biome = getWorldBiomeProfile(climate);
  const count = spec.sizeX * spec.sizeY * spec.sizeZ;
  const density = new Float32Array(count);
  const materials = new Uint16Array(count);
  const fields = new Float32Array(count * VOXEL_FIELD_STRIDE);
  const origin = chunkOrigin(key, spec);
  for (let y = 0; y < spec.sizeY; y += 1) {
    for (let z = 0; z < spec.sizeZ; z += 1) {
      for (let x = 0; x < spec.sizeX; x += 1) {
        const index = voxelIndex(spec, x, y, z);
        const worldX = origin[0] + (x + 0.5) * spec.voxelSize;
        const worldY = origin[1] + (y + 0.5) * spec.voxelSize;
        const worldZ = origin[2] + (z + 0.5) * spec.voxelSize;
        const sampleDensity = densityAt(climate, key.seed, worldX, worldY, worldZ);
        const material = materialForSample(climate, key.seed, worldX, worldY, worldZ, sampleDensity);
        const waterLevel = climateWaterLevel(climate);
        density[index] = material === VoxelMaterial.Air ? Math.min(sampleDensity, -0.01) : sampleDensity;
        materials[index] = material;
        const fieldBase = index * VOXEL_FIELD_STRIDE;
        fields[fieldBase] = climateSurfaceHeight(climate, key.seed, worldX, worldZ);
        fields[fieldBase + 1] = waterLevel;
        fields[fieldBase + 2] = fractalNoise(key.seed, worldX, 0, worldZ, 0.025, 0x7707);
        fields[fieldBase + 3] = fractalNoise(key.seed, worldX, 0, worldZ, 0.032, 0x8808);
        fields[fieldBase + 4] = fractalNoise(key.seed, worldX, worldY, worldZ, 0.075, 0x9909);
        fields[fieldBase + 5] = fractalNoise(key.seed, worldX, worldY, worldZ, 0.09, 0x4404);
        fields[fieldBase + 6] = climate === "volcanic" ? fields[fieldBase + 2] : 0;
        fields[fieldBase + 7] = hashPoint(key.seed, worldX, worldY, worldZ, 0xabc);
      }
    }
  }
  const max: [number, number, number] = [
    origin[0] + spec.sizeX * spec.voxelSize,
    origin[1] + spec.sizeY * spec.voxelSize,
    origin[2] + spec.sizeZ * spec.voxelSize,
  ];
  return Object.freeze({
    schemaVersion: 1 as const,
    key,
    spec,
    climate,
    biome,
    density,
    materials,
    fields,
    fieldStride: VOXEL_FIELD_STRIDE,
    resources: resourceLayersForClimate(climate),
    bounds: Object.freeze({
      min: Object.freeze(origin),
      max: Object.freeze(max),
    }),
    coordinateConvention: WORLD_GENERATOR_COORDINATE_CONVENTION,
  });
}

function cloneChunk(chunk: VoxelChunk): VoxelChunk {
  return Object.freeze({
    ...chunk,
    key: Object.freeze({ ...chunk.key }),
    spec: Object.freeze({ ...chunk.spec }),
    density: new Float32Array(chunk.density),
    materials: new Uint16Array(chunk.materials),
    fields: new Float32Array(chunk.fields),
    resources: Object.freeze([...chunk.resources]),
    bounds: Object.freeze({
      min: Object.freeze([...chunk.bounds.min] as [number, number, number]),
      max: Object.freeze([...chunk.bounds.max] as [number, number, number]),
    }),
  });
}

function brushInfluence(brush: VoxelBrush, point: readonly [number, number, number]) {
  const shape = brush.shape ?? "sphere";
  if (shape === "box") {
    const half = brush.halfExtents ?? [brush.radius, brush.radius, brush.radius];
    const dx = Math.abs(point[0] - brush.center[0]) / Math.max(half[0], 1e-6);
    const dy = Math.abs(point[1] - brush.center[1]) / Math.max(half[1], 1e-6);
    const dz = Math.abs(point[2] - brush.center[2]) / Math.max(half[2], 1e-6);
    return clamp01(1 - Math.max(dx, dy, dz));
  }
  const target = brush.end ?? brush.center;
  const ax = brush.center[0];
  const ay = brush.center[1];
  const az = brush.center[2];
  const bx = target[0];
  const by = target[1];
  const bz = target[2];
  const abx = bx - ax;
  const aby = by - ay;
  const abz = bz - az;
  const denom = abx * abx + aby * aby + abz * abz || 1;
  const t =
    shape === "capsule"
      ? clamp(((point[0] - ax) * abx + (point[1] - ay) * aby + (point[2] - az) * abz) / denom, 0, 1)
      : 0;
  const cx = ax + abx * t;
  const cy = ay + aby * t;
  const cz = az + abz * t;
  const distance = Math.hypot(point[0] - cx, point[1] - cy, point[2] - cz);
  return clamp01(1 - distance / Math.max(brush.radius, 1e-6));
}

function emptyDirty(): { min: [number, number, number]; max: [number, number, number] } {
  return {
    min: [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
    max: [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
  };
}

function markDirty(
  dirty: { min: [number, number, number]; max: [number, number, number] },
  x: number,
  y: number,
  z: number
) {
  dirty.min[0] = Math.min(dirty.min[0], x);
  dirty.min[1] = Math.min(dirty.min[1], y);
  dirty.min[2] = Math.min(dirty.min[2], z);
  dirty.max[0] = Math.max(dirty.max[0], x);
  dirty.max[1] = Math.max(dirty.max[1], y);
  dirty.max[2] = Math.max(dirty.max[2], z);
}

export function applyVoxelEditJournal(
  baseChunk: VoxelChunk,
  journal: VoxelEditJournal
): { chunk: VoxelChunk; delta: VoxelChunkDelta } {
  const chunk = cloneChunk(baseChunk);
  const origin = chunk.bounds.min;
  const dirty = emptyDirty();
  const collapseEvents: VoxelCollapseEvent[] = [];
  const editIds: string[] = [];
  for (const edit of journal.edits) {
    editIds.push(edit.id);
    if (edit.kind === "collapseSinkhole") {
      collapseEvents.push(
        Object.freeze({
          editId: edit.id,
          center: Object.freeze([...edit.brush.center] as [number, number, number]),
          radius: edit.brush.radius,
          depth: edit.collapseDepth ?? edit.brush.radius * 1.4,
        })
      );
    }
    for (let y = 0; y < chunk.spec.sizeY; y += 1) {
      for (let z = 0; z < chunk.spec.sizeZ; z += 1) {
        for (let x = 0; x < chunk.spec.sizeX; x += 1) {
          const world: [number, number, number] = [
            origin[0] + (x + 0.5) * chunk.spec.voxelSize,
            origin[1] + (y + 0.5) * chunk.spec.voxelSize,
            origin[2] + (z + 0.5) * chunk.spec.voxelSize,
          ];
          const influence = brushInfluence(edit.brush, world) * (edit.brush.strength ?? 1);
          if (influence <= 0) continue;
          const index = voxelIndex(chunk.spec, x, y, z);
          if (edit.kind === "subtractBrush") {
            chunk.density[index] -= influence * 4;
            if (chunk.density[index] < 0) chunk.materials[index] = VoxelMaterial.Air;
          } else if (edit.kind === "addMaterialBrush") {
            chunk.density[index] = Math.max(chunk.density[index], edit.density ?? influence * 2);
            chunk.materials[index] = edit.material;
          } else if (edit.kind === "replaceMaterialBrush") {
            if (chunk.materials[index] !== VoxelMaterial.Air || isLiquid(edit.material)) {
              chunk.materials[index] = edit.material;
              if (edit.density !== undefined) chunk.density[index] = edit.density;
            }
          } else if (edit.kind === "collapseSinkhole") {
            const depth = edit.collapseDepth ?? edit.brush.radius * 1.4;
            chunk.density[index] -= influence * (3 + depth * 0.4);
            if (world[1] < edit.brush.center[1] - depth * 0.45) {
              chunk.materials[index] = VoxelMaterial.Gravel;
              chunk.density[index] = Math.max(chunk.density[index], influence);
            } else if (chunk.density[index] < 0) {
              chunk.materials[index] = VoxelMaterial.Air;
            }
          } else if (edit.kind === "volcanicDeposit") {
            const heat = edit.heat ?? 1;
            if (influence > 0.72 && heat > 0.65) {
              chunk.materials[index] = VoxelMaterial.Lava;
              chunk.density[index] = Math.max(chunk.density[index], 0.2);
            } else if (influence > 0.34) {
              chunk.materials[index] = VoxelMaterial.Basalt;
              chunk.density[index] = Math.max(chunk.density[index], influence * 2);
            } else {
              chunk.materials[index] = VoxelMaterial.Ash;
              chunk.density[index] = Math.max(chunk.density[index], influence);
            }
          }
          markDirty(dirty, x, y, z);
        }
      }
    }
  }
  const dirtyMin: [number, number, number] = Number.isFinite(dirty.min[0]) ? dirty.min : [0, 0, 0];
  const dirtyMax: [number, number, number] = Number.isFinite(dirty.max[0])
    ? dirty.max
    : [chunk.spec.sizeX - 1, chunk.spec.sizeY - 1, chunk.spec.sizeZ - 1];
  return {
    chunk,
    delta: Object.freeze({
      chunkKey: Object.freeze({ ...chunk.key }),
      dirtyMin: Object.freeze(dirtyMin),
      dirtyMax: Object.freeze(dirtyMax),
      editIds: Object.freeze(editIds),
      collapseEvents: Object.freeze(collapseEvents),
    }),
  };
}

function materialName(material: VoxelMaterialId) {
  return `world.${VoxelMaterialLabel[material]}`;
}

function isRenderableVoxel(material: VoxelMaterialId, includeLiquids: boolean) {
  if (material === VoxelMaterial.Air) return false;
  if (isLiquid(material)) return includeLiquids;
  return true;
}

function meshingFieldIndex(field: VoxelMeshingField, x: number, y: number, z: number) {
  return x + field.latticeSizeX * (z + field.latticeSizeZ * y);
}

function normalizedHalo(halo: number | undefined) {
  return halo === undefined ? 1 : Math.max(0, Math.floor(halo));
}

function editBrushBounds(
  edit: VoxelEdit
): Readonly<{ min: readonly [number, number, number]; max: readonly [number, number, number] }> {
  const center = edit.brush.center;
  const end = edit.brush.end ?? center;
  const half = edit.brush.shape === "box" ? edit.brush.halfExtents ?? [edit.brush.radius, edit.brush.radius, edit.brush.radius] : null;
  const radius = edit.brush.shape === "box" ? 0 : edit.brush.radius;
  return Object.freeze({
    min: Object.freeze([
      Math.min(center[0], end[0]) - (half?.[0] ?? radius),
      Math.min(center[1], end[1]) - (half?.[1] ?? radius),
      Math.min(center[2], end[2]) - (half?.[2] ?? radius),
    ] as [number, number, number]),
    max: Object.freeze([
      Math.max(center[0], end[0]) + (half?.[0] ?? radius),
      Math.max(center[1], end[1]) + (half?.[1] ?? radius),
      Math.max(center[2], end[2]) + (half?.[2] ?? radius),
    ] as [number, number, number]),
  });
}

function chunkKeyForWorldPoint(
  seed: number,
  spec: VoxelChunkSpec,
  worldX: number,
  worldY: number,
  worldZ: number
): VoxelChunkKey {
  return Object.freeze({
    seed,
    cx: Math.floor(worldX / (spec.sizeX * spec.voxelSize)),
    cy: Math.floor(worldY / (spec.sizeY * spec.voxelSize)),
    cz: Math.floor(worldZ / (spec.sizeZ * spec.voxelSize)),
  });
}

function chunkKeyId(key: VoxelChunkKey) {
  return `${key.seed}:${key.cx}:${key.cy}:${key.cz}`;
}

export function getVoxelEditDirtyChunkKeys(
  chunkKey: VoxelChunkKey,
  specInput: Partial<VoxelChunkSpec> | undefined,
  edits: readonly VoxelEdit[],
  halo = 1
): VoxelEditDirtyChunkSet {
  const spec = normalizeSpec(specInput);
  const haloDistance = normalizedHalo(halo) * spec.voxelSize;
  const keys = new Map<string, VoxelChunkKey>();
  for (const edit of edits) {
    const bounds = editBrushBounds(edit);
    const min: [number, number, number] = [
      bounds.min[0] - haloDistance,
      bounds.min[1] - haloDistance,
      bounds.min[2] - haloDistance,
    ];
    const max: [number, number, number] = [
      bounds.max[0] + haloDistance,
      bounds.max[1] + haloDistance,
      bounds.max[2] + haloDistance,
    ];
    const minKey = chunkKeyForWorldPoint(chunkKey.seed, spec, min[0], min[1], min[2]);
    const maxKey = chunkKeyForWorldPoint(chunkKey.seed, spec, max[0], max[1], max[2]);
    for (let cy = minKey.cy; cy <= maxKey.cy; cy += 1) {
      for (let cz = minKey.cz; cz <= maxKey.cz; cz += 1) {
        for (let cx = minKey.cx; cx <= maxKey.cx; cx += 1) {
          const key = Object.freeze({ seed: chunkKey.seed, cx, cy, cz });
          keys.set(chunkKeyId(key), key);
        }
      }
    }
  }
  if (keys.size === 0) {
    const key = Object.freeze({ ...chunkKey });
    keys.set(chunkKeyId(key), key);
  }
  return Object.freeze({
    chunkKeys: Object.freeze([...keys.values()].sort((a, b) => a.cy - b.cy || a.cz - b.cz || a.cx - b.cx)),
    halo: normalizedHalo(halo),
  });
}

function chunkWorldBounds(key: VoxelChunkKey, spec: VoxelChunkSpec) {
  const min = chunkOrigin(key, spec);
  return Object.freeze({
    min: Object.freeze(min),
    max: Object.freeze([
      min[0] + spec.sizeX * spec.voxelSize,
      min[1] + spec.sizeY * spec.voxelSize,
      min[2] + spec.sizeZ * spec.voxelSize,
    ] as [number, number, number]),
  });
}

function boundsIntersect(
  a: Readonly<{ min: readonly [number, number, number]; max: readonly [number, number, number] }>,
  b: Readonly<{ min: readonly [number, number, number]; max: readonly [number, number, number] }>
) {
  return (
    a.min[0] <= b.max[0] &&
    a.max[0] >= b.min[0] &&
    a.min[1] <= b.max[1] &&
    a.max[1] >= b.min[1] &&
    a.min[2] <= b.max[2] &&
    a.max[2] >= b.min[2]
  );
}

export function splitVoxelEditJournalByChunk(
  journal: VoxelEditJournal,
  specInput?: Partial<VoxelChunkSpec>
): readonly VoxelEditJournal[] {
  const spec = normalizeSpec(specInput);
  const affected = getVoxelEditDirtyChunkKeys(journal.chunkKey, spec, journal.edits, 0).chunkKeys;
  const journals: VoxelEditJournal[] = [];
  for (const key of affected) {
    const chunkBounds = chunkWorldBounds(key, spec);
    const edits = journal.edits.filter((edit) => boundsIntersect(editBrushBounds(edit), chunkBounds));
    if (edits.length === 0) continue;
    journals.push(
      Object.freeze({
        schemaVersion: 1 as const,
        chunkKey: Object.freeze({ ...key }),
        edits: Object.freeze([...edits]),
      })
    );
  }
  return Object.freeze(journals);
}

function applyEditToSample(
  density: number,
  material: VoxelMaterialId,
  edit: VoxelEdit,
  world: readonly [number, number, number]
): { density: number; material: VoxelMaterialId } {
  const influence = brushInfluence(edit.brush, world) * (edit.brush.strength ?? 1);
  if (influence <= 0) return { density, material };
  if (edit.kind === "subtractBrush") {
    const nextDensity = density - influence * 4;
    return { density: nextDensity, material: nextDensity < 0 ? VoxelMaterial.Air : material };
  }
  if (edit.kind === "addMaterialBrush") {
    return {
      density: Math.max(density, edit.density ?? influence * 2),
      material: edit.material,
    };
  }
  if (edit.kind === "replaceMaterialBrush") {
    if (material !== VoxelMaterial.Air || isLiquid(edit.material)) {
      return {
        density: edit.density ?? density,
        material: edit.material,
      };
    }
    return { density, material };
  }
  if (edit.kind === "collapseSinkhole") {
    const depth = edit.collapseDepth ?? edit.brush.radius * 1.4;
    const nextDensity = density - influence * (3 + depth * 0.4);
    if (world[1] < edit.brush.center[1] - depth * 0.45) {
      return {
        density: Math.max(nextDensity, influence),
        material: VoxelMaterial.Gravel,
      };
    }
    return { density: nextDensity, material: nextDensity < 0 ? VoxelMaterial.Air : material };
  }
  if (edit.kind === "volcanicDeposit") {
    const heat = edit.heat ?? 1;
    if (influence > 0.72 && heat > 0.65) {
      return {
        density: Math.max(density, 0.2),
        material: VoxelMaterial.Lava,
      };
    }
    if (influence > 0.34) {
      return {
        density: Math.max(density, influence * 2),
        material: VoxelMaterial.Basalt,
      };
    }
    return {
      density: Math.max(density, influence),
      material: VoxelMaterial.Ash,
    };
  }
  return { density, material };
}

function combinedJournals(options: BuildVoxelSurfaceMeshOptions) {
  return [...(options.neighborhood?.journals ?? []), ...(options.journals ?? [])];
}

export function materializeVoxelMeshingField(options: MaterializeVoxelMeshingFieldOptions): VoxelMeshingField {
  const chunk = options.neighborhood?.center ?? options.chunk;
  const halo = Math.max(1, normalizedHalo(options.halo));
  const includeLiquids = options.includeLiquids ?? false;
  const latticeSizeX = chunk.spec.sizeX + 1 + halo * 2;
  const latticeSizeY = chunk.spec.sizeY + 1 + halo * 2;
  const latticeSizeZ = chunk.spec.sizeZ + 1 + halo * 2;
  const density = new Float32Array(latticeSizeX * latticeSizeY * latticeSizeZ);
  const materials = new Uint16Array(density.length);
  const origin = chunk.bounds.min;
  const journals = combinedJournals(options);
  for (let ly = 0; ly < latticeSizeY; ly += 1) {
    for (let lz = 0; lz < latticeSizeZ; lz += 1) {
      for (let lx = 0; lx < latticeSizeX; lx += 1) {
        const localX = lx - halo;
        const localY = ly - halo;
        const localZ = lz - halo;
        const world: [number, number, number] = [
          origin[0] + localX * chunk.spec.voxelSize,
          origin[1] + localY * chunk.spec.voxelSize,
          origin[2] + localZ * chunk.spec.voxelSize,
        ];
        let sampleDensity = densityAt(chunk.climate, chunk.key.seed, world[0], world[1], world[2]);
        let material = materialForSample(chunk.climate, chunk.key.seed, world[0], world[1], world[2], sampleDensity);
        for (const journal of journals) {
          for (const edit of journal.edits) {
            const replayed = applyEditToSample(sampleDensity, material, edit, world);
            sampleDensity = replayed.density;
            material = replayed.material;
          }
        }
        if (!isRenderableVoxel(material, includeLiquids)) {
          sampleDensity = Math.min(sampleDensity, -0.01);
        }
        const index = lx + latticeSizeX * (lz + latticeSizeZ * ly);
        density[index] = sampleDensity;
        materials[index] = material;
      }
    }
  }
  return Object.freeze({
    schemaVersion: 1 as const,
    chunkKey: Object.freeze({ ...chunk.key }),
    spec: Object.freeze({ ...chunk.spec }),
    climate: chunk.climate,
    biome: chunk.biome,
    halo,
    latticeSizeX,
    latticeSizeY,
    latticeSizeZ,
    density,
    materials,
    bounds: Object.freeze({
      min: Object.freeze([
        origin[0] - halo * chunk.spec.voxelSize,
        origin[1] - halo * chunk.spec.voxelSize,
        origin[2] - halo * chunk.spec.voxelSize,
      ] as [number, number, number]),
      max: Object.freeze([
        origin[0] + (chunk.spec.sizeX + halo) * chunk.spec.voxelSize,
        origin[1] + (chunk.spec.sizeY + halo) * chunk.spec.voxelSize,
        origin[2] + (chunk.spec.sizeZ + halo) * chunk.spec.voxelSize,
      ] as [number, number, number]),
    }),
    coordinateConvention: WORLD_GENERATOR_COORDINATE_CONVENTION,
  });
}

export function buildVoxelSurfaceMesh(
  chunk: VoxelChunk,
  options: BuildVoxelSurfaceMeshOptions = {}
): VoxelSurfaceMesh {
  return buildVoxelSurfaceMeshFromField(materializeVoxelMeshingField({ ...options, chunk }));
}

export function buildVoxelSurfaceMeshFromField(field: VoxelMeshingField): VoxelSurfaceMesh {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const vertexMaterials: number[] = [];
  const materialIds = new Set<string>();
  const min: [number, number, number] = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
  const max: [number, number, number] = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
  const cellSizeX = Math.max(0, field.latticeSizeX - 1);
  const cellSizeY = Math.max(0, field.latticeSizeY - 1);
  const cellSizeZ = Math.max(0, field.latticeSizeZ - 1);
  const cellVertices = new Int32Array(cellSizeX * cellSizeY * cellSizeZ);
  cellVertices.fill(-1);
  const cornerOffsets = [
    [0, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
    [1, 1, 0],
    [0, 0, 1],
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 1],
  ] as const;
  const edgePairs = [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7],
    [0, 2],
    [1, 3],
    [4, 6],
    [5, 7],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ] as const;
  const cellIndex = (x: number, y: number, z: number) => x + cellSizeX * (z + cellSizeZ * y);
  const sampleMaterial = (x: number, y: number, z: number) =>
    field.materials[meshingFieldIndex(field, x, y, z)] as VoxelMaterialId;
  const sampleDensity = (x: number, y: number, z: number) => field.density[meshingFieldIndex(field, x, y, z)];
  const worldPoint = (x: number, y: number, z: number): [number, number, number] => [
    field.bounds.min[0] + x * field.spec.voxelSize,
    field.bounds.min[1] + y * field.spec.voxelSize,
    field.bounds.min[2] + z * field.spec.voxelSize,
  ];
  const pushPoint = (
    point: readonly [number, number, number],
    normal: [number, number, number],
    material: VoxelMaterialId
  ) => {
    const index = positions.length / 3;
    positions.push(point[0], point[1], point[2]);
    normals.push(normal[0], normal[1], normal[2]);
    vertexMaterials.push(material);
    materialIds.add(materialName(material));
    min[0] = Math.min(min[0], point[0]);
    min[1] = Math.min(min[1], point[1]);
    min[2] = Math.min(min[2], point[2]);
    max[0] = Math.max(max[0], point[0]);
    max[1] = Math.max(max[1], point[1]);
    max[2] = Math.max(max[2], point[2]);
    return index;
  };
  const normalForCell = (x: number, y: number, z: number): [number, number, number] => {
    const sx0 = sampleDensity(Math.max(0, x), y, z);
    const sx1 = sampleDensity(Math.min(field.latticeSizeX - 1, x + 1), y, z);
    const sy0 = sampleDensity(x, Math.max(0, y), z);
    const sy1 = sampleDensity(x, Math.min(field.latticeSizeY - 1, y + 1), z);
    const sz0 = sampleDensity(x, y, Math.max(0, z));
    const sz1 = sampleDensity(x, y, Math.min(field.latticeSizeZ - 1, z + 1));
    const nx = sx0 - sx1;
    const ny = sy0 - sy1;
    const nz = sz0 - sz1;
    const length = Math.hypot(nx, ny, nz) || 1;
    return [nx / length, ny / length, nz / length];
  };
  for (let y = 0; y < cellSizeY; y += 1) {
    for (let z = 0; z < cellSizeZ; z += 1) {
      for (let x = 0; x < cellSizeX; x += 1) {
        const densities = cornerOffsets.map(([dx, dy, dz]) => sampleDensity(x + dx, y + dy, z + dz));
        const hasSolid = densities.some((value) => value >= 0);
        const hasAir = densities.some((value) => value < 0);
        if (!hasSolid || !hasAir) continue;

        const crossings: [number, number, number][] = [];
        for (const [a, b] of edgePairs) {
          const da = densities[a];
          const db = densities[b];
          if ((da >= 0) === (db >= 0)) continue;
          const ca = cornerOffsets[a];
          const cb = cornerOffsets[b];
          const t = clamp(da / (da - db), 0, 1);
          crossings.push([
            x + ca[0] + (cb[0] - ca[0]) * t,
            y + ca[1] + (cb[1] - ca[1]) * t,
            z + ca[2] + (cb[2] - ca[2]) * t,
          ]);
        }
        if (crossings.length === 0) continue;

        const average: [number, number, number] = [0, 0, 0];
        for (const crossing of crossings) {
          average[0] += crossing[0];
          average[1] += crossing[1];
          average[2] += crossing[2];
        }
        average[0] /= crossings.length;
        average[1] /= crossings.length;
        average[2] /= crossings.length;

        let material = VoxelMaterial.Rock as VoxelMaterialId;
        for (let i = 0; i < cornerOffsets.length; i += 1) {
          if (densities[i] < 0) continue;
          const [dx, dy, dz] = cornerOffsets[i];
          material = sampleMaterial(x + dx, y + dy, z + dz);
          break;
        }
        const vertex = pushPoint(worldPoint(average[0], average[1], average[2]), normalForCell(x, y, z), material);
        cellVertices[cellIndex(x, y, z)] = vertex;
      }
    }
  }
  const addQuad = (a: number, b: number, c: number, d: number, flip: boolean) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return;
    if (flip) {
      indices.push(a, d, c, a, c, b);
    } else {
      indices.push(a, b, c, a, c, d);
    }
  };
  const vertexAt = (x: number, y: number, z: number) => cellVertices[cellIndex(x, y, z)];
  const ownedMin = field.halo;
  const ownedMaxX = field.halo + field.spec.sizeX;
  const ownedMaxY = field.halo + field.spec.sizeY;
  const ownedMaxZ = field.halo + field.spec.sizeZ;
  for (let x = ownedMin; x < ownedMaxX; x += 1) {
    for (let y = ownedMin; y <= ownedMaxY; y += 1) {
      for (let z = ownedMin; z <= ownedMaxZ; z += 1) {
        const a = sampleDensity(x, y, z);
        const b = sampleDensity(x + 1, y, z);
        if ((a >= 0) === (b >= 0)) continue;
        addQuad(
          vertexAt(x, y, z),
          vertexAt(x, y - 1, z),
          vertexAt(x, y - 1, z - 1),
          vertexAt(x, y, z - 1),
          a < b
        );
      }
    }
  }
  for (let x = ownedMin; x < ownedMaxX; x += 1) {
    for (let y = ownedMin; y < ownedMaxY; y += 1) {
      for (let z = ownedMin; z <= ownedMaxZ; z += 1) {
        const a = sampleDensity(x, y, z);
        const b = sampleDensity(x, y + 1, z);
        if ((a >= 0) === (b >= 0)) continue;
        addQuad(
          vertexAt(x, y, z),
          vertexAt(x, y, z - 1),
          vertexAt(x - 1, y, z - 1),
          vertexAt(x - 1, y, z),
          a < b
        );
      }
    }
  }
  for (let x = ownedMin; x < ownedMaxX; x += 1) {
    for (let y = ownedMin; y <= ownedMaxY; y += 1) {
      for (let z = ownedMin; z < ownedMaxZ; z += 1) {
        const a = sampleDensity(x, y, z);
        const b = sampleDensity(x, y, z + 1);
        if ((a >= 0) === (b >= 0)) continue;
        addQuad(
          vertexAt(x, y, z),
          vertexAt(x - 1, y, z),
          vertexAt(x - 1, y - 1, z),
          vertexAt(x, y - 1, z),
          a < b
        );
      }
    }
  }
  const fallbackMin: [number, number, number] = [
    field.bounds.min[0] + field.halo * field.spec.voxelSize,
    field.bounds.min[1] + field.halo * field.spec.voxelSize,
    field.bounds.min[2] + field.halo * field.spec.voxelSize,
  ];
  const fallbackMax: [number, number, number] = [
    fallbackMin[0] + field.spec.sizeX * field.spec.voxelSize,
    fallbackMin[1] + field.spec.sizeY * field.spec.voxelSize,
    fallbackMin[2] + field.spec.sizeZ * field.spec.voxelSize,
  ];
  return Object.freeze({
    schemaVersion: 1 as const,
    algorithm: "surface-nets" as const,
    chunkKey: Object.freeze({ ...field.chunkKey }),
    sourceChunkIds: Object.freeze([chunkId(field.chunkKey)]),
    coordinateConvention: WORLD_GENERATOR_COORDINATE_CONVENTION,
    positions: Object.freeze(positions),
    normals: Object.freeze(normals),
    indices: Object.freeze(indices),
    materialIds: Object.freeze([...materialIds]),
    vertexMaterials: Object.freeze(vertexMaterials),
    bounds: Object.freeze({
      min: Object.freeze(Number.isFinite(min[0]) ? min : fallbackMin),
      max: Object.freeze(Number.isFinite(max[0]) ? max : fallbackMax),
    }),
    dirtyRegion: Object.freeze({
      min: Object.freeze([0, 0, 0] as const),
      max: Object.freeze([field.spec.sizeX - 1, field.spec.sizeY - 1, field.spec.sizeZ - 1] as const),
    }),
  });
}

export function buildVoxelCollisionMesh(
  chunk: VoxelChunk,
  options: BuildVoxelSurfaceMeshOptions = {}
): VoxelCollisionMesh {
  const includeLiquids = options.includeLiquids ?? false;
  const neighborChunks = options.neighborhood?.neighbors ?? [];
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const vertexMaterials: number[] = [];
  const materialIds = new Set<string>();
  const min: [number, number, number] = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
  const max: [number, number, number] = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
  const { sizeX, sizeY, sizeZ, voxelSize } = chunk.spec;
  const origin = chunk.bounds.min;
  let solidVoxelCount = 0;
  let exposedFaceCount = 0;

  const isSolidInChunk = (source: VoxelChunk, x: number, y: number, z: number) => {
    if (x < 0 || x >= source.spec.sizeX || y < 0 || y >= source.spec.sizeY || z < 0 || z >= source.spec.sizeZ) {
      return false;
    }
    const index = voxelIndex(source.spec, x, y, z);
    const material = source.materials[index] as VoxelMaterialId;
    return isRenderableVoxel(material, includeLiquids) && source.density[index] >= 0;
  };
  const isSolidInLoadedNeighbor = (x: number, y: number, z: number) => {
    const worldX = origin[0] + (x + 0.5) * voxelSize;
    const worldY = origin[1] + (y + 0.5) * voxelSize;
    const worldZ = origin[2] + (z + 0.5) * voxelSize;
    for (const neighbor of neighborChunks) {
      if (
        worldX < neighbor.bounds.min[0] ||
        worldX >= neighbor.bounds.max[0] ||
        worldY < neighbor.bounds.min[1] ||
        worldY >= neighbor.bounds.max[1] ||
        worldZ < neighbor.bounds.min[2] ||
        worldZ >= neighbor.bounds.max[2]
      ) {
        continue;
      }
      const nx = Math.floor((worldX - neighbor.bounds.min[0]) / neighbor.spec.voxelSize);
      const ny = Math.floor((worldY - neighbor.bounds.min[1]) / neighbor.spec.voxelSize);
      const nz = Math.floor((worldZ - neighbor.bounds.min[2]) / neighbor.spec.voxelSize);
      return isSolidInChunk(neighbor, nx, ny, nz);
    }
    return false;
  };
  const isColliderVoxel = (x: number, y: number, z: number) => {
    if (x < 0 || x >= sizeX || y < 0 || y >= sizeY || z < 0 || z >= sizeZ) {
      return isSolidInLoadedNeighbor(x, y, z);
    }
    return isSolidInChunk(chunk, x, y, z);
  };
  const worldPoint = (x: number, y: number, z: number): [number, number, number] => [
    origin[0] + x * voxelSize,
    origin[1] + y * voxelSize,
    origin[2] + z * voxelSize,
  ];
  const pushVertex = (
    point: readonly [number, number, number],
    normal: readonly [number, number, number],
    material: VoxelMaterialId
  ) => {
    const index = positions.length / 3;
    positions.push(point[0], point[1], point[2]);
    normals.push(normal[0], normal[1], normal[2]);
    vertexMaterials.push(material);
    materialIds.add(materialName(material));
    min[0] = Math.min(min[0], point[0]);
    min[1] = Math.min(min[1], point[1]);
    min[2] = Math.min(min[2], point[2]);
    max[0] = Math.max(max[0], point[0]);
    max[1] = Math.max(max[1], point[1]);
    max[2] = Math.max(max[2], point[2]);
    return index;
  };
  const pushFace = (
    material: VoxelMaterialId,
    normal: readonly [number, number, number],
    corners: readonly [
      readonly [number, number, number],
      readonly [number, number, number],
      readonly [number, number, number],
      readonly [number, number, number],
    ]
  ) => {
    const a = pushVertex(worldPoint(corners[0][0], corners[0][1], corners[0][2]), normal, material);
    const b = pushVertex(worldPoint(corners[1][0], corners[1][1], corners[1][2]), normal, material);
    const c = pushVertex(worldPoint(corners[2][0], corners[2][1], corners[2][2]), normal, material);
    const d = pushVertex(worldPoint(corners[3][0], corners[3][1], corners[3][2]), normal, material);
    indices.push(a, b, c, a, c, d);
    exposedFaceCount += 1;
  };

  for (let y = 0; y < sizeY; y += 1) {
    for (let z = 0; z < sizeZ; z += 1) {
      for (let x = 0; x < sizeX; x += 1) {
        if (!isColliderVoxel(x, y, z)) continue;
        solidVoxelCount += 1;
        const material = chunk.materials[voxelIndex(chunk.spec, x, y, z)] as VoxelMaterialId;
        if (!isColliderVoxel(x + 1, y, z)) {
          pushFace(material, [1, 0, 0], [
            [x + 1, y, z],
            [x + 1, y + 1, z],
            [x + 1, y + 1, z + 1],
            [x + 1, y, z + 1],
          ]);
        }
        if (!isColliderVoxel(x - 1, y, z)) {
          pushFace(material, [-1, 0, 0], [
            [x, y, z + 1],
            [x, y + 1, z + 1],
            [x, y + 1, z],
            [x, y, z],
          ]);
        }
        if (!isColliderVoxel(x, y + 1, z)) {
          pushFace(material, [0, 1, 0], [
            [x, y + 1, z + 1],
            [x + 1, y + 1, z + 1],
            [x + 1, y + 1, z],
            [x, y + 1, z],
          ]);
        }
        if (!isColliderVoxel(x, y - 1, z)) {
          pushFace(material, [0, -1, 0], [
            [x, y, z],
            [x + 1, y, z],
            [x + 1, y, z + 1],
            [x, y, z + 1],
          ]);
        }
        if (!isColliderVoxel(x, y, z + 1)) {
          pushFace(material, [0, 0, 1], [
            [x + 1, y, z + 1],
            [x + 1, y + 1, z + 1],
            [x, y + 1, z + 1],
            [x, y, z + 1],
          ]);
        }
        if (!isColliderVoxel(x, y, z - 1)) {
          pushFace(material, [0, 0, -1], [
            [x, y, z],
            [x, y + 1, z],
            [x + 1, y + 1, z],
            [x + 1, y, z],
          ]);
        }
      }
    }
  }

  const fallbackMin: [number, number, number] = [...chunk.bounds.min];
  const fallbackMax: [number, number, number] = [...chunk.bounds.max];
  return Object.freeze({
    schemaVersion: 1 as const,
    algorithm: "voxel-block-collider" as const,
    chunkKey: Object.freeze({ ...chunk.key }),
    sourceChunkIds: Object.freeze([chunkId(chunk.key)]),
    coordinateConvention: WORLD_GENERATOR_COORDINATE_CONVENTION,
    positions: Object.freeze(positions),
    normals: Object.freeze(normals),
    indices: Object.freeze(indices),
    materialIds: Object.freeze([...materialIds]),
    vertexMaterials: Object.freeze(vertexMaterials),
    solidVoxelCount,
    exposedFaceCount,
    bounds: Object.freeze({
      min: Object.freeze(Number.isFinite(min[0]) ? min : fallbackMin),
      max: Object.freeze(Number.isFinite(max[0]) ? max : fallbackMax),
    }),
    dirtyRegion: Object.freeze({
      min: Object.freeze([0, 0, 0] as const),
      max: Object.freeze([sizeX - 1, sizeY - 1, sizeZ - 1] as const),
    }),
  });
}

function voxelFluidMaterialKind(material: VoxelMaterialId): VoxelFluidMaterialKind | null {
  if (material === VoxelMaterial.Water) return "water";
  if (material === VoxelMaterial.Lava) return "lava";
  if (material === VoxelMaterial.Sludge) return "sludge";
  return null;
}

function fluidChunkKey(chunk: VoxelChunk, material: VoxelFluidMaterialKind) {
  return Object.freeze({
    fluidBodyId: `world.${chunk.key.seed}.${chunk.climate}.${material}`,
    cx: chunk.key.cx,
    cy: chunk.key.cy,
    cz: chunk.key.cz,
  });
}

function materialRenderClass(material: VoxelMaterialId): VoxelRenderMaterialProfile["class"] {
  if (material === VoxelMaterial.Snowpack) return "snow";
  if (material === VoxelMaterial.Ice) return "ice";
  if (material === VoxelMaterial.Crystal) return "crystal";
  if (material === VoxelMaterial.Cobble || material === VoxelMaterial.Road) return "constructed";
  if (material === VoxelMaterial.Ore) return "resource";
  return "terrain";
}

const terrainRenderColors: Readonly<Record<VoxelMaterialId, readonly [number, number, number, number]>> = Object.freeze({
  [VoxelMaterial.Air]: Object.freeze([0, 0, 0, 0] as const),
  [VoxelMaterial.Soil]: Object.freeze([0.43, 0.33, 0.22, 1] as const),
  [VoxelMaterial.Grass]: Object.freeze([0.28, 0.52, 0.26, 1] as const),
  [VoxelMaterial.LeafLitter]: Object.freeze([0.4, 0.29, 0.15, 1] as const),
  [VoxelMaterial.Roots]: Object.freeze([0.29, 0.2, 0.12, 1] as const),
  [VoxelMaterial.Rock]: Object.freeze([0.45, 0.46, 0.46, 1] as const),
  [VoxelMaterial.Gravel]: Object.freeze([0.55, 0.54, 0.51, 1] as const),
  [VoxelMaterial.Sand]: Object.freeze([0.77, 0.65, 0.38, 1] as const),
  [VoxelMaterial.Clay]: Object.freeze([0.64, 0.36, 0.24, 1] as const),
  [VoxelMaterial.Mud]: Object.freeze([0.31, 0.25, 0.2, 1] as const),
  [VoxelMaterial.Moss]: Object.freeze([0.25, 0.38, 0.2, 1] as const),
  [VoxelMaterial.Water]: Object.freeze([0, 0, 0, 0] as const),
  [VoxelMaterial.Ice]: Object.freeze([0.62, 0.82, 0.86, 0.95] as const),
  [VoxelMaterial.Snowpack]: Object.freeze([0.88, 0.92, 0.94, 1] as const),
  [VoxelMaterial.Basalt]: Object.freeze([0.15, 0.16, 0.17, 1] as const),
  [VoxelMaterial.Ash]: Object.freeze([0.4, 0.38, 0.35, 1] as const),
  [VoxelMaterial.Lava]: Object.freeze([0, 0, 0, 0] as const),
  [VoxelMaterial.Crystal]: Object.freeze([0.38, 0.78, 0.75, 1] as const),
  [VoxelMaterial.Sludge]: Object.freeze([0, 0, 0, 0] as const),
  [VoxelMaterial.Cobble]: Object.freeze([0.47, 0.44, 0.4, 1] as const),
  [VoxelMaterial.Road]: Object.freeze([0.29, 0.27, 0.25, 1] as const),
  [VoxelMaterial.Ore]: Object.freeze([0.68, 0.51, 0.25, 1] as const),
});

export function createVoxelMaterialPalette(id = "world.voxel.v1"): VoxelMaterialPalette {
  const terrainMaterials = VoxelMaterialIds.filter((material) => !isLiquid(material) && material !== VoxelMaterial.Air).map(
    (material) =>
      Object.freeze({
        id: materialName(material),
        material,
        class: materialRenderClass(material),
        baseColor: terrainRenderColors[material],
        roughness:
          material === VoxelMaterial.Ice || material === VoxelMaterial.Crystal
            ? 0.18
            : material === VoxelMaterial.Road || material === VoxelMaterial.Cobble
              ? 0.55
              : 0.78,
        metallic: material === VoxelMaterial.Ore ? 0.18 : 0,
        wetnessResponse:
          material === VoxelMaterial.Mud || material === VoxelMaterial.Moss || material === VoxelMaterial.Soil
            ? 0.9
            : 0.35,
        normalStrength:
          material === VoxelMaterial.Snowpack || material === VoxelMaterial.Sand
            ? 0.24
            : material === VoxelMaterial.Rock || material === VoxelMaterial.Basalt
              ? 0.75
              : 0.45,
      }) satisfies VoxelRenderMaterialProfile
  );

  return Object.freeze({
    schemaVersion: 1 as const,
    owner: "world-generator" as const,
    id,
    terrainMaterials: Object.freeze(terrainMaterials),
    fluidMaterialIds: Object.freeze({
      water: "fluid.water",
      lava: "fluid.lava",
      sludge: "fluid.sludge",
    }),
  });
}

export function buildVoxelFluidBoundaryField(chunk: VoxelChunk): VoxelFluidBoundaryField {
  const solid = new Uint8Array(chunk.density.length);
  for (let index = 0; index < chunk.density.length; index += 1) {
    const material = chunk.materials[index] as VoxelMaterialId;
    solid[index] = material !== VoxelMaterial.Air && !isLiquid(material) && (chunk.density[index] ?? -1) >= 0 ? 1 : 0;
  }

  return Object.freeze({
    schemaVersion: 1 as const,
    owner: "fluid" as const,
    chunkKey: fluidChunkKey(chunk, "water"),
    sizeX: chunk.spec.sizeX,
    sizeY: chunk.spec.sizeY,
    sizeZ: chunk.spec.sizeZ,
    voxelSize: chunk.spec.voxelSize,
    solid,
    openBoundaryMask: 0b111111,
  });
}

function createFluidVolumeInput(chunk: VoxelChunk, materialKind: VoxelFluidMaterialKind): VoxelFluidVolumeInput {
  const cellCount = chunk.density.length;
  const volumeFraction = new Float32Array(cellCount);
  const pressure = new Float32Array(cellCount);
  const velocity = new Float32Array(cellCount * 3);
  const temperatureKelvin = new Float32Array(cellCount);
  const foam = new Float32Array(cellCount);
  const materialId =
    materialKind === "water" ? VoxelMaterial.Water : materialKind === "lava" ? VoxelMaterial.Lava : VoxelMaterial.Sludge;
  const temperature = materialKind === "lava" ? 1250 : materialKind === "sludge" ? 295 : 288;

  for (let index = 0; index < cellCount; index += 1) {
    if (chunk.materials[index] === materialId) {
      volumeFraction[index] = isLiquid(materialId) ? 1 : clamp01((chunk.density[index] ?? 0) + 0.5);
      pressure[index] = volumeFraction[index];
    }
    temperatureKelvin[index] = temperature;
  }

  return Object.freeze({
    schemaVersion: 1 as const,
    owner: "fluid" as const,
    chunkKey: fluidChunkKey(chunk, materialKind),
    sizeX: chunk.spec.sizeX,
    sizeY: chunk.spec.sizeY,
    sizeZ: chunk.spec.sizeZ,
    voxelSize: chunk.spec.voxelSize,
    material: materialKind,
    volumeFraction,
    pressure,
    velocity,
    temperatureKelvin,
    foam,
  });
}

function fluidSourceFromEdit(edit: VoxelEdit): VoxelFluidSourceSinkInput | null {
  if (edit.kind === "addMaterialBrush" || edit.kind === "replaceMaterialBrush") {
    const material = voxelFluidMaterialKind(edit.material);
    if (!material) return null;
    return Object.freeze({
      id: edit.id,
      kind: "source" as const,
      material,
      center: Object.freeze([...edit.brush.center] as [number, number, number]),
      radius: edit.brush.radius,
      rate: edit.brush.strength ?? 0.35,
      temperatureKelvin: material === "lava" ? 1250 : undefined,
    });
  }
  if (edit.kind === "volcanicDeposit") {
    return Object.freeze({
      id: `${edit.id}.lava`,
      kind: "source" as const,
      material: "lava" as const,
      center: Object.freeze([...edit.brush.center] as [number, number, number]),
      radius: edit.brush.radius,
      rate: Math.max(0.25, edit.heat ?? 1),
      temperatureKelvin: 1250,
    });
  }
  if (edit.kind === "collapseSinkhole") {
    return Object.freeze({
      id: `${edit.id}.drain`,
      kind: "sink" as const,
      material: "water" as const,
      center: Object.freeze([...edit.brush.center] as [number, number, number]),
      radius: edit.brush.radius,
      rate: Math.max(0.2, edit.collapseDepth ? edit.collapseDepth / 8 : 0.4),
    });
  }
  return null;
}

export function createVoxelFluidSimulationInputs(
  chunk: VoxelChunk,
  options: { readonly journals?: readonly VoxelEditJournal[] } = {}
): VoxelFluidSimulationInputs {
  const sourceSinks: VoxelFluidSourceSinkInput[] = [];
  const edits = options.journals?.flatMap((journal) => journal.edits) ?? [];
  for (const edit of edits) {
    const source = fluidSourceFromEdit(edit);
    if (source) sourceSinks.push(source);
  }

  const dirtyChunkKeys =
    edits.length > 0 ? getVoxelEditDirtyChunkKeys(chunk.key, chunk.spec, edits, 1).chunkKeys : [Object.freeze({ ...chunk.key })];

  return Object.freeze({
    schemaVersion: 1 as const,
    owner: "world-generator" as const,
    boundary: buildVoxelFluidBoundaryField(chunk),
    fluidVolumes: Object.freeze([
      createFluidVolumeInput(chunk, "water"),
      createFluidVolumeInput(chunk, "lava"),
      createFluidVolumeInput(chunk, "sludge"),
    ]),
    sourceSinks: Object.freeze(sourceSinks),
    dirtyChunkKeys: Object.freeze([...dirtyChunkKeys]),
  });
}

function buildFluidSurfaceForMaterial(
  chunk: VoxelChunk,
  materialKind: VoxelFluidMaterialKind,
  materialId: string
): VoxelFluidSurfaceMesh {
  const material =
    materialKind === "water" ? VoxelMaterial.Water : materialKind === "lava" ? VoxelMaterial.Lava : VoxelMaterial.Sludge;
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const foam: number[] = [];
  const min: [number, number, number] = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
  const max: [number, number, number] = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
  const { sizeX, sizeY, sizeZ, voxelSize } = chunk.spec;
  const origin = chunk.bounds.min;

  const pushVertex = (x: number, y: number, z: number, foamAmount: number) => {
    const index = positions.length / 3;
    positions.push(x, y, z);
    normals.push(0, 1, 0);
    foam.push(foamAmount);
    min[0] = Math.min(min[0], x);
    min[1] = Math.min(min[1], y);
    min[2] = Math.min(min[2], z);
    max[0] = Math.max(max[0], x);
    max[1] = Math.max(max[1], y);
    max[2] = Math.max(max[2], z);
    return index;
  };

  for (let y = 0; y < sizeY; y += 1) {
    for (let z = 0; z < sizeZ; z += 1) {
      for (let x = 0; x < sizeX; x += 1) {
        const index = voxelIndex(chunk.spec, x, y, z);
        if (chunk.materials[index] !== material) continue;
        const aboveIndex = y + 1 < sizeY ? voxelIndex(chunk.spec, x, y + 1, z) : -1;
        if (aboveIndex >= 0 && chunk.materials[aboveIndex] === material) continue;
        const wx = origin[0] + x * voxelSize;
        const wy = origin[1] + (y + 0.82) * voxelSize;
        const wz = origin[2] + z * voxelSize;
        const foamAmount = materialKind === "water" ? 0.18 : materialKind === "lava" ? 0 : 0.08;
        const a = pushVertex(wx, wy, wz, foamAmount);
        const b = pushVertex(wx + voxelSize, wy, wz, foamAmount);
        const c = pushVertex(wx + voxelSize, wy, wz + voxelSize, foamAmount);
        const d = pushVertex(wx, wy, wz + voxelSize, foamAmount);
        indices.push(a, b, c, a, c, d);
      }
    }
  }

  const fallbackMin: [number, number, number] = [...chunk.bounds.min];
  const fallbackMax: [number, number, number] = [...chunk.bounds.max];
  return Object.freeze({
    schemaVersion: 1 as const,
    owner: "fluid" as const,
    chunkKey: fluidChunkKey(chunk, materialKind),
    material: materialKind,
    materialId,
    positions: Object.freeze(positions),
    normals: Object.freeze(normals),
    indices: Object.freeze(indices),
    foam: Object.freeze(foam),
    bounds: Object.freeze({
      min: Object.freeze(Number.isFinite(min[0]) ? min : fallbackMin),
      max: Object.freeze(Number.isFinite(max[0]) ? max : fallbackMax),
    }),
  });
}

export function buildVoxelRenderSurfaces(
  chunk: VoxelChunk,
  options: BuildVoxelSurfaceMeshOptions & GenerateWorldDecorationsOptions = {}
): VoxelRenderSurfaces {
  const materialPalette = createVoxelMaterialPalette();
  const terrain = buildVoxelSurfaceMesh(chunk, { ...options, includeLiquids: false });
  const decorations = generateWorldDecorations(chunk, options);
  const overlays = decorations.instances.filter(
    (instance) => instance.family === "steam-vent" || instance.family === "lava-crack" || instance.family === "water-ripple"
  );

  return Object.freeze({
    schemaVersion: 1 as const,
    owner: "world-generator" as const,
    chunkKey: Object.freeze({ ...chunk.key }),
    materialPalette,
    terrain,
    fluids: Object.freeze([
      buildFluidSurfaceForMaterial(chunk, "water", materialPalette.fluidMaterialIds.water),
      buildFluidSurfaceForMaterial(chunk, "lava", materialPalette.fluidMaterialIds.lava),
      buildFluidSurfaceForMaterial(chunk, "sludge", materialPalette.fluidMaterialIds.sludge),
    ]),
    overlays: Object.freeze(overlays),
    decorations,
  });
}

function decorationForMaterial(
  climate: ClimateBand,
  material: VoxelMaterialId,
  roll: number,
  families: readonly WorldDecorationFamily[]
): WorldDecorationFamily | null {
  const prefer = (family: WorldDecorationFamily) => families.includes(family);
  if (material === VoxelMaterial.Water) return prefer("water-ripple") ? "water-ripple" : null;
  if (material === VoxelMaterial.Lava) return prefer("lava-crack") ? "lava-crack" : null;
  if (material === VoxelMaterial.Snowpack || material === VoxelMaterial.Ice) return prefer("snow-patch") ? "snow-patch" : null;
  if (material === VoxelMaterial.Crystal) return prefer("crystal") ? "crystal" : null;
  if (material === VoxelMaterial.Rock || material === VoxelMaterial.Basalt || material === VoxelMaterial.Gravel) {
    if (prefer("boulder") && roll > 0.7) return "boulder";
    return prefer("rock") ? "rock" : null;
  }
  if (climate === "volcanic" && prefer("steam-vent") && roll > 0.76) return "steam-vent";
  if (climate === "underground" && prefer("fungi") && roll > 0.42) return "fungi";
  if (prefer("tree") && roll > 0.82) return "tree";
  if (prefer("shrub") && roll > 0.62) return "shrub";
  if (prefer("flower") && roll > 0.58) return "flower";
  if (prefer("reed") && material === VoxelMaterial.Mud && roll > 0.35) return "reed";
  if (prefer("grass") && roll > 0.32) return "grass";
  if (prefer("fallen-log") && roll > 0.88) return "fallen-log";
  return null;
}

export function generateWorldDecorations(
  chunk: VoxelChunk,
  options: GenerateWorldDecorationsOptions = {}
): WorldDecorationLayer {
  const maxInstances = Math.max(0, options.maxInstances ?? 256);
  const instances: WorldDecorationInstance[] = [];
  const origin = chunk.bounds.min;
  for (let z = 0; z < chunk.spec.sizeZ && instances.length < maxInstances; z += 1) {
    for (let x = 0; x < chunk.spec.sizeX && instances.length < maxInstances; x += 1) {
      for (let y = chunk.spec.sizeY - 1; y >= 0; y -= 1) {
        const index = voxelIndex(chunk.spec, x, y, z);
        const material = chunk.materials[index] as VoxelMaterialId;
        if (material === VoxelMaterial.Air) continue;
        const roll = hashPoint(chunk.key.seed, chunk.key.cx * 97 + x, chunk.key.cy * 53 + y, chunk.key.cz * 89 + z, 0xdec0);
        const family = decorationForMaterial(chunk.climate, material, roll, chunk.biome.decorativeFamilies);
        if (family && roll > 0.24) {
          const radius = 0.08 + roll * 0.45;
          const height = family === "tree" ? 2.4 + roll * 4.8 : family === "shrub" ? 0.5 + roll * 0.9 : 0.1 + roll * 0.6;
          instances.push(
            Object.freeze({
              id: `${chunkId(chunk.key)}.${family}.${x}.${y}.${z}`,
              family,
              category: family === "boulder" || family === "rock" || family === "water-ripple" || family === "lava-crack" ? "world" : "decorative",
              climate: chunk.climate,
              position: Object.freeze([
                origin[0] + (x + 0.5) * chunk.spec.voxelSize,
                origin[1] + (y + 1) * chunk.spec.voxelSize,
                origin[2] + (z + 0.5) * chunk.spec.voxelSize,
              ] as [number, number, number]),
              normal: Object.freeze([0, 1, 0] as const),
              radius,
              height,
              material,
              seed: hash32(chunk.key.seed ^ x ^ (y << 8) ^ (z << 16)),
            })
          );
        }
        break;
      }
    }
  }
  return Object.freeze({
    schemaVersion: 1 as const,
    chunkKey: Object.freeze({ ...chunk.key }),
    climate: chunk.climate,
    instances: Object.freeze(instances),
  });
}

export function createVoxelEditJournal(
  chunkKey: VoxelChunkKey,
  edits: readonly VoxelEdit[]
): VoxelEditJournal {
  return Object.freeze({
    schemaVersion: 1 as const,
    chunkKey: Object.freeze({ ...chunkKey }),
    edits: Object.freeze([...edits]),
  });
}

export function isVoxelMaterialId(value: number): value is VoxelMaterialId {
  return isValidMaterial(value);
}
