import type { WorkspaceConfig, ProviderCredential } from '../domain/types';
import { emptyWorkspace } from '../domain/workspace';

const DB_NAME = 'RepoPilotLocalDB';
const DB_VERSION = 1;
const WORKSPACE_STORE = 'workspace';
const CREDENTIALS_STORE = 'credentials';
const BATCH_LOGS_STORE = 'batch_logs';

export interface BatchRunLog {
  id: string;
  type: 'batch_rename' | 'batch_sync' | 'batch_ci_dispatch' | 'branch_merge' | 'pull_merge';
  timestamp: string;
  targetCount: number;
  status: 'completed' | 'dry_run' | 'failed';
  details: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(WORKSPACE_STORE)) {
        db.createObjectStore(WORKSPACE_STORE, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(CREDENTIALS_STORE)) {
        db.createObjectStore(CREDENTIALS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(BATCH_LOGS_STORE)) {
        db.createObjectStore(BATCH_LOGS_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveWorkspaceToLocalDB(workspace: WorkspaceConfig): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(WORKSPACE_STORE, 'readwrite');
    const store = tx.objectStore(WORKSPACE_STORE);
    store.put({ key: 'current_workspace', data: workspace, updatedAt: new Date().toISOString() });
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
  } catch {
    // Fallback to localStorage if IndexedDB is not available
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('repopilot.workspace.v1', JSON.stringify(workspace));
    }
  }
}

export async function loadWorkspaceFromLocalDB(): Promise<WorkspaceConfig> {
  try {
    const db = await openDB();
    const tx = db.transaction(WORKSPACE_STORE, 'readonly');
    const store = tx.objectStore(WORKSPACE_STORE);
    const request = store.get('current_workspace');

    return new Promise((resolve) => {
      request.onsuccess = () => {
        if (request.result && request.result.data) {
          resolve(request.result.data as WorkspaceConfig);
        } else {
          resolve(emptyWorkspace());
        }
      };
      request.onerror = () => resolve(emptyWorkspace());
    });
  } catch {
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem('repopilot.workspace.v1');
      if (raw) {
        try {
          return JSON.parse(raw) as WorkspaceConfig;
        } catch {
          return emptyWorkspace();
        }
      }
    }
    return emptyWorkspace();
  }
}

export async function saveCredentialToLocalDB(credential: ProviderCredential): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(CREDENTIALS_STORE, 'readwrite');
    const store = tx.objectStore(CREDENTIALS_STORE);
    const id = `${credential.provider}:${credential.account}`;
    store.put({ ...credential, id });
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
  } catch (err) {
    console.warn('Failed to save credential to LocalDB', err);
  }
}

export async function getCredentialsFromLocalDB(): Promise<ProviderCredential[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(CREDENTIALS_STORE, 'readonly');
    const store = tx.objectStore(CREDENTIALS_STORE);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        resolve((request.result as ProviderCredential[]) || []);
      };
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function logBatchRunToLocalDB(log: BatchRunLog): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(BATCH_LOGS_STORE, 'readwrite');
    const store = tx.objectStore(BATCH_LOGS_STORE);
    store.put(log);
  } catch {
    // Ignore logging errors in restricted environments
  }
}

export async function getBatchLogsFromLocalDB(): Promise<BatchRunLog[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(BATCH_LOGS_STORE, 'readonly');
    const store = tx.objectStore(BATCH_LOGS_STORE);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => resolve((request.result as BatchRunLog[]) || []);
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}
