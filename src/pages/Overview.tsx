import { Icon } from '../components/Icon';
import type { RepositoryConfig } from '../domain/types';
import type { PageId } from '../components/Sidebar';

export function Overview({
  repositories,
  onAddRepository,
  onNavigate,
}: {
  repositories: RepositoryConfig[];
  onAddRepository: () => void;
  onNavigate: (page: PageId) => void;
}) {
  const repositoryCount = repositories.length;

  return (
    <div className="page">
      <header className="page-heading">
        <div>
          <div className="eyebrow">WORKSPACE / OVERVIEW</div>
          <h1>
            Repository control, <span>on your terms.</span>
          </h1>
          <p className="page-subtitle">
            Configure safer sync and repair workflows across the remotes you choose.
          </p>
        </div>
        <button className="button button-primary" onClick={onAddRepository} type="button">
          <Icon name="plus" size={17} />
          Add repository
        </button>
      </header>

      <section className="overview-hero">
        <div className="hero-copy">
          <div className="hero-label">
            <span className="hero-label-dot" />
            FRONTEND FOUNDATION
            <span className="hero-label-divider">/</span>
            NO MANAGED BACKEND
          </div>
          <h2>
            Your repositories.
            <br />
            <span>Your rules.</span>
          </h2>
          <p>
            RepoPilot keeps configuration in this browser and leaves Git operations, credentials,
            and agent calls to an execution environment you control.
          </p>
          <div className="hero-actions">
            <button className="button button-light" onClick={onAddRepository} type="button">
              Configure a remote
              <Icon name="arrow" size={16} />
            </button>
            <button
              className="button button-hero-quiet"
              onClick={() => onNavigate('settings')}
              type="button"
            >
              View setup notes
            </button>
          </div>
        </div>
        <div className="hero-art" aria-label="RepoPilot safety boundaries">
          <div className="hero-orbit hero-orbit-one" />
          <div className="hero-orbit hero-orbit-two" />
          <div className="hero-core">
            <div className="brand-mark brand-mark-large" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <strong>REPOPILOT</strong>
            <small>CONTROL PLANE</small>
          </div>
          <div className="orbit-node orbit-node-top">
            <Icon name="repositories" size={17} />
            <span>YOUR REMOTES</span>
          </div>
          <div className="orbit-node orbit-node-right">
            <Icon name="shield" size={17} />
            <span>YOUR SECRETS</span>
          </div>
          <div className="orbit-node orbit-node-bottom">
            <Icon name="runs" size={17} />
            <span>YOUR RUNNER</span>
          </div>
          <div className="hero-art-caption">Credentials never enter this frontend</div>
        </div>
      </section>

      <section className="metric-grid" aria-label="Workspace status">
        <MetricCard
          icon="repositories"
          label="Repositories in this browser"
          value={String(repositoryCount)}
          note="Local metadata only"
          accent="mint"
        />
        <MetricCard
          icon="github"
          label="Verified provider links"
          value="0"
          note="No provider adapter connected"
          accent="violet"
        />
        <MetricCard
          icon="runs"
          label="Workflow runs"
          value="—"
          note="No runner connected"
          accent="blue"
        />
        <MetricCard
          icon="shield"
          label="Write safety"
          value="Dry-run first"
          note="Writes disabled by default"
          accent="amber"
        />
      </section>

      <div className="overview-lower-grid">
        <section className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">WORKFLOW ACTIVITY</div>
              <h2>Execution history</h2>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate('execution-history')}
              type="button"
            >
              View history <Icon name="arrow" size={15} />
            </button>
          </div>
          <div className="activity-empty">
            <div className="activity-empty-mark">
              <Icon name="clock" size={20} />
            </div>
            <div>
              <strong>No workflow runs to show</strong>
              <p>Runs will appear here after you connect a user-owned workflow.</p>
            </div>
            <span className="status-pill status-muted">
              <span className="status-dot status-dot-muted" />
              Not connected
            </span>
          </div>
        </section>

        <section className="panel safety-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">SAFE BY DEFAULT</div>
              <h2>Control stays with you</h2>
            </div>
            <span className="safety-icon">
              <Icon name="shield" size={19} />
            </span>
          </div>
          <ul className="safety-list">
            <SafetyLine text="No credentials in browser storage" />
            <SafetyLine text="Divergent histories pause for review" />
            <SafetyLine text="No automatic default-branch writes" />
            <SafetyLine text="Private repositories are opt-in" />
          </ul>
          <button
            className="text-button safety-link"
            onClick={() => onNavigate('settings')}
            type="button"
          >
            Read security boundaries <Icon name="arrow" size={15} />
          </button>
        </section>
      </div>

      <section className="setup-panel">
        <div className="setup-intro">
          <div className="eyebrow">GETTING STARTED</div>
          <h2>Set up your control plane</h2>
          <p>Configuration here is a local draft. Nothing runs until your own runner does it.</p>
        </div>
        <div className="setup-steps">
          <SetupStep
            number="01"
            title="Add a remote"
            detail={repositoryCount ? 'Saved locally; still unverified' : 'Record a repository URL'}
            state={repositoryCount ? 'draft' : 'next'}
            onClick={onAddRepository}
          />
          <SetupStep
            number="02"
            title="Review sync policy"
            detail="Dry-run and approval are the defaults"
            state="locked"
            onClick={() => onNavigate('sync-policies')}
          />
          <SetupStep
            number="03"
            title="Connect your runner"
            detail="Use a CI workflow you control"
            state="locked"
            onClick={() => onNavigate('settings')}
          />
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  note,
  accent,
}: {
  icon: 'repositories' | 'github' | 'runs' | 'shield';
  label: string;
  value: string;
  note: string;
  accent: string;
}) {
  return (
    <article className="metric-card">
      <div className={`metric-icon metric-icon-${accent}`}>
        <Icon name={icon} size={17} />
      </div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-note">{note}</div>
    </article>
  );
}

function SafetyLine({ text }: { text: string }) {
  return (
    <li>
      <span className="safety-check">
        <Icon name="check" size={13} />
      </span>
      {text}
    </li>
  );
}

function SetupStep({
  number,
  title,
  detail,
  state,
  onClick,
}: {
  number: string;
  title: string;
  detail: string;
  state: 'draft' | 'next' | 'locked';
  onClick: () => void;
}) {
  return (
    <button className={`setup-step setup-step-${state}`} type="button" onClick={onClick}>
      <span className="setup-step-number">{number}</span>
      <span className="setup-step-copy">
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
      <Icon name={state === 'draft' ? 'check' : 'chevron'} size={16} />
    </button>
  );
}
