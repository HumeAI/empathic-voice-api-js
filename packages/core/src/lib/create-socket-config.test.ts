import { describe, expect, it } from 'vitest';

import { createSocketConfig } from '..';

describe('create-config', () => {
  it('creates a new config object with defaults', () => {
    const config = createSocketConfig({
      auth: {
        type: 'apiKey',
        value: 'hume-api-key-1234',
      },
    });

    expect(config).toMatchObject({
      auth: {
        type: 'apiKey',
        value: 'hume-api-key-1234',
      },
      hostname: 'api.hume.ai',
      debug: false,
      reconnectAttempts: 30,
    });
  });

  it('throws an error if the API key is missing', () => {
    expect(() => {
      // @ts-expect-error - testing invalid input
      createSocketConfig({});
    }).toThrow();
  });
});
