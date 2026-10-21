import { useState } from 'react';
import { Icon } from '../components/Icon';
import type { WorkspaceConfig } from '../domain/types';

interface SettingsProps {
  workspace: WorkspaceConfig;
  onReset: () => void;
}

export function Settings({ workspace, onReset }: SettingsProps) {
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="page">
      <header className="page-heading page-heading-compact">
        <div>
          <div className="eyebrow">WORKSPACE / CONFIGURATION</div>
          <h1>Settings</h1>
          <p className="page-subtitle">Local storage, setup commands, and security boundaries.</p>
        </div>
        <span className="status-pill status-safe">
          <Icon name="shield" size={14} />
          No secrets stored
        </span>
      </header>

      <div className="settings-grid">
        <section className="panel settings-card">
          <div className="settings-card-icon">
            <Icon name="repositories" size={18} />
          </div>
          <div className="eyebrow">LOCAL WORKSPACE</div>
          <h2>Stored in this browser</h2>
          <p>
            Repository names, remote URLs, branch labels, and policy choices are saved in local
            storage on this device only.
          </p>
          <div className="settings-data-row">
            <span>Repository entries</span>
            <strong>{workspace.repositories.length}</strong>
          </div>
          <div className="settings-data-row">
            <span>Saved policy records</span>
            <strong>{Object.keys(workspace.syncPolicies).length}</strong>
          </div>
          <div className="settings-card-footer">
            <Icon name="warning" size={15} />
            <span>
              Local storage is not encrypted. Do not save credentials or sensitive data here.
            </span>
          </div>
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
          <div className="settings-checks">
            <span>
              <Icon name="check" size={14} /> npm run check
            </span>
            <span>
              <Icon name="check" size={14} /> npm run build
            </span>
          </div>
        </section>

        <section className="panel settings-card settings-security-card">
          <div className="settings-card-icon settings-card-icon-purple">
            <Icon name="shield" size={18} />
          </div>
          <div className="eyebrow">SECURITY BOUNDARIES</div>
          <h2>Secrets belong in your runner</h2>
          <p>
            Provider tokens and Jules credentials are not requested, bundled, or persisted by this
            frontend. Future integrations must use a user-owned secret manager.
          </p>
          <ul className="settings-boundary-list">
            <li>No browser token storage</li>
            <li>No managed backend or hosted database</li>
            <li>No external calls from this frontend</li>
            <li>Write operations require an approval gate</li>
          </ul>
        </section>

        <section className="panel settings-card settings-runner-card">
          <div className="settings-card-icon settings-card-icon-amber">
            <Icon name="branch" size={18} />
          </div>
          <div className="eyebrow">USER-OWNED EXECUTION</div>
          <h2>Runner setup is the next integration step</h2>
          <p>
            Sync schedules, CI logs, secret access, and Jules sessions must be implemented in a
            workflow or runner you own. This app does not dispatch jobs yet.
          </p>
          <div className="runner-state-row">
            <span className="status-dot status-dot-muted" />
            <span>Not configured</span>
            <span className="runner-state-suffix">No job can start from this page</span>
          </div>
        </section>
      </div>

      <section className="reset-local-panel">
        <div>
          <strong>Reset local configuration</strong>
          <p>Remove repository metadata and policy drafts stored in this browser.</p>
        </div>
        <button className="button button-danger-quiet" onClick={resetLocalData} type="button">
          Clear local data
        </button>
      </section>
    </div>
  );
}
