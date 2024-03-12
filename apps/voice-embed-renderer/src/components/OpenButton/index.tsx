import { motion } from 'framer-motion';
import { useRef, ComponentRef } from 'react';
import { useButton, mergeProps } from 'react-aria';
import { HumeLogo } from '../HumeLogo';
import { useSafeMotion } from '../../utils/useSafeMotion';

export const OpenButton = ({
  onPress,
  status,
}: {
  onPress: () => void;
  status: string;
}) => {
  const openButtonRef = useRef<ComponentRef<typeof motion.div>>(null);
  const { buttonProps: openButtonProps } = useButton(
    {
      onPress: () => {
        onPress();
      },
    },
    openButtonRef,
  );

  const buttonTransition = useSafeMotion({
    initial: {
      opacity: 0,
      scale: 0.5,
    },
    animate: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
    },
  });

  return (
    <motion.div
      ref={openButtonRef}
      className={
        'absolute inset-0 grid size-[50px] w-full cursor-pointer place-content-center'
      }
      {...mergeProps(openButtonProps, buttonTransition)}
    >
      <HumeLogo
        className={
          status === 'connecting'
            ? 'size-5 animate-[spin_1s_linear_infinite]'
            : 'size-5'
        }
      />
    </motion.div>
  );
};
