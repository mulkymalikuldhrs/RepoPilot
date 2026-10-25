import type { ProviderId, RepositoryConfig } from '../domain/types';
import type { GitProviderAdapter } from './types';

export type FetchLike = (
  url: string,
  init?: { headers?: Record<string, string> },
) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;

export interface ProviderRepoSnapshot {
  account: string;
  fullName: string;
  remoteUrl: string;
  defaultBranch: string;
  visibility: 'public' | 'private';
  archived: boolean;
  pushedAt: string;
  createdAt: string;
}

export function snapshotToRepositoryConfig(
  providerId: ProviderId,
  snapshot: ProviderRepoSnapshot,
): RepositoryConfig {
  return {
    id: `${providerId}:${snapshot.fullName.toLowerCase()}`,
    name: snapshot.fullName.split('/')[1] ?? snapshot.fullName,
    fullName: snapshot.fullName,
    provider: providerId,
    account: snapshot.account,
    remoteUrl: snapshot.remoteUrl,
    defaultBranch: snapshot.defaultBranch,
    createdAt: snapshot.createdAt,
    verification: 'verified',
    archived: snapshot.archived,
    visibility: snapshot.visibility,
    pushedAt: snapshot.pushedAt,
  };
}

/** Shared REST helpers for runner-side provider adapters. */

export async function fetchJson<T>(
  fetchImpl: FetchLike,
  url: string,
  headers: Record<string, string>,
): Promise<T> {
  const response = await fetchImpl(url, { headers });
  if (!response.ok) {
    throw new Error(`API ${response.status} for ${redactPath(url)}`);
  }
  return (await response.json()) as T;
}

/** Strip query strings (which can carry tokens) from URLs used in errors. */
export function redactPath(url: string): string {
  return url.split('?')[0] ?? url;
}

export async function paginate<T>(
  fetchImpl: FetchLike,
  buildUrl: (page: number) => string,
  headers: Record<string, string>,
  extract: (payload: unknown) => T[],
  maxPages = 20,
): Promise<T[]> {
  const out: T[] = [];
  for (let page = 1; page <= maxPages; page++) {
    let payload: unknown;
    try {
      const response = await fetchImpl(buildUrl(page), { headers });
      // Providers signal end-of-collection differently; a 404 on the next
      // page is treated as "no more items", anything else is fatal.
      if (response.status === 404) break;
      if (!response.ok) throw new Error(`API ${response.status} for ${redactPath(buildUrl(page))}`);
      payload = await response.json();
    } catch (error) {
      if (error instanceof Error && error.message.includes(' 404 ')) break;
      throw error;
    }
    const items = extract(payload);
    out.push(...items);
    if (items.length === 0) break;
  }
  return out;
}

export function asArray(payload: unknown): unknown[] {
  return Array.isArray(payload) ? payload : [];
}

export function asRecord(payload: unknown): Record<string, unknown> {
  return typeof payload === 'object' && payload !== null
    ? (payload as Record<string, unknown>)
    : {};
}

export function str(record: Record<string, unknown>, key: string, fallback = ''): string {
  const value = record[key];
  return typeof value === 'string' ? value : fallback;
}

export function bool(record: Record<string, unknown>, key: string, fallback = false): boolean {
  const value = record[key];
  return typeof value === 'boolean' ? value : fallback;
}

export interface AdapterContext {
  fetchImpl: FetchLike;
}

export function adapterNotVerified(): never {
  throw new Error('verifyRemote requires a connected provider adapter.');
}

export type { GitProviderAdapter };
