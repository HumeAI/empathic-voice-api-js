import { FC } from 'react';
import { ConversationFrame } from '@/components/ConversationFrame';
import { LayoutState, useLayoutStore } from '@/store/layout';
import { OpenButton } from '@/components/OpenButton';
import { useVoice } from '@humeai/voice-react';
import {
  VoiceAnimation,
  VoiceAnimationState,
} from '@/components/VoiceAnimation';
import { IntroScreen } from '@/components/IntroScreen';
import { Visualizer } from '@/components/Visualizer';
import { LastVoiceMessage } from '@/components/LastVoiceMessage';
import { Backdrop } from '@/components/WebGLBackdrop';

export type ViewsProps = Record<never, never>;

export const Views: FC<ViewsProps> = () => {
  const layoutState = useLayoutStore((store) => store.state);
  const open = useLayoutStore((store) => store.open);
  const close = useLayoutStore((store) => store.close);

  const {
    connect,
    disconnect,
    fft,
    status,
    lastVoiceMessage,
    messages,
    isPlaying,
    micFft,
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
            <IntroScreen
              onConnect={() => {
                void connect()
                  .then(() => {})
                  .catch((e) => {
                    console.error(e);
                  });
              }}
            />
          ) : (
            <>
              {/* <VoiceAnimation state={VoiceAnimationState.IDLE} fft={fft} /> */}
              {/* <LastVoiceMessage lastVoiceMessage={lastVoiceMessage} /> */}
              <Visualizer lastVoiceMessage={lastVoiceMessage} />
              {/* <Backdrop prosody={lastVoiceMessage?.models[0].entries ?? []} activeView={'talking'}/> */}
            </>
          )}
        </>
      )}
    </ConversationFrame>
  );
};
