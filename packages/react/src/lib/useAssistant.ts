import { useEffect, useRef, useState } from 'react';
import { AssistantClient, Config, Message } from '@humeai/assistant';

export const useAssistant = (props: { config: Config }) => {
  const config = useRef<Config>(props.config);
  config.current = props.config;

  const client = useRef<AssistantClient | null>(null);

  const [state, setState] = useState<'idle' | 'connecting' | 'open' | 'closed'>(
    'idle',
  );
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    client.current = AssistantClient.create(config.current);

    client.current.on('open', () => {
      setState('open');
    });

    client.current.on('message', (message) => {
      setMessages((prev) => {
        return prev.concat([message]);
      });
    });

    client.current.on('close', () => {
      setState('closed');
    });

    client.current.on('error', () => {});

    setState('connecting');

    client.current.connect();

    return () => {
      client.current?.disconnect();
    };
  }, []);

  return {
    state,
    messages,
  };
};
