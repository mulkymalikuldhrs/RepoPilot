# RepoPilot

RepoPilot is a frontend-first control plane for configuring Git repository synchronization and
user-owned repair workflows across providers and accounts.

> **Current status: foundation stage.** This repository contains a runnable local UI, local
> configuration models, a conservative sync planner, adapter boundaries, tests, and CI. It does
> **not** connect to Git providers, execute Git operations, dispatch workflows, or call Jules yet.
> The UI intentionally shows empty/unverified states instead of fabricated repository data.

## What works now

- Responsive overview, repository inventory, sync policy, repair policy, agent, run-history, and
  settings pages.
- Manual repository metadata entry with HTTPS/SSH URL validation and rejection of embedded
  credentials.
- Browser-local storage for repository metadata and policy drafts only.
- A dry-run planning function that blocks unknown or divergent histories and never performs writes.
- Typed boundaries for Git provider, runner, and coding-agent integrations. Unconfigured adapters
  fail explicitly rather than reporting success.
- Unit tests, ESLint, Prettier, a production build, and a GitHub Actions CI workflow.
- A post-build heuristic scan for common credential formats in generated frontend assets.

Provider connectivity, real synchronization, Jules task submission, scheduled jobs, remote logs,
and multi-device persistence remain future work.

## Local development

Requirements: Node.js 20 or newer and npm.

```sh
npm install
npm run dev
```

The dev server prints its local URL. Quality checks:

```sh
npm run check
npm run build
npm run preview
```

`npm run check` runs ESLint, unit tests, and formatting validation. The CI workflow runs those checks
and the production build plus a common-token-pattern scan on pushes, pull requests, and manual
dispatch. The scan is a guardrail, not a comprehensive secret scanner.

## Architecture

- `src/pages` and `src/components`: responsive control-plane UI; no provider calls.
- `src/domain`: repository and policy types, remote URL validation, and a pure sync planner.
- `src/storage`: versioned browser-local metadata storage; secrets are not part of the data model.
- `src/providers`: Git provider contracts and explicit unconfigured adapters.
- `src/runner`: contract for user-owned workflow dispatch; no runner is bundled or started.
- `src/agents`: coding-agent contract and an unavailable Jules adapter boundary.
- `docs`: architecture, security, roadmap, and initial repository audit.

See [Architecture](docs/ARCHITECTURE.md), [Security](docs/SECURITY.md), and
[Roadmap](docs/ROADMAP.md).

## Security boundaries

RepoPilot has no managed backend or hosted database in this stage. Repository URLs and policy drafts
are stored in the browser's `localStorage`; that storage is not encrypted and should not contain
secrets or sensitive data. The frontend never asks for Git tokens or Jules API keys. Remote URLs
with credentials are rejected.

Actual synchronization and agent requests are intended to run in a workflow or runner controlled
by the user, using that environment's secret manager. The default sync policy is dry-run with writes
disabled; divergent histories pause for review. No protected branch is modified by this frontend.

## Supported integrations

No external integration is currently connected or verified by this application. GitHub, GitLab,
Codeberg, other Git remotes, and Google Jules are represented by extension points only. The Jules
adapter deliberately returns an unavailable error until its API behavior, credentials, and
user-owned execution path are implemented and tested.

## License

No license has been selected yet. Until one is added, standard copyright restrictions apply.
