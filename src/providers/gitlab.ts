import type { RepositoryConfig } from '../domain/types';
import type { GitProviderAdapter } from './types';
import {
  asArray,
  asRecord,
  bool,
  paginate,
  snapshotToRepositoryConfig,
  type FetchLike,
  type ProviderRepoSnapshot,
} from './rest';

const API_ROOT = 'https://gitlab.com/api/v4';

function authHeaders(token: string): Record<string, string> {
  return { 'PRIVATE-TOKEN': token };
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * GitLab deploys anti-abuse filters that answer with sporadic 403/429 for
 * otherwise valid tokens. Retry with backoff before giving up.
 */
async function fetchWithRetry(
  fetchImpl: FetchLike,
  url: string,
  headers: Record<string, string>,
  attempts = 3,
): Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }> {
  let lastStatus = 0;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const response = await fetchImpl(url, { headers });
    if (response.ok || (response.status !== 403 && response.status !== 429)) return response;
    lastStatus = response.status;
    if (attempt < attempts) await sleep(3000 * attempt);
  }
  return {
    ok: false,
    status: lastStatus,
    json: async () => {
      throw new Error(`GitLab API unavailable (last status ${lastStatus})`);
    },
  };
}

interface GitLabProjectPayload {
  id: number;
  path_with_namespace: string;
  http_url_to_repo: string;
  default_branch: string;
  visibility: string;
  archived: boolean;
  last_activity_at: string;
  created_at: string;
}

function mapProject(payload: GitLabProjectPayload): ProviderRepoSnapshot {
  const fullName = payload.path_with_namespace;
  const account = fullName.split('/')[0] ?? fullName;
  return {
    account,
    fullName,
    remoteUrl: payload.http_url_to_repo,
    defaultBranch: payload.default_branch || 'main',
    visibility: payload.visibility === 'private' ? 'private' : 'public',
    archived: Boolean(payload.archived),
    pushedAt: payload.last_activity_at,
    createdAt: payload.created_at,
  };
}

/**
 * GitLab adapter. Lists personal projects of the token owner (proven path;
 * generic membership queries are known to trip GitLab anti-abuse filters on
 * some network ranges). Self-managed instances are out of scope for v0.2.
 */
export class GitLabAdapter implements GitProviderAdapter {
  readonly providerId = 'gitlab' as const;

  constructor(
    private readonly tokens: string[],
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  private async userId(token: string): Promise<number> {
    const response = await fetchWithRetry(this.fetchImpl, `${API_ROOT}/user`, authHeaders(token));
    if (!response.ok) {
      throw new Error(
        `GitLab API ${response.status} for /user (403/429 often means GitLab anti-abuse throttling for this network, not an invalid token)`,
      );
    }
    const payload = asRecord(await response.json());
    const id = payload.id;
    if (typeof id !== 'number') throw new Error('GitLab /user response missing id');
    return id;
  }

  async listRepositories(): Promise<RepositoryConfig[]> {
    const byPath = new Map<string, RepositoryConfig>();
    for (const token of this.tokens) {
      const headers = authHeaders(token);
      const uid = await this.userId(token);
      const projects = await paginate<GitLabProjectPayload>(
        (url, init) => fetchWithRetry(this.fetchImpl, url, init?.headers ?? {}),
        (page) => `${API_ROOT}/users/${uid}/projects?per_page=100&page=${page}`,
        headers,
        asArray,
      );
      for (const project of projects) {
        byPath.set(
          project.path_with_namespace.toLowerCase(),
          snapshotToRepositoryConfig(this.providerId, mapProject(project)),
        );
      }
    }
    return [...byPath.values()];
  }

  async verifyRemote(remoteUrl: string): Promise<void> {
    const path = remoteUrl.replace(/^https?:\/\/[^/]+\//, '').replace(/\.git$/, '');
    const encoded = encodeURIComponent(path);
    const response = await this.fetchImpl(`${API_ROOT}/projects/${encoded}`, {
      headers: authHeaders(this.tokens[0] ?? ''),
    });
    if (!response.ok) {
      throw new Error(`GitLab remote ${path} not verifiable (API ${response.status})`);
    }
  }
}

export const _gitlabInternal = { bool };
