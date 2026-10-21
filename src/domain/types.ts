export const PROVIDER_IDS = ['github', 'gitlab', 'codeberg', 'git'] as const;

export type ProviderId = (typeof PROVIDER_IDS)[number];
export type SyncDirection = 'one-way' | 'bidirectional';
export type HistoryRelation = 'in-sync' | 'fast-forward' | 'diverged' | 'unknown';

export interface RepositoryConfig {
  id: string;
  name: string;
  provider: ProviderId;
  account: string;
  remoteUrl: string;
  defaultBranch: string;
  createdAt: string;
  verification: 'unverified';
}

export interface SyncPolicy {
  direction: SyncDirection;
  sourceOfTruth: string;
  dryRun: boolean;
  writesEnabled: boolean;
  requireApproval: boolean;
  conflictStrategy: 'pause';
  exclusions: string[];
}

export interface RepairChecks {
  buildAndTests: boolean;
  lintAndTypes: boolean;
  dependencyMaintenance: boolean;
  documentation: boolean;
}

export interface RepairPolicy {
  checks: RepairChecks;
  createPullRequest: true;
  autoMerge: false;
  approvalRequired: true;
}

export interface WorkspaceConfig {
  repositories: RepositoryConfig[];
  syncPolicies: Record<string, SyncPolicy>;
  repairPolicy: RepairPolicy;
}
