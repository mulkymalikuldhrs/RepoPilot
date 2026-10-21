import { EmptyState } from '../components/EmptyState';
import type { PageId } from '../components/Sidebar';
import { Icon } from '../components/Icon';

export function ExecutionHistory({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  return (
    <div className="page">
      <header className="page-heading page-heading-compact">
        <div>
          <div className="eyebrow">WORKSPACE / OBSERVABILITY</div>
          <h1>Execution history</h1>
          <p className="page-subtitle">
            Workflow status, conflicts, test results, and logs—once a runner provides them.
          </p>
        </div>
        <span className="status-pill status-muted">
          <span className="status-dot status-dot-muted" />
          Runner not connected
        </span>
      </header>

      <section className="panel run-history-panel">
        <div className="run-history-toolbar">
          <div className="run-filter-group">
            <button className="run-filter run-filter-active" type="button">
              All runs
            </button>
            <button className="run-filter" type="button" disabled>
              Sync
            </button>
            <button className="run-filter" type="button" disabled>
              Repair
            </button>
          </div>
          <span className="run-history-note">
            <Icon name="clock" size={15} /> No remote logs available
          </span>
        </div>
        <EmptyState
          icon="runs"
          title="No executions recorded"
          description="RepoPilot does not generate sample activity. Run history will be populated only from an explicitly connected workflow."
          actionLabel="Review runner setup"
          onAction={() => onNavigate('settings')}
        />
      </section>

      <section className="log-boundary-note">
        <Icon name="shield" size={18} />
        <p>
          <strong>Logs may contain repository content.</strong> A future runner adapter must redact
          secrets and treat all output as untrusted before displaying it.
        </p>
      </section>
    </div>
  );
}
