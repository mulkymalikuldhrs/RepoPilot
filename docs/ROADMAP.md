# Roadmap

This roadmap separates the current UI foundation from capabilities that need a real user-owned
execution environment. “Planned” does not mean implemented or verified.

## Stage 1 — Foundation (current)

- [x] React + TypeScript + Vite application and responsive page structure.
- [x] Repository metadata and policies stored locally without credentials.
- [x] Remote URL validation and explicit unverified provider states.
- [x] Dry-run policy planner with safe handling for unknown/divergent histories.
- [x] Provider, runner, and agent contracts.
- [x] Jules adapter boundary that fails explicitly rather than simulating success.
- [x] Unit tests, lint/format checks, CI, and architecture/security documentation.

## Stage 2 — User-owned one-way synchronization

- Implement a runner CLI or workflow template with explicit permissions and secret names.
- Fetch refs, compare ancestry, generate a dry-run report, and test with temporary local repositories.
- Add bounded retry, idempotency keys, loop prevention, exclusions, and inspectable failure output.
- Require an explicit target and approval before remote writes; never force-push divergent history.

## Stage 3 — Provider adapters

- Implement one provider at a time, beginning with GitHub, then GitLab and Codeberg.
- Verify official API and Git transport behavior, token scopes, rate limits, and CORS constraints.
- Support multiple accounts without merging credentials or mirroring private repositories by default.
- Add user-controlled workflow paths for providers not directly supported by a coding agent.

## Stage 4 — Jules and repair orchestration

- Verify the current official Jules API and supported source/session operations before coding.
- Keep Jules API calls and keys inside the user's runner.
- Track real session states and failures; link each task to a repository and workflow run.
- Use isolated branches and pull requests. Require passing checks and human review; do not auto-merge.

## Stage 5 — Observability and hardening

- Ingest real CI status and redacted logs without adding a managed backend unless required.
- Test rate limits, expired credentials, conflicting histories, interrupted jobs, and incomplete
  agent sessions.
- Re-evaluate whether webhooks or cross-device persistence justify an optional backend.

## Open decisions

- Which CI platform and runner format to support first.
- Whether cross-device configuration or centralized webhooks justify a future backend.
- Which additional coding agents should follow Jules.
- Product domain and license.
