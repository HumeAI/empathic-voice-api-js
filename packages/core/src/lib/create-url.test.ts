import { describe, expect, test } from 'vitest';

import { createConfig } from './create-config';
import { createSocketUrl } from './create-url';

describe('create-url', () => {
  test.each([
    {
      auth: {
        type: 'apiKey',
        value: 'hume-api-key-1234',
      },
    } as const,
    {
      auth: {
        type: 'accessToken',
        value: 'hume-access-token-1234',
      },
    } as const,
  ])('createSocketUrl', (cfg) => {
    const config = createConfig(cfg);

    expect(createSocketUrl(config)).toBe(
      `wss://api.hume.ai/v0/assistant/chat?no_binary=true&${config.auth.type}=${
        config.auth.value
      }&tts=${config.tts.toString()}`,
    );
  });
});
