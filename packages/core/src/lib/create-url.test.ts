import { describe, expect, test } from 'vitest';

import { createSocketConfig } from './create-socket-config';
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
    const config = createSocketConfig(cfg);

    expect(createSocketUrl(config)).toBe(
      `wss://api.hume.ai/v0/evi/chat?${config.auth.type}=${config.auth.value}`,
    );
  });

  test('creates a new socket URL with configId and configVersion', () => {
    const config = createSocketConfig({
      auth: {
        type: 'apiKey',
        value: 'testing',
      },
      configId: 'test-config-id',
      configVersion: 1,
    });
    expect(createSocketUrl(config)).toBe(
      `wss://api.hume.ai/v0/evi/chat?${config.auth.type}=${config.auth.value}&config_id=${config.configId}&config_version=${config.configVersion}`,
    );
  });
});
