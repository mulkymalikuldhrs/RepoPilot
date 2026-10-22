import { describe, expect, it } from 'vitest';
import { createSyncPlan, defaultSyncPolicy } from './sync-policy';
import type { PolicyRestriction } from './types';

const policy = (overrides: Partial<ReturnType<typeof defaultSyncPolicy>> = {}) => ({
  ...defaultSyncPolicy('main'),
  dryRun: false,
  writesEnabled: true,
  requireApproval: true,
  ...overrides,
});

const observation = {
  relation: 'fast-forward' as const,
  sourceCommit: 'aaaa',
  destinationCommit: 'bbbb',
};

describe('policy-blocked decisions', () => {
  it('blocks writes when the target platform has a known restriction', () => {
    const restrictions: PolicyRestriction[] = [
      {
        kind: 'github-ruleset',
        platform: 'github',
        repository: 'org/repo',
        message: 'Rulesets reject this write.',
      },
    ];
    const plan = createSyncPlan(policy(), observation, false, restrictions);
    expect(plan.decision).toBe('policy-blocked');
    expect(plan.reason).toContain('github-ruleset');
    expect(plan.writesPerformed).toBe(false);
  });

  it('keeps approval-required behavior when no restrictions exist', () => {
    const plan = createSyncPlan(policy(), observation, false);
    expect(plan.decision).toBe('approval-required');
  });

  it('yields planned-write only with explicit approval and no restrictions', () => {
    const plan = createSyncPlan(policy(), observation, true);
    expect(plan.decision).toBe('planned-write');
  });

  it('policy-blocked outranks history checks when both apply', () => {
    const restrictions: PolicyRestriction[] = [
      { kind: 'archived', platform: 'codeberg', repository: 'o/r', message: 'archived' },
    ];
    const plan = createSyncPlan(
      policy(),
      { ...observation, relation: 'diverged' as const },
      true,
      restrictions,
    );
    expect(plan.decision).toBe('policy-blocked');
    expect(plan.reason).toContain('archived');
  });
});
