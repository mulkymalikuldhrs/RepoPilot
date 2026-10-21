import type { ProviderId } from './types';

export type RemoteValidation =
  { ok: true; normalizedUrl: string; host: string } | { ok: false; reason: string };

const SCP_STYLE_REMOTE = /^(?:[A-Za-z0-9._-]+@)?([^:@\s/]+):([A-Za-z0-9._~/-]+)$/;

export function validateRemoteUrl(value: string, provider: ProviderId): RemoteValidation {
  const input = value.trim();

  if (!input) {
    return { ok: false, reason: 'Enter a remote URL.' };
  }

  if (/\s/.test(input)) {
    return { ok: false, reason: 'Remote URLs cannot contain spaces.' };
  }

  const scpMatch = input.includes('://') ? null : input.match(SCP_STYLE_REMOTE);
  if (scpMatch) {
    const [, host, path] = scpMatch;
    if (!path || path.startsWith('/')) {
      return { ok: false, reason: 'Use the SSH form git@host:owner/repository.git.' };
    }
    return validateHost(host, provider, input);
  }

  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return { ok: false, reason: 'Use an HTTPS or SSH Git remote URL.' };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'ssh:') {
    return { ok: false, reason: 'Only HTTPS and SSH remote URLs are accepted.' };
  }

  const hasUnsafeSshUser =
    parsed.protocol === 'ssh:' && parsed.username !== '' && parsed.username !== 'git';
  const hasHttpsUser = parsed.protocol === 'https:' && parsed.username !== '';
  if (hasHttpsUser || hasUnsafeSshUser || parsed.password) {
    return {
      ok: false,
      reason: 'Do not embed credentials in a remote URL. Configure secrets in your runner.',
    };
  }

  if (parsed.search || parsed.hash) {
    return { ok: false, reason: 'Remove query strings or fragments from the remote URL.' };
  }

  const pathSegments = parsed.pathname.split('/').filter(Boolean);
  if (pathSegments.length < 2) {
    return { ok: false, reason: 'Include an owner or group and repository name in the URL.' };
  }

  if (provider === 'codeberg' && parsed.hostname !== 'codeberg.org') {
    return { ok: false, reason: 'A Codeberg remote must use codeberg.org.' };
  }

  return {
    ok: true,
    normalizedUrl: input,
    host: parsed.hostname,
  };
}

function validateHost(host: string, provider: ProviderId, input: string): RemoteValidation {
  if (!host || host.includes('@')) {
    return { ok: false, reason: 'The remote host is not valid.' };
  }
  if (provider === 'codeberg' && host !== 'codeberg.org') {
    return { ok: false, reason: 'A Codeberg remote must use codeberg.org.' };
  }
  return { ok: true, normalizedUrl: input, host };
}
