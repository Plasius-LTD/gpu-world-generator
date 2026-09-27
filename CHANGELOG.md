# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Refresh compatible npm dependencies and published Plasius dependency resolutions for the weekly security maintenance batch (2026-09-27).

- **Added**
  - (placeholder)

- **Changed**
  - Refreshed compatible @plasius/* lockfile resolutions to the latest published releases.
 - Bound npm publication to the exact prepared `main` commit after successful push-triggered CI.
  - (placeholder)

- **Fixed**
  - Added exact-commit CI dispatch and disabled package-manager cache finalization in both hosted validation jobs.
  - (placeholder)

- **Security**
  - Removed the npm write-token path, added a fail-closed npm 11.5.1-or-newer OIDC guard, and denied fork PR code access to reviewed CI.
  - Moved reviewed CI to explicit GitHub-hosted runners while retaining the same-repository pull-request guard.
  - Added fail-closed source and npm-package admission for the administrative contributor registry and pinned the CI/CD runtime to Node.js 24.18.0 LTS.
  - (placeholder)

## [0.1.0] - 2026-07-15

- **Added**
  - Added versioned persistent-atlas contracts for finite wrapped worlds,
    including tile, zone, local-zone, vertical-slab, model-instance, residency,
    and edit dirty-address types.
  - Added deterministic `origin-shard` bake planning and generation for a
    100 × 50 km atlas with qualified ocean/mountain coverage, blended climate,
    terminating drainage, Strahler channel roles, explicit riverbed/floodplain
    strata, biome/flora profiles, and an overview.
  - Added content-addressed world-tile encoding, strict decoding, SHA-256
    verification, and deterministic checksum tests.
  - Added mass-closure validation and seam-aware edit invalidation including
    the local voxel sampling halo.
  - Added deterministic view planning with the fixed representation ladder,
    20% hysteresis, velocity-directed prefetch, obsolete-work cancellation,
    coarse fallbacks, and low/standard/high hard residency budgets.
  - Added edit-aware 0.5 m and 1 m local-zone slab materialization, stable flora
    reconstruction, destination-clipped terrain/fluid assembly, canonical model
    deduplication with seam-safe render transforms, and a hard-budget resource
    residency coordinator with non-destructive admission checks.
  - Hardened tile decoding for nested model transforms, bounds, and LOD hints,
    and normalized wrapped flora edit placement during reconstruction.
  - Added ADR-0009, ADR-0010, TDR-0003, and TDR-0004 for finite atlas
    addressing, immutable bakes, destination ownership, and streaming.

- **Changed**
  - Documented hex zoning as a supported legacy LOD facility rather than the
    persistent world-address system.
  - Added `@plasius/asset-contracts` as the canonical source of spatial model
    asset references.

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.0.27] - 2026-07-13

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)
  - Consume the propagated gpu-shared and RFC-remediated translation releases (task #36).

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.0.26] - 2026-07-11

- **Added**
  - (placeholder)

- **Changed**
  - Updated runtime and development dependency baselines to the latest
    compatible published versions, including `@plasius/gpu-fluid` `0.1.12`,
    `@plasius/gpu-shared` `1.0.13`, `@plasius/translations` `1.0.22`,
    `@types/node` `26.1.1`, `@typescript-eslint` `8.63.0`, ESLint `10.7.0`,
    `globals` `17.7.0`, and React `19.2.7`.
  - Retained TypeScript `6.0.3` because the latest `@typescript-eslint/parser`
    release currently requires TypeScript below `6.1.0`; TypeScript 7 was
    rejected by npm's peer-dependency resolver.

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.0.25] - 2026-07-03

- **Added**
  - Added voxel-first world generation APIs for deterministic chunks, climate
    profiles, signed densities, material ids, edit journals, surface mesh
    extraction, and biome-driven decorations.
  - Added block-accurate voxel collision mesh extraction for gameplay physics
    surfaces derived from the authoritative chunk.
  - Added stitchable voxel meshing field APIs with one-voxel halo sampling and
    dirty chunk helpers for edit-driven rebuilds.
  - Added fluid-aware voxel rendering APIs, including voxel fluid boundary
    fields, fluid simulation inputs, separate terrain/fluid render surfaces,
    and terrain material palettes.
  - Added voxel source metadata to wavefront scene-source adapters.
  - Added `@plasius/gpu-fluid` as the fluid integration dependency.
  - Added ADR-0007, ADR-0008, and voxel-world design documentation for voxel
    authority and fluid-aware rendering.
  - (placeholder)

- **Changed**
  - Repositioned voxel chunks as the preferred authoritative world path while
    retaining legacy heightfield helpers for compatibility.
  - Replaced the demo with a voxel world viewer that supports climates,
    deformation tools, debug views, LOD views, and world/decorative layers.
  - Updated the demo terrain renderer to draw the smoothed surface-net mesh
    while still generating a conservative voxel collider for gameplay support.
  - Changed surface-net extraction to sample shared world-space lattice fields
    so adjacent chunks can stitch without skirts or filler geometry.
  - Changed voxel render meshing to exclude liquid materials by default so
    water, lava, and sludge render through separate fluid surfaces instead of
    terrain triangles.
  - Updated the demo to report and draw terrain and fluid surfaces separately.
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.0.24] - 2026-07-01

- **Added**
  - (placeholder)

- **Changed**
  - Updated runtime GPU dependencies to `@plasius/gpu-shared` `^1.0.2` and
    `@plasius/gpu-worker` `^0.3.4`.
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.0.23] - 2026-06-22

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.0.22] - 2026-06-22

- **Added**
  - Added `en-GB` translation keys and defaults for worker DAG profile descriptions.
  - Added `createWorldGeneratorWavefrontSceneSourceAdapter(...)` so live
    terrain, RT proxy, merged proxy, and horizon-shell outputs can emit
    wavefront-compatible scene-source payloads with chunk, cadence, and
    material-id metadata.

- **Changed**
  - Worker profiles and manifests now expose `descriptionKey` and `descriptionDefault` so consumers can resolve display descriptions through `@plasius/translations`.
  - Render representation plans now have a package-owned adapter path into the
    wavefront renderer boundary instead of requiring site-local mapping glue.

- **Fixed**
  - Restored the package CD workflow so protected main releases are prepared by PR and published without direct branch pushes.
  - Exported the root `dist/index.d.ts` declaration entry for NodeNext TypeScript consumers and pack-time validation.
  - (placeholder)

- **Security**
  - (placeholder)

## [0.0.17] - 2026-05-13

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.0.16] - 2026-05-13

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
[0.0.16]: https://github.com/Plasius-LTD/gpu-world-generator/releases/tag/v0.0.16
[0.0.17]: https://github.com/Plasius-LTD/gpu-world-generator/releases/tag/v0.0.17
[0.0.22]: https://github.com/Plasius-LTD/gpu-world-generator/releases/tag/v0.0.22
[0.0.23]: https://github.com/Plasius-LTD/gpu-world-generator/releases/tag/v0.0.23
[0.0.24]: https://github.com/Plasius-LTD/gpu-world-generator/releases/tag/v0.0.24
[0.0.25]: https://github.com/Plasius-LTD/gpu-world-generator/releases/tag/v0.0.25
[0.0.26]: https://github.com/Plasius-LTD/gpu-world-generator/releases/tag/v0.0.26
[0.0.27]: https://github.com/Plasius-LTD/gpu-world-generator/releases/tag/v0.0.27
[0.1.0]: https://github.com/Plasius-LTD/gpu-world-generator/releases/tag/v0.1.0
