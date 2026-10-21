import { describe, expect, it } from 'vitest';
import { createSyncPlan, defaultSyncPolicy, validateSyncPolicy } from './sync-policy';

describe('sync policy safety', () => {
  it('defaults to dry-run, disabled writes, and an explicit source of truth', () => {
    expect(defaultSyncPolicy('main')).toMatchObject({
      sourceOfTruth: 'main',
      dryRun: true,
      writesEnabled: false,
      requireApproval: true,
      conflictStrategy: 'pause',
    });
  });

  it('rejects policies that allow writes without approval', () => {
    const policy = { ...defaultSyncPolicy('main'), writesEnabled: true, requireApproval: false };
    expect(validateSyncPolicy(policy)).toContain(
      'Write operations must require explicit approval.',
    );
  });

  it('blocks divergent or unknown histories without performing writes', () => {
    const policy = defaultSyncPolicy('main');
    const divergent = createSyncPlan(policy, {
      relation: 'diverged',
      sourceCommit: 'a1',
      destinationCommit: 'b2',
    });
    const unknown = createSyncPlan(policy, {
      relation: 'unknown',
      sourceCommit: 'a1',
      destinationCommit: 'b2',
    });

    expect(divergent).toMatchObject({ decision: 'blocked', writesPerformed: false });
    expect(unknown).toMatchObject({ decision: 'blocked', writesPerformed: false });
  });

  it('plans a fast-forward in dry-run mode and never applies it', () => {
    const plan = createSyncPlan(defaultSyncPolicy('main'), {
      relation: 'fast-forward',
      sourceCommit: 'new',
      destinationCommit: 'old',
    });

    expect(plan).toMatchObject({ decision: 'dry-run', writesPerformed: false });
  });

  it('requires approval before planning any non-dry-run write', () => {
    const policy = {
      ...defaultSyncPolicy('main'),
      dryRun: false,
      writesEnabled: true,
    };
    const observation = {
      relation: 'fast-forward' as const,
      sourceCommit: 'new',
      destinationCommit: 'old',
    };

    expect(createSyncPlan(policy, observation).decision).toBe('approval-required');
    expect(createSyncPlan(policy, observation, true).decision).toBe('planned-write');
    expect(createSyncPlan(policy, observation, true).writesPerformed).toBe(false);
  });
});
