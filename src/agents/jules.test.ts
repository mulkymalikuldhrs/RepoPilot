import { describe, expect, it } from 'vitest';
import { julesAdapter } from './jules';

describe('Jules adapter boundary', () => {
  it('reports unavailable instead of returning a fabricated session', async () => {
    await expect(
      julesAdapter.submitTask({
        repositoryUrl: 'https://github.com/acme/widget.git',
        branch: 'main',
        instructions: 'Run tests',
      }),
    ).rejects.toThrow('API calls are not implemented');
  });
});
