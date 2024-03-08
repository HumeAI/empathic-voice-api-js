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
    'text-black',
    'transition-colors',
    'shadow-custom',
    'outline outline-2 -outline-offset-2 outline-tan-200/60',
    'bg-gradient-to-t from-orange-200/70 from-5%',
  ],
  {
    variants: {
      state: {
        [LayoutState.OPEN]: ['bg-tan-200/70'],
        [LayoutState.CLOSED]: [
          'bg-tan-200/90 bg-gradient-to-t from-orange-300/90 from-5% hover:bg-tan-200',
        ],
        [LayoutState.MINIMIZED]: ['bg-tan-200'],
      },
    },
  },
);

const frameDimensions = (state: LayoutState) =>
  match(state)
    .with(LayoutState.OPEN, () => ({
      width: '350px',
      height: '400px',
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
      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
      data-testid={'frame-component'}
    >
      {children}
    </motion.div>
  );
};
