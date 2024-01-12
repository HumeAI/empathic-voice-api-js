import { describe, expect, it } from 'vitest';

import { createConfig } from '..';

describe('create-config', () => {
  it('creates a new config object with defaults', () => {
    const config = createConfig({
      apiKey: 'hume-api-key-1234',
    });

    expect(config).toMatchObject({
      apiKey: 'hume-api-key-1234',
      hostname: 'api.hume.ai',
      debug: false,
      reconnectAttempts: 30,
    });
  });

  it('throws an error if the API key is missing', () => {
    expect(() => {
      // @ts-expect-error - testing invalid input
      createConfig({});
    }).toThrow();
  });
});
