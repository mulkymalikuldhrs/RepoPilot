import { useState, useEffect } from 'react';
import { Sidebar, type PageId } from './components/Sidebar';
import { Overview } from './pages/Overview';
import { Repositories } from './pages/Repositories';
import { BatchOperations } from './pages/BatchOperations';
import { ReadmeConsistency } from './pages/ReadmeConsistency';
import { SyncPolicies } from './pages/SyncPolicies';
import { RepairPolicies } from './pages/RepairPolicies';
import { Agents } from './pages/Agents';
import { ExecutionHistory } from './pages/ExecutionHistory';
import { Settings } from './pages/Settings';
import { RepositoryDialog } from './components/RepositoryDialog';
import { loadWorkspaceFromLocalDB, saveWorkspaceToLocalDB } from './storage/local-db';
import type {
  RepositoryConfig,
  SyncPolicy,
  ProviderCredential,
  ReadmeConsistencyPolicy,
  WorkspaceConfig,
} from './domain/types';

export function App() {
  const [activePage, setActivePage] = useState<PageId>('overview');
  const [workspace, setWorkspace] = useState<WorkspaceConfig>(() => ({
    repositories: [],
    syncPolicies: {},
    repairPolicy: {
      checks: {
        buildAndTests: true,
        lintAndTypes: true,
        dependencyMaintenance: false,
        documentation: false,
      },
      createPullRequest: true,
      autoMerge: false,
      approvalRequired: true,
    },
    credentials: [],
    readmePolicy: {
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
  }));
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    loadWorkspaceFromLocalDB().then((loaded) => {
      if (loaded && Array.isArray(loaded.repositories)) {
        setWorkspace((prev) => ({ ...prev, ...loaded }));
      }
    });
  }, []);

  function handleSaveWorkspace(next: WorkspaceConfig) {
    setWorkspace(next);
    saveWorkspaceToLocalDB(next);
  }

  function handleAddRepository(repo: RepositoryConfig): boolean {
    const exists = workspace.repositories.some((r) => r.remoteUrl === repo.remoteUrl);
    if (exists) return false;

    handleSaveWorkspace({
      ...workspace,
      repositories: [...workspace.repositories, repo],
    });
    setIsAddOpen(false);
    return true;
  }

  function handleRenameRepository(id: string, newName: string) {
    handleSaveWorkspace({
      ...workspace,
      repositories: workspace.repositories.map((r) => (r.id === id ? { ...r, name: newName } : r)),
    });
  }

  function handleBatchRenameRepositories(renames: { id: string; newName: string }[]) {
    const map = new Map(renames.map((r) => [r.id, r.newName]));
    handleSaveWorkspace({
      ...workspace,
      repositories: workspace.repositories.map((r) =>
        map.has(r.id) ? { ...r, name: map.get(r.id)! } : r,
      ),
    });
  }

  function handleArchiveRepository(id: string, archived: boolean) {
    handleSaveWorkspace({
      ...workspace,
      repositories: workspace.repositories.map((r) => (r.id === id ? { ...r, archived } : r)),
    });
  }

  function handleRemoveRepository(id: string) {
    handleSaveWorkspace({
      ...workspace,
      repositories: workspace.repositories.filter((r) => r.id !== id),
    });
  }

  function handleUpdateSyncPolicy(repositoryId: string, policy: SyncPolicy) {
    handleSaveWorkspace({
      ...workspace,
      syncPolicies: {
        ...workspace.syncPolicies,
        [repositoryId]: policy,
      },
    });
  }

  function handleSaveCredential(credential: ProviderCredential) {
    const existing = workspace.credentials || [];
    const filtered = existing.filter((c) => c.account !== credential.account);
    handleSaveWorkspace({
      ...workspace,
      credentials: [...filtered, credential],
    });
  }

  function handleUpdateReadmePolicy(policy: ReadmeConsistencyPolicy) {
    handleSaveWorkspace({
      ...workspace,
      readmePolicy: policy,
    });
  }

  function handleResetWorkspace() {
    const reset: WorkspaceConfig = {
      repositories: [],
      syncPolicies: {},
      repairPolicy: workspace.repairPolicy,
      credentials: [],
      readmePolicy: workspace.readmePolicy,
    };
    handleSaveWorkspace(reset);
  }

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        repositoryCount={workspace.repositories.length}
      />
      <main className="main-content">
        {activePage === 'overview' && (
          <Overview
            repositories={workspace.repositories}
            onAddRepository={() => setIsAddOpen(true)}
            onNavigate={setActivePage}
          />
        )}
        {activePage === 'repositories' && (
          <Repositories
            repositories={workspace.repositories}
            onAddRepository={() => setIsAddOpen(true)}
            onRenameRepository={handleRenameRepository}
            onArchiveRepository={handleArchiveRepository}
            onRemoveRepository={handleRemoveRepository}
          />
        )}
        {activePage === 'batch-operations' && (
          <BatchOperations
            repositories={workspace.repositories}
            onRenameRepositories={handleBatchRenameRepositories}
          />
        )}
        {activePage === 'readme-consistency' && (
          <ReadmeConsistency
            repositories={workspace.repositories}
            policy={workspace.readmePolicy}
            onUpdatePolicy={handleUpdateReadmePolicy}
          />
        )}
        {activePage === 'sync-policies' && (
          <SyncPolicies
            repositories={workspace.repositories}
            policies={workspace.syncPolicies}
            onAddRepository={() => setIsAddOpen(true)}
            onUpdate={handleUpdateSyncPolicy}
          />
        )}
        {activePage === 'repair-policies' && (
          <RepairPolicies
            policy={workspace.repairPolicy}
            onUpdate={(repairPolicy) => handleSaveWorkspace({ ...workspace, repairPolicy })}
          />
        )}
        {activePage === 'agents' && <Agents onNavigate={setActivePage} />}
        {activePage === 'execution-history' && <ExecutionHistory onNavigate={setActivePage} />}
        {activePage === 'settings' && (
          <Settings
            workspace={workspace}
            onReset={handleResetWorkspace}
            onSaveCredential={handleSaveCredential}
          />
        )}
      </main>

      {isAddOpen && (
        <RepositoryDialog onClose={() => setIsAddOpen(false)} onSave={handleAddRepository} />
      )}
    </div>
  );
}

export default App;
