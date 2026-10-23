import type { RepositoryConfig } from '../domain/types';
import type { GitProviderAdapter } from './types';
import {
  asArray,
  asRecord,
  bool,
  paginate,
  snapshotToRepositoryConfig,
  str,
  type FetchLike,
  type ProviderRepoSnapshot,
} from './rest';

const API_ROOT = 'https://codeberg.org/api/v1';

function authHeaders(token: string): Record<string, string> {
  // Gitea accepts token auth via Authorization header.
  return { Authorization: `token ${token}` };
}

interface GiteaRepoPayload {
  full_name: string;
  owner: { login?: string };
  private: boolean;
  archived: boolean;
  updated_at: string;
  created_at: string;
  default_branch: string;
}

function mapRepo(payload: GiteaRepoPayload): ProviderRepoSnapshot {
  const fullName = payload.full_name;
  const rec = asRecord(payload);
  const account = str(asRecord(payload.owner), 'login') || fullName.split('/')[0] || fullName;
  return {
    account,
    fullName,
    remoteUrl: `https://codeberg.org/${fullName}.git`,
    defaultBranch: payload.default_branch || 'main',
    visibility: payload.private ? 'private' : 'public',
    archived: bool(rec, 'archived'),
    pushedAt: payload.updated_at,
    createdAt: payload.created_at,
  };
}

/**
 * Codeberg (Gitea) adapter. /user/repos returns personal repos plus repos of
 * orgs the account belongs to, which matches RepoPilot's multi-account model.
 */
export class CodebergAdapter implements GitProviderAdapter {
  readonly providerId = 'codeberg' as const;

  constructor(
    private readonly tokens: string[],
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  /** Codeberg HTTPS push URLs need the account username. */
  async loginFor(token: string): Promise<string> {
    const response = await this.fetchImpl(`${API_ROOT}/user`, { headers: authHeaders(token) });
    if (!response.ok) throw new Error(`Codeberg token rejected (API ${response.status})`);
    const payload = asRecord(await response.json());
    return str(payload, 'login');
  }

  async listRepositories(): Promise<RepositoryConfig[]> {
    const byFullName = new Map<string, RepositoryConfig>();
    for (const token of this.tokens) {
      const headers = authHeaders(token);
      const repos = await paginate<GiteaRepoPayload>(
        this.fetchImpl,
        (page) => `${API_ROOT}/user/repos?limit=50&page=${page}`,
        headers,
        (payload) => asArray(payload) as unknown as GiteaRepoPayload[],
      );
      for (const repo of repos) {
        byFullName.set(
          repo.full_name.toLowerCase(),
          snapshotToRepositoryConfig(this.providerId, mapRepo(repo)),
        );
      }
    }
    return [...byFullName.values()];
  }

  async verifyRemote(remoteUrl: string): Promise<void> {
    const fullName = remoteUrl.replace(/^https?:\/\/[^/]+\//, '').replace(/\.git$/, '');
    const response = await this.fetchImpl(`${API_ROOT}/repos/${fullName}`, {
      headers: authHeaders(this.tokens[0] ?? ''),
    });
    if (!response.ok) {
      throw new Error(`Codeberg remote ${fullName} not verifiable (API ${response.status})`);
    }
  }
}
