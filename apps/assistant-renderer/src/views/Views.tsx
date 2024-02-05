import { FC } from 'react';
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

  const { connect, disconnect, fft } = useAssistant();

  if (layoutState === LayoutState.CLOSED) {
    return (
      <OpenButton
        onPress={() => {
          open();
          connect();
        }}
      />
    );
  }

  return (
    <ConversationFrame
      onClose={() => {
        close();
        disconnect();
      }}
    >
      <AssistantAnimation
        state={AssistantAnimationState.IDLE}
        prosody={{
          emotions: [],
        }}
        fft={fft}
      />
      {/* <div>readystate: {readyState}</div> */}
    </ConversationFrame>
  );
};
