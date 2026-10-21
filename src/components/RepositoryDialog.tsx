import { useState, type FormEvent } from 'react';
import { PROVIDERS } from '../providers/registry';
import { validateRemoteUrl } from '../domain/remote-url';
import type { ProviderId, RepositoryConfig } from '../domain/types';
import { Icon } from './Icon';

interface RepositoryDialogProps {
  onClose: () => void;
  onSave: (repository: RepositoryConfig) => boolean;
}

export function RepositoryDialog({ onClose, onSave }: RepositoryDialogProps) {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState<ProviderId>('github');
  const [account, setAccount] = useState('');
  const [remoteUrl, setRemoteUrl] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('main');
  const [error, setError] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const validation = validateRemoteUrl(remoteUrl, provider);
    if (!validation.ok) {
      setError(validation.reason);
      return;
    }
    if (!name.trim()) {
      setError('Enter a display name for this repository.');
      return;
    }
    if (!defaultBranch.trim()) {
      setError('Enter the source branch.');
      return;
    }

    const saved = onSave({
      id: globalThis.crypto?.randomUUID?.() ?? `repo-${Date.now()}`,
      name: name.trim(),
      provider,
      account: account.trim(),
      remoteUrl: validation.normalizedUrl,
      defaultBranch: defaultBranch.trim(),
      createdAt: new Date().toISOString(),
      verification: 'unverified',
    });

    if (!saved) setError('This remote is already saved in this browser.');
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-labelledby="repository-dialog-title"
        aria-modal="true"
        className="dialog"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialog-heading">
          <div>
            <span className="eyebrow">LOCAL CONFIGURATION</span>
            <h2 id="repository-dialog-title">Add a repository</h2>
            <p>Save remote metadata in this browser. This does not connect or clone it.</p>
          </div>
          <button className="icon-button" aria-label="Close dialog" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </div>
        <form onSubmit={submit}>
          <label className="field">
            <span>Repository name</span>
            <input
              autoFocus
              autoComplete="off"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. storefront"
              maxLength={100}
            />
          </label>
          <div className="form-grid">
            <label className="field">
              <span>Provider</span>
              <select
                value={provider}
                onChange={(event) => setProvider(event.target.value as ProviderId)}
              >
                {PROVIDERS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>
                Account label <small>Optional</small>
              </span>
              <input
                autoComplete="off"
                value={account}
                onChange={(event) => setAccount(event.target.value)}
                placeholder="personal, work…"
                maxLength={80}
              />
            </label>
          </div>
          <label className="field">
            <span>Remote URL</span>
            <input
              autoComplete="off"
              value={remoteUrl}
              onChange={(event) => setRemoteUrl(event.target.value)}
              placeholder="https://github.com/owner/repository.git"
              spellCheck={false}
              maxLength={500}
            />
            <small>
              HTTPS and SSH remotes are accepted. Do not include credentials in the URL.
            </small>
          </label>
          <label className="field">
            <span>Authoritative source branch</span>
            <input
              autoComplete="off"
              value={defaultBranch}
              onChange={(event) => setDefaultBranch(event.target.value)}
              placeholder="main"
              maxLength={120}
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="dialog-notice">
            <Icon name="shield" size={17} />
            <span>
              Credentials are never requested or saved here. Provider access is unverified.
            </span>
          </div>
          <div className="dialog-actions">
            <button className="button button-quiet" onClick={onClose} type="button">
              Cancel
            </button>
            <button className="button button-primary" type="submit">
              Save local configuration
              <Icon name="arrow" size={16} />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
