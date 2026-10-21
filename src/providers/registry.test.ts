import { describe, expect, it } from 'vitest';
import { createUnconfiguredProviderAdapter, PROVIDERS } from './registry';

describe('provider registry', () => {
  it('lists providers as unconnected or unverified, never as connected by default', () => {
    expect(PROVIDERS.map((provider) => provider.connectionState)).not.toContain('connected');
  });

  it('does not fake repository discovery for an unconfigured provider', async () => {
    const adapter = createUnconfiguredProviderAdapter('github');
    await expect(adapter.listRepositories()).rejects.toThrow('is not connected');
  });
});
