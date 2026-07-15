import {
  ORIGIN_SHARD_ATLAS_SPEC,
  WORLD_ATLAS_COUNTS,
  WORLD_BEDROCK_IDS,
  WORLD_BIOME_IDS,
  WORLD_FLORA_PROFILE_IDS,
  WORLD_HYDROLOGY_CLASSES,
  WORLD_WATER_KINDS,
  normalizeWorldTileKey,
  type WorldAtlasBakePlan,
  type WorldAtlasDiagnostics,
  type WorldAtlasOverviewCellV1,
  type WorldBiomeId,
  type WorldFloraProfileId,
  type WorldMacroZoneV1,
  type WorldTileKey,
  type WorldTileMacroDataV1,
  type WorldWaterKind,
} from "./world-atlas-contracts";

const MACRO_COLUMNS = 1_000;
const MACRO_ROWS = 500;
const MACRO_CELL_COUNT = MACRO_COLUMNS * MACRO_ROWS;
const TAU = Math.PI * 2;
const D8_X = Object.freeze([1, 1, 0, -1, -1, -1, 0, 1] as const);
const D8_Z = Object.freeze([0, 1, 1, 1, 0, -1, -1, -1] as const);
const D4_X = Object.freeze([1, 0, -1, 0] as const);
const D4_Z = Object.freeze([0, 1, 0, -1] as const);

interface TectonicPlate {
  readonly x: number;
  readonly z: number;
  readonly base: number;
  readonly motionX: number;
  readonly motionZ: number;
}

/** Compact global macro fields used while baking tile assets. */
export interface WorldAtlasMacroGrid {
  readonly elevation: Float32Array;
  readonly temperature: Float32Array;
  readonly precipitation: Float32Array;
  readonly moisture: Float32Array;
  readonly windX: Float32Array;
  readonly windZ: Float32Array;
  readonly oceanInfluence: Float32Array;
  readonly slope: Float32Array;
  readonly flowDirection: Int8Array;
  readonly downstream: Int32Array;
  readonly flowAccumulation: Uint32Array;
  readonly streamOrder: Uint8Array;
  readonly waterKind: Uint8Array;
  readonly riverDepth: Float32Array;
  readonly floodplain: Float32Array;
  readonly hydrologyClass: Uint8Array;
  readonly waterSurfaceElevation: Float32Array;
  readonly bedrock: Uint8Array;
  readonly soilDepth: Float32Array;
  readonly sedimentDepth: Float32Array;
  readonly waterTableDepth: Float32Array;
  readonly aquifer: Float32Array;
  readonly riverbedGravelDepth: Float32Array;
  readonly floodplainSiltDepth: Float32Array;
  readonly floodplainClayDepth: Float32Array;
  readonly alluvialDepth: Float32Array;
  readonly biome: Uint8Array;
  readonly floraProfile: Uint8Array;
  readonly floraSeed: Uint32Array;
  readonly mountainous: Uint8Array;
  readonly diagnostics: WorldAtlasDiagnostics;
}

interface HeapNode {
  readonly index: number;
  readonly priority: number;
}

class MinHeap {
  private readonly indices: number[] = [];
  private readonly priorities: number[] = [];

  get size(): number {
    return this.indices.length;
  }

  push(index: number, priority: number): void {
    let cursor = this.indices.length;
    this.indices.push(index);
    this.priorities.push(priority);
    while (cursor > 0) {
      const parent = (cursor - 1) >> 1;
      if (this.priorities[parent]! <= priority) break;
      this.indices[cursor] = this.indices[parent]!;
      this.priorities[cursor] = this.priorities[parent]!;
      cursor = parent;
    }
    this.indices[cursor] = index;
    this.priorities[cursor] = priority;
  }

  pop(): HeapNode | undefined {
    if (this.indices.length === 0) return undefined;
    const result = {
      index: this.indices[0]!,
      priority: this.priorities[0]!,
    };
    const lastIndex = this.indices.pop()!;
    const lastPriority = this.priorities.pop()!;
    if (this.indices.length === 0) return result;
    let cursor = 0;
    while (true) {
      const left = cursor * 2 + 1;
      if (left >= this.indices.length) break;
      const right = left + 1;
      const child =
        right < this.indices.length &&
        this.priorities[right]! < this.priorities[left]!
          ? right
          : left;
      if (this.priorities[child]! >= lastPriority) break;
      this.indices[cursor] = this.indices[child]!;
      this.priorities[cursor] = this.priorities[child]!;
      cursor = child;
    }
    this.indices[cursor] = lastIndex;
    this.priorities[cursor] = lastPriority;
    return result;
  }
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function hash32(seed: number, x: number, z: number, salt = 0): number {
  let value =
    (seed ^ Math.imul(x | 0, 0x9e3779b1) ^ Math.imul(z | 0, 0x85ebca77) ^ salt) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d) >>> 0;
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b) >>> 0;
  value ^= value >>> 16;
  return value >>> 0;
}

function unitHash(seed: number, x: number, z: number, salt = 0): number {
  return hash32(seed, x, z, salt) / 0xffffffff;
}

function wrapMacroX(x: number): number {
  return ((x % MACRO_COLUMNS) + MACRO_COLUMNS) % MACRO_COLUMNS;
}

function macroIndex(x: number, z: number): number {
  return z * MACRO_COLUMNS + wrapMacroX(x);
}

function macroCoordinates(index: number): readonly [number, number] {
  return [index % MACRO_COLUMNS, Math.floor(index / MACRO_COLUMNS)];
}

function createPlates(seed: number): readonly TectonicPlate[] {
  const plates: TectonicPlate[] = [];
  for (let index = 0; index < 18; index += 1) {
    const angle = unitHash(seed, index, 0, 0x7137) * TAU;
    plates.push({
      x: unitHash(seed, index, 1, 0xa511),
      z: unitHash(seed, index, 2, 0xc2b2),
      base: unitHash(seed, index, 3, 0x27d4) * 2.3 - 1.15,
      motionX: Math.cos(angle),
      motionZ: Math.sin(angle),
    });
  }
  return plates;
}

function wrappedDeltaX(from: number, to: number): number {
  let delta = to - from;
  if (delta > 0.5) delta -= 1;
  if (delta < -0.5) delta += 1;
  return delta;
}

function baseElevationScore(
  seed: number,
  x: number,
  z: number,
  plates: readonly TectonicPlate[],
): number {
  const nx = (x + 0.5) / MACRO_COLUMNS;
  const nz = (z + 0.5) / MACRO_ROWS;
  let nearest = plates[0]!;
  let second = plates[1]!;
  let nearestDistance = Infinity;
  let secondDistance = Infinity;
  for (const plate of plates) {
    const dx = wrappedDeltaX(nx, plate.x) * 1.15;
    const dz = nz - plate.z;
    const distance = dx * dx + dz * dz;
    if (distance < nearestDistance) {
      second = nearest;
      secondDistance = nearestDistance;
      nearest = plate;
      nearestDistance = distance;
    } else if (distance < secondDistance) {
      second = plate;
      secondDistance = distance;
    }
  }

  const boundary = Math.exp(
    -Math.abs(Math.sqrt(secondDistance) - Math.sqrt(nearestDistance)) * 36,
  );
  let normalX = wrappedDeltaX(nearest.x, second.x);
  let normalZ = second.z - nearest.z;
  const normalLength = Math.hypot(normalX, normalZ) || 1;
  normalX /= normalLength;
  normalZ /= normalLength;
  const relativeMotion =
    (second.motionX - nearest.motionX) * normalX +
    (second.motionZ - nearest.motionZ) * normalZ;
  const convergence = Math.max(0, -relativeMotion);
  const divergence = Math.max(0, relativeMotion);

  const phaseA = unitHash(seed, 1, 1, 0x51f2) * TAU;
  const phaseB = unitHash(seed, 2, 2, 0x9e37) * TAU;
  const phaseC = unitHash(seed, 3, 3, 0x85eb) * TAU;
  const harmonic =
    Math.sin(nx * TAU * 2 + nz * 4.7 + phaseA) * 0.48 +
    Math.cos(nx * TAU * 5 - nz * 8.3 + phaseB) * 0.27 +
    Math.sin(nx * TAU * 11 + nz * 15.1 + phaseC) * 0.13;
  const ridge = Math.pow(
    1 - Math.abs(Math.sin(nx * TAU * 3 + nz * 9.2 + phaseB)),
    3,
  );

  return (
    nearest.base * 0.74 +
    harmonic +
    ridge * 0.58 +
    boundary * (convergence * 1.35 - divergence * 0.8) +
    0.01
  );
}

function scoreToElevation(score: number): number {
  if (score < 0) {
    return Math.max(
      ORIGIN_SHARD_ATLAS_SPEC.minYM,
      -Math.pow(-score, 0.82) * 650,
    );
  }
  return Math.min(
    ORIGIN_SHARD_ATLAS_SPEC.maxYM - 0.001,
    Math.pow(score, 0.78) * 1_300,
  );
}

function flowDirectionCode(
  childX: number,
  childZ: number,
  parentX: number,
  parentZ: number,
): number {
  let dx = parentX - childX;
  if (dx > 1) dx = -1;
  if (dx < -1) dx = 1;
  const dz = parentZ - childZ;
  return D8_X.findIndex((value, index) => value === dx && D8_Z[index] === dz);
}

function routeHydrology(
  elevation: Float32Array,
): Readonly<{
  filled: Float32Array;
  downstream: Int32Array;
  flowDirection: Int8Array;
  order: Int32Array;
  orderLength: number;
}> {
  const filled = new Float32Array(elevation);
  const downstream = new Int32Array(MACRO_CELL_COUNT);
  downstream.fill(-1);
  const flowDirection = new Int8Array(MACRO_CELL_COUNT);
  flowDirection.fill(-1);
  const visited = new Uint8Array(MACRO_CELL_COUNT);
  const order = new Int32Array(MACRO_CELL_COUNT);
  const heap = new MinHeap();

  for (let index = 0; index < MACRO_CELL_COUNT; index += 1) {
    if (elevation[index]! < ORIGIN_SHARD_ATLAS_SPEC.seaLevelM) {
      visited[index] = 1;
      heap.push(index, elevation[index]!);
    }
  }
  if (heap.size === 0) {
    throw new Error("Atlas generation produced no ocean drainage seeds");
  }

  let orderLength = 0;
  while (heap.size > 0) {
    const current = heap.pop()!;
    order[orderLength] = current.index;
    orderLength += 1;
    const [x, z] = macroCoordinates(current.index);
    for (let direction = 0; direction < D8_X.length; direction += 1) {
      const neighborZ = z + D8_Z[direction]!;
      if (neighborZ < 0 || neighborZ >= MACRO_ROWS) continue;
      const neighborX = wrapMacroX(x + D8_X[direction]!);
      const neighbor = macroIndex(neighborX, neighborZ);
      if (visited[neighbor] === 1) continue;
      visited[neighbor] = 1;
      const routedElevation = Math.max(
        elevation[neighbor]!,
        current.priority + 0.001,
      );
      filled[neighbor] = routedElevation;
      downstream[neighbor] = current.index;
      flowDirection[neighbor] = flowDirectionCode(
        neighborX,
        neighborZ,
        x,
        z,
      );
      heap.push(neighbor, routedElevation);
    }
  }

  if (orderLength !== MACRO_CELL_COUNT) {
    throw new Error("Hydrology routing did not visit every macro zone");
  }
  return { filled, downstream, flowDirection, order, orderLength };
}

function computeOceanDistance(waterKind: Uint8Array): Uint16Array {
  const distance = new Uint16Array(MACRO_CELL_COUNT);
  distance.fill(0xffff);
  const queue = new Int32Array(MACRO_CELL_COUNT);
  let head = 0;
  let tail = 0;
  for (let index = 0; index < MACRO_CELL_COUNT; index += 1) {
    if (waterKind[index] === WORLD_WATER_KINDS.indexOf("ocean")) {
      distance[index] = 0;
      queue[tail] = index;
      tail += 1;
    }
  }
  while (head < tail) {
    const current = queue[head]!;
    head += 1;
    const [x, z] = macroCoordinates(current);
    const nextDistance = Math.min(0xfffe, distance[current]! + 1);
    for (let direction = 0; direction < D4_X.length; direction += 1) {
      const neighborZ = z + D4_Z[direction]!;
      if (neighborZ < 0 || neighborZ >= MACRO_ROWS) continue;
      const neighbor = macroIndex(x + D4_X[direction]!, neighborZ);
      if (distance[neighbor]! <= nextDistance) continue;
      distance[neighbor] = nextDistance;
      queue[tail] = neighbor;
      tail += 1;
    }
  }
  return distance;
}

function classifyBiome(
  temperatureC: number,
  precipitationMm: number,
  elevationM: number,
  slope: number,
  waterKind: WorldWaterKind,
  floodplain: number,
): WorldBiomeId {
  if (waterKind === "ocean") return "ocean";
  if (waterKind === "lake" || waterKind === "river") return "freshwater";
  if (floodplain > 0.45 && precipitationMm > 650) return "wetland";
  if (elevationM > 1_250 || (elevationM > 750 && slope > 0.18)) return "alpine";
  if (temperatureC < -8) return "polar-desert";
  if (temperatureC < 2) return "tundra";
  if (temperatureC < 9) return "boreal-forest";
  if (precipitationMm < 450) return "subtropical-desert";
  if (temperatureC > 23 && precipitationMm > 1_300) return "tropical-forest";
  if (precipitationMm > 850) return "temperate-forest";
  return "temperate-grassland";
}

function floraForBiome(biome: WorldBiomeId): WorldFloraProfileId {
  switch (biome) {
    case "tundra":
      return "tundra-low";
    case "boreal-forest":
      return "boreal";
    case "temperate-forest":
      return "temperate-mixed";
    case "temperate-grassland":
      return "grassland";
    case "subtropical-desert":
      return "desert-sparse";
    case "tropical-forest":
      return "tropical-dense";
    case "wetland":
    case "freshwater":
      return "wetland-reeds";
    case "alpine":
      return "alpine-sparse";
    default:
      return "none";
  }
}

/** Generate deterministic global macro fields for one bake plan. */
export function generateWorldAtlasMacroGrid(
  plan: WorldAtlasBakePlan,
): WorldAtlasMacroGrid {
  const plates = createPlates(plan.seed);
  const elevation = new Float32Array(MACRO_CELL_COUNT);
  for (let z = 0; z < MACRO_ROWS; z += 1) {
    for (let x = 0; x < MACRO_COLUMNS; x += 1) {
      const index = macroIndex(x, z);
      elevation[index] = scoreToElevation(
        baseElevationScore(plan.seed, x, z, plates),
      );
    }
  }

  const routed = routeHydrology(elevation);
  const flowAccumulation = new Uint32Array(MACRO_CELL_COUNT);
  flowAccumulation.fill(1);
  const maxUpstreamOrder = new Uint8Array(MACRO_CELL_COUNT);
  const maxUpstreamCount = new Uint8Array(MACRO_CELL_COUNT);
  const streamOrder = new Uint8Array(MACRO_CELL_COUNT);
  for (let cursor = routed.orderLength - 1; cursor >= 0; cursor -= 1) {
    const index = routed.order[cursor]!;
    const order = Math.max(
      1,
      maxUpstreamOrder[index]! + (maxUpstreamCount[index]! >= 2 ? 1 : 0),
    );
    streamOrder[index] = Math.min(255, order);
    const parent = routed.downstream[index]!;
    if (parent < 0) continue;
    flowAccumulation[parent] = Math.min(
      0xffffffff,
      flowAccumulation[parent]! + flowAccumulation[index]!,
    );
    if (order > maxUpstreamOrder[parent]!) {
      maxUpstreamOrder[parent] = order;
      maxUpstreamCount[parent] = 1;
    } else if (order === maxUpstreamOrder[parent]!) {
      maxUpstreamCount[parent] = Math.min(
        255,
        maxUpstreamCount[parent]! + 1,
      );
    }
  }

  const slope = new Float32Array(MACRO_CELL_COUNT);
  const riverDepth = new Float32Array(MACRO_CELL_COUNT);
  const floodplain = new Float32Array(MACRO_CELL_COUNT);
  const waterKind = new Uint8Array(MACRO_CELL_COUNT);
  const mountainous = new Uint8Array(MACRO_CELL_COUNT);
  let oceanZoneCount = 0;
  let mountainZoneCount = 0;
  let riverZoneCount = 0;
  let lakeZoneCount = 0;
  let flowCycleCount = 0;

  const orderPosition = new Int32Array(MACRO_CELL_COUNT);
  for (let cursor = 0; cursor < routed.orderLength; cursor += 1) {
    orderPosition[routed.order[cursor]!] = cursor;
  }

  for (let z = 0; z < MACRO_ROWS; z += 1) {
    for (let x = 0; x < MACRO_COLUMNS; x += 1) {
      const index = macroIndex(x, z);
      let maximumRise = 0;
      for (let direction = 0; direction < D8_X.length; direction += 1) {
        const neighborZ = z + D8_Z[direction]!;
        if (neighborZ < 0 || neighborZ >= MACRO_ROWS) continue;
        const neighbor = macroIndex(x + D8_X[direction]!, neighborZ);
        maximumRise = Math.max(
          maximumRise,
          Math.abs(elevation[index]! - elevation[neighbor]!),
        );
      }
      slope[index] = maximumRise / ORIGIN_SHARD_ATLAS_SPEC.zoneSizeM;
      const isOcean = elevation[index]! < ORIGIN_SHARD_ATLAS_SPEC.seaLevelM;
      const fillDepth = routed.filled[index]! - elevation[index]!;
      const isLake = !isOcean && fillDepth > 8;
      const isRiver =
        !isOcean && !isLake && flowAccumulation[index]! >= 80;
      if (isOcean) {
        waterKind[index] = WORLD_WATER_KINDS.indexOf("ocean");
        oceanZoneCount += 1;
      } else if (isLake) {
        waterKind[index] = WORLD_WATER_KINDS.indexOf("lake");
        lakeZoneCount += 1;
      } else if (isRiver) {
        waterKind[index] = WORLD_WATER_KINDS.indexOf("river");
        riverDepth[index] = Math.min(
          18,
          Math.log2(flowAccumulation[index]!) * 0.72 *
            Math.max(0.18, slope[index]!),
        );
        elevation[index] -= riverDepth[index]!;
        riverZoneCount += 1;
      } else {
        waterKind[index] = WORLD_WATER_KINDS.indexOf("land");
      }
      floodplain[index] = isRiver
        ? clamp01(
            Math.log2(flowAccumulation[index]!) / 14 - slope[index]! * 1.8,
          )
        : 0;
      const isMountain =
        !isOcean &&
        !isLake &&
        (elevation[index]! >= 420 || slope[index]! >= 0.12);
      mountainous[index] = isMountain ? 1 : 0;
      if (isMountain) mountainZoneCount += 1;

      const parent = routed.downstream[index]!;
      if (
        parent >= 0 &&
        orderPosition[parent]! >= orderPosition[index]!
      ) {
        flowCycleCount += 1;
      }
    }
  }

  // Priority-flood order lists every outlet before the cells that drain into
  // it. Reconcile carved river beds mouth-to-head so every channel has a small
  // positive downstream gradient even where depression filling selected a
  // spill path above the original basin floor.
  for (let cursor = 0; cursor < routed.orderLength; cursor += 1) {
    const index = routed.order[cursor]!;
    if (waterKind[index] !== WORLD_WATER_KINDS.indexOf("river")) continue;
    const downstream = routed.downstream[index]!;
    if (downstream < 0) continue;
    const minimumUpstreamElevation = elevation[downstream]! + 0.01;
    if (elevation[index]! < minimumUpstreamElevation) {
      elevation[index] = minimumUpstreamElevation;
    }
  }

  const waterSurfaceElevation = new Float32Array(MACRO_CELL_COUNT);
  for (let index = 0; index < MACRO_CELL_COUNT; index += 1) {
    const water = WORLD_WATER_KINDS[waterKind[index]!]!;
    waterSurfaceElevation[index] =
      water === "ocean"
        ? ORIGIN_SHARD_ATLAS_SPEC.seaLevelM
        : water === "lake"
          ? routed.filled[index]!
          : water === "river"
            ? elevation[index]! + riverDepth[index]!
            : elevation[index]!;
  }

  const oceanDistance = computeOceanDistance(waterKind);
  const temperature = new Float32Array(MACRO_CELL_COUNT);
  const precipitation = new Float32Array(MACRO_CELL_COUNT);
  const moisture = new Float32Array(MACRO_CELL_COUNT);
  const windX = new Float32Array(MACRO_CELL_COUNT);
  const windZ = new Float32Array(MACRO_CELL_COUNT);
  const oceanInfluence = new Float32Array(MACRO_CELL_COUNT);
  const hydrologyClass = new Uint8Array(MACRO_CELL_COUNT);
  const bedrock = new Uint8Array(MACRO_CELL_COUNT);
  const soilDepth = new Float32Array(MACRO_CELL_COUNT);
  const sedimentDepth = new Float32Array(MACRO_CELL_COUNT);
  const waterTableDepth = new Float32Array(MACRO_CELL_COUNT);
  const aquifer = new Float32Array(MACRO_CELL_COUNT);
  const riverbedGravelDepth = new Float32Array(MACRO_CELL_COUNT);
  const floodplainSiltDepth = new Float32Array(MACRO_CELL_COUNT);
  const floodplainClayDepth = new Float32Array(MACRO_CELL_COUNT);
  const alluvialDepth = new Float32Array(MACRO_CELL_COUNT);
  const biome = new Uint8Array(MACRO_CELL_COUNT);
  const floraProfile = new Uint8Array(MACRO_CELL_COUNT);
  const floraSeed = new Uint32Array(MACRO_CELL_COUNT);

  for (let z = 0; z < MACRO_ROWS; z += 1) {
    const latitude = 90 - ((z + 0.5) / MACRO_ROWS) * 180;
    const latitudeMagnitude = Math.abs(latitude) / 90;
    const circulationPhase = Math.abs(latitude);
    const prevailingWest =
      (circulationPhase >= 30 && circulationPhase < 60) ||
      circulationPhase >= 75;
    for (let x = 0; x < MACRO_COLUMNS; x += 1) {
      const index = macroIndex(x, z);
      const influence = Math.exp(-oceanDistance[index]! / 22);
      oceanInfluence[index] = influence;
      windX[index] = prevailingWest ? 1 : -1;
      windZ[index] = latitude === 0 ? 0 : latitude > 0 ? -0.18 : 0.18;
      const latitudeTemperature = 31 - 49 * Math.pow(latitudeMagnitude, 1.22);
      temperature[index] =
        latitudeTemperature - Math.max(0, elevation[index]!) * 0.0062 +
        influence * (latitudeMagnitude * 7 - 1.5);

      const upwindX = x + (prevailingWest ? -1 : 1);
      const upwind = macroIndex(upwindX, z);
      const orographicLift = Math.max(
        0,
        (elevation[index]! - elevation[upwind]!) /
          ORIGIN_SHARD_ATLAS_SPEC.zoneSizeM,
      );
      const equatorialRain = Math.exp(-Math.pow(latitude / 18, 2)) * 900;
      const subtropicalDry =
        Math.exp(-Math.pow((Math.abs(latitude) - 27) / 9, 2)) * 650;
      const temperateRain =
        Math.exp(-Math.pow((Math.abs(latitude) - 52) / 14, 2)) * 430;
      precipitation[index] = Math.max(
        40,
        260 +
          influence * 1_050 +
          equatorialRain +
          temperateRain -
          subtropicalDry +
          orographicLift * 420,
      );
      moisture[index] = clamp01(
        precipitation[index]! / 1_850 +
          influence * 0.22 +
          floodplain[index]! * 0.35,
      );

      bedrock[index] =
        hash32(plan.seed, x, z, 0xbed) % WORLD_BEDROCK_IDS.length;
      const rock = WORLD_BEDROCK_IDS[bedrock[index]!]!;
      const sedimentFactor =
        floodplain[index]! +
        (waterKind[index] === WORLD_WATER_KINDS.indexOf("lake") ? 0.7 : 0);
      const water = WORLD_WATER_KINDS[waterKind[index]!]!;
      if (water === "ocean" || water === "lake") {
        hydrologyClass[index] = WORLD_HYDROLOGY_CLASSES.indexOf(water);
      } else if (water === "river") {
        const downstream = routed.downstream[index]!;
        const downstreamWater =
          downstream >= 0 ? WORLD_WATER_KINDS[waterKind[downstream]!] : "land";
        const drainageRole =
          downstreamWater === "ocean" || downstreamWater === "lake"
            ? "delta"
            : streamOrder[index]! <= 1 && flowAccumulation[index]! < 160
              ? "headwater"
              : streamOrder[index]! >= 4
                ? "main-channel"
                : floodplain[index]! >= 0.45
                  ? "floodplain"
                  : "tributary";
        hydrologyClass[index] = WORLD_HYDROLOGY_CLASSES.indexOf(drainageRole);
      }
      soilDepth[index] = Math.max(
        0.1,
        0.35 + moisture[index]! * 2.4 - slope[index]! * 1.7,
      );
      sedimentDepth[index] =
        0.2 + sedimentFactor * 5.5 +
        (rock === "limestone" || rock === "shale" ? 0.6 : 0);
      waterTableDepth[index] = Math.max(
        0,
        8.5 - moisture[index]! * 7.2 - floodplain[index]! * 2.5,
      );
      aquifer[index] = clamp01(
        moisture[index]! * 0.62 +
          (rock === "limestone" || rock === "sandstone" ? 0.28 : 0.04),
      );
      riverbedGravelDepth[index] =
        water === "river" ? 0.2 + riverDepth[index]! * 0.35 : 0;
      floodplainSiltDepth[index] =
        floodplain[index]! * 3.2 +
        (hydrologyClass[index] === WORLD_HYDROLOGY_CLASSES.indexOf("delta")
          ? 1.4
          : 0);
      floodplainClayDepth[index] =
        floodplain[index]! * 1.7 +
        (hydrologyClass[index] === WORLD_HYDROLOGY_CLASSES.indexOf("delta")
          ? 0.8
          : 0);
      alluvialDepth[index] =
        floodplain[index]! * 7 +
        (waterKind[index] === WORLD_WATER_KINDS.indexOf("river")
          ? Math.min(5, Math.log2(flowAccumulation[index]!) * 0.35)
          : 0);

      const biomeId = classifyBiome(
        temperature[index]!,
        precipitation[index]!,
        elevation[index]!,
        slope[index]!,
        water,
        floodplain[index]!,
      );
      biome[index] = WORLD_BIOME_IDS.indexOf(biomeId);
      floraProfile[index] = WORLD_FLORA_PROFILE_IDS.indexOf(
        floraForBiome(biomeId),
      );
      floraSeed[index] = hash32(plan.seed, x, z, 0xf10a) & 0x00ffffff;
    }
  }

  let invalidDrainageTerminationCount = 0;
  const drainageValid = new Uint8Array(MACRO_CELL_COUNT);
  for (let cursor = 0; cursor < routed.orderLength; cursor += 1) {
    const index = routed.order[cursor]!;
    const water = WORLD_WATER_KINDS[waterKind[index]!]!;
    if (water === "ocean" || water === "lake") {
      drainageValid[index] = 1;
    } else {
      const parent = routed.downstream[index]!;
      drainageValid[index] = parent >= 0 ? drainageValid[parent]! : 0;
    }
    if (
      water === "river" &&
      drainageValid[index] === 0
    ) {
      invalidDrainageTerminationCount += 1;
    }
  }

  return {
    elevation,
    temperature,
    precipitation,
    moisture,
    windX,
    windZ,
    oceanInfluence,
    slope,
    flowDirection: routed.flowDirection,
    downstream: routed.downstream,
    flowAccumulation,
    streamOrder,
    waterKind,
    riverDepth,
    floodplain,
    hydrologyClass,
    waterSurfaceElevation,
    bedrock,
    soilDepth,
    sedimentDepth,
    waterTableDepth,
    aquifer,
    riverbedGravelDepth,
    floodplainSiltDepth,
    floodplainClayDepth,
    alluvialDepth,
    biome,
    floraProfile,
    floraSeed,
    mountainous,
    diagnostics: Object.freeze({
      oceanCoverage: oceanZoneCount / MACRO_CELL_COUNT,
      mountainCoverage: mountainZoneCount / MACRO_CELL_COUNT,
      riverZoneCount,
      lakeZoneCount,
      flowCycleCount,
      invalidDrainageTerminationCount,
    }),
  };
}

/** Convert one global macro-grid index to the public persisted zone shape. */
export function macroZoneFromGrid(
  grid: WorldAtlasMacroGrid,
  index: number,
): WorldMacroZoneV1 {
  if (!Number.isInteger(index) || index < 0 || index >= MACRO_CELL_COUNT) {
    throw new Error("Macro zone index is outside the atlas");
  }
  return Object.freeze({
    elevationM: grid.elevation[index]!,
    temperatureC: grid.temperature[index]!,
    precipitationMm: grid.precipitation[index]!,
    moisture: grid.moisture[index]!,
    windX: grid.windX[index]!,
    windZ: grid.windZ[index]!,
    oceanInfluence: grid.oceanInfluence[index]!,
    slope: grid.slope[index]!,
    flowDirection: grid.flowDirection[index]!,
    flowAccumulation: grid.flowAccumulation[index]!,
    streamOrder: grid.streamOrder[index]!,
    waterKind: WORLD_WATER_KINDS[grid.waterKind[index]!]!,
    riverDepthM: grid.riverDepth[index]!,
    floodplain: grid.floodplain[index]!,
    hydrologyClass: WORLD_HYDROLOGY_CLASSES[grid.hydrologyClass[index]!]!,
    waterSurfaceElevationM: grid.waterSurfaceElevation[index]!,
    bedrock: WORLD_BEDROCK_IDS[grid.bedrock[index]!]!,
    soilDepthM: grid.soilDepth[index]!,
    sedimentDepthM: grid.sedimentDepth[index]!,
    waterTableDepthM: grid.waterTableDepth[index]!,
    aquifer: grid.aquifer[index]!,
    riverbedGravelDepthM: grid.riverbedGravelDepth[index]!,
    floodplainSiltDepthM: grid.floodplainSiltDepth[index]!,
    floodplainClayDepthM: grid.floodplainClayDepth[index]!,
    alluvialDepthM: grid.alluvialDepth[index]!,
    biome: WORLD_BIOME_IDS[grid.biome[index]!]!,
    floraProfile: WORLD_FLORA_PROFILE_IDS[grid.floraProfile[index]!]!,
    floraSeed: grid.floraSeed[index]!,
    mountainous: grid.mountainous[index] === 1,
  });
}

/** Materialize the one hundred macro zones owned by a tile. */
export function worldTileFromMacroGrid(
  plan: WorldAtlasBakePlan,
  grid: WorldAtlasMacroGrid,
  key: WorldTileKey,
): WorldTileMacroDataV1 {
  const normalizedKey = normalizeWorldTileKey(key);
  const zones: WorldMacroZoneV1[] = [];
  const startX = normalizedKey.tx * WORLD_ATLAS_COUNTS.zonesPerTileAxis;
  const startZ = normalizedKey.tz * WORLD_ATLAS_COUNTS.zonesPerTileAxis;
  for (let localZ = 0; localZ < WORLD_ATLAS_COUNTS.zonesPerTileAxis; localZ += 1) {
    for (let localX = 0; localX < WORLD_ATLAS_COUNTS.zonesPerTileAxis; localX += 1) {
      zones.push(
        macroZoneFromGrid(grid, macroIndex(startX + localX, startZ + localZ)),
      );
    }
  }
  return Object.freeze({
    schemaVersion: 1,
    worldId: plan.worldId,
    atlasRevision: plan.atlasRevision,
    seed: plan.seed,
    key: normalizedKey,
    zones: Object.freeze(zones),
    spatialModels: Object.freeze([]),
  });
}

/** Build the complete one-kilometre overview from global macro fields. */
export function createWorldAtlasOverview(
  grid: WorldAtlasMacroGrid,
): readonly WorldAtlasOverviewCellV1[] {
  const result: WorldAtlasOverviewCellV1[] = [];
  for (let tz = 0; tz < WORLD_ATLAS_COUNTS.tilesZ; tz += 1) {
    for (let tx = 0; tx < WORLD_ATLAS_COUNTS.tilesX; tx += 1) {
      let elevation = 0;
      let temperature = 0;
      let precipitation = 0;
      let ocean = 0;
      let mountain = 0;
      let rivers = 0;
      const biomeCounts = new Uint16Array(WORLD_BIOME_IDS.length);
      const startX = tx * WORLD_ATLAS_COUNTS.zonesPerTileAxis;
      const startZ = tz * WORLD_ATLAS_COUNTS.zonesPerTileAxis;
      for (let localZ = 0; localZ < 10; localZ += 1) {
        for (let localX = 0; localX < 10; localX += 1) {
          const index = macroIndex(startX + localX, startZ + localZ);
          elevation += grid.elevation[index]!;
          temperature += grid.temperature[index]!;
          precipitation += grid.precipitation[index]!;
          if (WORLD_WATER_KINDS[grid.waterKind[index]!] === "ocean") ocean += 1;
          if (grid.mountainous[index] === 1) mountain += 1;
          if (WORLD_WATER_KINDS[grid.waterKind[index]!] === "river") rivers += 1;
          biomeCounts[grid.biome[index]!] += 1;
        }
      }
      let dominantBiomeIndex = 0;
      for (let index = 1; index < biomeCounts.length; index += 1) {
        if (biomeCounts[index]! > biomeCounts[dominantBiomeIndex]!) {
          dominantBiomeIndex = index;
        }
      }
      result.push(
        Object.freeze({
          key: Object.freeze({ tx, tz }),
          meanElevationM: elevation / 100,
          meanTemperatureC: temperature / 100,
          meanPrecipitationMm: precipitation / 100,
          oceanFraction: ocean / 100,
          mountainFraction: mountain / 100,
          riverZoneCount: rivers,
          dominantBiome: WORLD_BIOME_IDS[dominantBiomeIndex]!,
        }),
      );
    }
  }
  return Object.freeze(result);
}

/** Stable little helper used by codecs and validators. */
export const WORLD_ATLAS_MACRO_DIMENSIONS = Object.freeze({
  columns: MACRO_COLUMNS,
  rows: MACRO_ROWS,
  cellCount: MACRO_CELL_COUNT,
} as const);
