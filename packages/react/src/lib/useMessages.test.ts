// import { describe, it, expect, beforeEach, vi } from 'vitest';
// import { renderHook, act } from '@testing-library/react-hooks';
// import { useMessages } from './useMessages'; // adjust the import path as needed
// import { RenderResult } from '@testing-library/react';

// describe('useMessages hook', () => {
//   let result;

//   beforeEach(() => {
//     const { result: hookResult } = renderHook(() => useMessages());
//     result = hookResult;
//   });

//   it('should initialize with correct default states', () => {
//     expect(result.current.messages).toEqual([]);
//     expect(result.current.lastAssistantMessage).toBeNull();
//     expect(result.current.lastUserMessage).toBeNull();
//   });

//   it('should handle connection message creation', () => {
//     act(() => {
//       result.current.createConnectMessage();
//     });

//     expect(result.current.messages).toHaveLength(1);
//     expect(result.current.messages[0].type).toBe('socket_connected');
//   });

//   it('should handle disconnection message creation', () => {
//     act(() => {
//       result.current.createDisconnectMessage();
//     });

//     expect(result.current.messages).toHaveLength(1);
//     expect(result.current.messages[0].type).toBe('socket_disconnected');
//   });

//   it('should handle transcript messages for assistant and user', () => {
//     const assistantMessage = {
//       id: '1',
//       type: 'assistant_message',
//       content: 'Hello',
//     };
//     const userMessage = { id: '2', type: 'user_message', content: 'Hi there!' };

//     act(() => {
//       result.current.onTranscriptMessage(assistantMessage);
//     });

//     expect(result.current.lastAssistantMessage).toBeNull(); // Assistant messages do not update lastAssistantMessage
//     expect(result.current.messages).toContainEqual(assistantMessage);

//     act(() => {
//       result.current.onTranscriptMessage(userMessage);
//     });

//     expect(result.current.lastUserMessage).toEqual(userMessage);
//     expect(result.current.messages).toContainEqual(userMessage);
//   });

//   it('should handle playing audio from an assistant message', () => {
//     const assistantMessage = {
//       id: '3',
//       type: 'assistant_message',
//       content: 'Playing audio',
//     };

//     act(() => {
//       result.current.onTranscriptMessage(assistantMessage); // First, add the message
//     });

//     act(() => {
//       result.current.onPlayAudio(assistantMessage.id); // Then, simulate playing audio
//     });

//     expect(result.current.lastAssistantMessage).toEqual(assistantMessage);
//     // Verify the message is still in the messages array only once
//     expect(
//       result.current.messages.filter((msg) => msg.id === assistantMessage.id),
//     ).toHaveLength(1);
//   });

//   it('should clear all messages and states on disconnect', () => {
//     // First, add some messages and states
//     act(() => {
//       result.current.createConnectMessage();
//       result.current.createDisconnectMessage();
//     });

//     // Then, disconnect
//     act(() => {
//       result.current.disconnect();
//     });

//     expect(result.current.messages).toHaveLength(0);
//     expect(result.current.lastAssistantMessage).toBeNull();
//     expect(result.current.lastUserMessage).toBeNull();
//   });
// });
