import { Icon } from '../components/Icon';
import type { RepositoryConfig, SyncPolicy } from '../domain/types';
import { defaultSyncPolicy } from '../domain/sync-policy';

interface SyncPoliciesProps {
  repositories: RepositoryConfig[];
  policies: Record<string, SyncPolicy>;
  onAddRepository: () => void;
  onUpdate: (repositoryId: string, policy: SyncPolicy) => void;
}

export function SyncPolicies({
  repositories,
  policies,
  onAddRepository,
  onUpdate,
}: SyncPoliciesProps) {
  return (
    <div className="page">
      <header className="page-heading page-heading-compact">
        <div>
          <div className="eyebrow">WORKSPACE / SAFETY</div>
          <h1>Sync policies</h1>
          <p className="page-subtitle">
            Define authority and conflict behavior before any runner is allowed to act.
          </p>
        </div>
        <span className="status-pill status-safe">
          <Icon name="shield" size={14} />
          Dry-run first
        </span>
      </header>

      <div className="policy-banner">
        <div className="policy-banner-icon">
          <Icon name="shield" size={19} />
        </div>
        <div>
          <strong>Conflict handling is deliberately conservative</strong>
          <p>
            Divergent histories always pause. RepoPilot does not offer a silent overwrite option.
          </p>
        </div>
      </div>

      {repositories.length === 0 ? (
        <section className="panel policy-empty-panel">
          <EmptyPolicy onAddRepository={onAddRepository} />
        </section>
      ) : (
        <div className="policy-list">
          {repositories.map((repository) => {
            const policy = policies[repository.id] ?? defaultSyncPolicy(repository.defaultBranch);
            return (
              <SyncPolicyCard
                key={repository.id}
                repository={repository}
                policy={policy}
                onChange={(next) => onUpdate(repository.id, next)}
              />
            );
          })}
        </div>
      )}

      <section className="panel policy-note">
        <div className="note-icon">
          <Icon name="warning" size={18} />
        </div>
        <div>
          <strong>Policies are saved locally, not executed</strong>
          <p>
            This foundation has no Git transport or connected runner. The dry-run planner only
            evaluates supplied history observations; it never performs remote writes.
          </p>
        </div>
      </section>
    </div>
  );
}

function EmptyPolicy({ onAddRepository }: { onAddRepository: () => void }) {
  return (
    <div className="policy-empty">
      <div className="empty-icon">
        <Icon name="sync" size={21} />
      </div>
      <h3>Add a repository before setting sync rules</h3>
      <p>Policies always belong to a specific remote and an explicit source-of-truth branch.</p>
      <button
        className="button button-secondary button-small"
        onClick={onAddRepository}
        type="button"
      >
        <Icon name="plus" size={15} />
        Add repository
      </button>
    </div>
  );
}

function SyncPolicyCard({
  repository,
  policy,
  onChange,
}: {
  repository: RepositoryConfig;
  policy: SyncPolicy;
  onChange: (policy: SyncPolicy) => void;
}) {
  return (
    <section className="panel policy-card">
      <div className="policy-card-heading">
        <div>
          <div className="eyebrow">REPOSITORY POLICY</div>
          <h2>{repository.name}</h2>
          <p>{repository.remoteUrl}</p>
        </div>
        <span className="status-pill status-muted">
          <span className="status-dot status-dot-muted" />
          Local draft
        </span>
      </div>

      <div className="policy-form-grid">
        <label className="field">
          <span>Sync direction</span>
          <select
            value={policy.direction}
            onChange={(event) =>
              onChange({ ...policy, direction: event.target.value as SyncPolicy['direction'] })
            }
          >
            <option value="one-way">One-way mirror</option>
            <option value="bidirectional">Bidirectional (conflicts pause)</option>
          </select>
        </label>
        <label className="field">
          <span>Authoritative source branch</span>
          <input
            value={policy.sourceOfTruth}
            onChange={(event) => onChange({ ...policy, sourceOfTruth: event.target.value })}
            maxLength={120}
          />
        </label>
      </div>

      <div className="policy-toggle-list">
        <PolicyToggle
          title="Dry-run mode"
          description="Build a plan without writing to either remote."
          checked={policy.dryRun}
          onChange={(checked) => onChange({ ...policy, dryRun: checked })}
        />
        <PolicyToggle
          title="Allow writes after approval"
          description="A human approval is required; no runner is connected in this foundation."
          checked={policy.writesEnabled}
          onChange={(checked) => onChange({ ...policy, writesEnabled: checked })}
        />
      </div>

      <label className="field exclusions-field">
        <span>
          Excluded paths <small>One pattern per line</small>
        </span>
        <textarea
          rows={3}
          value={policy.exclusions.join('\n')}
          placeholder={'e.g. .env\nprivate-data/**'}
          onChange={(event) =>
            onChange({
              ...policy,
              exclusions: event.target.value
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter(Boolean),
            })
          }
        />
      </label>

      <div className="policy-guardrail">
        <Icon name="shield" size={16} />
        <span>
          <strong>Conflict rule:</strong> pause and require review. Approval is always required for
          writes.
        </span>
      </div>
    </section>
  );
}

function PolicyToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="policy-toggle-row">
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <button
        aria-checked={checked}
        aria-label={title}
        className={`switch${checked ? ' switch-on' : ''}`}
        onClick={() => onChange(!checked)}
        role="switch"
        type="button"
      >
        <span />
      </button>
    </div>
  );
}
