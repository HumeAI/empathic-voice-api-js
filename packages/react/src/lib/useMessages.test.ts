import type {
  AssistantTranscriptMessage,
  UserTranscriptMessage,
} from '@humeai/voice';
import type { RenderHookResult } from '@testing-library/react-hooks';
import { act, renderHook } from '@testing-library/react-hooks';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useMessages } from './useMessages'; // adjust the import path as needed

describe('useMessages hook', () => {
  let hook: RenderHookResult<unknown, ReturnType<typeof useMessages>>;
  let userMessage: UserTranscriptMessage;
  let agentMessage: AssistantTranscriptMessage;

  const sendMessageToParent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    hook = renderHook(() => useMessages({ sendMessageToParent }));
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
    agentMessage = {
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
    expect(hook.result.current.lastVoiceMessage).toBeNull();
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
      hook.result.current.onMessage(userMessage);
    });

    expect(hook.result.current.lastUserMessage).toEqual(userMessage);
    expect(hook.result.current.messages).toContainEqual(userMessage);
  });

  it('should add voice messages to the voice message map', () => {
    act(() => {
      hook.result.current.onMessage(agentMessage);
    });

    expect(hook.result.current.lastVoiceMessage).toBeNull();
    expect(hook.result.current.messages).not.toContainEqual(agentMessage);
  });

  it('should expose the voice message after the associated audio clip is played', () => {
    // add the message
    act(() => {
      hook.result.current.onMessage(agentMessage);
    });

    // simulate playing audio
    act(() => {
      hook.result.current.onPlayAudio(
        'id' in agentMessage ? agentMessage.id : '',
      );
    });

    expect(hook.result.current.lastVoiceMessage).toEqual(agentMessage);
    expect(hook.result.current.messages).toContainEqual(agentMessage);
  });

  it('should expose the voice message after the associated audio clip is played', () => {
    act(() => {
      hook.result.current.onMessage(agentMessage); // First, add the message
    });

    act(() => {
      hook.result.current.onPlayAudio(
        'id' in agentMessage ? agentMessage.id : '',
      );
    });

    expect(hook.result.current.lastVoiceMessage).toEqual(agentMessage);
    expect(hook.result.current.messages).toContainEqual(agentMessage);
  });

  it('should only add voice messages once', () => {
    act(() => {
      hook.result.current.onMessage(agentMessage); // First, add the message
    });

    act(() => {
      hook.result.current.onPlayAudio(
        'id' in agentMessage ? agentMessage.id : '',
      );
    });

    expect(hook.result.current.messages).toHaveLength(1);

    // play audio clip with the same ID as before
    act(() => {
      hook.result.current.onPlayAudio(
        'id' in agentMessage ? agentMessage.id : '',
      );
    });

    expect(hook.result.current.messages).toHaveLength(1);
  });

  it('should call the sendMessageToParent callback when the associated audio clip plays', () => {
    act(() => {
      hook.result.current.onMessage(agentMessage);
    });

    act(() => {
      hook.result.current.onPlayAudio(
        'id' in agentMessage ? agentMessage.id : '',
      );
    });

    expect(sendMessageToParent).toHaveBeenCalledWith(agentMessage);
  });

  it('should clear all messages and states on disconnect', () => {
    // First, add some messages and states
    act(() => {
      hook.result.current.createConnectMessage();
      hook.result.current.createDisconnectMessage();
    });

    // Then, disconnect
    act(() => {
      hook.result.current.clearMessages();
    });

    expect(hook.result.current.messages).toHaveLength(0);
    expect(hook.result.current.lastVoiceMessage).toBeNull();
    expect(hook.result.current.lastUserMessage).toBeNull();
  });
});
