# Architecture

## Current shape

RepoPilot is a static frontend application built with React, TypeScript, and Vite. It has no
application server, hosted database, background worker, or paid runtime dependency. Browser code is
the configuration/control plane only.

```text
Browser UI
  ├── domain models, validation, and dry-run planner
  ├── localStorage (non-secret drafts only)
  └── typed integration contracts
        ├── Git provider adapters (not connected)
        ├── user-owned CI/runner (not connected)
        └── coding-agent adapters (Jules boundary only)
```

## Modules

- `src/domain`: provider-neutral repository and policy models. `createSyncPlan` accepts an observed
  history relationship and describes a safe decision; it never runs Git or writes to a remote.
- `src/storage`: stores repository labels, remote URLs, and policy drafts in browser-local storage.
  It intentionally has no credential fields.
- `src/providers`: `GitProviderAdapter` is the provider boundary. The initial registry describes
  GitHub, GitLab, Codeberg, and generic Git, while adapters fail with an explicit
  `ProviderNotConfiguredError`.
- `src/runner`: defines the user-owned execution boundary. A future runner must report its run ID,
  status, and logs; this app does not dispatch jobs yet.
- `src/agents`: `CodingAgentAdapter` isolates coding-agent operations. The Jules adapter is
  intentionally unavailable until its supported API and secure execution model are implemented.
- `src/pages` and `src/components`: display stored configuration and explicit integration states.
  Empty states are real; there is no sample activity or fabricated repository data.

## Data and execution flow

1. The user manually records a remote and branch. The app validates URL syntax and rejects
   credential-bearing URLs, but does not authenticate or verify that the remote exists.
2. A policy draft records direction, authoritative branch, exclusions, dry-run mode, and whether
   writes may be considered after approval.
3. A future user-owned runner fetches Git refs and supplies a verified history relationship to the
   planner. Unknown or divergent histories are blocked.
4. A future runner performs approved Git work and returns real workflow results. The frontend must
   not imply that configuration was executed.
5. A future agent adapter receives a narrowly scoped task and returns an inspectable session; any
   proposed changes must be isolated and reviewed.

## Synchronization safety

- The default is one-way, dry-run, writes disabled, and explicit source-of-truth branch.
- Divergent histories always pause. No “force push” or silent overwrite mode is modeled.
- A fast-forward plan is descriptive only; the planner's `writesPerformed` value is always false.
- Writes require a policy that enables them and explicit human approval. A user-owned runner is
  still required to perform the operation.
- Idempotency, retry limits, loop prevention, schedules, real conflict detection, and Git transport
  are not implemented yet.

## Why no managed backend

The initial scope needs a configuration surface, not a permanently running service. CI workflows or
a local runner can own credentials and execute scheduled work. Centralized webhooks, cross-device
state, live provider inventory, and centralized execution monitoring may eventually require a
backend; revisit that decision only when a concrete requirement cannot be met safely by a runner.

## Adding an integration

Implement a provider-specific adapter behind `GitProviderAdapter`; do not add tokens to UI props,
browser storage, logs, or static assets. Keep Git transport and scheduling in a user-owned runner.
Agent adapters must implement `CodingAgentAdapter`, report unsupported operations and limits
explicitly, and never mark a task successful without a verified upstream result.
