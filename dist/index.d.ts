declare const TerrainBiome: {
    readonly Plains: 0;
    readonly Tundra: 1;
    readonly Savanna: 2;
    readonly River: 3;
    readonly City: 4;
    readonly Village: 5;
    readonly Ice: 6;
    readonly Snow: 7;
    readonly Mountainous: 8;
    readonly Volcanic: 9;
    readonly Road: 10;
    readonly Town: 11;
    readonly Castle: 12;
    readonly MixedForest: 13;
};
type TerrainBiomeId = (typeof TerrainBiome)[keyof typeof TerrainBiome];
declare const TerrainBiomeLabel: Record<TerrainBiomeId, string>;
declare const MacroBiome: {
    readonly Polar: 0;
    readonly ColdTemperate: 1;
    readonly Temperate: 2;
    readonly Arid: 3;
    readonly Tropical: 4;
    readonly Alpine: 5;
    readonly Volcanic: 6;
    readonly Freshwater: 7;
    readonly Coastal: 8;
    readonly Urban: 9;
    readonly Underground: 10;
};
type MacroBiomeId = (typeof MacroBiome)[keyof typeof MacroBiome];
declare const MacroBiomeLabel: Record<MacroBiomeId, string>;
declare const SurfaceCover: {
    readonly Grass: 0;
    readonly Dirt: 1;
    readonly Sand: 2;
    readonly Rock: 3;
    readonly Gravel: 4;
    readonly Snowpack: 5;
    readonly Ice: 6;
    readonly Mud: 7;
    readonly Ash: 8;
    readonly Cobble: 9;
    readonly Road: 10;
    readonly Water: 11;
    readonly Basalt: 12;
    readonly Crystal: 13;
    readonly Sludge: 14;
};
type SurfaceCoverId = (typeof SurfaceCover)[keyof typeof SurfaceCover];
declare const SurfaceCoverLabel: Record<SurfaceCoverId, string>;
declare const MicroFeature: {
    readonly Tree: 0;
    readonly Bush: 1;
    readonly GrassTuft: 2;
    readonly Reed: 3;
    readonly Rock: 4;
    readonly Boulder: 5;
    readonly WaterRipple: 6;
    readonly IceSpike: 7;
    readonly Hut: 8;
    readonly Wall: 9;
    readonly Bridge: 10;
    readonly Gate: 11;
    readonly Tower: 12;
    readonly Ruin: 13;
    readonly Stalactite: 14;
    readonly Stalagmite: 15;
    readonly CrystalSpire: 16;
    readonly Mushroom: 17;
    readonly TimberSupport: 18;
    readonly Rail: 19;
    readonly Cart: 20;
    readonly Lantern: 21;
    readonly Grate: 22;
    readonly BrickTunnel: 23;
    readonly Flower: 24;
};
type MicroFeatureId = (typeof MicroFeature)[keyof typeof MicroFeature];
declare const MicroFeatureLabel: Record<MicroFeatureId, string>;
interface HexCell {
    q: number;
    r: number;
    level: number;
    flags?: number;
}
declare const SlopeBand: {
    readonly Downward: 0;
    readonly Flat: 1;
    readonly Upward: 2;
};
type SlopeBandId = (typeof SlopeBand)[keyof typeof SlopeBand];
declare const SlopeBandLabel: Record<SlopeBandId, string>;
interface TerrainCell {
    height: number;
    heat: number;
    moisture: number;
    biome: TerrainBiomeId;
    macroBiome?: MacroBiomeId;
    surface?: SurfaceCoverId;
    feature?: MicroFeatureId;
    obstacle?: number;
    foliage?: number;
    slopeBand?: SlopeBandId;
}
interface TerrainParams {
    seed: number;
    cellCount: number;
    heatBias?: number;
    heightScale?: number;
    macroScale?: number;
    macroWarpStrength?: number;
    styleMixStrength?: number;
    terraceSteps?: number;
    terraceStrength?: number;
    craterStrength?: number;
    craterScale?: number;
    heightMin?: number;
    heightMax?: number;
    slopeDownMax?: number;
    slopeUpMin?: number;
}
interface HexLevelSpec {
    level: number;
    areaM2: number;
    sideMeters: number;
    acrossFlatsMeters: number;
}

declare function hexAreaFromSide(sideMeters: number): number;
declare function hexSideFromArea(areaM2: number): number;
declare function axialToWorld(q: number, r: number, sizeMeters: number): {
    x: number;
    y: number;
};
declare function generateHexGrid(radius: number, level?: number): HexCell[];
declare function buildHexLevels(options?: {
    topAreaKm2?: number;
    minAreaM2?: number;
    levels?: number;
}): HexLevelSpec[];

declare function packHexCells(cells: HexCell[]): Int32Array;
declare function encodeTerrainParams(params: TerrainParams): ArrayBuffer;
declare function unpackTerrain(buffer: ArrayBuffer): TerrainCell[];

declare const terrainWgslUrl: URL;
declare const fieldWgslUrl: URL;
declare const fractalPrepassWgslUrl: URL;
declare function loadTerrainWgsl(options?: {
    url?: URL | string;
    fetcher?: typeof fetch | null;
}): Promise<string>;
declare function loadFieldWgsl(options?: {
    url?: URL | string;
    fetcher?: typeof fetch | null;
}): Promise<string>;
declare function loadFractalPrepassWgsl(options?: {
    url?: URL | string;
    fetcher?: typeof fetch | null;
}): Promise<string>;

declare const FIELD_DOWNWARD_MAX = 0.2;
declare const FIELD_UPWARD_MIN = 0.8;
type FieldParams = {
    seed: number;
    scale: number;
    warpScale: number;
    warpStrength: number;
    iterations: number;
    power: number;
    detailScale: number;
    detailIterations: number;
    detailPower: number;
    ridgePower: number;
    heatBias: number;
    moistureBias: number;
    macroScale: number;
    macroWarpStrength: number;
    styleMixStrength: number;
    terraceSteps: number;
    terraceStrength: number;
    craterStrength: number;
    craterScale: number;
    heightMin: number;
    heightMax: number;
};
type FieldSample = {
    height: number;
    cumulativeHeight: number;
    slopeBand: SlopeBandId;
    heat: number;
    moisture: number;
    roughness: number;
    rockiness: number;
    water: number;
    featureMask: number;
    obstacleMask: number;
    foliageMask: number;
    ridge: number;
    base: number;
    detail: number;
};
declare function classifySlopeBand(cumulativeHeight: number): SlopeBandId;
declare function defaultFieldParams(seed?: number): FieldParams;
declare function sampleFieldStack(x: number, z: number, params: FieldParams): FieldSample;

interface MixedForestOptions {
    seed?: number;
    terrainSeed?: number;
    featureSeed?: number;
    foliageSeed?: number;
    radius?: number;
    topAreaKm2?: number;
    minAreaM2?: number;
    levels?: number;
}
interface MixedForestLayer {
    levelSpec: HexLevelSpec;
    cells: HexCell[];
    terrain: TerrainCell[];
}
declare function generateTemperateMixedForest(options: MixedForestOptions): MixedForestLayer;

interface PerfMonitorOptions {
    targetFps?: number;
    tolerance?: number;
    sampleSize?: number;
    minSampleFraction?: number;
    cooldownMs?: number;
    qualitySlew?: number;
    initialBudget?: number;
    auto?: boolean;
}
interface PerfMonitorUpdate {
    budget: number;
    medianFps: number | null;
    miss: number | null;
    adjusted: boolean;
    stable: boolean;
}
interface PerfMonitor {
    sampleFrame: (dtSeconds: number) => void;
    sampleFps: (fps: number) => void;
    update: (nowMs: number) => PerfMonitorUpdate;
    resetSamples: () => void;
    setBudget: (budget: number) => void;
    getBudget: () => number;
    setAuto: (enabled: boolean) => void;
    getConfig: () => Required<PerfMonitorOptions>;
}
declare function createPerfMonitor(options?: PerfMonitorOptions): PerfMonitor;

type GPUDeviceLike = any;
declare const FRACTAL_ASSET_VERSION = 2;
declare const FRACTAL_SAMPLE_STRIDE = 8;
type FractalMandelSettings = {
    scale: number;
    strength: number;
    rockBoost: number;
};
declare const defaultFractalMandelSettings: FractalMandelSettings;
type FractalAsset = {
    seed: number;
    extent: number;
    gridSize: number;
    heightScale: number;
    samples: Float32Array;
};
type FractalAssetPayload = {
    version: number;
    seed: number;
    extent: number;
    gridSize: number;
    heightScale: number;
    sampleStride: number;
    samples: number[];
};
type FractalPrepassRunOptions = {
    seed: number;
    extent: number;
    heightScale: number;
    fieldParams?: Partial<FieldParams>;
    mandel?: Partial<FractalMandelSettings>;
};
type FractalPrepassRunner = {
    gridSize: number;
    gridPoints: number;
    sampleCount: number;
    run: (options: FractalPrepassRunOptions) => Promise<FractalAsset>;
};
declare function serializeFractalAsset(asset: FractalAsset): FractalAssetPayload;
declare function parseFractalAsset(payload: unknown): FractalAsset | null;
declare function assetMatches(asset: FractalAsset | null, config: {
    seed: number;
    extent: number;
    gridSize: number;
}): boolean;
declare function createFractalPrepassRunner(options: {
    device: GPUDeviceLike;
    wgsl: string;
    gridSize: number;
}): FractalPrepassRunner;

type TileKey = {
    seed: number;
    tx: number;
    tz: number;
    level: number;
    tileSizeWorld?: number;
};
interface TileAsset {
    key: TileKey;
    gridSize: number;
    heightScale: number;
    height: Float32Array;
    fields?: Float32Array;
    fieldStride?: number;
    materials?: Uint8Array;
    materialStride?: number;
    features?: Float32Array;
    featureStride?: number;
}
interface TileAssetPayload {
    version: number;
    key: TileKey;
    gridSize: number;
    heightScale: number;
    height: number[];
    fields?: number[];
    fieldStride?: number;
    materials?: number[];
    materialStride?: number;
    features?: number[];
    featureStride?: number;
}
declare const TILE_ASSET_VERSION = 1;
declare function validateTileAssetPayload(payload: TileAssetPayload): string[];
declare function serializeTileAssetJson(asset: TileAsset): TileAssetPayload;
declare function parseTileAssetJson(payload: TileAssetPayload): TileAsset;
interface TileBakeOutput {
    asset: TileAsset;
    payload: TileAssetPayload;
    binary: ArrayBuffer;
}
interface TileBakeWriter {
    writeJson?: (payload: TileAssetPayload, asset: TileAsset) => void | Promise<void>;
    writeBinary?: (binary: ArrayBuffer, asset: TileAsset, payload: TileAssetPayload) => void | Promise<void>;
}
declare function bakeTileAsset(asset: TileAsset, writer?: TileBakeWriter): Promise<TileBakeOutput>;
declare function serializeTileAssetBinary(asset: TileAsset): ArrayBuffer;
declare function parseTileAssetBinary(input: ArrayBuffer | ArrayBufferView): TileAsset;
declare function serializeTileAssetBinaryFromJson(payload: TileAssetPayload): ArrayBuffer;
declare function serializeTileAssetJsonFromBinary(input: ArrayBuffer | ArrayBufferView): TileAssetPayload;

type TileCacheStatus = "pending" | "ready" | "error";
interface TileCacheEntry {
    key: TileKey;
    status: TileCacheStatus;
    asset?: TileAsset;
    payload?: TileAssetPayload;
    binary?: ArrayBuffer;
    bytes: number;
    lastAccess: number;
    error?: unknown;
}
type TileGenerator = (key: TileKey) => TileAsset | Promise<TileAsset>;
interface TileCacheOptions {
    maxEntries?: number;
    maxBytes?: number;
    keepBinary?: boolean;
    keepJson?: boolean;
    writer?: TileBakeWriter;
    now?: () => number;
    onEvict?: (entry: TileCacheEntry) => void;
}
declare const DEFAULT_TILE_SIZE_WORLD = 64;
declare function normalizeTileKey(key: TileKey): TileKey;
declare function tileKeyToString(key: TileKey): string;
declare function resolveTileSizeWorld(key: TileKey, defaultTileSizeWorld?: number): number;
declare function tileBoundsWorld(key: TileKey, defaultTileSizeWorld?: number): {
    minX: number;
    minZ: number;
    maxX: number;
    maxZ: number;
    centerX: number;
    centerZ: number;
    size: number;
};
declare function tileKeyFromWorldPosition(options: {
    seed: number;
    x: number;
    z: number;
    level?: number;
    tileSizeWorld?: number;
    defaultTileSizeWorld?: number;
}): TileKey;
declare function tileAssetFileStem(key: TileKey): string;
declare class TileCache {
    private entries;
    private inflight;
    private totalBytes;
    private options;
    constructor(options?: TileCacheOptions);
    getStats(): {
        entries: number;
        bytes: number;
        inflight: number;
    };
    has(key: TileKey): boolean;
    get(key: TileKey): TileCacheEntry | undefined;
    getOrCreate(key: TileKey, generator: TileGenerator): Promise<TileCacheEntry>;
    delete(key: TileKey): boolean;
    private replaceEntry;
    private evictIfNeeded;
}

type Vec3 = [number, number, number];
type MeshGeomorph = {
    targetY: number;
    weight?: number;
};
interface MeshBuilderOptions {
    size?: number;
    includeGeomorph?: boolean;
    defaultMaterial?: number;
    foliageMaterial?: number;
}
interface MeshBuilder {
    vertices: number[];
    boxMin: number[];
    boxMax: number[];
    vertexStride: number;
    includeGeomorph: boolean;
    addTriangle: (a: Vec3, b: Vec3, c: Vec3, normal: Vec3, color: Vec3, swayA?: number, swayB?: number, swayC?: number, material?: number, morphA?: MeshGeomorph, morphB?: MeshGeomorph, morphC?: MeshGeomorph) => void;
    addQuad: (a: Vec3, b: Vec3, c: Vec3, d: Vec3, normal: Vec3, color: Vec3, swayA?: number, swayB?: number, swayC?: number, swayD?: number, material?: number, morphA?: MeshGeomorph, morphB?: MeshGeomorph, morphC?: MeshGeomorph, morphD?: MeshGeomorph) => void;
    addTreeMesh: (center: Vec3, baseHeight: number, seedValue: number, material?: number) => void;
    addBounds: (points: Vec3[], minY?: number, maxYOverride?: number) => void;
    readonly treeMeshCount: number;
}
declare function normalize(vec: Vec3): Vec3;
declare function computeNormal(a: Vec3, b: Vec3, c: Vec3): Vec3;
declare function shade(color: Vec3, factor: number): Vec3;
declare function createMeshBuilder(sizeOrOptions?: number | MeshBuilderOptions): MeshBuilder;

export { DEFAULT_TILE_SIZE_WORLD, FIELD_DOWNWARD_MAX, FIELD_UPWARD_MIN, FRACTAL_ASSET_VERSION, FRACTAL_SAMPLE_STRIDE, type FieldParams, type FieldSample, type FractalAsset, type FractalAssetPayload, type FractalMandelSettings, type FractalPrepassRunOptions, type FractalPrepassRunner, type HexCell, type HexLevelSpec, MacroBiome, type MacroBiomeId, MacroBiomeLabel, type MeshBuilder, type MeshBuilderOptions, type MeshGeomorph, MicroFeature, type MicroFeatureId, MicroFeatureLabel, type MixedForestLayer, type MixedForestOptions, type PerfMonitor, type PerfMonitorOptions, type PerfMonitorUpdate, SlopeBand, type SlopeBandId, SlopeBandLabel, SurfaceCover, type SurfaceCoverId, SurfaceCoverLabel, TILE_ASSET_VERSION, TerrainBiome, type TerrainBiomeId, TerrainBiomeLabel, type TerrainCell, type TerrainParams, type TileAsset, type TileAssetPayload, type TileBakeOutput, type TileBakeWriter, TileCache, type TileCacheEntry, type TileCacheOptions, type TileCacheStatus, type TileGenerator, type TileKey, type Vec3, assetMatches, axialToWorld, bakeTileAsset, buildHexLevels, classifySlopeBand, computeNormal, createFractalPrepassRunner, createMeshBuilder, createPerfMonitor, defaultFieldParams, defaultFractalMandelSettings, encodeTerrainParams, fieldWgslUrl, fractalPrepassWgslUrl, generateHexGrid, generateTemperateMixedForest, hexAreaFromSide, hexSideFromArea, loadFieldWgsl, loadFractalPrepassWgsl, loadTerrainWgsl, normalize, normalizeTileKey, packHexCells, parseFractalAsset, parseTileAssetBinary, parseTileAssetJson, resolveTileSizeWorld, sampleFieldStack, serializeFractalAsset, serializeTileAssetBinary, serializeTileAssetBinaryFromJson, serializeTileAssetJson, serializeTileAssetJsonFromBinary, shade, terrainWgslUrl, tileAssetFileStem, tileBoundsWorld, tileKeyFromWorldPosition, tileKeyToString, unpackTerrain, validateTileAssetPayload };
