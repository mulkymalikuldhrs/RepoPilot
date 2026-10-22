import { describe, expect, it } from 'vitest';
import { generateSyncWorkflowYaml } from './templates';
import type { RepositoryConfig, SyncPolicy } from '../domain/types';

describe('generateSyncWorkflowYaml', () => {
  const sampleRepository: RepositoryConfig = {
    id: 'repo-1',
    name: 'test-repo',
    provider: 'github',
    account: 'example',
    remoteUrl: 'https://github.com/example/test-repo.git',
    defaultBranch: 'main',
    createdAt: '2026-10-22T00:00:00.000Z',
    verification: 'unverified',
  };

  const samplePolicy: SyncPolicy = {
    direction: 'one-way',
    sourceOfTruth: 'main',
    dryRun: true,
    writesEnabled: false,
    requireApproval: true,
    conflictStrategy: 'pause',
    exclusions: ['.env', 'private/*'],
  };

  it('generates valid YAML containing repository name and source branch', () => {
    const yaml = generateSyncWorkflowYaml({
      repository: sampleRepository,
      policy: samplePolicy,
    });

    expect(yaml).toContain('name: RepoPilot Sync - test-repo');
    expect(yaml).toContain('SOURCE_BRANCH: "main"');
    expect(yaml).toContain('# Exclusions:\n# - .env\n# - private/*');
    expect(yaml).toContain('default: true');
  });

  it('includes custom schedule cron when provided', () => {
    const yaml = generateSyncWorkflowYaml({
      repository: sampleRepository,
      policy: samplePolicy,
      scheduleCron: '0 0 * * *',
    });

    expect(yaml).toContain("- cron: '0 0 * * *'");
  });
});
