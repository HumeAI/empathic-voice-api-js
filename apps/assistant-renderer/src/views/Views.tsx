import { FC, useEffect, useRef } from 'react';
import { ConversationFrame } from '@/components/ConversationFrame';
import { LayoutState, useLayoutStore } from '@/store/layout';
import { OpenButton } from '@/components/OpenButton';
import { useAssistant } from '@humeai/assistant-react';
import {
  AssistantAnimation,
  AssistantAnimationState,
} from '@/components/AssistantAnimation';

export type ViewsProps = Record<never, never>;

export const Views: FC<ViewsProps> = () => {
  const layoutState = useLayoutStore((store) => store.state);
  const open = useLayoutStore((store) => store.open);
  const close = useLayoutStore((store) => store.close);

  const { connect, disconnect, fft, status, messages } = useAssistant();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (layoutState === LayoutState.CLOSED) {
    return (
      <>
        <OpenButton
          status={status.value}
          onPress={() => {
            void connect().then(() => {
              open();
            });
          }}
        />
      </>
    );
  }

  return (
    <ConversationFrame
      onClose={() => {
        close();
        disconnect();
      }}
    >
      {status.value === 'error' ? (
        <div className="text-center">Error: {status.reason}</div>
      ) : (
        <>
          <AssistantAnimation
            state={AssistantAnimationState.IDLE}
            prosody={{
              emotions: [],
            }}
            fft={fft}
          />
          <div>
            <div className="h-24 p-4 overflow-auto text-xs font-mono w-full">
              {messages.map((message, index) => {
                return (
                  <div key={index} className="pb-2 flex gap-2">
                    <div>{JSON.stringify(message, null, 2)}</div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </>
      )}
    </ConversationFrame>
  );
};
