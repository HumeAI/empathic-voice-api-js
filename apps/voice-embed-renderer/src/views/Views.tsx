import { ConversationFrame } from '@/components/ConversationFrame';
import { OpenButton } from '@/components/OpenButton';
import { LayoutState, useLayoutStore } from '@/store/layout';
import { ConversationScreen } from '@/views/ConversationScreen';
import { ErrorScreen } from '@/views/ErrorScreen';
import { IntroScreen } from '@/views/IntroScreen';
import { useVoice } from '@humeai/voice-react';
import { FC } from 'react';

export type ViewsProps = Record<never, never>;

export const Views: FC<ViewsProps> = () => {
  const layoutState = useLayoutStore((store) => store.state);
  const open = useLayoutStore((store) => store.open);
  const close = useLayoutStore((store) => store.close);

  const { connect, disconnect, status } = useVoice();

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
        <ErrorScreen errorReason={status.reason} onConnect={onConnect} />
      ) : (
        <>
          {status.value === 'disconnected' ? (
            <IntroScreen onConnect={onConnect} />
          ) : (
            <ConversationScreen />
          )}
        </>
      )}
    </ConversationFrame>
  );
};
