import { emptyWorkspace } from '../domain/workspace';
import type { WorkspaceConfig } from '../domain/types';

const STORAGE_KEY = 'repopilot.workspace.v1';

export function loadWorkspace(): WorkspaceConfig {
  if (typeof window === 'undefined') {
    return emptyWorkspace();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyWorkspace();

    const value: unknown = JSON.parse(raw);
    if (!isWorkspaceConfig(value)) return emptyWorkspace();
    return value;
  } catch {
    return emptyWorkspace();
  }
}

export function saveWorkspace(workspace: WorkspaceConfig): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
}

export function clearWorkspace(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

function isWorkspaceConfig(value: unknown): value is WorkspaceConfig {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<WorkspaceConfig>;
  return (
    Array.isArray(candidate.repositories) &&
    typeof candidate.syncPolicies === 'object' &&
    candidate.syncPolicies !== null &&
    typeof candidate.repairPolicy === 'object' &&
    candidate.repairPolicy !== null
  );
}
