# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
