# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
