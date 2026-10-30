/**
 * RepoPilot runner credential handling.
 *
 * Credentials NEVER live in browser storage, bundles, or plan files. They are
 * read from the environment at runner start, held in memory only, injected
 * into Git URLs at operation time, and redacted from every output.
 */

export const CREDENTIAL_ENV_VARS = {
  github: 'REPOPILOT_GITHUB_TOKENS',
  gitlab: 'REPOPILOT_GITLAB_TOKEN',
  codeberg: 'REPOPILOT_CODEBERG_TOKEN',
} as const;

export interface RunnerCredentials {
  /** One or more GitHub PATs. Each token may belong to a different account. */
  github: string[];
  gitlab: string[];
  codeberg: string[];
}

function splitList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

export function loadCredentials(
  env: Record<string, string | undefined> = (
    globalThis as unknown as { process?: { env: Record<string, string | undefined> } }
  ).process?.env ?? {},
): RunnerCredentials {
  return {
    github: splitList(env[CREDENTIAL_ENV_VARS.github]),
    gitlab: splitList(env[CREDENTIAL_ENV_VARS.gitlab]),
    codeberg: splitList(env[CREDENTIAL_ENV_VARS.codeberg]),
  };
}

export function hasCredentials(creds: RunnerCredentials): boolean {
  return creds.github.length > 0 || creds.gitlab.length > 0 || creds.codeberg.length > 0;
}

/** Mask `user:token@` and bare tokens in any string destined for logs/files. */
export function redact(text: string, tokens: string[] = []): string {
  let out = text.replace(/(https?:\/\/)([^@/\s]+):([^@/\s]+)@/g, '$1***@');
  for (const token of tokens) {
    if (token.length >= 8) out = out.split(token).join('***');
  }
  return out;
}

/**
 * Build an authenticated HTTPS Git URL for a single operation.
 * The result MUST be passed to git directly and never written to disk.
 */
export function authenticatedUrl(
  platform: 'github' | 'gitlab' | 'codeberg',
  remoteUrl: string,
  token: string,
  username = '',
): string {
  const url = remoteUrl.replace(/^https?:\/\//, '');
  switch (platform) {
    case 'github':
      return `https://x-access-token:${token}@${url}`;
    case 'gitlab':
      return `https://oauth2:${token}@${url}`;
    case 'codeberg':
      return `https://${username}:${token}@${url}`;
  }
}
