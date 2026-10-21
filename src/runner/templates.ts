import type { RepositoryConfig, SyncPolicy } from '../domain/types';

export interface WorkflowExportOptions {
  repository: RepositoryConfig;
  policy: SyncPolicy;
  scheduleCron?: string;
}

export function generateSyncWorkflowYaml(options: WorkflowExportOptions): string {
  const { repository, policy, scheduleCron = '0 */6 * * *' } = options;

  const exclusionsComment =
    policy.exclusions.length > 0
      ? `# Exclusions:\n# ${policy.exclusions.map((e) => `- ${e}`).join('\n# ')}\n`
      : '';

  return `# RepoPilot User-Owned Workflow Template
# Repository: ${repository.name} (${repository.remoteUrl})
# Sync Direction: ${policy.direction}
# Source of Truth Branch: ${policy.sourceOfTruth}
${exclusionsComment}
name: RepoPilot Sync - ${repository.name}

on:
  schedule:
    - cron: '${scheduleCron}'
  workflow_dispatch:
    inputs:
      dry_run:
        description: 'Run in dry-run mode'
        type: boolean
        default: ${policy.dryRun ? 'true' : 'false'}

permissions:
  contents: write

jobs:
  sync:
    name: Sync ${repository.name}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Configure Git Identity
        run: |
          git config user.name "repopilot-runner[bot]"
          git config user.email "runner@repopilot.local"

      - name: Evaluate Synchronization
        env:
          SOURCE_BRANCH: "${policy.sourceOfTruth}"
          DRY_RUN: "\${{ inputs.dry_run || '${policy.dryRun ? 'true' : 'false'}' }}"
          WRITES_ENABLED: "${policy.writesEnabled ? 'true' : 'false'}"
        run: |
          echo "Syncing repository ${repository.name} using branch $SOURCE_BRANCH..."
          if [ "$DRY_RUN" = "true" ]; then
            echo "Dry-run mode active. No remote branches will be overwritten."
          fi
`;
}
