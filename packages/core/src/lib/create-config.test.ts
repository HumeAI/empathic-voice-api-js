import { describe, expect, it } from 'vitest';

import { createConfig, MAX_SYSTEM_PROMPT_LENGTH } from '..';

describe('create-config', () => {
  it('creates a new config object with defaults', () => {
    const config = createConfig({
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
      speedRatio: 1.0,
    });
  });

  it('throws an error if the system prompt is too long', () => {
    expect(() => {
      createConfig({
        systemPrompt: 'a'.repeat(MAX_SYSTEM_PROMPT_LENGTH + 1),
        auth: {
          type: 'apiKey',
          value: 'hume-api-key-1234',
        },
      });
    }).toThrow();
  });

  it('throws an error if the API key is missing', () => {
    expect(() => {
      // @ts-expect-error - testing invalid input
      createConfig({});
    }).toThrow();
  });
});
