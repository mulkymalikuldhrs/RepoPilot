import { describe, expect, it } from 'vitest';
import { authenticatedUrl, loadCredentials, redact } from './credentials';

describe('runner credentials', () => {
  it('loads tokens from environment variables only', () => {
    const creds = loadCredentials({
      REPOPILOT_GITHUB_TOKENS: 'gh_token_a, gh_token_b',
      REPOPILOT_GITLAB_TOKEN: 'gl_token',
      REPOPILOT_CODEBERG_TOKEN: 'cb_token',
    });
    expect(creds.github).toEqual(['gh_token_a', 'gh_token_b']);
    expect(creds.gitlab).toEqual(['gl_token']);
    expect(creds.codeberg).toEqual(['cb_token']);
  });

  it('returns empty credential sets when env is unset', () => {
    const creds = loadCredentials({});
    expect(creds.github).toEqual([]);
    expect(creds.gitlab).toEqual([]);
    expect(creds.codeberg).toEqual([]);
  });

  it('redacts embedded credentials in URLs and bare tokens', () => {
    const out = redact('push https://x-access-token:ghsecret@github.com/o/r.git failed', [
      'ghsecret',
    ]);
    expect(out).not.toContain('ghsecret');
    expect(out).toContain('https://***@github.com/o/r.git');
  });

  it('builds platform-specific authenticated URLs', () => {
    expect(authenticatedUrl('github', 'https://github.com/o/r.git', 't1')).toBe(
      'https://x-access-token:t1@github.com/o/r.git',
    );
    expect(authenticatedUrl('gitlab', 'https://gitlab.com/g/r.git', 't2')).toBe(
      'https://oauth2:t2@gitlab.com/g/r.git',
    );
    expect(authenticatedUrl('codeberg', 'https://codeberg.org/u/r.git', 't3', 'user')).toBe(
      'https://user:t3@codeberg.org/u/r.git',
    );
  });
});
