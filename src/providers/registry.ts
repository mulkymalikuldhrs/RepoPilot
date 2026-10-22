import type { ProviderId } from '../domain/types';
import type { GitProviderAdapter, ProviderDescriptor } from './types';
import { CodebergAdapter } from './codeberg';
import { GitHubAdapter } from './github';
import { GitLabAdapter } from './gitlab';
import { loadCredentials, type RunnerCredentials } from '../runner/credentials';

export const PROVIDERS: ProviderDescriptor[] = [
  {
    id: 'github',
    name: 'GitHub',
    detail:
      'Runner-side adapter ready: set REPOPILOT_GITHUB_TOKENS (comma-separated PATs, one per account).',
    connectionState: 'not-connected',
    supportsMultipleAccounts: true,
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    detail:
      'Runner-side adapter ready: set REPOPILOT_GITLAB_TOKEN. Lists personal projects of the token owner.',
    connectionState: 'not-connected',
    supportsMultipleAccounts: true,
  },
  {
    id: 'codeberg',
    name: 'Codeberg',
    detail: 'Runner-side adapter ready: set REPOPILOT_CODEBERG_TOKEN (personal + org repos).',
    connectionState: 'not-connected',
    supportsMultipleAccounts: true,
  },
  {
    id: 'git',
    name: 'Other Git remote',
    detail: 'Git-compatible remotes can be recorded; access is not tested by this frontend.',
    connectionState: 'unverified',
    supportsMultipleAccounts: true,
  },
];

export class ProviderNotConfiguredError extends Error {
  constructor(providerId: ProviderId) {
    super(`${providerId} is not connected. Configure it through a user-controlled runner.`);
    this.name = 'ProviderNotConfiguredError';
  }
}

export function createUnconfiguredProviderAdapter(providerId: ProviderId): GitProviderAdapter {
  return {
    providerId,
    async listRepositories() {
      throw new ProviderNotConfiguredError(providerId);
    },
    async verifyRemote() {
      throw new ProviderNotConfiguredError(providerId);
    },
  };
}

/**
 * Wire real adapters when the runner environment carries tokens; otherwise
 * fall back to explicit not-configured stubs so callers fail loudly.
 */
export function createProviderAdapters(
  creds: RunnerCredentials = loadCredentials(),
): Partial<Record<ProviderId, GitProviderAdapter>> {
  const adapters: Partial<Record<ProviderId, GitProviderAdapter>> = {};
  if (creds.github.length > 0) adapters.github = new GitHubAdapter(creds.github);
  if (creds.gitlab.length > 0) adapters.gitlab = new GitLabAdapter(creds.gitlab);
  if (creds.codeberg.length > 0) adapters.codeberg = new CodebergAdapter(creds.codeberg);
  return adapters;
}

export function requireAdapter(
  adapters: Partial<Record<ProviderId, GitProviderAdapter>>,
  providerId: ProviderId,
): GitProviderAdapter {
  const adapter = adapters[providerId];
  if (!adapter) throw new ProviderNotConfiguredError(providerId);
  return adapter;
}
