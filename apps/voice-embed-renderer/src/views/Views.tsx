import { FC } from 'react';
import { ConversationFrame } from '@/components/ConversationFrame';
import { LayoutState, useLayoutStore } from '@/store/layout';
import { OpenButton } from '@/components/OpenButton';
import { useVoice } from '@humeai/voice-react';
import { VoiceAnimationState } from '@/components/VoiceAnimation';
import { IntroScreen } from '@/components/IntroScreen';
import { Backdrop } from '@/components/WebGLBackdrop';
import { LastVoiceMessage } from '@/components/LastVoiceMessage';
import { WebGLAvatar } from '@/components/WebGLAvatar';
import { WaitingPrompt } from '@/components/WaitingPrompt';

export type ViewsProps = Record<never, never>;

export const Views: FC<ViewsProps> = () => {
  const layoutState = useLayoutStore((store) => store.state);
  const open = useLayoutStore((store) => store.open);
  const close = useLayoutStore((store) => store.close);

  const {
    connect,
    disconnect,
    status,
    lastVoiceMessage,
    isPlaying,
    micFft,
    lastUserMessage,
  } = useVoice();

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

  const onConnect = () => {
    void connect()
      .then(() => {})
      .catch((e) => {
        console.error(e);
      });
  };

  return (
    <ConversationFrame
      onClose={() => {
        close();
        disconnect();
      }}
    >
      {status.value === 'error' ? (
        <div className="flex flex-col items-center justify-center">
          <div className="text-center">Sorry, we had to end your session.</div>
          <div>Error: {status.reason}</div>
          <div className="pt-4">
            <button
              className={
                'flex h-[36px] items-center justify-center rounded-full border border-gray-700 bg-gray-800 px-4 text-base font-medium text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white focus:outline-none'
              }
              onClick={onConnect}
            >
              Reconnect
            </button>
          </div>
        </div>
      ) : (
        <>
          {status.value === 'disconnected' ? (
            <IntroScreen onConnect={onConnect} />
          ) : (
            <>
              <LastVoiceMessage lastVoiceMessage={lastVoiceMessage} />
              {!lastUserMessage ? (
                <WaitingPrompt />
              ) : (
                <WebGLAvatar
                  fft={micFft}
                  isPlaying={isPlaying}
                  prosody={lastVoiceMessage?.models[0].entries ?? []}
                  width={400}
                  height={200}
                />
              )}
              <Backdrop
                prosody={lastVoiceMessage?.models[0].entries ?? []}
                activeView={VoiceAnimationState.IDLE}
              />
            </>
          )}
        </>
      )}
    </ConversationFrame>
  );
};
