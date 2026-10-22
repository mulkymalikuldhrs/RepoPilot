<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=28&pause=1000&color=3B82F6&center=true&vCenter=true&width=600&lines=REPOPILOT;Universal+Git+Sync+%26+Repair+Plane;Bring-Your-Own-Credentials+%26+Agent" alt="RepoPilot Banner" />
</p>

<p align="center">
  <strong>A frontend-first control plane for user-owned Git repository synchronization and automated code repair workflows across providers and coding agents.</strong>
</p>

<p align="center">
  <a href="https://github.com/mulkymalikuldhaher/repopilot/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/mulkymalikuldhaher/repopilot/ci.yml?branch=main&style=for-the-badge&logo=github&label=CI%20Status" alt="CI Status" /></a>
  <a href="https://github.com/mulkymalikuldhaher/repopilot/blob/main/LICENSE"><img src="https://img.shields.io/github/license/mulkymalikuldhaher/repopilot?style=for-the-badge&color=blue" alt="License" /></a>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Security-No%20Stored%20Secrets-emerald?style=for-the-badge&logo=shield" alt="Security" />
</p>

---

> **Current Status: Foundation Stage (v0.1.0).** This repository contains a runnable local control plane UI, local repository/policy models, a conservative dry-run sync planner, modular adapter boundaries (GitHub, GitLab, Codeberg, Google Jules), unit tests, and CI. It does **not** store credentials in browser local storage or execute unverified write operations.

---

## 📐 Architecture & Visual Workflow

RepoPilot operates without a hosted database or paid backend application. The browser UI acts purely as the configuration and control interface, delegating execution, secret management, and scheduling to user-controlled CI workflows or runners.

```
                  ┌───────────────────────────────────────────┐
                  │              Browser Client               │
                  │   (React 19 + TypeScript Control Plane)   │
                  └─────────────────────┬─────────────────────┘
                                        │
                         Config & Dry-Run Sync Plans
                         (No Privileged Credentials)
                                        │
                                        ▼
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

## ✨ Core Features

- **Multi-Provider Inventory**: Manage repositories across multiple GitHub accounts, GitLab, Codeberg, and generic Git remotes in one place.
- **Conservative Synchronization**: One-way mirroring and bidirectional sync policies with explicit dry-run mode and automatic pause on divergent histories.
- **Automated Repair Policies**: Configure lint, build, test, and dependency maintenance checks with strict human-in-the-loop approval gates.
- **Coding Agent Orchestration**: Google Jules agent integration adapter boundary supporting GitHub connected sources and isolated branch PRs.
- **Zero-Backend Security**: Provider credentials and API keys remain safely inside your user-owned secret manager, never exposed to browser storage or static bundles.

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

RepoPilot is built as a static Single Page Application (SPA). You can deploy it to any static web hosting platform for free.

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
├── scripts/
│   └── check-bundle-secrets.mjs # Post-build secret scanner
├── src/
│   ├── agents/                # Coding agent contracts (Google Jules)
│   ├── components/            # Reusable UI components (Sidebar, Dialogs, Icons)
│   ├── domain/                # Business logic, URL validators, Sync Planner
│   ├── pages/                 # Overview, Repos, Policies, Agents, Settings
│   ├── providers/             # Git Provider adapters (GitHub, GitLab, Codeberg)
│   ├── runner/                # User-owned CI runner contract
│   ├── storage/               # Non-sensitive browser local storage store
│   ├── App.tsx                # App shell & router
│   ├── main.tsx               # Entry point
│   └── styles.css             # Theme & UI styles
├── CHANGELOG.md               # Version release history
└── package.json               # Dependencies & build scripts
```

---

## 📝 Changelog

Project changes are synchronized with [`CHANGELOG.md`](./CHANGELOG.md).

### [0.1.0] - 2026-10-22

- **Initial Release**: React 19 + TypeScript + Vite responsive SaaS control plane foundation.
- **Pages**: Dashboard Overview, Repositories, Sync Policies, Repair Policies, Agents, Execution History, Settings.
- **Domain**: Remote URL validation, dry-run sync planner, local store, provider/agent contracts.
- **Security & Quality**: Vitest suite, ESLint, Prettier, CI workflow, bundle secret scanner.

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

