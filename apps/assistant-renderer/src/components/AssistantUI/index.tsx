import { FC } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ConversationUI } from '../ConversationUI';
import { LayoutState, useLayoutStore } from '../../store/layout';
import { Frame } from '../Frame';
import { P, match } from 'ts-pattern';
import { OpenButton } from '../OpenButton';

export type AssistantUIProps = {
  apiKey: string;
};

export const AssistantUI: FC<AssistantUIProps> = ({ apiKey }) => {
  const layoutState = useLayoutStore((store) => store.state);

  return (
    <Frame state={layoutState}>
      <AnimatePresence mode={'wait'}>
        {match(layoutState)
          .with(LayoutState.CLOSED, () => <OpenButton />)
          .with(P.union(LayoutState.OPEN, LayoutState.MINIMIZED), () => (
            <ConversationUI apiKey={apiKey} />
          ))
          .exhaustive()}
      </AnimatePresence>
    </Frame>
  );
};
