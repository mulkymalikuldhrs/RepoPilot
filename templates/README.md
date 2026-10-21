# Workflow templates

No synchronization or agent workflow template is shipped yet. A runnable template would imply real
Git writes and credential handling, so it will be added only alongside a tested runner and explicit
approval controls.

The repository's `.github/workflows/ci.yml` is a read-only project quality check; it does not access
repositories beyond this source tree, synchronize remotes, or call an agent.
