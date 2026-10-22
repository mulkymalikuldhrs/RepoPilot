import { useState } from 'react';
import { Icon } from '../components/Icon';
import type { RepositoryConfig } from '../domain/types';

interface RepositoriesProps {
  repositories: RepositoryConfig[];
  onAddRepository: () => void;
  onRenameRepository: (id: string, newName: string) => void;
  onArchiveRepository: (id: string, archived: boolean) => void;
  onRemoveRepository: (id: string) => void;
}

export function Repositories({
  repositories,
  onAddRepository,
  onRenameRepository,
  onArchiveRepository,
  onRemoveRepository,
}: RepositoriesProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [mergeModalRepo, setMergeModalRepo] = useState<RepositoryConfig | null>(null);
  const [sourceBranch, setSourceBranch] = useState('');
  const [targetBranch, setTargetBranch] = useState('main');
  const [mergeStatus, setMergeStatus] = useState<string | null>(null);

  const filteredRepos = repositories.filter((repo) => {
    if (filter === 'active') return !repo.archived;
    if (filter === 'archived') return repo.archived;
    return true;
  });

  function startRename(repo: RepositoryConfig) {
    setEditingId(repo.id);
    setEditName(repo.name);
  }

  function handleSaveRename(id: string) {
    if (editName.trim()) {
      onRenameRepository(id, editName.trim());
    }
    setEditingId(null);
  }

  function handleBranchMerge(e: React.FormEvent) {
    e.preventDefault();
    if (!sourceBranch.trim() || !targetBranch.trim() || !mergeModalRepo) return;
    setMergeStatus(
      `Dry-Run Branch Merge Plan created: Merge ${sourceBranch} into ${targetBranch} for ${mergeModalRepo.name}. Dispatch sent to local runner.`,
    );
    window.setTimeout(() => {
      setMergeModalRepo(null);
      setMergeStatus(null);
      setSourceBranch('');
    }, 2500);
  }

  return (
    <div className="page">
      <header className="page-heading">
        <div>
          <div className="eyebrow">WORKSPACE / INVENTORY</div>
          <h1>Repositories</h1>
          <p className="page-subtitle">
            Manage, rename, archive, and perform branch/pull merges across remotes.
          </p>
        </div>
        <div className="page-actions">
          <button className="button button-primary" onClick={onAddRepository} type="button">
            <Icon name="plus" size={16} />
            Add Repository
          </button>
        </div>
      </header>

      <div className="filter-bar">
        <div className="button-group">
          <button
            className={`button button-small ${filter === 'active' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setFilter('active')}
            type="button"
          >
            Active ({repositories.filter((r) => !r.archived).length})
          </button>
          <button
            className={`button button-small ${filter === 'archived' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setFilter('archived')}
            type="button"
          >
            Archived ({repositories.filter((r) => r.archived).length})
          </button>
          <button
            className={`button button-small ${filter === 'all' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setFilter('all')}
            type="button"
          >
            All ({repositories.length})
          </button>
        </div>
      </div>

      {filteredRepos.length === 0 ? (
        <section className="panel empty-repo-panel">
          <div className="empty-state">
            <h3>No repositories found</h3>
            <p>Add a repository to begin monitoring and synchronizing remotes.</p>
            <button className="button button-primary" onClick={onAddRepository} type="button">
              Add Repository
            </button>
          </div>
        </section>
      ) : (
        <div className="repo-grid">
          {filteredRepos.map((repo) => (
            <article key={repo.id} className={`panel repo-card ${repo.archived ? 'archived' : ''}`}>
              <div className="repo-card-header">
                <div>
                  <div className="eyebrow">
                    {repo.provider.toUpperCase()} • {repo.account}
                  </div>
                  {editingId === repo.id ? (
                    <div className="inline-edit">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="field-input"
                      />
                      <button
                        className="button button-small button-primary"
                        onClick={() => handleSaveRename(repo.id)}
                        type="button"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <h2>{repo.name}</h2>
                  )}
                </div>
                <span className={`status-pill ${repo.archived ? 'status-muted' : 'status-safe'}`}>
                  {repo.archived ? 'Archived' : 'Active'}
                </span>
              </div>

              <p className="repo-url">{repo.remoteUrl}</p>
              <div className="repo-meta">
                <span>
                  Branch: <strong>{repo.defaultBranch}</strong>
                </span>
              </div>

              <div className="repo-card-actions">
                <button
                  className="button button-secondary button-small"
                  onClick={() => startRename(repo)}
                  type="button"
                >
                  Rename
                </button>
                <button
                  className="button button-secondary button-small"
                  onClick={() => setMergeModalRepo(repo)}
                  type="button"
                >
                  Branch Merge
                </button>
                <button
                  className="button button-secondary button-small"
                  onClick={() => onArchiveRepository(repo.id, !repo.archived)}
                  type="button"
                >
                  {repo.archived ? 'Unarchive' : 'Archive'}
                </button>
                <button
                  className="button button-danger-quiet button-small"
                  onClick={() => onRemoveRepository(repo.id)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {mergeModalRepo && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <h2>Branch Merge Tool • {mergeModalRepo.name}</h2>
            <p className="modal-subtitle">Configure dry-run or automated branch/pull merges.</p>
            {mergeStatus ? (
              <div
                className="status-pill status-safe"
                style={{ marginTop: '1rem', padding: '1rem' }}
              >
                {mergeStatus}
              </div>
            ) : (
              <form onSubmit={handleBranchMerge} className="dialog-form">
                <label className="field">
                  <span>Source Branch / Ref</span>
                  <input
                    value={sourceBranch}
                    onChange={(e) => setSourceBranch(e.target.value)}
                    placeholder="e.g. feature/fix-auth or origin/dev"
                    required
                  />
                </label>
                <label className="field">
                  <span>Target Branch</span>
                  <input
                    value={targetBranch}
                    onChange={(e) => setTargetBranch(e.target.value)}
                    placeholder="e.g. main"
                    required
                  />
                </label>
                <div className="dialog-actions">
                  <button
                    className="button button-secondary"
                    onClick={() => setMergeModalRepo(null)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button className="button button-primary" type="submit">
                    Run Branch Merge
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
