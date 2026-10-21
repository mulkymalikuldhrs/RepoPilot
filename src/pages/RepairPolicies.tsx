import { Icon } from '../components/Icon';
import type { RepairChecks, RepairPolicy } from '../domain/types';

interface RepairPoliciesProps {
  policy: RepairPolicy;
  onUpdate: (policy: RepairPolicy) => void;
}

const checks: { id: keyof RepairChecks; title: string; detail: string }[] = [
  {
    id: 'buildAndTests',
    title: 'Build and tests',
    detail: 'Consume results produced by your own CI workflow.',
  },
  {
    id: 'lintAndTypes',
    title: 'Lint and type checks',
    detail: 'Use checks already defined by the repository.',
  },
  {
    id: 'dependencyMaintenance',
    title: 'Dependency maintenance',
    detail: 'Review outdated or vulnerable dependency updates.',
  },
  {
    id: 'documentation',
    title: 'Documentation drift',
    detail: 'Flag missing or stale project documentation.',
  },
];

export function RepairPolicies({ policy, onUpdate }: RepairPoliciesProps) {
  function setCheck(id: keyof RepairChecks, value: boolean) {
    onUpdate({ ...policy, checks: { ...policy.checks, [id]: value } });
  }

  return (
    <div className="page">
      <header className="page-heading page-heading-compact">
        <div>
          <div className="eyebrow">WORKSPACE / AUTOMATION</div>
          <h1>Repair policies</h1>
          <p className="page-subtitle">
            Choose the checks a user-owned workflow may report or ask an agent to address.
          </p>
        </div>
        <span className="status-pill status-muted">
          <span className="status-dot status-dot-muted" />
          No runner connected
        </span>
      </header>

      <div className="repair-layout">
        <section className="panel repair-checks-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">DETECTION SCOPE</div>
              <h2>What should be checked?</h2>
            </div>
            <span className="panel-count">
              {Object.values(policy.checks).filter(Boolean).length} enabled
            </span>
          </div>
          <div className="repair-check-list">
            {checks.map((check) => (
              <label className="repair-check-row" key={check.id}>
                <input
                  checked={policy.checks[check.id]}
                  onChange={(event) => setCheck(check.id, event.target.checked)}
                  type="checkbox"
                />
                <span className="custom-checkbox">
                  <Icon name="check" size={13} />
                </span>
                <span className="repair-check-copy">
                  <strong>{check.title}</strong>
                  <small>{check.detail}</small>
                </span>
                <span className="check-state">{policy.checks[check.id] ? 'Enabled' : 'Off'}</span>
              </label>
            ))}
          </div>
          <div className="panel-footnote">
            These are saved policy choices only. No repository checks are executed by the frontend.
          </div>
        </section>

        <section className="panel repair-approval-panel">
          <div className="eyebrow">CHANGE APPROVAL</div>
          <div className="repair-approval-icon">
            <Icon name="shield" size={21} />
          </div>
          <h2>Human review stays in the loop</h2>
          <p>
            Any agent proposal should use an isolated branch and pass the repository's checks before
            a pull request is opened.
          </p>
          <div className="approval-rule-list">
            <ApprovalRule label="Create a pull request" value="Required" />
            <ApprovalRule label="Automatically merge changes" value="Never" />
            <ApprovalRule label="Human approval" value="Required" />
          </div>
          <div className="repair-approval-note">
            <Icon name="warning" size={15} />
            <span>Repair execution is not implemented in this foundation.</span>
          </div>
        </section>
      </div>

      <section className="repair-integration-strip">
        <div className="repair-strip-icon">
          <Icon name="agents" size={19} />
        </div>
        <div>
          <strong>Agent output is untrusted input</strong>
          <p>Review diffs and test results before accepting any proposed change.</p>
        </div>
        <Icon name="arrow" size={16} />
      </section>
    </div>
  );
}

function ApprovalRule({ label, value }: { label: string; value: string }) {
  return (
    <div className="approval-rule">
      <span>{label}</span>
      <strong>
        <Icon name="check" size={14} /> {value}
      </strong>
    </div>
  );
}
