import { describe, expect, test } from 'vitest';

import { createConfig } from './create-config';
import { createSocketUrl } from './create-url';

describe('create-url', () => {
  test('createSocketUrl', () => {
    const config = createConfig({
      apiKey: 'hume-api-key-1234',
    });

    expect(createSocketUrl(config)).toBe(
      `wss://api.hume.ai/v0/assistant/chat?access_token=${config.apiKey}`,
    );
  });
});
