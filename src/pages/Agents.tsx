import { Icon } from '../components/Icon';

export function Agents() {
  return (
    <div className="page">
      <header className="page-heading page-heading-compact">
        <div>
          <div className="eyebrow">WORKSPACE / AGENT ROUTING</div>
          <h1>Agents</h1>
          <p className="page-subtitle">
            Coding agents are optional workers. They do not replace the Git synchronization engine.
          </p>
        </div>
        <span className="status-pill status-muted">
          <span className="status-dot status-dot-muted" />
          No agent connected
        </span>
      </header>

      <section className="agent-feature-card">
        <div className="agent-feature-top">
          <div className="agent-brand-icon">
            <span>J</span>
          </div>
          <div className="agent-feature-status">
            <span className="status-pill status-planned">PLANNED ADAPTER</span>
            <span className="status-pill status-muted">Not connected</span>
          </div>
        </div>
        <div className="agent-feature-body">
          <div>
            <div className="eyebrow">FIRST INTEGRATION TARGET</div>
            <h2>Google Jules</h2>
            <p>
              The adapter boundary is in place, but Jules API calls are not implemented here. Any
              future requests must run from a user-controlled environment.
            </p>
          </div>
          <div className="agent-capability-list">
            <Capability label="API credential in browser" value="Never" />
            <Capability label="Task submission" value="Not available" />
            <Capability label="Session tracking" value="Not available" />
          </div>
        </div>
        <div className="agent-feature-footer">
          <Icon name="shield" size={16} />
          <span>
            Design target: GitHub-connected Jules sources first. For GitLab and Codeberg, use
            user-controlled Git workflows; no direct Jules support is assumed.
          </span>
        </div>
      </section>

      <div className="section-title-row agent-section-heading">
        <div>
          <div className="eyebrow">ADAPTER ARCHITECTURE</div>
          <h2>Keep workers replaceable</h2>
        </div>
        <span className="section-side-note">No agent-specific credentials are stored here.</span>
      </div>

      <section className="agent-adapter-grid">
        <article className="agent-adapter-card agent-adapter-active">
          <div className="adapter-number">01</div>
          <div className="adapter-icon">
            <Icon name="agents" size={19} />
          </div>
          <strong>Jules adapter</strong>
          <p>Isolated contract; unavailable until a secure runner implementation is added.</p>
          <span>Planned</span>
        </article>
        <article className="agent-adapter-card">
          <div className="adapter-number">02</div>
          <div className="adapter-icon adapter-icon-muted">
            <Icon name="plus" size={19} />
          </div>
          <strong>Future agents</strong>
          <p>Add providers behind the same task and session interfaces.</p>
          <span>Extension point</span>
        </article>
        <article className="agent-adapter-card">
          <div className="adapter-number">03</div>
          <div className="adapter-icon adapter-icon-muted">
            <Icon name="branch" size={19} />
          </div>
          <strong>Human review</strong>
          <p>Proposals remain inspectable and isolated from protected branches.</p>
          <span>Required gate</span>
        </article>
      </section>
    </div>
  );
}

function Capability({ label, value }: { label: string; value: string }) {
  return (
    <div className="agent-capability">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
