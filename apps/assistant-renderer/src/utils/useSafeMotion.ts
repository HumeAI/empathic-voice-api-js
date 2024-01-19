import { MotionProps, useReducedMotion } from 'framer-motion';

// @reference https://github.com/framer/motion/issues/1723
export const useSafeMotion = (motion: MotionProps): MotionProps => {
  const reduced = useReducedMotion();

  return reduced ? {} : motion;
};
