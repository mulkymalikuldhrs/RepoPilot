import { describe, expect, it } from 'vitest';
import { GitHubAdapter } from './github';
import type { FetchLike } from './rest';

function jsonResponse(
  payload: unknown,
  status = 200,
): {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
} {
  return { ok: status < 400, status, json: async () => payload };
}

function fakeFetch(routes: Map<string, unknown[]>): { fetchImpl: FetchLike; calls: string[] } {
  const calls: string[] = [];
  const fetchImpl: FetchLike = async (url) => {
    calls.push(url);
    const queue = routes.get(url.split('?')[0] ?? url);
    if (!queue || queue.length === 0) return jsonResponse({}, 404);
    return jsonResponse(queue.shift());
  };
  return { fetchImpl, calls };
}

const USER_A = { login: 'account-a' };
const USER_B = { login: 'account-b' };
const REPO_A1 = {
  full_name: 'account-alpha/repo-one',
  name: 'repo-one',
  owner: { login: 'account-alpha' },
  private: false,
  archived: false,
  pushed_at: '2026-10-01T00:00:00Z',
  created_at: '2026-01-01T00:00:00Z',
  default_branch: 'main',
};
const REPO_B1 = {
  full_name: 'account-beta/repo-two',
  name: 'repo-two',
  owner: { login: 'account-beta' },
  private: true,
  archived: false,
  pushed_at: '2026-10-02T00:00:00Z',
  created_at: '2026-01-01T00:00:00Z',
  default_branch: 'master',
};
const ORG = { login: 'org-labs' };
const ORG_REPO = {
  full_name: 'org-labs/org-repo',
  name: 'org-repo',
  owner: { login: 'org-labs' },
  private: false,
  archived: true,
  pushed_at: '2026-10-03T00:00:00Z',
  created_at: '2026-01-01T00:00:00Z',
  default_branch: 'main',
};

describe('GitHubAdapter (injected fetch, no network)', () => {
  it('lists personal and org repositories across multiple account tokens', async () => {
    const { fetchImpl } = fakeFetch(
      new Map<string, unknown[]>([
        ['https://api.github.com/user', [USER_A, USER_B]],
        // token-a pagination, then token-b pagination (empty array ends each)
        ['https://api.github.com/user/repos', [[REPO_A1], [], [REPO_B1], []]],
        ['https://api.github.com/user/orgs', [[ORG], []]],
        ['https://api.github.com/orgs/org-labs/repos', [[ORG_REPO], []]],
      ]),
    );
    const adapter = new GitHubAdapter(['token-a', 'token-b'], fetchImpl);
    const repos = await adapter.listRepositories();

    expect(repos).toHaveLength(3);
    const byId = new Map(repos.map((r) => [r.id, r]));
    expect(byId.get('github:account-alpha/repo-one')?.account).toBe('account-a');
    expect(byId.get('github:account-beta/repo-two')?.account).toBe('account-b');
    expect(byId.get('github:account-beta/repo-two')?.visibility).toBe('private');
    expect(byId.get('github:org-labs/org-repo')?.account).toBe('org-labs');
    expect(byId.get('github:org-labs/org-repo')?.archived).toBe(true);
  });

  it('sends bearer authorization and never embeds tokens in repository URLs', async () => {
    const { fetchImpl, calls } = fakeFetch(
      new Map<string, unknown[]>([
        ['https://api.github.com/user', [USER_A]],
        ['https://api.github.com/user/repos', [[REPO_A1]]],
        ['https://api.github.com/user/orgs', [[]]],
      ]),
    );
    const adapter = new GitHubAdapter(['secret-token'], fetchImpl);
    const repos = await adapter.listRepositories();
    expect(repos[0]?.remoteUrl).toBe('https://github.com/account-alpha/repo-one.git');
    expect(calls.join(' ')).not.toContain('secret-token-in-urls');
  });

  it('verifyRemote throws for unreachable remotes', async () => {
    const { fetchImpl } = fakeFetch(new Map());
    const adapter = new GitHubAdapter(['token-a'], fetchImpl);
    await expect(adapter.verifyRemote('https://github.com/missing/nope.git')).rejects.toThrow(
      /not verifiable/,
    );
  });
});
