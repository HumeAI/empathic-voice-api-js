import { Canvas } from '@react-three/fiber';
import { useEffect } from 'react';
import { useSpring } from '@react-spring/three';
import { AnimatePresence, motion } from 'framer-motion';
import { WebGLBurst } from './WebGLBurst';
import { WebGLEmotionBursts } from './WebGLEmotionBursts';
import { cn } from '@/utils';
import { VoiceAnimationState } from '../VoiceAnimation';
import { EmotionScores } from '@humeai/voice-embed-react';

export const Backdrop = ({
  prosody = {},
  activeView,
}: {
  prosody: EmotionScores | undefined;
  activeView: VoiceAnimationState;
}) => {
  const top3Prosody = Object.entries(prosody)
    .sort((a, b) => {
      return b[1] - a[1];
    })
    .slice(0, 3)
    .map(([key, value]) => ({ name: key, score: value }));

  const [{ y, radius, opacity }, transition] = useSpring(() => ({
    y: -1.0,
    radius: 0.0,
    opacity: 0.0,
    config: {},
  }));

  useEffect(() => {
    switch (activeView) {
      case 'idle':
        void transition.start({ y: -0.1, radius: 1.0, opacity: 0 });
        break;
      case 'talking':
        void transition.start({ y: 1.0, radius: 0.5, opacity: 0.8 });
        break;
      case 'error':
        void transition.start({ y: 0.5, radius: 1.0, opacity: 1.0 });
        break;
    }
  }, [transition, activeView]);

  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={{
        initial: {
          opacity: 0,
        },
        enter: {
          opacity: 1.0,
          transition: {
            duration: 1.2,
          },
        },
        exit: {
          opacity: 0,
        },
      }}
      className={cn(
        '-z-10',
        'opacity-100',
        'absolute inset-0',
        'overflow-auto',
        'pointer-events-none',
      )}
    >
      <Canvas>
        <WebGLBurst
          x={0.5}
          y={y}
          radius={radius}
          opacity={opacity}
          r={0.96}
          g={0.78}
          b={0.54}
        />
        <AnimatePresence>
          <WebGLEmotionBursts key={`emotion-bursts`} prosody={top3Prosody} />
        </AnimatePresence>
      </Canvas>
    </motion.div>
  );
};
