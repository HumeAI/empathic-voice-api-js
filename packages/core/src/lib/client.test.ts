import { describe, expect, it } from 'vitest';

import { AssistantClient } from './client';
import { defaultConfig } from './create-config';

describe('client', () => {
  it('to start closed', () => {
    const client = AssistantClient.create({
      apiKey: 'test',
      ...defaultConfig,
    });

    client.on('message', (message) => {
      if (message.type === 'audio') {
        console.log('audio message');
      }

      if (message.type === 'assistant_message') {
        console.log('assistant message');
      }

      if (message.type === 'user_message') {
        console.log('user message');
      }
    });

    expect(client.readyState).toBe(3);
  });
});
