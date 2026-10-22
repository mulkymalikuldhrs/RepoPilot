import { describe, expect, it } from 'vitest';
import { classifyPushRejection, metadataRestrictions } from './rejection';

describe('push rejection classification', () => {
  it('classifies GitHub ruleset rejections', () => {
    const result = classifyPushRejection(
      'github',
      'remote: error: GH013: Repository rule violations found for refs/heads/master.',
    );
    expect(result?.kind).toBe('github-ruleset');
  });

  it('classifies Codeberg pre-receive hook rejections', () => {
    const result = classifyPushRejection('codeberg', 'remote: error: pre-receive hook declined');
    expect(result?.kind).toBe('pre-receive-hook');
  });

  it('classifies GitLab push rules as push-rules', () => {
    const result = classifyPushRejection(
      'gitlab',
      'remote: GitLab: Push rules: commit message does not follow pattern',
    );
    expect(result?.kind).toBe('push-rules');
  });

  it('classifies archived repositories', () => {
    const result = classifyPushRejection('github', 'remote: cannot push to archived repository');
    expect(result?.kind).toBe('archived');
  });

  it('returns null for unknown failures so retry logic can operate', () => {
    expect(classifyPushRejection('github', 'connection reset by peer')).toBeNull();
  });

  it('maps archived repository metadata into restrictions', () => {
    const restrictions = metadataRestrictions([
      { provider: 'github', fullName: 'o/ArchivedRepo', archived: true },
      { provider: 'gitlab', fullName: 'g/active', archived: false },
    ]);
    expect(restrictions).toHaveLength(1);
    expect(restrictions[0].repository).toBe('o/ArchivedRepo');
  });
});
