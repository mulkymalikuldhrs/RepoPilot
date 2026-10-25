export const PROVIDER_IDS = ['github', 'gitlab', 'codeberg', 'git'] as const;

export type ProviderId = (typeof PROVIDER_IDS)[number];
export type SyncDirection = 'one-way' | 'bidirectional';
export type HistoryRelation = 'in-sync' | 'fast-forward' | 'diverged' | 'unknown';

export interface RepositoryConfig {
  id: string;
  name: string;
  fullName?: string;
  provider: ProviderId;
  account: string;
  remoteUrl: string;
  defaultBranch: string;
  createdAt: string;
  verification: 'unverified' | 'verified';
  /** Runner-verified metadata (optional; never required by the UI). */
  archived?: boolean;
  visibility?: 'public' | 'private';
  pushedAt?: string;
}

/**
 * A platform-level restriction that makes a repository impossible or unsafe
 * to write to, regardless of policy. Discovered by the runner from real
 * provider responses/push failures, never guessed by the UI.
 */
export type PolicyRestrictionKind =
  'github-ruleset' | 'pre-receive-hook' | 'push-rules' | 'archived' | 'auth-denied' | 'unknown';

export interface PolicyRestriction {
  kind: PolicyRestrictionKind;
  platform: ProviderId;
  repository: string;
  message: string;
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
