import type { HistoryRelation, PolicyRestriction, SyncPolicy } from './types';

export interface SyncObservation {
  relation: HistoryRelation;
  sourceCommit: string;
  destinationCommit: string;
}

export type SyncDecision =
  'blocked' | 'no-op' | 'dry-run' | 'approval-required' | 'planned-write' | 'policy-blocked';

export interface SyncPlan {
  decision: SyncDecision;
  reason: string;
  sourceCommit: string;
  destinationCommit: string;
  writesPerformed: false;
}

export function defaultSyncPolicy(sourceBranch: string): SyncPolicy {
  return {
    direction: 'one-way',
    sourceOfTruth: sourceBranch,
    dryRun: true,
    writesEnabled: false,
    requireApproval: true,
    conflictStrategy: 'pause',
    exclusions: [],
  };
}

export function validateSyncPolicy(policy: SyncPolicy): string[] {
  const errors: string[] = [];

  if (!policy.sourceOfTruth.trim()) {
    errors.push('Choose an authoritative source branch.');
  }
  if (policy.writesEnabled && !policy.requireApproval) {
    errors.push('Write operations must require explicit approval.');
  }
  if (policy.conflictStrategy !== 'pause') {
    errors.push('Divergent histories must pause for review.');
  }

  return errors;
}

function restrictionReason(restrictions: PolicyRestriction[]): string {
  const kinds = restrictions.map((r) => r.kind).join(', ');
  const messages = restrictions.map((r) => `${r.repository}: ${r.message}`.trim()).join(' | ');
  return `Platform policy blocks writes before any Git operation runs (${kinds}). ${messages}`;
}

export function createSyncPlan(
  policy: SyncPolicy,
  observation: SyncObservation,
  approved = false,
  restrictions: PolicyRestriction[] = [],
): SyncPlan {
  const base = {
    sourceCommit: observation.sourceCommit,
    destinationCommit: observation.destinationCommit,
    writesPerformed: false as const,
  };
  const policyErrors = validateSyncPolicy(policy);

  if (policyErrors.length > 0) {
    return { ...base, decision: 'blocked', reason: policyErrors.join(' ') };
  }

  // Platform restrictions outrank everything else: the runner must not even
  // attempt a write that a provider has already proven it will reject.
  if (restrictions.length > 0) {
    return { ...base, decision: 'policy-blocked', reason: restrictionReason(restrictions) };
  }

  if (observation.relation === 'diverged') {
    return {
      ...base,
      decision: 'blocked',
      reason: 'Histories diverged. RepoPilot will not overwrite either side.',
    };
  }

  if (observation.relation === 'unknown') {
    return {
      ...base,
      decision: 'blocked',
      reason: 'History relationship is unknown. Fetch and compare before planning a sync.',
    };
  }

  if (observation.relation === 'in-sync') {
    return { ...base, decision: 'no-op', reason: 'Both remotes are already in sync.' };
  }

  if (policy.dryRun) {
    return {
      ...base,
      decision: 'dry-run',
      reason: 'A fast-forward is available. Dry-run only; no Git operation was performed.',
    };
  }

  if (!policy.writesEnabled) {
    return {
      ...base,
      decision: 'blocked',
      reason: 'Writes are disabled for this policy.',
    };
  }

  if (!approved) {
    return {
      ...base,
      decision: 'approval-required',
      reason: 'A person must approve this write before a runner can apply it.',
    };
  }

  return {
    ...base,
    decision: 'planned-write',
    reason: 'Approved plan only. A configured user-owned runner must perform the Git operation.',
  };
}
