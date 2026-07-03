import type {
  WorldGeneratorRepresentationBand,
  WorldGeneratorRepresentationCadence,
  WorldGeneratorRepresentationDescriptor,
  WorldGeneratorRepresentationOutput,
  WorldGeneratorRepresentationRtParticipation,
  WorldGeneratorRepresentationShadowRelevance,
} from "./worker";
import { WORLD_GENERATOR_COORDINATE_CONVENTION } from "./voxels";
import type { VoxelChunkKey } from "./voxels";

export interface WorldGeneratorWavefrontSceneSourceMeshInput {
  id: string;
  chunkId: string;
  sourceChunkIds: readonly string[];
  sourceJobKeys: readonly string[];
  representationBand: WorldGeneratorRepresentationBand;
  representationOutput: WorldGeneratorRepresentationOutput;
  rtParticipation: WorldGeneratorRepresentationRtParticipation;
  shadowRelevance: WorldGeneratorRepresentationShadowRelevance;
  refreshCadence: Readonly<WorldGeneratorRepresentationCadence>;
  preservesChunkIdentity: boolean;
  accelerationStructureUpdateClass: "streaming" | "proxy" | "horizon";
  materialIds: readonly string[];
  positions: readonly number[];
  normals: readonly number[] | null;
  tangents: readonly number[] | null;
  uvs: readonly number[] | null;
  derivableUvs: Readonly<{
    enabled: boolean;
    projection: "planar" | "world-xz" | "triplanar";
    scale: readonly [number, number] | readonly number[];
  }>;
  indices: readonly number[];
  coordinateConvention: typeof WORLD_GENERATOR_COORDINATE_CONVENTION;
  voxelSource: Readonly<{
    enabled: boolean;
    chunkKeys: readonly VoxelChunkKey[];
    materialPaletteId: string | null;
    decorationLayerIds: readonly string[];
    dirtyRegion: Readonly<{
      min: readonly [number, number, number];
      max: readonly [number, number, number];
    }> | null;
  }>;
}

export interface WorldGeneratorWavefrontSceneSourceAdapterOutput {
  schemaVersion: 1;
  owner: "world-generator";
  adapterId: string;
  chunkId: string;
  representation: Readonly<WorldGeneratorRepresentationDescriptor>;
  mesh: Readonly<WorldGeneratorWavefrontSceneSourceMeshInput>;
}

function freezeArray(values: readonly number[] | null | undefined) {
  return Array.isArray(values) ? Object.freeze([...values]) : null;
}

function normalizeDerivableUvs(input: {
  uvs?: readonly number[] | null;
  derivableUvs?: Partial<WorldGeneratorWavefrontSceneSourceMeshInput["derivableUvs"]> | null;
}) {
  if (Array.isArray(input.uvs) && input.uvs.length > 0) {
    return Object.freeze({
      enabled: false,
      projection: "planar" as const,
      scale: Object.freeze([1, 1]),
    });
  }
  return Object.freeze({
    enabled: input.derivableUvs?.enabled ?? true,
    projection: input.derivableUvs?.projection ?? "world-xz",
    scale: Object.freeze([
      Number.isFinite(input.derivableUvs?.scale?.[0])
        ? Number(input.derivableUvs?.scale?.[0])
        : 1,
      Number.isFinite(input.derivableUvs?.scale?.[1])
        ? Number(input.derivableUvs?.scale?.[1])
        : 1,
    ]),
  });
}

function normalizeUpdateClass(
  output: WorldGeneratorRepresentationOutput
): WorldGeneratorWavefrontSceneSourceMeshInput["accelerationStructureUpdateClass"] {
  if (output === "rtProxy" || output === "mergedProxy") {
    return "proxy";
  }
  if (output === "horizonShell") {
    return "horizon";
  }
  return "streaming";
}

function validateMeshShape(mesh: {
  positions: readonly number[];
  normals?: readonly number[] | null;
  uvs?: readonly number[] | null;
  indices: readonly number[];
}) {
  if (mesh.positions.length % 3 !== 0) {
    throw new Error("mesh.positions length must be divisible by 3.");
  }
  if (mesh.normals && mesh.normals.length !== mesh.positions.length) {
    throw new Error("mesh.normals length must match mesh.positions length.");
  }
  if (mesh.uvs && mesh.uvs.length % 2 !== 0) {
    throw new Error("mesh.uvs length must be divisible by 2.");
  }
  if (mesh.indices.length % 3 !== 0) {
    throw new Error("mesh.indices length must be divisible by 3.");
  }
  const vertexCount = mesh.positions.length / 3;
  for (const index of mesh.indices) {
    if (!Number.isInteger(index) || index < 0 || index >= vertexCount) {
      throw new Error("mesh.indices must reference existing vertices.");
    }
  }
}

export function createWorldGeneratorWavefrontSceneSourceAdapter(options: {
  representation: WorldGeneratorRepresentationDescriptor;
  mesh: {
    id?: string;
    materialIds: readonly string[];
    positions: readonly number[];
    normals?: readonly number[] | null;
    tangents?: readonly number[] | null;
    uvs?: readonly number[] | null;
    derivableUvs?: Partial<WorldGeneratorWavefrontSceneSourceMeshInput["derivableUvs"]> | null;
    indices: readonly number[];
    voxelSource?: Partial<WorldGeneratorWavefrontSceneSourceMeshInput["voxelSource"]> | null;
  };
  accelerationStructureUpdateClass?: WorldGeneratorWavefrontSceneSourceMeshInput["accelerationStructureUpdateClass"];
}): WorldGeneratorWavefrontSceneSourceAdapterOutput {
  const { representation } = options;
  validateMeshShape(options.mesh);
  const mesh = Object.freeze({
    id:
      options.mesh.id ??
      `${representation.chunkId}.${representation.band}.${representation.output}.scene-source`,
    chunkId: representation.chunkId,
    sourceChunkIds: Object.freeze([...representation.sourceChunkIds]),
    sourceJobKeys: Object.freeze([...representation.sourceJobKeys]),
    representationBand: representation.band,
    representationOutput: representation.output,
    rtParticipation: representation.rtParticipation,
    shadowRelevance: representation.shadowRelevance,
    refreshCadence: Object.freeze({
      kind: representation.refreshCadence.kind,
      divisor: representation.refreshCadence.divisor,
    }),
    preservesChunkIdentity: representation.preservesChunkIdentity,
    accelerationStructureUpdateClass:
      options.accelerationStructureUpdateClass ??
      normalizeUpdateClass(representation.output),
    materialIds: Object.freeze([...options.mesh.materialIds]),
    positions: Object.freeze([...options.mesh.positions]),
    normals: freezeArray(options.mesh.normals),
    tangents: freezeArray(options.mesh.tangents),
    uvs: freezeArray(options.mesh.uvs),
    derivableUvs: normalizeDerivableUvs(options.mesh),
    indices: Object.freeze([...options.mesh.indices]),
    coordinateConvention: WORLD_GENERATOR_COORDINATE_CONVENTION,
    voxelSource: Object.freeze({
      enabled: options.mesh.voxelSource?.enabled ?? false,
      chunkKeys: Object.freeze(
        (options.mesh.voxelSource?.chunkKeys ?? []).map((key) => Object.freeze({ ...key }))
      ),
      materialPaletteId: options.mesh.voxelSource?.materialPaletteId ?? null,
      decorationLayerIds: Object.freeze([...(options.mesh.voxelSource?.decorationLayerIds ?? [])]),
      dirtyRegion: options.mesh.voxelSource?.dirtyRegion
        ? Object.freeze({
            min: Object.freeze([
              options.mesh.voxelSource.dirtyRegion.min[0],
              options.mesh.voxelSource.dirtyRegion.min[1],
              options.mesh.voxelSource.dirtyRegion.min[2],
            ] as const),
            max: Object.freeze([
              options.mesh.voxelSource.dirtyRegion.max[0],
              options.mesh.voxelSource.dirtyRegion.max[1],
              options.mesh.voxelSource.dirtyRegion.max[2],
            ] as const),
          })
        : null,
    }),
  });

  return Object.freeze({
    schemaVersion: 1,
    owner: "world-generator" as const,
    adapterId: `${representation.id}.wavefront-scene-source`,
    chunkId: representation.chunkId,
    representation,
    mesh,
  });
}
