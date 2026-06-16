import type {
  WorldGeneratorRepresentationBand,
  WorldGeneratorRepresentationCadence,
  WorldGeneratorRepresentationDescriptor,
  WorldGeneratorRepresentationOutput,
  WorldGeneratorRepresentationRtParticipation,
  WorldGeneratorRepresentationShadowRelevance,
} from "./worker";

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
  };
  accelerationStructureUpdateClass?: WorldGeneratorWavefrontSceneSourceMeshInput["accelerationStructureUpdateClass"];
}): WorldGeneratorWavefrontSceneSourceAdapterOutput {
  const { representation } = options;
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
