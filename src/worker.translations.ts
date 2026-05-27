import { worldGeneratorEnGbTranslations } from "./translations/en-GB";

export const worldGeneratorWorkerTranslationKeys = {
  profileStreamingDescription:
    "gpuWorldGenerator.worker.profile.streaming.description",
  profileBakeDescription: "gpuWorldGenerator.worker.profile.bake.description",
} as const;

export type WorldGeneratorWorkerTranslationKey =
  (typeof worldGeneratorWorkerTranslationKeys)[keyof typeof worldGeneratorWorkerTranslationKeys];

export const worldGeneratorWorkerProfileDescriptionKeys = {
  streaming: worldGeneratorWorkerTranslationKeys.profileStreamingDescription,
  bake: worldGeneratorWorkerTranslationKeys.profileBakeDescription,
} as const satisfies Record<string, WorldGeneratorWorkerTranslationKey>;

export { worldGeneratorEnGbTranslations };

export const worldGeneratorTranslations = {
  "en-GB": worldGeneratorEnGbTranslations,
} as const;

export function getWorldGeneratorDefaultTranslation(
  key: WorldGeneratorWorkerTranslationKey
): string {
  return worldGeneratorEnGbTranslations[key] ?? key;
}
