import { AgentNotConfiguredError, type CodingAgentAdapter } from './types';

export const julesAdapter: CodingAgentAdapter = {
  id: 'jules',
  name: 'Google Jules',
  async submitTask() {
    throw new AgentNotConfiguredError(
      'Google Jules',
      'API calls are not implemented in this frontend foundation. Use a user-owned runner.',
    );
  },
};
