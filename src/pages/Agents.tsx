import { Icon } from '../components/Icon';
import type { PageId } from '../components/Sidebar';

export function Agents({ onNavigate }: { onNavigate?: (page: PageId) => void }) {
  return (
    <div className="page">
      <header className="page-heading page-heading-compact">
        <div>
          <div className="eyebrow">INTEGRATIONS / AGENTS</div>
          <h1>Coding Agent Orchestration</h1>
          <p className="page-subtitle">Google Jules is the first supported coding agent.</p>
        </div>
        <span className="status-pill status-muted">
          <span className="status-dot status-dot-muted" />
          Adapter boundary only
        </span>
      </header>

      <div className="agent-card">
        <div className="agent-card-header">
          <div className="agent-title-block">
            <div className="agent-icon">
              <Icon name="agents" size={20} />
            </div>
            <div>
              <h2>Google Jules</h2>
              <p>External coding worker for GitHub-connected repositories.</p>
            </div>
          </div>
          <span className="status-pill status-amber">Experimental</span>
        </div>

        <div className="agent-body">
          <p>
            RepoPilot treats Jules as an external worker, not the core sync engine. Tasks are
            submitted to connected GitHub repositories, with proposed fixes presented in isolated
            pull requests.
          </p>

          <div className="agent-limitations">
            <strong>Known Limitations:</strong>
            <ul>
              <li>
                Jules API capabilities must be verified against current official documentation.
              </li>
              <li>Direct GitLab and Codeberg support requires intermediary GitHub workflows.</li>
              <li>API keys must remain within your user-controlled execution environment.</li>
            </ul>
          </div>
        </div>

        <div className="agent-card-footer">
          {onNavigate && (
            <button
              className="button button-secondary button-small"
              onClick={() => onNavigate('settings')}
              type="button"
            >
              Configure Credentials
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
