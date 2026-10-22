<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=28&pause=1000&color=3B82F6&center=true&vCenter=true&width=600&lines=REPOPILOT;Universal+Git+Sync+%26+Repair+Plane;Bring-Your-Own-Credentials+%26+Agent;PWA-Ready+%2B+IndexedDB+LocalDB" alt="RepoPilot Banner" />
</p>

<p align="center">
  <strong>A frontend-first control plane for user-owned Git repository synchronization, batch operations, PWA offline capability, and automated code repair workflows across providers and coding agents.</strong>
</p>

<p align="center">
  <a href="https://github.com/mulkymalikuldhaher/repopilot/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/mulkymalikuldhaher/repopilot/ci.yml?branch=main&style=for-the-badge&logo=github&label=CI%20Status" alt="CI Status" /></a>
  <a href="https://github.com/mulkymalikuldhaher/repopilot/blob/main/LICENSE"><img src="https://img.shields.io/github/license/mulkymalikuldhaher/repopilot?style=for-the-badge&color=blue" alt="License" /></a>
  <img src="https://img.shields.io/badge/PWA-Ready-purple?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA Ready" />
  <img src="https://img.shields.io/badge/LocalDB-IndexedDB-emerald?style=for-the-badge&logo=database" alt="IndexedDB LocalDB" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

---

> **Current Status: Foundation Stage (v0.1.0).** RepoPilot provides an offline-first PWA control plane, IndexedDB LocalDB storage for provider credentials (PAT / Token / API Key), multi-repository batch tools, branch merge tools, README consistency enforcement, dry-run sync planners, and modular provider/agent contracts.

---

## 📐 Architecture & Visual Workflow

RepoPilot operates as an offline-capable PWA SPA without a hosted backend database or managed server. User configurations, credentials, and batch logs are stored safely in browser IndexedDB LocalDB, delegating actual Git transport, scheduling, and secret execution to user-controlled CI workflows or local runners.

```
                  ┌───────────────────────────────────────────┐
                  │             RepoPilot PWA App             │
                  │  (React 19 + TypeScript Control Plane)    │
                  └─────────────┬───────────────┬─────────────┘
                                │               │
          Offline Cache & Sync  │               │ LocalDB Storage
          (Service Worker / SW) │               │ (IndexedDB Credentials)
                                ▼               ▼
                  ┌───────────────────────────────────────────┐
                  │        User-Owned Execution Runner        │
                  │    (GitHub Actions / GitLab CI / Local)   │
                  └──────┬─────────────────────┬──────────────┘
                         │                     │
          Fetch / Push   │                     │  Task Dispatch
          Git Operations │                     │  & Session Tracking
                         ▼                     ▼
          ┌─────────────────────┐       ┌─────────────────────┐
          │    Git Remotes      │       │    Coding Agents    │
          │ ───────────         │       │ ─────────────       │
          │  • GitHub (Multi)   │       │  • Google Jules     │
          │  • GitLab           │       │  • Future Adapters  │
          │  • Codeberg         │       │                     │
          └─────────────────────┘       └─────────────────────┘
```

---

## ✨ Advanced Core Features

- **PWA-Ready Application**: Installable web application with offline caching service worker and Web App Manifest.
- **IndexedDB LocalDB Storage**: Store workspace metadata, masked provider tokens (PAT, OAuth, API Keys), and batch execution history logs securely in offline IndexedDB.
- **Repository Inventory & Controls**:
  - **Inline Rename & Archive**: Easily rename repositories or archive inactive remotes.
  - **Branch Merge & Pull Merge**: Dry-run branch merge planning and pull request merge dispatches.
- **Batch Automation Engine**:
  - **Batch Rename**: Prefix, suffix, and substring search-and-replace rules across selected repositories.
  - **Batch Remote Sync**: Simultaneous dry-run sync dispatches across multiple remotes.
  - **Batch CI/CD Dispatcher**: Simultaneous GitHub Actions / GitLab CI workflow dispatches.
- **README Consistency Enforcement**: Automatically audit and enforce required README sections (Architecture, Usage Guide, Deployment, Author Info) across repositories.
- **Provider Sign-In & Auth**: Connect GitHub PAT, GitLab Token, Codeberg Token, or Google Jules API Keys stored locally in IndexedDB.

---

## 🚀 Tutorial & Usage Guide

### Local Development Setup

Requirements: **Node.js 20+** and **npm**.

1. **Clone the repository:**

   ```bash
   git clone https://github.com/mulkymalikuldhaher/repopilot.git
   cd repopilot
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the local development server:**

   ```bash
   npm run dev
   ```

   Open the printed local URL (e.g. `http://localhost:5173`) in your browser.

4. **Run quality checks & tests:**
   ```bash
   # Run ESLint, Vitest, and Prettier checks
   npm run check

   # Test production build & bundle secret scanner
   npm run build
   npm run security:bundle
   ```

---

## 🌐 Deployment Tutorial

RepoPilot is built as a static Single Page Application (SPA) with full PWA capability.

### Deploying to Vercel

```bash
npm install -g vercel
vercel
```

_Build Command:_ `npm run build` | _Output Directory:_ `dist`

### Deploying to Netlify

```bash
npm install -g netlify-cli
netlify deploy --build
```

_Build Command:_ `npm run build` | _Publish Directory:_ `dist`

### Deploying to GitHub Pages

1. In repository **Settings** > **Pages**, set **Source** to **GitHub Actions**.
2. On every push to `main`, the included GitHub Actions workflow will build and publish the `dist` directory.

### Deploying with Docker

Build and run a production NGINX container:

```bash
# Build the Docker image
docker build -t repopilot:v0.1.0 .

# Run the container locally on port 8080
docker run -d -p 8080:80 repopilot:v0.1.0
```

---

## 📋 Structure & Project Layout

```
repopilot/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI check
├── docs/
│   ├── ARCHITECTURE.md        # Technical architecture details
│   ├── PROJECT_AUDIT.md       # Initial project foundation audit
│   ├── ROADMAP.md             # Multi-stage release roadmap
│   └── SECURITY.md           # Security boundaries and guidelines
├── public/
│   ├── manifest.webmanifest   # PWA manifest
│   └── sw.js                  # PWA service worker offline cache
├── scripts/
│   └── check-bundle-secrets.mjs # Post-build secret scanner
├── src/
│   ├── agents/                # Coding agent contracts (Google Jules)
│   ├── components/            # Reusable UI components (Sidebar, Dialogs, Icons)
│   ├── domain/                # Business logic, URL validators, Sync Planner
│   ├── pages/                 # Overview, Repos, Batch, README Sync, Agents, Settings
│   ├── providers/             # Git Provider adapters (GitHub, GitLab, Codeberg)
│   ├── runner/                # User-owned CI runner contract
│   ├── storage/               # IndexedDB LocalDB store & fallback
│   ├── App.tsx                # App shell & router
│   ├── main.tsx               # Entry point
│   └── styles.css             # Theme & UI styles
├── CHANGELOG.md               # Version release history
├── README.md                  # Project documentation
└── package.json               # Dependencies & build scripts
```

---

## 📝 Changelog

Project changes are synchronized with [`CHANGELOG.md`](./CHANGELOG.md).

### [0.1.0] - 2026-10-22

- **Initial Foundation & Feature Upgrade**: React 19 + TypeScript + Vite responsive control plane.
- **PWA Capabilities**: Web App Manifest, Service Worker offline caching.
- **IndexedDB LocalDB**: Persistent storage for workspace configs, provider PATs/tokens, and batch logs.
- **Advanced Tools**: Branch merge, repo rename, repo archive, batch rename, batch sync, batch CI/CD dispatch, README consistency enforcement, provider credential sign-in.

---

## 🤝 Contributors

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue.

<a href="https://github.com/mulkymalikuldhaher/repopilot/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=mulkymalikuldhaher/repopilot" alt="Contributors" />
</a>

---

## 👤 Author & Contact

**Mulky Malikul Dhaher**

- **GitHub:** [mulkymalikuldhaher](https://github.com/mulkymalikuldhaher)
- **Repository:** [https://github.com/mulkymalikuldhaher/repopilot](https://github.com/mulkymalikuldhaher/repopilot)
- **Email:** [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
