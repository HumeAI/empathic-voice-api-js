import { FC } from 'react';
import { ConversationFrame } from '@/components/ConversationFrame';
import { LayoutState, useLayoutStore } from '@/store/layout';
import { OpenButton } from '@/components/OpenButton';
import { useVoice } from '@humeai/voice-react';
import {
  VoiceAnimation,
  VoiceAnimationState,
} from '@/components/VoiceAnimation';
import { MessageConsole } from '@/components/MessageConsole';

export type ViewsProps = Record<never, never>;

export const Views: FC<ViewsProps> = () => {
  const layoutState = useLayoutStore((store) => store.state);
  const open = useLayoutStore((store) => store.open);
  const close = useLayoutStore((store) => store.close);

  const { connect, disconnect, fft, status, messages } = useVoice();

  if (layoutState === LayoutState.CLOSED) {
    return (
      <>
        <OpenButton
          status={status.value}
          onPress={() => {
            open();
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
          {status.value === 'disconnected' ? (
            <div className="flex flex-col gap-4 px-4">
              <h2 className="text-3xl font-medium">Hello, there!</h2>
              <p className="">
                I'm <span className="font-medium">EVI</span>, the Hume Empathic
                Voice Interface. I'm here to answer any questions you have about
                the Hume website, or just to chat.
              </p>
              <button
                className={
                  'flex h-[36px] items-center justify-center rounded-full border border-gray-700 bg-gray-800 text-base font-medium text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white focus:outline-none'
                }
                onClick={() => {
                  void connect();
                }}
              >
                Start Conversation
              </button>
            </div>
          ) : (
            <>
              <VoiceAnimation
                state={VoiceAnimationState.IDLE}
                prosody={{
                  emotions: [],
                }}
                fft={fft}
              />
              <MessageConsole messages={messages} />
            </>
          )}
        </>
      )}
    </ConversationFrame>
  );
};
