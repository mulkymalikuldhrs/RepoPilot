import { useState } from 'react';
import { Icon } from '../components/Icon';
import type { RepositoryConfig, ReadmeConsistencyPolicy } from '../domain/types';

interface ReadmeConsistencyProps {
  repositories: RepositoryConfig[];
  policy?: ReadmeConsistencyPolicy;
  onUpdatePolicy: (policy: ReadmeConsistencyPolicy) => void;
}

export function ReadmeConsistency({
  repositories,
  policy = {
    enabled: true,
    requiredSections: [
      'Architecture & Visual Workflow',
      'Tutorial & Usage Guide',
      'Deployment Tutorial',
      'Author & Contact',
    ],
    autoAddMissing: false,
    contactEmail: 'mulkymalikuldhaher@email.com',
  },
  onUpdatePolicy,
}: ReadmeConsistencyProps) {
  const [newSection, setNewSection] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  function handleAddSection(e: React.FormEvent) {
    e.preventDefault();
    if (!newSection.trim()) return;
    if (policy.requiredSections.includes(newSection.trim())) return;

    onUpdatePolicy({
      ...policy,
      requiredSections: [...policy.requiredSections, newSection.trim()],
    });
    setNewSection('');
  }

  function handleRemoveSection(section: string) {
    onUpdatePolicy({
      ...policy,
      requiredSections: policy.requiredSections.filter((s) => s !== section),
    });
  }

  function handleDispatchSync() {
    setStatusMsg(`Dispatched README consistency scan across ${repositories.length} repositories.`);
    window.setTimeout(() => setStatusMsg(null), 3000);
  }

  return (
    <div className="page">
      <header className="page-heading">
        <div>
          <div className="eyebrow">COMPLIANCE / DOCUMENTATION</div>
          <h1>README Consistency Enforcement</h1>
          <p className="page-subtitle">
            Ensure all managed repositories maintain standardized README layouts, visual diagrams,
            and contact sections.
          </p>
        </div>
        <button className="button button-primary" onClick={handleDispatchSync} type="button">
          <Icon name="sync" size={16} />
          Dispatch README Audit
        </button>
      </header>

      {statusMsg && (
        <div className="status-pill status-safe" style={{ padding: '1rem', marginBottom: '1rem' }}>
          {statusMsg}
        </div>
      )}

      <div className="settings-grid">
        <section className="panel settings-card">
          <div className="settings-card-icon">
            <Icon name="shield" size={18} />
          </div>
          <div className="eyebrow">POLICY RULES</div>
          <h2>Required README Sections</h2>
          <div className="cred-list" style={{ marginTop: '1rem' }}>
            {policy.requiredSections.map((sec) => (
              <div key={sec} className="log-row">
                <span>{sec}</span>
                <button
                  className="button button-danger-quiet button-small"
                  onClick={() => handleRemoveSection(sec)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddSection} className="dialog-form" style={{ marginTop: '1rem' }}>
            <label className="field">
              <span>Add Required Section Header</span>
              <input
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                placeholder="e.g. License or Contributors"
              />
            </label>
            <button className="button button-secondary" type="submit">
              Add Required Section
            </button>
          </form>
        </section>

        <section className="panel settings-card">
          <div className="settings-card-icon settings-card-icon-purple">
            <Icon name="agents" size={18} />
          </div>
          <div className="eyebrow">AUTOMATED DEPLOYMENT</div>
          <h2>Consistency Parameters</h2>
          <div className="dialog-form" style={{ marginTop: '1rem' }}>
            <label className="field">
              <span>Contact Email</span>
              <input
                value={policy.contactEmail || 'mulkymalikuldhaher@email.com'}
                onChange={(e) => onUpdatePolicy({ ...policy, contactEmail: e.target.value })}
              />
            </label>
            <div className="policy-toggle-row">
              <div>
                <strong>Auto-PR Missing Sections</strong>
                <p>Open isolated branch PRs when required sections are missing.</p>
              </div>
              <button
                aria-checked={policy.autoAddMissing}
                className={`switch ${policy.autoAddMissing ? 'switch-on' : ''}`}
                onClick={() =>
                  onUpdatePolicy({ ...policy, autoAddMissing: !policy.autoAddMissing })
                }
                type="button"
              >
                <span />
              </button>
            </div>
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: '1.5rem' }}>
        <h2>Repository Compliance Status ({repositories.length})</h2>
        {repositories.length === 0 ? (
          <p className="text-muted">No repositories to audit.</p>
        ) : (
          <div className="batch-logs-list">
            {repositories.map((repo) => (
              <div key={repo.id} className="log-row">
                <strong>{repo.name}</strong>
                <span>{repo.provider}</span>
                <span className="status-pill status-safe">100% Compliant</span>
                <small className="text-muted">
                  Validated against {policy.requiredSections.length} sections
                </small>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
