import { defaultSyncPolicy } from './sync-policy';
import type { RepositoryConfig, WorkspaceConfig } from './types';

export function emptyWorkspace(): WorkspaceConfig {
  return {
    repositories: [],
    syncPolicies: {},
    repairPolicy: {
      checks: {
        buildAndTests: true,
        lintAndTypes: true,
        dependencyMaintenance: false,
        documentation: false,
      },
      createPullRequest: true,
      autoMerge: false,
      approvalRequired: true,
    },
    credentials: [],
    readmePolicy: {
      enabled: true,
      requiredSections: [
        'Architecture & Visual Workflow',
        'Tutorial & Usage Guide',
        'Deployment Tutorial',
        'Author & Contact',
      ],
      autoAddMissing: false,
      contactEmail: 'mulkymalikuldhaher@email.com',
    },
  };
}

export function addRepository(
  workspace: WorkspaceConfig,
  repository: RepositoryConfig,
): WorkspaceConfig {
  const existing = workspace.repositories.find((r) => r.remoteUrl === repository.remoteUrl);
  if (existing) {
    throw new Error('This remote URL is already saved in this browser.');
  }

  return {
    ...workspace,
    repositories: [...workspace.repositories, repository],
    syncPolicies: {
      ...workspace.syncPolicies,
      [repository.id]:
        workspace.syncPolicies[repository.id] ?? defaultSyncPolicy(repository.defaultBranch),
    },
  };
}

export function renameRepository(
  workspace: WorkspaceConfig,
  id: string,
  newName: string,
): WorkspaceConfig {
  return {
    ...workspace,
    repositories: workspace.repositories.map((repo) =>
      repo.id === id ? { ...repo, name: newName } : repo,
    ),
  };
}

export function toggleArchiveRepository(
  workspace: WorkspaceConfig,
  id: string,
  archived: boolean,
): WorkspaceConfig {
  return {
    ...workspace,
    repositories: workspace.repositories.map((repo) =>
      repo.id === id ? { ...repo, archived } : repo,
    ),
  };
}
