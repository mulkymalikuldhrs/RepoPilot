import { defaultSyncPolicy } from './sync-policy';
import type { RepairPolicy, RepositoryConfig, WorkspaceConfig } from './types';

export const DEFAULT_REPAIR_POLICY: RepairPolicy = {
  checks: {
    buildAndTests: true,
    lintAndTypes: true,
    dependencyMaintenance: false,
    documentation: false,
  },
  createPullRequest: true,
  autoMerge: false,
  approvalRequired: true,
};

export function emptyWorkspace(): WorkspaceConfig {
  return {
    repositories: [],
    syncPolicies: {},
    repairPolicy: structuredClone(DEFAULT_REPAIR_POLICY),
  };
}

export function addRepository(
  workspace: WorkspaceConfig,
  repository: RepositoryConfig,
): WorkspaceConfig {
  if (workspace.repositories.some((entry) => entry.remoteUrl === repository.remoteUrl)) {
    throw new Error('This remote URL is already saved in this browser.');
  }

  return {
    ...workspace,
    repositories: [...workspace.repositories, repository],
    syncPolicies: {
      ...workspace.syncPolicies,
      [repository.id]: defaultSyncPolicy(repository.defaultBranch),
    },
  };
}
