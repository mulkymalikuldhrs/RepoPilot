# Security boundaries and recovery

## Data in this version

The frontend stores repository display names, provider labels, remote URLs, branch names, and policy
drafts in `localStorage` under a versioned key. Browser storage is not encrypted, does not sync
between devices, and is not an appropriate secret store. Do not put tokens, API keys, passwords,
private keys, or sensitive repository data into it.

The app does not request provider credentials or Jules keys. It makes no provider API calls, does
not clone repositories, and does not start a runner. Remote URLs with embedded username/password
credentials are rejected, as are plain HTTP URLs.

CI scans built frontend assets for common GitHub, GitLab, cloud-access-key, and chat-token formats.
This heuristic can catch accidental commits of recognizable token strings; it is not a general
secret scanner and does not prove that arbitrary secrets are absent.

## Credential placement

When integrations are implemented, credentials belong in the user's CI secret manager or runner
environment. They must not enter:

- Browser bundles, `localStorage`, query strings, committed files, or public artifacts.
- Browser logs, run logs, errors, screenshots, or support output.
- Repository URLs, commit messages, or agent prompts.

Use least-privilege, repository-scoped credentials; rotate expired or exposed credentials in the
provider. Never paste a secret into an issue or chat.

## Trust boundaries

Repository files, branch names, commit messages, issue text, workflow logs, and agent output are
untrusted input. They may contain prompt injection, terminal escape sequences, markup, or secret-like
strings. Future adapters must treat these as data, escape rendered content, redact secrets before
logging, and never let repository instructions override execution policy.

The browser is a display/control plane, not an authorization boundary. A future runner must validate
the requested repository, branch, policy, and approval independently before any write.

## Write safety

- Dry-run is enabled by default; writes are disabled by default.
- Source-of-truth branch must be explicit.
- Unknown history is blocked until fetched and compared.
- Divergent histories pause for human resolution. No force push is allowed by this foundation.
- A human approval gate is mandatory for write plans.
- Protected default branches must never be modified directly by automation.
- Private repositories are opt-in; there is no automatic mirroring to a shared repository.

## Recovery guidance for planned runner behavior

These are requirements for future execution code, not claims that those paths are already
implemented.

| Failure                            | Required response                                                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Expired token / permission denied  | Stop the job, identify the missing provider permission without printing token values, and require the user to rotate or reauthorize. |
| API rate limit                     | Stop or defer with the provider reset time; use bounded backoff and do not retry in a tight loop.                                    |
| Network failure                    | Mark the run interrupted/unknown; re-fetch refs before resuming.                                                                     |
| Divergent or conflicting histories | Do not write; preserve both sides and request a human resolution.                                                                    |
| Failed tests or lint               | Keep changes on an isolated branch and report the failing check.                                                                     |
| Interrupted workflow               | Make resumption idempotent; verify current commit/ref before repeating a write.                                                      |
| Incomplete agent session           | Mark the result unknown, do not open or merge a change, and allow inspection of available output.                                    |
| Suspected secret in logs           | Redact before persistence/display; stop exposing the affected value and rotate it in its owner system.                               |

Report security issues privately to the project maintainers. No compliance certification is claimed.
