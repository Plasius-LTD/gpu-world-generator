import {
  createWorldGeneratorRepresentationPlan,
  getWorldGeneratorWorkerManifest,
} from "../dist/index.js";
import { mountGpuShowcase } from "../node_modules/@plasius/gpu-shared/dist/index.js";

const root = globalThis.document?.getElementById("app");
if (!root) {
  throw new Error("World generator demo root element was not found.");
}

function createState() {
  return {
    chunkId: "harbor-ring-a",
    profile: "streaming",
  };
}

function updateState(state, scene) {
  state.profile = scene.stress ? "bake" : "streaming";
  return state;
}

function describeState(state, scene) {
  const representationPlan = createWorldGeneratorRepresentationPlan({
    chunkId: state.chunkId,
    profile: state.profile,
    gameplayImportance: scene.stress ? "critical" : "high",
  });
  const manifest = getWorldGeneratorWorkerManifest(state.profile);
  const near = representationPlan.representations.find((entry) => entry.band === "near");
  const far = representationPlan.representations.find((entry) => entry.band === "far");

  return {
    status: `World generation live · ${state.profile} profile`,
    details:
      "The demo now validates representation bands and worker manifests on a stable 3D surface instead of a broken bundler-specific entry.",
    sceneMetrics: [
      `chunk: ${representationPlan.chunkId}`,
      `representations: ${representationPlan.representations.length}`,
      `bands: ${representationPlan.bands.join(", ")}`,
      `worker jobs: ${manifest.jobs.length}`,
    ],
    qualityMetrics: [
      `near output: ${near?.output ?? "-"}`,
      `near RT: ${near?.rtParticipation ?? "-"}`,
      `far output: ${far?.output ?? "-"}`,
      `far cadence: ${far?.refreshCadence.divisor ?? "-"}`,
    ],
    debugMetrics: [
      `profile: ${state.profile}`,
      `queue class: ${manifest.queueClass}`,
      `scheduler: ${manifest.schedulerMode}`,
      `scene stress: ${scene.stress ? "on" : "off"}`,
    ],
    notes: [
      "The demo path is now static-server friendly and no longer depends on TypeScript source imports or raw WGSL module transforms in the browser.",
      "gpu-world-generator still owns the representation-band and worker-manifest logic shown here.",
      "Stress mode shifts the demo to the bake profile so near/far representation policy is easy to compare.",
    ],
    textState: {
      chunkId: representationPlan.chunkId,
      profile: representationPlan.profile,
      bands: representationPlan.bands,
      manifestJobCount: manifest.jobs.length,
    },
    visuals: {
      reflectionStrength: state.profile === "bake" ? 0.18 : 0.12,
      shadowAccent: state.profile === "bake" ? 0.08 : 0.05,
      waveAmplitude: state.profile === "bake" ? 0.78 : 0.62,
      flagMotion: state.profile === "bake" ? 0.48 : 0.56,
      harborWall: state.profile === "bake" ? { r: 0.44, g: 0.4, b: 0.34 } : { r: 0.5, g: 0.42, b: 0.34 },
    },
  };
}

await mountGpuShowcase({
  root,
  focus: "integrated",
  packageName: "@plasius/gpu-world-generator",
  title: "World Representation Harbor Validation",
  subtitle:
    "A shared 3D harbor scene driven by gpu-world-generator chunk representation bands, cadence policy, and worker manifests.",
  createState,
  updateState,
  describeState,
});
