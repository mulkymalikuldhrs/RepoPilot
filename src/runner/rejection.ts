import type { PolicyRestriction, PolicyRestrictionKind, ProviderId } from '../domain/types';

export interface RejectionClassification {
  kind: PolicyRestrictionKind;
  guidance: string;
}

/**
 * Classify a Git push rejection into a platform policy restriction.
 *
 * Patterns come from real provider behavior observed while syncing multi-
 * platform repositories (GitHub rulesets, Codeberg/Gitea pre-receive hooks,
 * GitLab push rules). The runner never overrides these; it records them so
 * planners can produce `policy-blocked` decisions instead of retrying blindly.
 */
export function classifyPushRejection(
  platform: ProviderId,
  stderr: string,
): RejectionClassification | null {
  const text = stderr.toLowerCase();

  if (
    text.includes('gh013') ||
    (platform === 'github' &&
      (text.includes('ruleset') || text.includes('protected branch') || text.includes('rule')))
  ) {
    return {
      kind: 'github-ruleset',
      guidance:
        'GitHub rulesets/branch protection reject this write. Adjust rules in repo settings or use a sanctioned workflow.',
    };
  }
  if (text.includes('pre-receive hook declined')) {
    if (platform === 'gitlab') {
      return {
        kind: 'push-rules',
        guidance: 'GitLab push rules rejected the push. Review project push rules before retrying.',
      };
    }
    return {
      kind: 'pre-receive-hook',
      guidance:
        'Instance pre-receive hook rejected the push. Server-side policy must change first.',
    };
  }
  if (text.includes('push rules') || text.includes('push rule')) {
    return {
      kind: 'push-rules',
      guidance: 'Provider push rules rejected the write.',
    };
  }
  if (text.includes('cannot push to archived') || text.includes('archived')) {
    return {
      kind: 'archived',
      guidance: 'Repository is archived and read-only.',
    };
  }
  if (text.includes('403') || text.includes('denied') || text.includes('not allowed')) {
    return {
      kind: 'auth-denied',
      guidance: 'Token lacks write access to this repository.',
    };
  }
  return null;
}

export function restrictionFromRejection(
  platform: ProviderId,
  repository: string,
  stderr: string,
): PolicyRestriction | null {
  const classification = classifyPushRejection(platform, stderr);
  if (!classification) return null;
  return {
    kind: classification.kind,
    platform,
    repository,
    message: classification.guidance,
  };
}

/** Known restrictions discovered outside Git (e.g. from repository metadata). */
export function metadataRestrictions(
  repos: { provider: ProviderId; fullName: string; archived: boolean }[],
): PolicyRestriction[] {
  return repos
    .filter((repo) => repo.archived)
    .map((repo) => ({
      kind: 'archived' as const,
      platform: repo.provider,
      repository: repo.fullName,
      message: 'Repository is archived upstream; writes are rejected by the provider.',
    }));
}
