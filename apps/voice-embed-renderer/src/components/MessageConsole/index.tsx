import { useEffect, useMemo, useRef } from 'react';
import type {
  AgentTranscriptMessage,
  UserTranscriptMessage,
  useVoice,
} from '@humeai/voice-react';
import { match } from 'ts-pattern';

export const MessageConsole = ({
  messages,
}: {
  messages: ReturnType<typeof useVoice>['messages'];
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formattedMessages = useMemo(() => {
    return messages.reduce<
      {
        sender: 'user' | 'assistant';
        message: UserTranscriptMessage | AgentTranscriptMessage;
      }[]
    >((state, message) => {
      if (
        message.type === 'socket_connected' ||
        message.type === 'socket_disconnected' ||
        message.type === 'user_interruption' ||
        message.type === 'error'
      ) {
        return state;
      }

      const sender = match(message.type)
        .with('user_message', () => 'user' as const)
        .with('assistant_message', () => 'assistant' as const)
        .otherwise(() => null);

      if (sender === null) {
        return state;
      }

      return state.concat([
        {
          sender,
          message,
        },
      ]);
    }, []);
  }, [messages]);

  return (
    <div className="h-64 w-full overflow-auto rounded-md px-6">
      {formattedMessages.map(({ message, sender }, index) => {
        return (
          <div
            key={index}
            className="flex w-full flex-row flex-wrap items-start pb-3"
          >
            <div className={'w-full'}>
              <div className={'font-mono text-[10px] uppercase text-gray-500'}>
                {sender}
              </div>
            </div>
            <div className={'pr-4 text-sm font-medium'}>
              {message.message.content}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
