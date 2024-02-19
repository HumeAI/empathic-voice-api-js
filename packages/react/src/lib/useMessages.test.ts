import type { RenderHookResult } from '@testing-library/react-hooks';
import { act, renderHook } from '@testing-library/react-hooks';
import { beforeEach, describe, expect, it } from 'vitest';

import { useMessages } from './useMessages'; // adjust the import path as needed
import type { TranscriptMessage } from '..';

describe('useMessages hook', () => {
  let hook: RenderHookResult<unknown, ReturnType<typeof useMessages>>;
  let userMessage: TranscriptMessage;
  let assistantMessage: TranscriptMessage;

  beforeEach(() => {
    hook = renderHook(() => useMessages());
    userMessage = {
      type: 'user_message',
      message: {
        role: 'user',
        content: 'How is the weather today?',
      },
      models: [
        {
          model: 'prosody',
          entries: [
            {
              name: 'Amusement',
              score: 0.95,
            },
          ],
          time: {
            begin: 1633035600,
            end: 1633035620,
          },
        },
      ],
      receivedAt: new Date(),
    };
    assistantMessage = {
      type: 'assistant_message' as const,
      id: 'message_12345',
      message: {
        role: 'assistant' as const,
        content: 'Hey',
      },
      models: [
        {
          model: 'prosody',
          entries: [
            {
              name: 'Amusement',
              score: 0.98,
            },
          ],
          time: {
            begin: 1633035625,
            end: 1633035635,
          },
        },
      ],
      receivedAt: new Date(),
    };
  });

  it('should initialize with correct default states', () => {
    expect(hook.result.current.messages).toEqual([]);
    expect(hook.result.current.lastAssistantMessage).toBeNull();
    expect(hook.result.current.lastUserMessage).toBeNull();
  });

  it('should handle connection message creation', () => {
    act(() => {
      hook.result.current.createConnectMessage();
    });

    expect(hook.result.current.messages).toHaveLength(1);
    expect(hook.result.current.messages[0]?.type).toBe('socket_connected');
  });

  it('should handle disconnection message creation', () => {
    act(() => {
      hook.result.current.createDisconnectMessage();
    });

    expect(hook.result.current.messages).toHaveLength(1);
    expect(hook.result.current.messages[0]?.type).toBe('socket_disconnected');
  });

  it('should add user messages to `messages` immediately', () => {
    act(() => {
      hook.result.current.onTranscriptMessage(userMessage);
    });

    expect(hook.result.current.lastUserMessage).toEqual(userMessage);
    expect(hook.result.current.messages).toContainEqual(userMessage);
  });

  it('should add assistant messages to the assistant message map', () => {
    act(() => {
      hook.result.current.onTranscriptMessage(assistantMessage);
    });

    expect(hook.result.current.lastAssistantMessage).toBeNull();
    expect(hook.result.current.messages).not.toContainEqual(assistantMessage);
  });

  it('should expose the assistant message after the associated audio clip is played', () => {
    // add the message
    act(() => {
      hook.result.current.onTranscriptMessage(assistantMessage);
    });

    // simulate playing audio
    act(() => {
      hook.result.current.onPlayAudio(
        'id' in assistantMessage ? assistantMessage.id : '',
      );
    });

    expect(hook.result.current.lastAssistantMessage).toEqual(assistantMessage);
    expect(hook.result.current.messages).toContainEqual(assistantMessage);
  });

  it('should expose the assistant message after the associated audio clip is played', () => {
    act(() => {
      hook.result.current.onTranscriptMessage(assistantMessage); // First, add the message
    });

    act(() => {
      hook.result.current.onPlayAudio(
        'id' in assistantMessage ? assistantMessage.id : '',
      );
    });

    expect(hook.result.current.lastAssistantMessage).toEqual(assistantMessage);
    expect(hook.result.current.messages).toContainEqual(assistantMessage);
  });

  it('should only add assistant messages once', () => {
    act(() => {
      hook.result.current.onTranscriptMessage(assistantMessage); // First, add the message
    });

    act(() => {
      hook.result.current.onPlayAudio(
        'id' in assistantMessage ? assistantMessage.id : '',
      );
    });

    expect(hook.result.current.messages).toHaveLength(1);

    // play audio clip with the same ID as before
    act(() => {
      hook.result.current.onPlayAudio(
        'id' in assistantMessage ? assistantMessage.id : '',
      );
    });

    expect(hook.result.current.messages).toHaveLength(1);
  });

  it('should clear all messages and states on disconnect', () => {
    // First, add some messages and states
    act(() => {
      hook.result.current.createConnectMessage();
      hook.result.current.createDisconnectMessage();
    });

    // Then, disconnect
    act(() => {
      hook.result.current.disconnect();
    });

    expect(hook.result.current.messages).toHaveLength(0);
    expect(hook.result.current.lastAssistantMessage).toBeNull();
    expect(hook.result.current.lastUserMessage).toBeNull();
  });
});
