/**
 * RepoPilot user-owned runner CLI.
 *
 * Commands:
 *   inventory          List repositories from every configured provider.
 *   plan --auto        Group mirrors by name, pick newest source, detect
 *                      history relations, emit an approvable plan (dry-run).
 *   apply --plan F     Execute approved pushes. Requires --approve and a
 *                      plan produced by `plan`. Never force-pushes; a plain
 *                      push only lands if the remote allows fast-forward.
 *
 * Credentials come from the environment only (see src/runner/credentials.ts)
 * and are redacted from all output. Plan files contain no credentials.
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { authenticatedUrl, loadCredentials, redact, type RunnerCredentials } from './credentials';
import { createProviderAdapters } from '../providers/registry';
import { CodebergAdapter } from '../providers/codeberg';
import type { GitProviderAdapter } from '../providers/types';
import type { PolicyRestriction, ProviderId, RepositoryConfig } from '../domain/types';
import { createSyncPlan, defaultSyncPolicy, type SyncPlan } from '../domain/sync-policy';
import { detectRelation } from './relation';
import { metadataRestrictions, restrictionFromRejection } from './rejection';

interface RunnerRepo extends RepositoryConfig {
  fullName: string;
  head?: string;
  restrictions?: PolicyRestriction[];
}

interface PlanTarget {
  platform: ProviderId;
  account: string;
  fullName: string;
  remoteUrl: string;
  head: string;
  relation: string;
  detail: string;
  decision: SyncPlan['decision'] | 'pending';
  reason: string;
  restrictions: PolicyRestriction[];
}

interface PlanEntry {
  key: string;
  branch: string;
  source: {
    platform: ProviderId;
    account: string;
    fullName: string;
    remoteUrl: string;
    head: string;
    pushedAt: string;
  };
  targets: PlanTarget[];
}

interface SyncPlanFile {
  version: 1;
  createdAt: string;
  generator: 'repopilot-runner';
  mode: 'auto';
  exclusions: string[];
  entries: PlanEntry[];
  results?: AppliedResult[];
}

interface AppliedResult {
  target: string;
  branch: string;
  outcome: 'written' | 'verified' | 'skipped' | 'policy-blocked' | 'failed';
  message: string;
}

const GITLAB_PACING_MS = Number(process.env.REPOPILOT_GITLAB_PACING_MS ?? 30000);
const MAX_ATTEMPTS = 3;

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      args[key] = next;
      i++;
    } else {
      args[key] = true;
    }
  }
  return args;
}

function git(args: string[], options: { cwd?: string } = {}): { stdout: string; stderr: string } {
  try {
    const stdout = execFileSync('git', args, {
      encoding: 'utf8',
      timeout: 600_000,
      maxBuffer: 256 * 1024 * 1024,
      ...options,
    });
    return { stdout, stderr: '' };
  } catch (error) {
    const err = error as { stderr?: string; message: string };
    return { stdout: '', stderr: err.stderr ?? err.message };
  }
}

function platformToken(creds: RunnerCredentials, platform: ProviderId): string | null {
  switch (platform) {
    case 'github':
      return creds.github[0] ?? null;
    case 'gitlab':
      return creds.gitlab[0] ?? null;
    case 'codeberg':
      return creds.codeberg[0] ?? null;
    default:
      return null;
  }
}

function authenticatedFor(
  repo: RunnerRepo,
  creds: RunnerCredentials,
  codebergUsernames: Map<string, string>,
): string {
  const token = platformToken(creds, repo.provider);
  if (!token) return repo.remoteUrl;
  if (repo.provider === 'codeberg') {
    const username = codebergUsernames.get(token) ?? '';
    return authenticatedUrl('codeberg', repo.remoteUrl, token, username);
  }
  return authenticatedUrl(repo.provider as 'github' | 'gitlab', repo.remoteUrl, token);
}

function allTokens(creds: RunnerCredentials): string[] {
  return [...creds.github, ...creds.gitlab, ...creds.codeberg];
}

async function collectRepos(
  adapters: Partial<Record<ProviderId, GitProviderAdapter>>,
): Promise<RunnerRepo[]> {
  const repos: RunnerRepo[] = [];
  const failures: string[] = [];
  for (const [providerId, adapter] of Object.entries(adapters)) {
    try {
      const list = await adapter.listRepositories();
      console.error(`[inventory] ${providerId}: ${list.length} repositories`);
      repos.push(
        ...list.map((r) => ({
          ...r,
          fullName: r.fullName ?? `${r.account}/${r.name}`,
        })),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${providerId}: ${message}`);
      console.error(`[inventory] ${providerId} FAILED (continuing): ${message}`);
    }
  }
  if (failures.length > 0) {
    console.error(
      `[inventory] providers with errors: ${failures.length}/${Object.keys(adapters).length}`,
    );
  }
  return repos;
}

function normalizeKey(name: string): string {
  return name.trim().toLowerCase();
}

function pickSource(members: RunnerRepo[]): RunnerRepo {
  return [...members].sort((a, b) => {
    const at = a.pushedAt ?? '';
    const bt = b.pushedAt ?? '';
    if (at !== bt) return at < bt ? 1 : -1;
    return a.fullName.localeCompare(b.fullName);
  })[0];
}

async function cmdInventory(args: Record<string, string | boolean>): Promise<void> {
  const creds = loadCredentials();
  const adapters = createProviderAdapters(creds);
  const repos = await collectRepos(adapters);
  if (args.json) {
    console.log(JSON.stringify(repos, null, 2));
    return;
  }
  for (const repo of repos.sort((a, b) => a.fullName.localeCompare(b.fullName))) {
    const flags = [repo.visibility ?? 'public', repo.archived ? 'archived' : '']
      .filter(Boolean)
      .join(',');
    console.log(
      `${repo.provider.padEnd(8)} ${repo.fullName.padEnd(48)} ${repo.defaultBranch.padEnd(10)} ${flags}`,
    );
  }
  console.error(`[inventory] total: ${repos.length}`);
}

async function cmdPlan(args: Record<string, string | boolean>): Promise<void> {
  if (!args.auto) fail('only --auto planning is supported in this release');
  const creds = loadCredentials();
  const adapters = createProviderAdapters(creds);
  const exclusions = String(args.exclusions ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const repos = await collectRepos(adapters);
  const restrictions = metadataRestrictions(
    repos.map((r) => ({
      provider: r.provider,
      fullName: r.fullName,
      archived: Boolean(r.archived),
    })),
  );

  const groups = new Map<string, RunnerRepo[]>();
  for (const repo of repos) {
    if (
      exclusions.some(
        (e) => normalizeKey(repo.name).includes(e) || repo.fullName.toLowerCase().includes(e),
      )
    ) {
      continue;
    }
    const key = normalizeKey(repo.name);
    const group = groups.get(key) ?? [];
    group.push(repo);
    groups.set(key, group);
  }

  const entries: PlanEntry[] = [];
  for (const [key, members] of groups) {
    if (members.length < 2) continue;
    const source = pickSource(members);
    const branch = args.branch ? String(args.branch) : source.defaultBranch;

    const sourceHeads = probeHeads(source);
    const sourceHead = sourceHeads.get(branch) ?? '';
    const targets: PlanTarget[] = [];

    for (const target of members) {
      if (target.id === source.id) continue;
      const targetRestrictions = restrictions.filter(
        (r) => r.platform === target.provider && r.repository === target.fullName,
      );
      const relation = detectRelation(source.remoteUrl, target.remoteUrl, branch);
      const targetHead = relation.targetHead;
      const observation = {
        relation: relation.relation,
        sourceCommit: sourceHead || relation.sourceHead,
        destinationCommit: targetHead,
      };
      // Plan always assumes writes need a person: dry-run disabled, writes
      // enabled, approval required => fast-forward targets land as
      // `approval-required`, everything else is blocked/policy-blocked.
      const policy = {
        ...defaultSyncPolicy(branch),
        dryRun: false,
        writesEnabled: true,
        requireApproval: true,
      };
      const plan = createSyncPlan(policy, observation, false, targetRestrictions);
      targets.push({
        platform: target.provider,
        account: target.account,
        fullName: target.fullName,
        remoteUrl: target.remoteUrl,
        head: targetHead,
        relation: relation.relation,
        detail: relation.detail,
        decision: plan.decision,
        reason: plan.reason,
        restrictions: targetRestrictions,
      });
    }

    if (targets.length === 0) continue;
    entries.push({
      key,
      branch,
      source: {
        platform: source.provider,
        account: source.account,
        fullName: source.fullName,
        remoteUrl: source.remoteUrl,
        head: sourceHead,
        pushedAt: source.pushedAt ?? '',
      },
      targets,
    });
  }

  const planFile: SyncPlanFile = {
    version: 1,
    createdAt: new Date().toISOString(),
    generator: 'repopilot-runner',
    mode: 'auto',
    exclusions,
    entries,
  };

  const outPath = typeof args.out === 'string' ? args.out : 'repopilot-plan.json';
  writeFileSync(outPath, JSON.stringify(planFile, null, 2));
  console.log(
    redact(JSON.stringify({ out: outPath, entries: entries.length }, null, 2), allTokens(creds)),
  );
  for (const entry of entries) {
    console.error(`[plan] ${entry.key} <- ${entry.source.fullName} (${entry.branch})`);
    for (const target of entry.targets) {
      console.error(
        `  -> ${target.platform}:${target.fullName} [${target.relation}] ${target.decision}`,
      );
    }
  }
}

function probeHeads(repo: RunnerRepo): Map<string, string> {
  const { stdout, stderr } = git(['ls-remote', '--heads', repo.remoteUrl]);
  const heads = new Map<string, string>();
  for (const line of stdout.split('\n')) {
    const [sha, ref] = line.trim().split(/\s+/);
    if (sha && ref?.startsWith('refs/heads/')) {
      heads.set(ref.slice('refs/heads/'.length), sha);
    }
  }
  if (heads.size === 0 && stderr) {
    console.error(redact(`[warn] ls-remote failed for ${repo.fullName}: ${stderr}`, []));
  }
  return heads;
}

async function cmdApply(args: Record<string, string | boolean>): Promise<void> {
  if (!args.approve) fail('apply requires --approve; plans are never executed implicitly');
  const planPath = typeof args.plan === 'string' ? args.plan : '';
  if (!planPath) fail('apply requires --plan <file>');
  const mode = args.mode === 'mirror' ? 'mirror' : 'branch';
  const targetFilter = String(args.targets ?? '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const plan = JSON.parse(readFileSync(planPath, 'utf8')) as SyncPlanFile;
  const creds = loadCredentials();

  const codebergUsernames = new Map<string, string>();
  if (creds.codeberg.length > 0) {
    const adapter = new CodebergAdapter(creds.codeberg);
    for (const token of creds.codeberg) {
      try {
        codebergUsernames.set(token, await adapter.loginFor(token));
      } catch {
        // username stays empty; push URLs still work with empty user for token auth
      }
    }
  }

  const results: AppliedResult[] = [];
  let gitlabPushes = 0;

  for (const entry of plan.entries) {
    for (const target of entry.targets) {
      const targetKey = `${target.platform}:${target.fullName}`.toLowerCase();
      if (targetFilter.length > 0 && !targetFilter.includes(targetKey)) {
        results.push({
          target: targetKey,
          branch: entry.branch,
          outcome: 'skipped',
          message: 'excluded by --targets filter',
        });
        continue;
      }
      if (target.decision !== 'approval-required') {
        results.push({
          target: targetKey,
          branch: entry.branch,
          outcome: 'skipped',
          message: `decision=${target.decision}`,
        });
        continue;
      }

      const sourceRepo: RunnerRepo = {
        id: `source:${entry.source.fullName.toLowerCase()}`,
        name: entry.key,
        fullName: entry.source.fullName,
        provider: entry.source.platform,
        account: entry.source.account,
        remoteUrl: entry.source.remoteUrl,
        defaultBranch: entry.branch,
        createdAt: '',
        verification: 'verified',
      };
      const targetRepo: RunnerRepo = {
        id: `target:${target.fullName.toLowerCase()}`,
        name: entry.key,
        fullName: target.fullName,
        provider: target.platform,
        account: target.account,
        remoteUrl: target.remoteUrl,
        defaultBranch: entry.branch,
        createdAt: '',
        verification: 'verified',
        restrictions: target.restrictions,
      };

      const outcome = await pushWithRetry(
        sourceRepo,
        targetRepo,
        entry,
        mode,
        creds,
        codebergUsernames,
      );
      results.push({ target: targetKey, branch: entry.branch, ...outcome });
      if (outcome.outcome === 'written' || outcome.outcome === 'verified') {
        target.decision = 'planned-write';
        target.reason = outcome.message;
      } else if (outcome.outcome === 'policy-blocked') {
        target.decision = 'policy-blocked';
        target.reason = outcome.message;
      }

      if (target.platform === 'gitlab' && ++gitlabPushes < plan.entries.length * 2) {
        await sleep(GITLAB_PACING_MS);
      }
    }
  }

  plan.results = results;
  const resultPath = `${planPath.replace(/\.json$/, '')}.applied.json`;
  writeFileSync(resultPath, JSON.stringify(plan, null, 2));
  const failed = results.filter(
    (r) => r.outcome === 'failed' || r.outcome === 'policy-blocked',
  ).length;
  console.log(redact(JSON.stringify({ resultPath, results }, null, 2), allTokens(creds)));
  if (failed > 0) process.exitCode = 1;
}

async function pushWithRetry(
  source: RunnerRepo,
  target: RunnerRepo,
  entry: PlanEntry,
  mode: 'branch' | 'mirror',
  creds: RunnerCredentials,
  codebergUsernames: Map<string, string>,
): Promise<{ outcome: AppliedResult['outcome']; message: string }> {
  const sourceUrl = authenticatedFor(source, creds, codebergUsernames);
  const targetUrl = authenticatedFor(target, creds, codebergUsernames);
  const tokens = allTokens(creds);
  const workdir = mkdtempSync(join(tmpdir(), 'repopilot-apply-'));
  let lastStderr = '';

  try {
    const cloneArgs =
      mode === 'mirror'
        ? ['clone', '--mirror', '--quiet', sourceUrl, 'mirror.git']
        : ['clone', '--quiet', '--no-checkout', '--filter=blob:none', sourceUrl, 'repo.git'];
    const cloneResult = git(cloneArgs, { cwd: workdir });
    if (cloneResult.stderr && cloneResult.stderr.includes('fatal')) {
      return {
        outcome: 'failed',
        message: redact(`source clone failed: ${cloneResult.stderr}`, tokens),
      };
    }
    const repoDir = join(workdir, mode === 'mirror' ? 'mirror.git' : 'repo.git');

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const pushArgs =
        mode === 'mirror'
          ? ['push', '--mirror', targetUrl]
          : ['push', targetUrl, `refs/heads/${entry.branch}:refs/heads/${entry.branch}`];
      const pushResult = git(pushArgs, { cwd: repoDir });
      if (!pushResult.stderr || !isRejection(pushResult.stderr)) {
        if (pushResult.stderr) {
          console.error(redact(`[push] ${pushResult.stderr}`, tokens));
        }
        const verify = git(['ls-remote', '--heads', targetUrl, `refs/heads/${entry.branch}`]);
        const newHead = verify.stdout.trim().split(/\s+/)[0] ?? '';
        if (newHead && newHead === (entry.source.head || '')) {
          return {
            outcome: 'verified',
            message: `target ${entry.branch} now at ${newHead.slice(0, 12)}`,
          };
        }
        return { outcome: 'written', message: 'push accepted (head verification inconclusive)' };
      }
      lastStderr = pushResult.stderr;
      const restriction = restrictionFromRejection(target.provider, target.fullName, lastStderr);
      if (restriction) {
        if (!target.restrictions) target.restrictions = [];
        target.restrictions.push(restriction);
        return {
          outcome: 'policy-blocked',
          message: redact(`${restriction.kind}: ${restriction.message}`, tokens),
        };
      }
      if (attempt < MAX_ATTEMPTS) {
        await sleep(5000 * attempt);
      }
    }
    return {
      outcome: 'failed',
      message: redact(`push failed after ${MAX_ATTEMPTS} attempts: ${lastStderr}`, tokens),
    };
  } finally {
    rmSync(workdir, { recursive: true, force: true });
  }
}

function isRejection(stderr: string): boolean {
  return /fatal|error:|denied|declined|rejected|gh013|403/i.test(stderr);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);
  switch (command) {
    case 'inventory':
      await cmdInventory(args);
      break;
    case 'plan':
      await cmdPlan(args);
      break;
    case 'apply':
      await cmdApply(args);
      break;
    default:
      fail('usage: repopilot-runner <inventory|plan|apply> [options]');
  }
}

/** Only auto-run when executed directly (not under vitest imports). */
const isDirectRun = process.argv[1]?.endsWith('cli.ts') ?? false;
if (isDirectRun) void main();

/** Exported for unit tests. */
export const __internals = {
  normalizeKey,
  pickSource,
  parseArgs,
};
