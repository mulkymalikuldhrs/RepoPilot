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

const API_ROOT = 'https://api.github.com';

function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

interface GitHubRepoPayload {
  full_name: string;
  name: string;
  owner: { login?: string };
  private: boolean;
  archived: boolean;
  pushed_at: string;
  created_at: string;
  default_branch: string;
}

function mapRepo(payload: GitHubRepoPayload, account: string): ProviderRepoSnapshot {
  return {
    account,
    fullName: payload.full_name,
    remoteUrl: `https://github.com/${payload.full_name}.git`,
    defaultBranch: payload.default_branch || 'main',
    visibility: payload.private ? 'private' : 'public',
    archived: Boolean(payload.archived),
    pushedAt: payload.pushed_at,
    createdAt: payload.created_at,
  };
}

/**
 * GitHub adapter. Supports multiple accounts: pass one PAT per account;
 * repositories of the authenticated user AND their orgs are listed per token
 * and de-duplicated by full name.
 */
export class GitHubAdapter implements GitProviderAdapter {
  readonly providerId = 'github' as const;

  constructor(
    private readonly tokens: string[],
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  private async loginFor(token: string): Promise<string> {
    const response = await this.fetchImpl(`${API_ROOT}/user`, { headers: authHeaders(token) });
    if (!response.ok) throw new Error(`GitHub token rejected (API ${response.status})`);
    const payload = asRecord(await response.json());
    return str(payload, 'login');
  }

  /** Resolve every configured token to its account login. */
  async accounts(): Promise<{ token: string; login: string }[]> {
    const results: { token: string; login: string }[] = [];
    for (const token of this.tokens) {
      results.push({ token, login: await this.loginFor(token) });
    }
    return results;
  }

  async listRepositories(): Promise<RepositoryConfig[]> {
    const byFullName = new Map<string, RepositoryConfig>();
    const toConfig = (snapshot: ProviderRepoSnapshot) =>
      snapshotToRepositoryConfig(this.providerId, snapshot);

    for (const token of this.tokens) {
      const headers = authHeaders(token);
      const login = await this.loginFor(token);

      const personal = await paginate<GitHubRepoPayload>(
        this.fetchImpl,
        (page) => `${API_ROOT}/user/repos?per_page=100&sort=updated&page=${page}`,
        headers,
        asArray,
      );
      for (const repo of personal) {
        byFullName.set(repo.full_name.toLowerCase(), toConfig(mapRepo(repo, login)));
      }

      const orgs = asArray(await this.fetchJsonWith(headers, `${API_ROOT}/user/orgs`));
      for (const rawOrg of orgs) {
        const org = asRecord(rawOrg);
        const orgLogin = str(org, 'login');
        if (!orgLogin) continue;
        const orgRepos = await paginate<GitHubRepoPayload>(
          this.fetchImpl,
          (page) => `${API_ROOT}/orgs/${orgLogin}/repos?per_page=100&page=${page}`,
          headers,
          asArray,
        );
        for (const repo of orgRepos) {
          byFullName.set(repo.full_name.toLowerCase(), toConfig(mapRepo(repo, orgLogin)));
        }
      }
    }
    return [...byFullName.values()];
  }

  private async fetchJsonWith(headers: Record<string, string>, url: string): Promise<unknown> {
    const response = await this.fetchImpl(url, { headers });
    if (!response.ok) throw new Error(`API ${response.status} for ${url}`);
    return response.json();
  }

  async verifyRemote(remoteUrl: string): Promise<void> {
    const fullName = remoteUrl.replace(/^https?:\/\/[^/]+\//, '').replace(/\.git$/, '');
    const response = await this.fetchImpl(`${API_ROOT}/repos/${fullName}`, {
      headers: authHeaders(this.tokens[0] ?? ''),
    });
    if (!response.ok) {
      throw new Error(`GitHub remote ${fullName} not verifiable (API ${response.status})`);
    }
  }
}

/** Exposed for tests only. */
export const _internal = { bool, asRecord };
