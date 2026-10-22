import { Icon } from '../components/Icon';
import type { PageId } from '../components/Sidebar';

export function ExecutionHistory({ onNavigate }: { onNavigate?: (page: PageId) => void }) {
  return (
    <div className="page">
      <header className="page-heading page-heading-compact">
        <div>
          <div className="eyebrow">OBSERVABILITY / AUDIT LOGS</div>
          <h1>Execution History</h1>
          <p className="page-subtitle">Track runner executions and workflow sync dispatches.</p>
        </div>
        <span className="status-pill status-muted">
          <span className="status-dot status-dot-muted" />
          No runs recorded
        </span>
      </header>

      <section className="panel empty-repo-panel">
        <div className="empty-state">
          <h3>No execution logs available</h3>
          <p>Connect a user-owned runner or dispatch a batch operation to populate logs.</p>
          {onNavigate && (
            <button
              className="button button-secondary"
              onClick={() => onNavigate('batch-operations')}
              type="button"
            >
              <Icon name="sync" size={16} />
              Open Batch Operations
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
