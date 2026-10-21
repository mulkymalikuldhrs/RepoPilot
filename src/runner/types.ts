export interface RunnerJob {
  repositoryId: string;
  workflowRunId?: string;
  action: 'sync-dry-run' | 'repair-check';
}

export interface RunnerAdapter {
  readonly name: string;
  readonly executionOwner: 'user';
  dispatch(job: RunnerJob): Promise<never>;
}

export class RunnerNotConfiguredError extends Error {
  constructor() {
    super('No user-owned runner is configured. No job was started.');
    this.name = 'RunnerNotConfiguredError';
  }
}

export const unconfiguredRunner: RunnerAdapter = {
  name: 'User-owned workflow',
  executionOwner: 'user',
  async dispatch() {
    throw new RunnerNotConfiguredError();
  },
};
