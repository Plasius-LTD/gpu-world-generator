# ADR-0012: Trusted Branch CI on Approved Self-Hosted Capacity

- Status: Accepted
- Date: 2026-10-29
- Supersedes: CI scheduling in ADR-0011; hosted production OIDC publication remains unchanged

## Context

The public-release recovery task requires approved self-hosted CI and denies
external-fork code execution. The previous hosted/same-repository-PR policy
cannot satisfy that boundary. Package publication separately requires hosted
OIDC support and exact-main successful push CI.

## Decision

Both ci.yml jobs use literal `Public CI - Quarantined` and
`[self-hosted, Linux, X64]`. An exact-repository guard permits only branch
`push` and `workflow_dispatch` events. No pull-request or tag execution,
hosted fallback, input-selected runner or reusable CI call graph is allowed.
Checkout does not persist credentials and setup-node caching stays disabled.
Jobs have explicit 15/10-minute timeouts and per-ref cancellation.

Runner admission is an operator control: review the source first, then admit
an immutable workflow SHA or an admin-enforced locked branch, checking that
all other runner-group settings and repository selections remain unchanged.
Remove temporary source-validation entries after CI terminates. Do not widen
runner visibility or admit mutable unreviewed branches to make checks pass.

The existing phase-isolated `main`/`cd.yml`/`production` publication route stays
GitHub-hosted with OIDC, exact-SHA CI verification and no npm write tokens.
CD remains disabled until an authorized npm maintainer records the current
exact publisher binding and reconciles a never-used next version with removed
and retired versions. Source CI alone cannot establish release completion.

Feature `platform.public-artifact-integrity.enabled` retains its remote
backend evaluator and staged-distribution role. Enabled permits reviewed
restoration after gates; disabled or rollback stops restoration. Mandatory
source, package and CI/CD integrity gates do not evaluate the flag and cannot
be bypassed. No user-facing capability or runtime API change is introduced.

## Alternatives

Hosted validation conflicts with the required CI policy. Same-repository PR
execution is broader than trusted branch admission. A caller-selected runner
or widened runner visibility defeats the approved-capacity boundary.

## Validation and consequences

Regression tests execute both actual job guards for allowed branch events and
rejected same-repository/fork PRs, privileged PR events, fork pushes and tags.
Workflow contracts preserve coverage, artifact and hosted OIDC release gates.
Run frozen installs, build before shader-loader tests, coverage, lint/types,
full audit, package/tree/admission checks and actionlint; verify exact-source
remote CI. Only the affected brace-expansion transitive resolution is updated
to clear the baseline high-severity audit failure; runtime ranges stay stable.

Public source changes require ordinary review/merge, successful exact-main CI
on admitted capacity, then approved OIDC release and public artifact/consumer
qualification. Rollback disables the affected workflow/channel and removes
its temporary admission without restoring prohibited paths or token fallbacks.
