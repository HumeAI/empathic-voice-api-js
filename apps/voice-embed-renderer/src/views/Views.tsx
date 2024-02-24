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
    </ConversationFrame>
  );
};
