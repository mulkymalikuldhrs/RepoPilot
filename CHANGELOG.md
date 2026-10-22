# Changelog

All notable changes to RepoPilot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
