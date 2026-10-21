import type { ProviderId, RepositoryConfig } from '../domain/types';

export type ProviderConnectionState = 'not-connected' | 'unverified' | 'connected';

export interface ProviderDescriptor {
  id: ProviderId;
  name: string;
  detail: string;
  connectionState: ProviderConnectionState;
  supportsMultipleAccounts: boolean;
}

export interface GitProviderAdapter {
  readonly providerId: ProviderId;
  listRepositories(): Promise<RepositoryConfig[]>;
  verifyRemote(remoteUrl: string): Promise<void>;
}

export class ProviderNotConfiguredError extends Error {
  constructor(providerId: ProviderId) {
    super(`${providerId} is not connected. Configure it through a user-controlled runner.`);
    this.name = 'ProviderNotConfiguredError';
  }
}
