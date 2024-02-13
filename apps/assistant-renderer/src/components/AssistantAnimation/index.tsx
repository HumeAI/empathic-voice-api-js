import { motion } from 'framer-motion';
import { FC } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export enum AssistantAnimationState {
  LISTENING = 'listening',
  TALKING = 'talking',
  THINKING = 'thinking',
  ERROR = 'error',
  IDLE = 'idle',
}

type EmotionScore = {
  name: string;
  score: number;
};

type AssistantAnimationProsody = {
  emotions: EmotionScore[];
};

type FFTValues = number[]; // likely length of 24, may not be always.

type AssistantAnimationRendererProps = {
  state: AssistantAnimationState;
  prosody: AssistantAnimationProsody;
  fft: FFTValues;
};

export const AssistantAnimation: FC<AssistantAnimationRendererProps> = ({
  // state,
  // prosody,
  fft,
}) => {
  return (
    <div className={'relative h-full w-full'}>
      <motion.svg
        viewBox={'0 0 100 100'}
        width={100}
        height={100}
        className={'absolute inset-0 h-full w-full'}
      >
        {Array.from({ length: 24 }).map((_, index) => {
          const value = (fft[index] ?? 0) / 4;
          const height = Math.min(Math.max(value * 80, 2), 70);
          const yOffset = 50 - height * 0.5;

          return (
            <motion.rect
              key={index}
              fill={'white'}
              height={height}
              width={2}
              x={2 + (index * 100 - 4) / 24}
              y={yOffset}
              rx={4}
            />
          );
        })}
      </motion.svg>
    </div>
  );
};
