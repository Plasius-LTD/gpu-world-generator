export type WorldGeneratorWorkerQueueClass = "voxel";
export type WorldGeneratorWorkerProfileName = "streaming" | "bake";
export type WorldGeneratorWorkerDomain = "geometry" | "textures" | "custom";
export type WorldGeneratorWorkerAuthority =
  | "visual"
  | "non-authoritative-simulation"
  | "authoritative";
export type WorldGeneratorWorkerImportance = "medium" | "high" | "critical";

export interface WorldGeneratorWorkerBudgetLevelConfig {
  maxDispatchesPerFrame: number;
  maxJobsPerDispatch: number;
  cadenceDivisor: number;
  workgroupScale: number;
  maxQueueDepth: number;
  metadata: Readonly<{
    owner: typeof worldGeneratorDebugOwner;
    queueClass: typeof worldGeneratorWorkerQueueClass;
    jobType: string;
    quality: string;
  }>;
}

export interface WorldGeneratorWorkerBudgetLevel {
  id: string;
  estimatedCostMs: number;
  config: WorldGeneratorWorkerBudgetLevelConfig;
}

export interface WorldGeneratorWorkerProfile {
  readonly name: WorldGeneratorWorkerProfileName;
  readonly description: string;
  readonly jobs: readonly string[];
}

export interface WorldGeneratorWorkerManifestJob {
  readonly key: string;
  readonly label: string;
  readonly worker: Readonly<{
    jobType: string;
    queueClass: typeof worldGeneratorWorkerQueueClass;
    priority: number;
    dependencies: readonly string[];
    schedulerMode: "dag";
  }>;
  readonly performance: Readonly<{
    id: string;
    jobType: string;
    queueClass: typeof worldGeneratorWorkerQueueClass;
    domain: WorldGeneratorWorkerDomain;
    authority: WorldGeneratorWorkerAuthority;
    importance: WorldGeneratorWorkerImportance;
    levels: readonly WorldGeneratorWorkerBudgetLevel[];
  }>;
  readonly debug: Readonly<{
    owner: typeof worldGeneratorDebugOwner;
    queueClass: typeof worldGeneratorWorkerQueueClass;
    jobType: string;
    tags: readonly string[];
    suggestedAllocationIds: readonly string[];
  }>;
}

export interface WorldGeneratorWorkerManifest {
  readonly schemaVersion: 1;
  readonly owner: typeof worldGeneratorDebugOwner;
  readonly profile: WorldGeneratorWorkerProfileName;
  readonly description: string;
  readonly queueClass: typeof worldGeneratorWorkerQueueClass;
  readonly schedulerMode: "dag";
  readonly suggestedAllocationIds: readonly string[];
  readonly jobs: readonly WorldGeneratorWorkerManifestJob[];
}

export const worldGeneratorDebugOwner = "world-generator";
export const worldGeneratorWorkerQueueClass = "voxel";
export const defaultWorldGeneratorWorkerProfile = "streaming";

type WorkerLevelSpec = Omit<WorldGeneratorWorkerBudgetLevel, "config"> & {
  config: Omit<WorldGeneratorWorkerBudgetLevelConfig, "metadata">;
};

type WorkerJobSpec = {
  priority: number;
  dependencies: readonly string[];
  domain: WorldGeneratorWorkerDomain;
  authority: WorldGeneratorWorkerAuthority;
  importance: WorldGeneratorWorkerImportance;
  levels: readonly WorkerLevelSpec[];
  suggestedAllocationIds: readonly string[];
};

type WorkerProfileSpec = {
  description: string;
  suggestedAllocationIds: readonly string[];
  jobs: Readonly<Record<string, WorkerJobSpec>>;
};

function buildBudgetLevels(
  jobType: string,
  queueClass: WorldGeneratorWorkerQueueClass,
  levels: readonly WorkerLevelSpec[]
) {
  return Object.freeze(
    levels.map((level) =>
      Object.freeze({
        id: level.id,
        estimatedCostMs: level.estimatedCostMs,
        config: Object.freeze({
          maxDispatchesPerFrame: level.config.maxDispatchesPerFrame,
          maxJobsPerDispatch: level.config.maxJobsPerDispatch,
          cadenceDivisor: level.config.cadenceDivisor,
          workgroupScale: level.config.workgroupScale,
          maxQueueDepth: level.config.maxQueueDepth,
          metadata: Object.freeze({
            owner: worldGeneratorDebugOwner,
            queueClass,
            jobType,
            quality: level.id,
          }),
        }),
      })
    )
  );
}

const worldGeneratorWorkerProfileSpecs: Record<
  WorldGeneratorWorkerProfileName,
  WorkerProfileSpec
> = {
  streaming: {
    description:
      "Runtime chunk generation DAG for fractal prepass, terrain synthesis, voxel materialization, mesh build, and tile bake.",
    suggestedAllocationIds: [
      "world.chunk.field.scratch",
      "world.chunk.height.buffer",
      "world.chunk.voxel.buffer",
      "world.chunk.mesh.buffer",
    ],
    jobs: {
      fractalPrepass: {
        priority: 4,
        dependencies: [],
        domain: "custom",
        authority: "authoritative",
        importance: "high",
        levels: [
          {
            id: "fixed",
            estimatedCostMs: 0.6,
            config: {
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 1,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 32,
            },
          },
        ],
        suggestedAllocationIds: ["world.chunk.field.scratch"],
      },
      fieldSynthesis: {
        priority: 4,
        dependencies: [],
        domain: "custom",
        authority: "authoritative",
        importance: "critical",
        levels: [
          {
            id: "fixed",
            estimatedCostMs: 0.9,
            config: {
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 2,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 48,
            },
          },
        ],
        suggestedAllocationIds: ["world.chunk.field.scratch"],
      },
      terrainSynthesis: {
        priority: 5,
        dependencies: ["fractalPrepass", "fieldSynthesis"],
        domain: "custom",
        authority: "authoritative",
        importance: "critical",
        levels: [
          {
            id: "fixed",
            estimatedCostMs: 1.4,
            config: {
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 1,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 32,
            },
          },
        ],
        suggestedAllocationIds: ["world.chunk.height.buffer"],
      },
      voxelMaterialize: {
        priority: 3,
        dependencies: ["terrainSynthesis"],
        domain: "custom",
        authority: "non-authoritative-simulation",
        importance: "high",
        levels: [
          {
            id: "low",
            estimatedCostMs: 0.8,
            config: {
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 1,
              cadenceDivisor: 2,
              workgroupScale: 0.6,
              maxQueueDepth: 24,
            },
          },
          {
            id: "medium",
            estimatedCostMs: 1.2,
            config: {
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 2,
              cadenceDivisor: 1,
              workgroupScale: 0.8,
              maxQueueDepth: 32,
            },
          },
          {
            id: "high",
            estimatedCostMs: 1.8,
            config: {
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 2,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 40,
            },
          },
        ],
        suggestedAllocationIds: ["world.chunk.voxel.buffer"],
      },
      meshBuild: {
        priority: 2,
        dependencies: ["terrainSynthesis", "voxelMaterialize"],
        domain: "geometry",
        authority: "visual",
        importance: "high",
        levels: [
          {
            id: "low",
            estimatedCostMs: 0.7,
            config: {
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 1,
              cadenceDivisor: 2,
              workgroupScale: 0.6,
              maxQueueDepth: 16,
            },
          },
          {
            id: "medium",
            estimatedCostMs: 1.1,
            config: {
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 1,
              cadenceDivisor: 1,
              workgroupScale: 0.8,
              maxQueueDepth: 24,
            },
          },
          {
            id: "high",
            estimatedCostMs: 1.6,
            config: {
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 2,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 32,
            },
          },
        ],
        suggestedAllocationIds: ["world.chunk.mesh.buffer"],
      },
      tileBake: {
        priority: 2,
        dependencies: ["terrainSynthesis"],
        domain: "textures",
        authority: "non-authoritative-simulation",
        importance: "medium",
        levels: [
          {
            id: "low",
            estimatedCostMs: 0.6,
            config: {
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 1,
              cadenceDivisor: 3,
              workgroupScale: 0.5,
              maxQueueDepth: 16,
            },
          },
          {
            id: "medium",
            estimatedCostMs: 0.9,
            config: {
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 1,
              cadenceDivisor: 2,
              workgroupScale: 0.75,
              maxQueueDepth: 24,
            },
          },
          {
            id: "high",
            estimatedCostMs: 1.3,
            config: {
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 2,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 32,
            },
          },
        ],
        suggestedAllocationIds: ["world.chunk.height.buffer"],
      },
    },
  },
  bake: {
    description:
      "Offline tile bake DAG for terrain generation, voxel materialization, mesh build, and asset serialization.",
    suggestedAllocationIds: [
      "world.bake.field.scratch",
      "world.bake.height.buffer",
      "world.bake.mesh.buffer",
      "world.bake.asset.binary",
    ],
    jobs: {
      fractalPrepass: {
        priority: 4,
        dependencies: [],
        domain: "custom",
        authority: "authoritative",
        importance: "high",
        levels: [
          {
            id: "fixed",
            estimatedCostMs: 0.7,
            config: {
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 1,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 32,
            },
          },
        ],
        suggestedAllocationIds: ["world.bake.field.scratch"],
      },
      fieldSynthesis: {
        priority: 4,
        dependencies: [],
        domain: "custom",
        authority: "authoritative",
        importance: "critical",
        levels: [
          {
            id: "fixed",
            estimatedCostMs: 1.0,
            config: {
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 2,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 48,
            },
          },
        ],
        suggestedAllocationIds: ["world.bake.field.scratch"],
      },
      terrainSynthesis: {
        priority: 5,
        dependencies: ["fractalPrepass", "fieldSynthesis"],
        domain: "custom",
        authority: "authoritative",
        importance: "critical",
        levels: [
          {
            id: "fixed",
            estimatedCostMs: 1.6,
            config: {
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 1,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 32,
            },
          },
        ],
        suggestedAllocationIds: ["world.bake.height.buffer"],
      },
      voxelMaterialize: {
        priority: 3,
        dependencies: ["terrainSynthesis"],
        domain: "custom",
        authority: "non-authoritative-simulation",
        importance: "high",
        levels: [
          {
            id: "low",
            estimatedCostMs: 0.9,
            config: {
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 1,
              cadenceDivisor: 2,
              workgroupScale: 0.6,
              maxQueueDepth: 24,
            },
          },
          {
            id: "medium",
            estimatedCostMs: 1.4,
            config: {
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 2,
              cadenceDivisor: 1,
              workgroupScale: 0.8,
              maxQueueDepth: 32,
            },
          },
          {
            id: "high",
            estimatedCostMs: 2.0,
            config: {
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 2,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 48,
            },
          },
        ],
        suggestedAllocationIds: ["world.bake.height.buffer"],
      },
      meshBuild: {
        priority: 2,
        dependencies: ["terrainSynthesis", "voxelMaterialize"],
        domain: "geometry",
        authority: "visual",
        importance: "high",
        levels: [
          {
            id: "low",
            estimatedCostMs: 0.9,
            config: {
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 1,
              cadenceDivisor: 2,
              workgroupScale: 0.6,
              maxQueueDepth: 16,
            },
          },
          {
            id: "medium",
            estimatedCostMs: 1.3,
            config: {
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 1,
              cadenceDivisor: 1,
              workgroupScale: 0.8,
              maxQueueDepth: 24,
            },
          },
          {
            id: "high",
            estimatedCostMs: 1.9,
            config: {
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 2,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 32,
            },
          },
        ],
        suggestedAllocationIds: ["world.bake.mesh.buffer"],
      },
      tileBake: {
        priority: 2,
        dependencies: ["terrainSynthesis"],
        domain: "textures",
        authority: "non-authoritative-simulation",
        importance: "medium",
        levels: [
          {
            id: "low",
            estimatedCostMs: 0.8,
            config: {
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 1,
              cadenceDivisor: 3,
              workgroupScale: 0.5,
              maxQueueDepth: 16,
            },
          },
          {
            id: "medium",
            estimatedCostMs: 1.1,
            config: {
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 1,
              cadenceDivisor: 2,
              workgroupScale: 0.75,
              maxQueueDepth: 24,
            },
          },
          {
            id: "high",
            estimatedCostMs: 1.5,
            config: {
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 2,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 32,
            },
          },
        ],
        suggestedAllocationIds: ["world.bake.height.buffer"],
      },
      assetSerialize: {
        priority: 1,
        dependencies: ["meshBuild", "tileBake"],
        domain: "custom",
        authority: "non-authoritative-simulation",
        importance: "medium",
        levels: [
          {
            id: "low",
            estimatedCostMs: 0.4,
            config: {
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 1,
              cadenceDivisor: 4,
              workgroupScale: 0.5,
              maxQueueDepth: 8,
            },
          },
          {
            id: "medium",
            estimatedCostMs: 0.7,
            config: {
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 1,
              cadenceDivisor: 2,
              workgroupScale: 0.75,
              maxQueueDepth: 12,
            },
          },
          {
            id: "high",
            estimatedCostMs: 1.0,
            config: {
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 2,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 16,
            },
          },
        ],
        suggestedAllocationIds: ["world.bake.asset.binary"],
      },
    },
  },
};

function buildWorldGeneratorWorkerProfile(
  name: WorldGeneratorWorkerProfileName,
  spec: WorkerProfileSpec
) {
  return Object.freeze({
    name,
    description: spec.description,
    jobs: Object.freeze(Object.keys(spec.jobs)),
  });
}

function buildWorldGeneratorWorkerManifestJob(
  profileName: WorldGeneratorWorkerProfileName,
  jobName: string,
  spec: WorkerJobSpec
) {
  const label = `world-generator.${profileName}.${jobName}`;
  return Object.freeze({
    key: jobName,
    label,
    worker: Object.freeze({
      jobType: label,
      queueClass: worldGeneratorWorkerQueueClass,
      priority: spec.priority,
      dependencies: Object.freeze(
        spec.dependencies.map(
          (dependency) => `world-generator.${profileName}.${dependency}`
        )
      ),
      schedulerMode: "dag",
    }),
    performance: Object.freeze({
      id: label,
      jobType: label,
      queueClass: worldGeneratorWorkerQueueClass,
      domain: spec.domain,
      authority: spec.authority,
      importance: spec.importance,
      levels: buildBudgetLevels(
        label,
        worldGeneratorWorkerQueueClass,
        spec.levels
      ),
    }),
    debug: Object.freeze({
      owner: worldGeneratorDebugOwner,
      queueClass: worldGeneratorWorkerQueueClass,
      jobType: label,
      tags: Object.freeze(["world-generator", profileName, jobName, spec.domain]),
      suggestedAllocationIds: Object.freeze([...spec.suggestedAllocationIds]),
    }),
  });
}

function buildWorldGeneratorWorkerManifest(
  name: WorldGeneratorWorkerProfileName,
  spec: WorkerProfileSpec
) {
  return Object.freeze({
    schemaVersion: 1,
    owner: worldGeneratorDebugOwner,
    profile: name,
    description: spec.description,
    queueClass: worldGeneratorWorkerQueueClass,
    schedulerMode: "dag",
    suggestedAllocationIds: Object.freeze([...spec.suggestedAllocationIds]),
    jobs: Object.freeze(
      Object.entries(spec.jobs).map(([jobName, jobSpec]) =>
        buildWorldGeneratorWorkerManifestJob(name, jobName, jobSpec)
      )
    ),
  });
}

export const worldGeneratorWorkerProfiles = Object.freeze(
  Object.fromEntries(
    Object.entries(worldGeneratorWorkerProfileSpecs).map(([name, spec]) => [
      name,
      buildWorldGeneratorWorkerProfile(
        name as WorldGeneratorWorkerProfileName,
        spec
      ),
    ])
  )
) as Readonly<Record<WorldGeneratorWorkerProfileName, WorldGeneratorWorkerProfile>>;

export const worldGeneratorWorkerProfileNames = Object.freeze(
  Object.keys(worldGeneratorWorkerProfiles)
) as readonly WorldGeneratorWorkerProfileName[];

export const worldGeneratorWorkerManifests = Object.freeze(
  Object.fromEntries(
    Object.entries(worldGeneratorWorkerProfileSpecs).map(([name, spec]) => [
      name,
      buildWorldGeneratorWorkerManifest(
        name as WorldGeneratorWorkerProfileName,
        spec
      ),
    ])
  )
) as Readonly<Record<WorldGeneratorWorkerProfileName, WorldGeneratorWorkerManifest>>;

export function getWorldGeneratorWorkerProfile(
  name: WorldGeneratorWorkerProfileName = defaultWorldGeneratorWorkerProfile
) {
  const profile = worldGeneratorWorkerProfiles[name];
  if (!profile) {
    const available = worldGeneratorWorkerProfileNames.join(", ");
    throw new Error(
      `Unknown world-generator worker profile "${name}". Available: ${available}.`
    );
  }
  return profile;
}

export function getWorldGeneratorWorkerManifest(
  name: WorldGeneratorWorkerProfileName = defaultWorldGeneratorWorkerProfile
) {
  const manifest = worldGeneratorWorkerManifests[name];
  if (!manifest) {
    const available = worldGeneratorWorkerProfileNames.join(", ");
    throw new Error(
      `Unknown world-generator worker profile "${name}". Available: ${available}.`
    );
  }
  return manifest;
}
