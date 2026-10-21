import { describe, expect, it } from 'vitest';
import { addRepository, emptyWorkspace } from './workspace';
import type { RepositoryConfig } from './types';

const repository: RepositoryConfig = {
  id: 'repo-1',
  name: 'Widget',
  provider: 'github',
  account: 'personal',
  remoteUrl: 'https://github.com/acme/widget.git',
  defaultBranch: 'main',
  createdAt: '2026-01-01T00:00:00.000Z',
  verification: 'unverified',
};

describe('workspace configuration', () => {
  it('starts empty and creates a safe default policy when a repository is added', () => {
    const next = addRepository(emptyWorkspace(), repository);
    expect(next.repositories).toEqual([repository]);
    expect(next.syncPolicies['repo-1']).toMatchObject({
      dryRun: true,
      writesEnabled: false,
      sourceOfTruth: 'main',
    });
  });

  it('rejects duplicate remote URLs', () => {
    const workspace = addRepository(emptyWorkspace(), repository);
    expect(() => addRepository(workspace, { ...repository, id: 'repo-2' })).toThrow(
      'This remote URL is already saved in this browser.',
    );
  });
});
