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
  verification: 'unverified' | 'verified';
  archived?: boolean;
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

export interface ProviderCredential {
  provider: ProviderId;
  account: string;
  authType: 'pat' | 'oauth_token' | 'api_key';
  maskedToken: string;
  rawToken?: string;
  updatedAt: string;
}

export interface BranchMergeRequest {
  repositoryId: string;
  sourceBranch: string;
  targetBranch: string;
  strategy: 'fast-forward' | 'squash' | 'merge-commit';
  autoDeleteSource?: boolean;
}

export interface PullMergeRequest {
  repositoryId: string;
  remoteBranch: string;
  localBranch: string;
  dryRun: boolean;
}

export interface BatchRenameRule {
  targetRepositoryIds: string[];
  pattern: string;
  replacement: string;
  prefix?: string;
  suffix?: string;
}

export interface BatchSyncRequest {
  repositoryIds: string[];
  direction: SyncDirection;
  dryRun: boolean;
}

export interface BatchCiDispatch {
  repositoryIds: string[];
  workflowFile: string;
  ref: string;
  inputs?: Record<string, string>;
}

export interface ReadmeConsistencyPolicy {
  enabled: boolean;
  requiredSections: string[];
  autoAddMissing: boolean;
  standardBannerUrl?: string;
  contactEmail?: string;
}

export interface WorkspaceConfig {
  repositories: RepositoryConfig[];
  syncPolicies: Record<string, SyncPolicy>;
  repairPolicy: RepairPolicy;
  credentials?: ProviderCredential[];
  readmePolicy?: ReadmeConsistencyPolicy;
}
