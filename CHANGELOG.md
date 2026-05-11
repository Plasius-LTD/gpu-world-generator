# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.0.15] - 2026-05-11

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - Parenthesized terrain hash multiplication terms before xor mixing so
    browsers accept assembled WGSL worker shaders.
  - (placeholder)

- **Security**
  - (placeholder)

## [0.0.14] - 2026-04-02

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.0.13] - 2026-03-23

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.0.12] - 2026-03-15

- **Added**
  - ADR, TDR, and test-first planning coverage for chunk representation tiers,
    RT proxies, and far-field world outputs.
  - Added `createWorldGeneratorRepresentationPlan(...)` plus public
    representation-band exports for near, mid, far, and horizon chunk outputs.
  - Added tests covering explicit RT proxy descriptors, far/horizon cadence and
    shadow metadata, and chunk-identity preservation through proxy outputs.

- **Changed**
  - TDR-0002 now reflects the implemented public representation-plan helper.

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.0.11] - 2026-03-14

- **Added**
  - Added worker profile and manifest exports for `streaming` and `bake`
    world-generation DAGs.
  - Added tests covering chunk/voxel dependency ordering, queue metadata, and
    profile validation.
  - Added ADR, TDR, and design docs for worker-first world-generation
    scheduling.

- **Changed**
  - Clarified README guidance for integrating chunk and voxel generation with
    `@plasius/gpu-worker`, `@plasius/gpu-performance`, and `@plasius/gpu-debug`.
  - Raised the minimum `@plasius/gpu-worker` dependency to `^0.1.10` so npm
    installs resolve the published DAG-ready worker runtime by default.
  - Updated GitHub Actions workflows to run JavaScript actions on Node 24,
    refreshed core workflow action versions, and switched Codecov uploads to
    the Codecov CLI.

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.0.10] - 2026-03-04

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.0.6] - 2026-03-01

- **Added**
  - `lint`, `typecheck`, and security audit scripts for local and CI enforcement.

- **Changed**
  - CI now fails early on lint/typecheck/runtime dependency audit before build/test.

- **Fixed**
  - Pack-check regex cleanup to remove an unnecessary path escape.

- **Security**
  - Runtime dependency vulnerability checks are now enforced in CI.

## [0.0.5] - 2026-02-28

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.0.5] - 2026-02-28

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.0.4] - 2026-02-12

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.0.3] - 2026-02-12

### Added
- Initial scaffold for GPU world generation package.
- WGSL terrain job (height/heat/moisture/biome).
- Hex-grid utilities and biome mappings.
- Planning documentation and ADRs.
- Temperate mixed-forest generator (macro -> surface -> feature).
- Mixed Forest biome id in WGSL and TS enums.

## [0.0.0] - 2026-02-11

- **Added**
  - Initial release.

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)
[0.0.3]: https://github.com/Plasius-LTD/gpu-world-generator/releases/tag/v0.0.3
[0.0.4]: https://github.com/Plasius-LTD/gpu-world-generator/releases/tag/v0.0.4
[0.0.5]: https://github.com/Plasius-LTD/gpu-world-generator/releases/tag/v0.0.5
[0.0.6]: https://github.com/Plasius-LTD/gpu-world-generator/releases/tag/v0.0.6
[0.0.10]: https://github.com/Plasius-LTD/gpu-world-generator/releases/tag/v0.0.10
[0.0.11]: https://github.com/Plasius-LTD/gpu-world-generator/releases/tag/v0.0.11
[0.0.12]: https://github.com/Plasius-LTD/gpu-world-generator/releases/tag/v0.0.12
[0.0.13]: https://github.com/Plasius-LTD/gpu-world-generator/releases/tag/v0.0.13
[0.0.14]: https://github.com/Plasius-LTD/gpu-world-generator/releases/tag/v0.0.14
[0.0.15]: https://github.com/Plasius-LTD/gpu-world-generator/releases/tag/v0.0.15
