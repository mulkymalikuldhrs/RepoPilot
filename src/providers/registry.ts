import {
  ProviderNotConfiguredError,
  type GitProviderAdapter,
  type ProviderDescriptor,
} from './types';
import type { ProviderId } from '../domain/types';

export const PROVIDERS: ProviderDescriptor[] = [
  {
    id: 'github',
    name: 'GitHub',
    detail: 'Connected GitHub accounts can be added in a later integration stage.',
    connectionState: 'not-connected',
    supportsMultipleAccounts: true,
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    detail: 'GitLab.com and self-managed remotes are planned through user-owned workflows.',
    connectionState: 'not-connected',
    supportsMultipleAccounts: true,
  },
  {
    id: 'codeberg',
    name: 'Codeberg',
    detail: 'Codeberg remotes are planned through user-owned workflows.',
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
