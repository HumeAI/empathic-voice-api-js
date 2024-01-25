import { motion } from 'framer-motion';
import { useRef, ComponentRef } from 'react';
import { useButton, mergeProps } from 'react-aria';
import { useLayoutStore } from '../../store/layout';
import { HumeLogo } from '../HumeLogo';
import { useSafeMotion } from '../../utils/useSafeMotion';

export const OpenButton = () => {
  const open = useLayoutStore((store) => store.open);
  const openButtonRef = useRef<ComponentRef<typeof motion.div>>(null);
  const { buttonProps: openButtonProps } = useButton(
    {
      onPress: () => {
        open();
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
        'absolute inset-0 grid place-content-center size-[50px] cursor-pointer w-full'
      }
      {...mergeProps(openButtonProps, buttonTransition)}
    >
      <HumeLogo className={'w-5 h-5'} />
    </motion.div>
  );
};
