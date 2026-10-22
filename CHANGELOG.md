# Changelog

All notable changes to RepoPilot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-10-22

### Added
- **Project Foundation**: Initial React 19 + TypeScript + Vite responsive control plane application.
- **PWA Ready Capabilities**:
  - Web App Manifest (`public/manifest.webmanifest`) for standalone app installation.
  - Offline-first Service Worker (`public/sw.js`) caching core UI assets.
  - HTML PWA meta tags and service worker registration script in `index.html`.
- **IndexedDB LocalDB Storage Adapter**:
  - Offline persistent storage in `src/storage/local-db.ts` for workspace metadata, credentials, and batch logs.
  - Automatic localStorage fallback for restricted browser environments.
- **Advanced Repository Management Features**:
  - Branch merge & pull merge dry-run planning tools.
  - Repository inline rename and active/archived toggle filters in `src/pages/Repositories.tsx`.
- **Batch Operations**:
  - Multi-repository batch rename (prefix, suffix, substring search-and-replace).
  - Multi-repository batch remote sync dispatches.
  - Multi-repository batch CI/CD workflow dispatches.
  - Persistent batch execution history logging.
- **Provider Sign-In & Credentials Manager**:
  - Secure offline LocalDB token storage for GitHub PAT, GitLab PAT, Codeberg Token, and Jules API Keys in `src/pages/Settings.tsx`.
- **README Consistency Enforcement**:
  - Automated README compliance audit and section enforcement tool in `src/pages/ReadmeConsistency.tsx`.
- **Responsive Dashboard & Navigation**: Overview, Repositories, Batch Operations, README Sync, Sync Policies, Repair Policies, Agents, Execution History, Settings & Auth.
- **Quality & Security Tooling**:
  - Vitest unit test suite covering domain logic and adapters.
  - ESLint and Prettier formatting configuration.
  - Post-build bundle secret scanner script (`check-bundle-secrets.mjs`).
  - GitHub Actions CI workflow for linting, testing, formatting, and building.
- **Documentation**: Architecture, Security boundaries, Roadmap, Initial Repository Audit, and Comprehensive Usage & Deployment setup guides.
