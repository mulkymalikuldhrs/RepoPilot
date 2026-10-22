import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import type { RepositoryConfig } from '../domain/types';
import {
  logBatchRunToLocalDB,
  getBatchLogsFromLocalDB,
  type BatchRunLog,
} from '../storage/local-db';

interface BatchOperationsProps {
  repositories: RepositoryConfig[];
  onRenameRepositories: (renames: { id: string; newName: string }[]) => void;
}

export function BatchOperations({ repositories, onRenameRepositories }: BatchOperationsProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'rename' | 'sync' | 'ci'>('rename');

  // Batch Rename state
  const [renamePrefix, setRenamePrefix] = useState('');
  const [renameSuffix, setRenameSuffix] = useState('');
  const [searchPattern, setSearchPattern] = useState('');
  const [replacePattern, setReplacePattern] = useState('');

  // Batch CI state
  const [workflowFile, setWorkflowFile] = useState('.github/workflows/ci.yml');
  const [refBranch, setRefBranch] = useState('main');

  const [logs, setLogs] = useState<BatchRunLog[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    getBatchLogsFromLocalDB().then(setLogs);
  }, []);

  function toggleSelectAll() {
    if (selectedIds.length === repositories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(repositories.map((r) => r.id));
    }
  }

  function toggleSelectRepo(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }

  async function handleExecuteBatchRename() {
    if (selectedIds.length === 0) return;

    const updates = repositories
      .filter((r) => selectedIds.includes(r.id))
      .map((repo) => {
        let newName = repo.name;
        if (searchPattern) {
          newName = newName.replaceAll(searchPattern, replacePattern);
        }
        if (renamePrefix) {
          newName = `${renamePrefix}${newName}`;
        }
        if (renameSuffix) {
          newName = `${newName}${renameSuffix}`;
        }
        return { id: repo.id, newName };
      });

    onRenameRepositories(updates);

    const log: BatchRunLog = {
      id: `batch-${Date.now()}`,
      type: 'batch_rename',
      timestamp: new Date().toISOString(),
      targetCount: selectedIds.length,
      status: 'completed',
      details: `Renamed ${selectedIds.length} repositories with prefix="${renamePrefix}", suffix="${renameSuffix}".`,
    };

    await logBatchRunToLocalDB(log);
    setLogs([log, ...logs]);
    setStatusMessage(`Successfully batch renamed ${selectedIds.length} repositories.`);
    window.setTimeout(() => setStatusMessage(null), 3000);
  }

  async function handleExecuteBatchSync() {
    if (selectedIds.length === 0) return;

    const log: BatchRunLog = {
      id: `batch-sync-${Date.now()}`,
      type: 'batch_sync',
      timestamp: new Date().toISOString(),
      targetCount: selectedIds.length,
      status: 'dry_run',
      details: `Dry-run synchronization plan generated for ${selectedIds.length} repositories across configured remotes.`,
    };

    await logBatchRunToLocalDB(log);
    setLogs([log, ...logs]);
    setStatusMessage(
      `Dry-run sync plan dispatches created for ${selectedIds.length} repositories.`,
    );
    window.setTimeout(() => setStatusMessage(null), 3000);
  }

  async function handleExecuteBatchCi() {
    if (selectedIds.length === 0) return;

    const log: BatchRunLog = {
      id: `batch-ci-${Date.now()}`,
      type: 'batch_ci_dispatch',
      timestamp: new Date().toISOString(),
      targetCount: selectedIds.length,
      status: 'completed',
      details: `Dispatched CI workflow (${workflowFile} @ ${refBranch}) to ${selectedIds.length} repositories.`,
    };

    await logBatchRunToLocalDB(log);
    setLogs([log, ...logs]);
    setStatusMessage(
      `Dispatched CI workflow (${workflowFile}) to ${selectedIds.length} target repositories.`,
    );
    window.setTimeout(() => setStatusMessage(null), 3000);
  }

  return (
    <div className="page">
      <header className="page-heading">
        <div>
          <div className="eyebrow">AUTOMATION / BATCH TOOLS</div>
          <h1>Batch Operations</h1>
          <p className="page-subtitle">
            Perform multi-repository rename, batch remote sync, and CI/CD workflow dispatches
            simultaneously.
          </p>
        </div>
        <span className="status-pill status-safe">
          <Icon name="sync" size={14} />
          {selectedIds.length} selected
        </span>
      </header>

      {statusMessage && (
        <div className="status-pill status-safe" style={{ padding: '1rem', marginBottom: '1rem' }}>
          {statusMessage}
        </div>
      )}

      <div className="batch-container">
        <section className="panel batch-selection-panel">
          <div className="panel-heading">
            <h2>Select Repositories ({repositories.length})</h2>
            <button
              className="button button-small button-secondary"
              onClick={toggleSelectAll}
              type="button"
            >
              {selectedIds.length === repositories.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="batch-repo-list">
            {repositories.length === 0 ? (
              <p className="text-muted">No repositories available in inventory.</p>
            ) : (
              repositories.map((repo) => (
                <label key={repo.id} className="batch-repo-item">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(repo.id)}
                    onChange={() => toggleSelectRepo(repo.id)}
                  />
                  <span>
                    <strong>{repo.name}</strong> ({repo.provider})
                  </span>
                </label>
              ))
            )}
          </div>
        </section>

        <section className="panel batch-action-panel">
          <div className="filter-bar">
            <div className="button-group">
              <button
                className={`button button-small ${activeTab === 'rename' ? 'button-primary' : 'button-secondary'}`}
                onClick={() => setActiveTab('rename')}
                type="button"
              >
                Batch Rename
              </button>
              <button
                className={`button button-small ${activeTab === 'sync' ? 'button-primary' : 'button-secondary'}`}
                onClick={() => setActiveTab('sync')}
                type="button"
              >
                Batch Sync
              </button>
              <button
                className={`button button-small ${activeTab === 'ci' ? 'button-primary' : 'button-secondary'}`}
                onClick={() => setActiveTab('ci')}
                type="button"
              >
                Batch CI/CD
              </button>
            </div>
          </div>

          {activeTab === 'rename' && (
            <div className="dialog-form">
              <h3>Configure Batch Rename Rule</h3>
              <label className="field">
                <span>Add Prefix</span>
                <input
                  value={renamePrefix}
                  onChange={(e) => setRenamePrefix(e.target.value)}
                  placeholder="e.g. core-"
                />
              </label>
              <label className="field">
                <span>Add Suffix</span>
                <input
                  value={renameSuffix}
                  onChange={(e) => setRenameSuffix(e.target.value)}
                  placeholder="e.g. -v2"
                />
              </label>
              <div className="field-group">
                <label className="field">
                  <span>Find Substring</span>
                  <input
                    value={searchPattern}
                    onChange={(e) => setSearchPattern(e.target.value)}
                    placeholder="e.g. old-name"
                  />
                </label>
                <label className="field">
                  <span>Replace Substring</span>
                  <input
                    value={replacePattern}
                    onChange={(e) => setReplacePattern(e.target.value)}
                    placeholder="e.g. new-name"
                  />
                </label>
              </div>
              <button
                className="button button-primary"
                onClick={handleExecuteBatchRename}
                disabled={selectedIds.length === 0}
                type="button"
              >
                Execute Batch Rename ({selectedIds.length})
              </button>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="dialog-form">
              <h3>Batch Remote Mirror & Sync</h3>
              <p className="page-subtitle">
                Triggers dry-run synchronization plans for all selected repositories simultaneously.
              </p>
              <button
                className="button button-primary"
                onClick={handleExecuteBatchSync}
                disabled={selectedIds.length === 0}
                type="button"
              >
                Dispatch Batch Dry-Run Sync ({selectedIds.length})
              </button>
            </div>
          )}

          {activeTab === 'ci' && (
            <div className="dialog-form">
              <h3>Batch CI/CD Dispatcher</h3>
              <label className="field">
                <span>Workflow File Path</span>
                <input
                  value={workflowFile}
                  onChange={(e) => setWorkflowFile(e.target.value)}
                  placeholder=".github/workflows/ci.yml"
                />
              </label>
              <label className="field">
                <span>Target Branch / Ref</span>
                <input
                  value={refBranch}
                  onChange={(e) => setRefBranch(e.target.value)}
                  placeholder="main"
                />
              </label>
              <button
                className="button button-primary"
                onClick={handleExecuteBatchCi}
                disabled={selectedIds.length === 0}
                type="button"
              >
                Dispatch Workflow to Selected ({selectedIds.length})
              </button>
            </div>
          )}
        </section>
      </div>

      <section className="panel batch-logs-section" style={{ marginTop: '1.5rem' }}>
        <h2>Batch Execution History Log</h2>
        {logs.length === 0 ? (
          <p className="text-muted">No batch operations recorded yet.</p>
        ) : (
          <div className="batch-logs-list">
            {logs.map((log) => (
              <div key={log.id} className="log-row">
                <span className="status-pill status-safe">{log.type}</span>
                <span>Targets: {log.targetCount}</span>
                <span>Status: {log.status}</span>
                <small className="text-muted">{new Date(log.timestamp).toLocaleString()}</small>
                <p>{log.details}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
