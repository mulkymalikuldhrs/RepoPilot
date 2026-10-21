import { describe, expect, it } from 'vitest';
import { validateRemoteUrl } from './remote-url';

describe('validateRemoteUrl', () => {
  it('accepts HTTPS and SSH remotes without embedded credentials', () => {
    expect(validateRemoteUrl('https://github.com/acme/widget.git', 'github').ok).toBe(true);
    expect(validateRemoteUrl('git@github.com:acme/widget.git', 'github').ok).toBe(true);
    expect(validateRemoteUrl('ssh://git@gitlab.example/acme/widget.git', 'gitlab').ok).toBe(true);
    expect(validateRemoteUrl('ssh://alice@gitlab.example/acme/widget.git', 'gitlab')).toMatchObject(
      { ok: false },
    );
  });

  it('rejects credential-bearing URLs and insecure HTTP remotes', () => {
    expect(
      validateRemoteUrl('https://alice:secret@github.com/acme/widget.git', 'github'),
    ).toMatchObject({ ok: false });
    expect(validateRemoteUrl('http://github.com/acme/widget.git', 'github')).toMatchObject({
      ok: false,
    });
    expect(validateRemoteUrl('alice:secret@github.com:acme/widget.git', 'github')).toMatchObject({
      ok: false,
    });
  });

  it('requires a repository path and validates the Codeberg host', () => {
    expect(validateRemoteUrl('https://github.com', 'github')).toMatchObject({ ok: false });
    expect(validateRemoteUrl('https://github.com/acme/widget.git', 'codeberg')).toMatchObject({
      ok: false,
    });
    expect(validateRemoteUrl('https://codeberg.org/acme/widget.git', 'codeberg').ok).toBe(true);
  });
});
