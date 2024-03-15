import { motion } from 'framer-motion';
import { FC, PropsWithChildren } from 'react';
import { LayoutState, useLayoutStore } from '../../store/layout';
import { cva } from 'class-variance-authority';
import { match } from 'ts-pattern';
import { WindowDimensions } from '@humeai/voice-embed-react';

export type FrameProps = PropsWithChildren;

const frameStyles = cva(
  [
    'rounded-[25px]',
    'backdrop-blur-[50px]',
    'absolute bottom-0 right-0',
    'text-black',
    'transition-colors',
    'outline outline-2 -outline-offset-2 outline-white/80',
  ],
  {
    variants: {
      state: {
        [LayoutState.OPEN]: ['bg-tan-200/70'],
        [LayoutState.CLOSED]: [
          'bg-gradient backdrop-blur-sm',
          'transition-opacity duration-500 hover:opacity-80',
        ],
        [LayoutState.MINIMIZED]: ['bg-white'],
      },
    },
  },
);

const frameDimensions = (state: LayoutState, frameSize: WindowDimensions) =>
  match(state)
    .with(LayoutState.OPEN, () => ({
      width: `${frameSize.width}px`,
      height: `${frameSize.height}px`,
    }))
    .with(LayoutState.CLOSED, () => ({
      width: '50px',
      height: '50px',
    }))
    .with(LayoutState.MINIMIZED, () => ({
      width: '350px',
      height: '50px',
    }))
    .exhaustive();

export const Frame: FC<FrameProps> = ({ children }) => {
  const state = useLayoutStore((store) => store.state);
  const frameSize = useLayoutStore((store) => store.frameSize);

  return (
    <motion.div
      className={frameStyles({ state })}
      animate={frameDimensions(state, frameSize)}
      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
      data-testid={'frame-component'}
    >
      {children}
    </motion.div>
  );
};
