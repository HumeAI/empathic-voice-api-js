import { FC } from 'react';
import { ConversationFrame } from '@/components/ConversationFrame';
import { LayoutState, useLayoutStore } from '@/store/layout';
import { OpenButton } from '@/components/OpenButton';
import { useAssistant } from '@humeai/assistant-react';
import {
  AssistantAnimation,
  AssistantAnimationState,
} from '@/components/AssistantAnimation';

export type ViewsProps = {
  apiKey: string;
};

export const Views: FC<ViewsProps> = ({ apiKey }) => {
  const layoutState = useLayoutStore((store) => store.state);
  const open = useLayoutStore((store) => store.open);

  const { connect, fft } = useAssistant({ apiKey });

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
    <ConversationFrame>
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
