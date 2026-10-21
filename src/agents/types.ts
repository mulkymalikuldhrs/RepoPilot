export interface CodingTask {
  repositoryUrl: string;
  branch: string;
  instructions: string;
}

export interface AgentSession {
  sessionId: string;
  state: 'queued' | 'running' | 'completed' | 'failed' | 'unknown';
}

export interface CodingAgentAdapter {
  readonly id: string;
  readonly name: string;
  submitTask(task: CodingTask): Promise<AgentSession>;
}

export class AgentNotConfiguredError extends Error {
  constructor(agentName: string, detail: string) {
    super(`${agentName} is not configured: ${detail}`);
    this.name = 'AgentNotConfiguredError';
  }
}
