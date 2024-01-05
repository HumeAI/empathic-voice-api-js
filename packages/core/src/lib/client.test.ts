import { describe, it } from 'vitest';
import { AssistantClient } from './client';
import { defaultConfig } from './create-config';

describe('client', () => {
  it('should have a url', () => {
    const client = AssistantClient.create({
      apiKey: 'test',
      ...defaultConfig,
    });

    client.on('message', (message) => {
      if (message.type === 'audio') {
        console.log('audio message');
      }

      if (message.type === 'transcript') {
        console.log('transcript message');
      }
    });

    client.connect();

    client.sendAudio(new ArrayBuffer(0));
  });
});
