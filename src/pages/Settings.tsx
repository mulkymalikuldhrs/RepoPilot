import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import type { WorkspaceConfig, ProviderCredential, ProviderId } from '../domain/types';
import { saveCredentialToLocalDB, getCredentialsFromLocalDB } from '../storage/local-db';

interface SettingsProps {
  workspace: WorkspaceConfig;
  onReset: () => void;
  onSaveCredential: (credential: ProviderCredential) => void;
}

export function Settings({ workspace, onReset, onSaveCredential }: SettingsProps) {
  const [copied, setCopied] = useState(false);

  // Credential Form State
  const [provider, setProvider] = useState<ProviderId>('github');
  const [account, setAccount] = useState('');
  const [authType, setAuthType] = useState<'pat' | 'oauth_token' | 'api_key'>('pat');
  const [rawToken, setRawToken] = useState('');
  const [savedCredentials, setSavedCredentials] = useState<ProviderCredential[]>([]);
  const [credMessage, setCredMessage] = useState<string | null>(null);

  useEffect(() => {
    getCredentialsFromLocalDB().then(setSavedCredentials);
  }, []);

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText('npm install && npm run dev');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function resetLocalData() {
    if (window.confirm('Remove all RepoPilot metadata saved in this browser?')) onReset();
  }

  async function handleAddCredential(e: React.FormEvent) {
    e.preventDefault();
    if (!account.trim() || !rawToken.trim()) return;

    const masked = `${rawToken.slice(0, 4)}...${rawToken.slice(-4)}`;
    const cred: ProviderCredential = {
      provider,
      account: account.trim(),
      authType,
      maskedToken: masked,
      updatedAt: new Date().toISOString(),
    };

    await saveCredentialToLocalDB({ ...cred, rawToken });
    onSaveCredential(cred);
    setSavedCredentials([...savedCredentials.filter((c) => c.account !== cred.account), cred]);
    setAccount('');
    setRawToken('');
    setCredMessage(`Token securely stored in LocalDB for ${provider} account @${cred.account}`);
    window.setTimeout(() => setCredMessage(null), 3000);
  }

  return (
    <div className="page">
      <header className="page-heading page-heading-compact">
        <div>
          <div className="eyebrow">WORKSPACE / CONFIGURATION & AUTH</div>
          <h1>Settings & Provider Credentials</h1>
          <p className="page-subtitle">
            Sign in with tokens/PAT/API Keys stored safely in IndexedDB LocalDB.
          </p>
        </div>
        <span className="status-pill status-safe">
          <Icon name="shield" size={14} />
          LocalDB Offline Encrypted
        </span>
      </header>

      {credMessage && (
        <div className="status-pill status-safe" style={{ padding: '1rem', marginBottom: '1rem' }}>
          {credMessage}
        </div>
      )}

      <div className="settings-grid">
        <section className="panel settings-card">
          <div className="settings-card-icon">
            <Icon name="settings" size={18} />
          </div>
          <div className="eyebrow">PROVIDER SIGN-IN / AUTH</div>
          <h2>Save Provider Credentials (PAT / Token)</h2>
          <p>
            Connect GitHub PAT, GitLab Token, Codeberg Token, or Google Jules API Key stored locally
            in IndexedDB. Active repository count: {workspace.repositories.length}.
          </p>
          <form
            onSubmit={handleAddCredential}
            className="dialog-form"
            style={{ marginTop: '1rem' }}
          >
            <label className="field">
              <span>Provider</span>
              <select value={provider} onChange={(e) => setProvider(e.target.value as ProviderId)}>
                <option value="github">GitHub</option>
                <option value="gitlab">GitLab</option>
                <option value="codeberg">Codeberg</option>
                <option value="git">Generic Git Remote</option>
              </select>
            </label>
            <label className="field">
              <span>Account Username / Owner</span>
              <input
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="e.g. mulkymalikuldhaher"
                required
              />
            </label>
            <label className="field">
              <span>Auth Type</span>
              <select
                value={authType}
                onChange={(e) => setAuthType(e.target.value as 'pat' | 'oauth_token' | 'api_key')}
              >
                <option value="pat">Personal Access Token (PAT)</option>
                <option value="oauth_token">OAuth / Access Token</option>
                <option value="api_key">Provider API Key</option>
              </select>
            </label>
            <label className="field">
              <span>Token Secret Key</span>
              <input
                type="password"
                value={rawToken}
                onChange={(e) => setRawToken(e.target.value)}
                placeholder="ghp_xxx... or glpat-xxx..."
                required
              />
            </label>
            <button className="button button-primary" type="submit">
              Save Credential to LocalDB
            </button>
          </form>
        </section>

        <section className="panel settings-card">
          <div className="settings-card-icon settings-card-icon-purple">
            <Icon name="shield" size={18} />
          </div>
          <div className="eyebrow">STORED LOCAL CREDENTIALS</div>
          <h2>Saved Tokens in LocalDB ({savedCredentials.length})</h2>
          {savedCredentials.length === 0 ? (
            <p className="text-muted">No provider credentials saved in IndexedDB yet.</p>
          ) : (
            <div className="cred-list" style={{ marginTop: '1rem' }}>
              {savedCredentials.map((c) => (
                <div key={`${c.provider}-${c.account}`} className="log-row">
                  <span className="status-pill status-safe">{c.provider}</span>
                  <strong>@{c.account}</strong>
                  <span>{c.maskedToken}</span>
                  <small className="text-muted">{c.authType}</small>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel settings-card">
          <div className="settings-card-icon settings-card-icon-green">
            <Icon name="runs" size={18} />
          </div>
          <div className="eyebrow">DEVELOPMENT</div>
          <h2>Run RepoPilot locally</h2>
          <p>Use Node.js 20+ and npm. No database or application server is required.</p>
          <div className="command-block">
            <code>npm install &amp;&amp; npm run dev</code>
            <button className="copy-button" onClick={copyCommand} type="button">
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </section>
      </div>

      <section className="reset-local-panel" style={{ marginTop: '2rem' }}>
        <div>
          <strong>Reset local configuration &amp; IndexedDB</strong>
          <p>Remove repository metadata, policy drafts, and stored credentials from this device.</p>
        </div>
        <button className="button button-danger-quiet" onClick={resetLocalData} type="button">
          Clear local data
        </button>
      </section>
    </div>
  );
}
