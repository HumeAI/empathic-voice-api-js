import { motion } from 'framer-motion';
import { FC, PropsWithChildren } from 'react';
import { LayoutState, useLayoutStore } from '../../store/layout';
import { cva } from 'class-variance-authority';
import { match } from 'ts-pattern';

export type FrameProps = PropsWithChildren;

const frameStyles = cva(
  [
    'rounded-[25px]',
    'backdrop-blur-sm',
    'absolute bottom-0 right-0',
    'text-white',
    'transition-colors',
  ],
  {
    variants: {
      state: {
        [LayoutState.OPEN]: ['bg-black/80'],
        [LayoutState.CLOSED]: ['bg-black/60'],
        [LayoutState.MINIMIZED]: ['bg-black/60'],
      },
    },
  },
);

const frameDimensions = (state: LayoutState) =>
  match(state)
    .with(LayoutState.OPEN, () => ({
      width: '350px',
      height: '300px',
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

  return (
    <motion.div
      className={frameStyles({ state })}
      animate={frameDimensions(state)}
      data-testid={'frame-component'}
    >
      {children}
    </motion.div>
  );
};
