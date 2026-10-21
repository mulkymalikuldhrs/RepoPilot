import { useEffect, useState } from 'react';
import { Icon } from './components/Icon';
import { RepositoryDialog } from './components/RepositoryDialog';
import { Sidebar, type PageId } from './components/Sidebar';
import { addRepository, emptyWorkspace } from './domain/workspace';
import type { RepositoryConfig, RepairPolicy, SyncPolicy, WorkspaceConfig } from './domain/types';
import { loadWorkspace, saveWorkspace } from './storage/local-store';
import { Agents } from './pages/Agents';
import { ExecutionHistory } from './pages/ExecutionHistory';
import { Overview } from './pages/Overview';
import { RepairPolicies } from './pages/RepairPolicies';
import { Repositories } from './pages/Repositories';
import { Settings } from './pages/Settings';
import { SyncPolicies } from './pages/SyncPolicies';

const pageTitles: Record<PageId, string> = {
  overview: 'Overview',
  repositories: 'Repositories',
  sync: 'Sync policies',
  repairs: 'Repair policies',
  agents: 'Agents',
  runs: 'Execution history',
  settings: 'Settings',
};

export default function App() {
  const [workspace, setWorkspace] = useState<WorkspaceConfig>(() => loadWorkspace());
  const [page, setPage] = useState<PageId>('overview');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    saveWorkspace(workspace);
  }, [workspace]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setDialogOpen(true);
      }
      if (event.key === 'Escape') {
        setDialogOpen(false);
        setMobileNavOpen(false);
      }
    }
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  function saveRepository(repository: RepositoryConfig): boolean {
    if (workspace.repositories.some((entry) => entry.remoteUrl === repository.remoteUrl))
      return false;
    setWorkspace((current) => addRepository(current, repository));
    setDialogOpen(false);
    setNotice('Saved locally. This remote is still unverified.');
    return true;
  }

  function updateSyncPolicy(repositoryId: string, policy: SyncPolicy) {
    setWorkspace((current) => ({
      ...current,
      syncPolicies: { ...current.syncPolicies, [repositoryId]: policy },
    }));
  }

  function updateRepairPolicy(policy: RepairPolicy) {
    setWorkspace((current) => ({ ...current, repairPolicy: policy }));
  }

  function navigate(nextPage: PageId) {
    setPage(nextPage);
    setNotice('');
  }

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        onNavigate={navigate}
        onAddRepository={() => setDialogOpen(true)}
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              aria-label="Open navigation"
              className="icon-button mobile-menu-button"
              onClick={() => setMobileNavOpen(true)}
              type="button"
            >
              <Icon name="menu" />
            </button>
            <div className="breadcrumb">
              <span>Personal workspace</span>
              <Icon name="chevron" size={14} />
              <strong>{pageTitles[page]}</strong>
            </div>
          </div>
          <div className="topbar-right">
            <span className="topbar-environment">
              <span /> LOCAL-ONLY
            </span>
            <button
              className="topbar-add"
              onClick={() => setDialogOpen(true)}
              type="button"
              aria-label="Add repository"
            >
              <Icon name="plus" size={16} />
              <span>Add remote</span>
            </button>
          </div>
        </header>
        <main className="main-content">
          {notice && (
            <div className="notice-bar" role="status">
              <Icon name="check" size={16} />
              <span>{notice}</span>
              <button aria-label="Dismiss notice" onClick={() => setNotice('')} type="button">
                <Icon name="close" size={14} />
              </button>
            </div>
          )}
          {page === 'overview' && (
            <Overview
              repositories={workspace.repositories}
              onAddRepository={() => setDialogOpen(true)}
              onNavigate={navigate}
            />
          )}
          {page === 'repositories' && (
            <Repositories
              repositories={workspace.repositories}
              onAddRepository={() => setDialogOpen(true)}
            />
          )}
          {page === 'sync' && (
            <SyncPolicies
              repositories={workspace.repositories}
              policies={workspace.syncPolicies}
              onAddRepository={() => setDialogOpen(true)}
              onUpdate={updateSyncPolicy}
            />
          )}
          {page === 'repairs' && (
            <RepairPolicies policy={workspace.repairPolicy} onUpdate={updateRepairPolicy} />
          )}
          {page === 'agents' && <Agents />}
          {page === 'runs' && <ExecutionHistory onNavigate={navigate} />}
          {page === 'settings' && (
            <Settings workspace={workspace} onReset={() => setWorkspace(emptyWorkspace())} />
          )}
        </main>
      </div>
      {dialogOpen && (
        <RepositoryDialog onClose={() => setDialogOpen(false)} onSave={saveRepository} />
      )}
    </div>
  );
}
