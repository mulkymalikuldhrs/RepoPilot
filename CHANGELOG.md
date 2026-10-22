# Changelog

All notable changes to RepoPilot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-10-22

### Added

- **Runner CLI (Stage 2)**: `npm run runner` with `inventory`, `plan --auto`, and `apply --plan <file> --approve` commands. Plans are dry-run by default; writes require an explicit `--approve` flag plus an `approval-required` decision per target.
- **History relation detection**: `ls-remote` head comparison plus real `merge-base --is-ancestor` ancestry checks in a temporary bare repo (in-sync / fast-forward / diverged / unknown). Diverged and unknown relations are never written; source-behind targets are refused instead of regressed.
- **Provider adapters (Stage 3)**: real GitHub (multi-account PATs + org repos), GitLab (token owner projects), and Codeberg (Gitea) REST adapters with injectable fetch for offline tests. Adapters attach verified metadata (default branch, visibility, archived, pushedAt).
- **`policy-blocked` decision**: platform restrictions discovered from repository metadata or real push rejections (GitHub rulesets GH013, Codeberg pre-receive hooks, GitLab push rules, archived repos, auth denials) are recorded and outrank all other planning decisions.
- **Credential hygiene**: tokens are read from `REPOPILOT_GITHUB_TOKENS`, `REPOPILOT_GITLAB_TOKEN`, `REPOPILOT_CODEBERG_TOKEN` only, held in memory, injected into Git URLs at operation time, and redacted from all output and plan files. Plan files contain no credentials.
- **Operational guards**: bounded retry (3 attempts) with backoff, GitLab anti-abuse pacing (`REPOPILOT_GITLAB_PACING_MS`, default 30s), post-push head verification, and mirror mode only behind an explicit `--mode mirror` flag (default is safe branch-only push without force).

## [0.1.0] - 2026-10-22

### Added

- **Project Foundation**: Initial React 19 + TypeScript + Vite responsive control plane application.
- **Responsive Dashboard & Navigation**: Overview, Repositories inventory, Sync Policies, Repair Policies, Agent Settings, Execution History, and Settings pages.
- **Domain Modeling**:
  - Provider-neutral repository metadata configuration.
  - Remote URL syntax validator supporting HTTPS/SSH formats and rejecting embedded credentials.
  - Conservative, non-writing dry-run sync planner with conflict detection and pause behavior.
  - Versioned browser-local storage for non-sensitive repository drafts.
- **Integration Contracts**:
  - `GitProviderAdapter` contract and explicit unconfigured adapter boundaries for GitHub, GitLab, and Codeberg.
  - `UserOwnedRunner` contract for user-controlled CI workflow execution.
  - `CodingAgentAdapter` contract and Google Jules agent boundary.
- **Quality & Security Tooling**:
  - Vitest unit test suite covering domain logic and adapters.
  - ESLint and Prettier formatting configuration.
  - Post-build bundle secret scanner script (`check-bundle-secrets.mjs`).
  - GitHub Actions CI workflow for linting, testing, formatting, and building.
- **Documentation**: Architecture, Security boundaries, Roadmap, Initial Repository Audit, and Comprehensive Usage & Deployment setup guides.
