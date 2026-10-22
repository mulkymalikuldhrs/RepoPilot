import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { HistoryRelation } from '../domain/types';

export interface RemoteHeads {
  [branch: string]: string;
}

export interface RelationResult {
  relation: HistoryRelation;
  sourceHead: string;
  targetHead: string;
  detail: string;
}

function git(args: string[], cwd?: string): string {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    timeout: 300_000,
    maxBuffer: 64 * 1024 * 1024,
  });
}

export function lsRemoteHeads(remoteUrl: string): RemoteHeads {
  const output = git(['ls-remote', remoteUrl]);
  const heads: RemoteHeads = {};
  for (const line of output.split('\n')) {
    const [sha, ref] = line.trim().split(/\s+/);
    if (!sha || !ref) continue;
    if (ref.startsWith('refs/heads/')) {
      heads[ref.slice('refs/heads/'.length)] = sha;
    }
  }
  return heads;
}

/**
 * Compare source and target for one branch.
 *
 * in-sync       — identical heads
 * fast-forward  — target head is an ancestor of source head
 * diverged      — either side has unique commits, or the source would
 *                 move the target backwards (never regressed by RepoPilot)
 * unknown       — refs missing or Git inspection failed
 */
export function detectRelation(
  sourceUrl: string,
  targetUrl: string,
  branch: string,
): RelationResult {
  try {
    const sourceHeads = lsRemoteHeads(sourceUrl);
    const targetHeads = lsRemoteHeads(targetUrl);
    const sourceHead = sourceHeads[branch] ?? '';
    const targetHead = targetHeads[branch] ?? '';

    if (!sourceHead || !targetHead) {
      return {
        relation: 'unknown',
        sourceHead,
        targetHead,
        detail: `Branch ${branch} missing (source: ${Boolean(sourceHead)}, target: ${Boolean(targetHead)}).`,
      };
    }
    if (sourceHead === targetHead) {
      return { relation: 'in-sync', sourceHead, targetHead, detail: 'Heads identical.' };
    }

    const workdir = mkdtempSync(join(tmpdir(), 'repopilot-rel-'));
    try {
      git(['init', '--bare', '--quiet', workdir]);
      git(
        ['fetch', '--quiet', '--no-tags', sourceUrl, `+refs/heads/${branch}:refs/s/branch`],
        workdir,
      );
      git(
        ['fetch', '--quiet', '--no-tags', targetUrl, `+refs/heads/${branch}:refs/t/branch`],
        workdir,
      );
      const isAncestor = (older: string, newer: string): boolean => {
        try {
          git(['merge-base', '--is-ancestor', older, newer], workdir);
          return true;
        } catch {
          return false;
        }
      };
      if (isAncestor(targetHead, sourceHead)) {
        return {
          relation: 'fast-forward',
          sourceHead,
          targetHead,
          detail: 'Target can fast-forward to source.',
        };
      }
      if (isAncestor(sourceHead, targetHead)) {
        return {
          relation: 'diverged',
          sourceHead,
          targetHead,
          detail: 'Source is behind target; RepoPilot refuses to regress the target.',
        };
      }
      return {
        relation: 'diverged',
        sourceHead,
        targetHead,
        detail: 'Both sides contain unique commits.',
      };
    } finally {
      rmSync(workdir, { recursive: true, force: true });
    }
  } catch (error) {
    return {
      relation: 'unknown',
      sourceHead: '',
      targetHead: '',
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}
