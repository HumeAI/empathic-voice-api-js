import { motion } from 'framer-motion';
import { useRef, ComponentRef } from 'react';
import { useButton, mergeProps } from 'react-aria';
import { useLayoutStore } from '../../store/layout';
import { useSafeMotion } from '../../utils/useSafeMotion';
import { X } from 'lucide-react';

export const CloseButton = () => {
  const close = useLayoutStore((store) => store.close);
  const closeButtonRef = useRef<ComponentRef<typeof motion.div>>(null);
  const { buttonProps: closeButtonProps } = useButton(
    {
      onPress: () => {
        close();
      },
    },
    closeButtonRef,
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
      ref={closeButtonRef}
      className={
        'grid place-content-center size-[36px] cursor-pointer bg-red rounded-full'
      }
      {...mergeProps(closeButtonProps, buttonTransition)}
    >
      <X className={'w-5 h-5'} />
    </motion.div>
  );
};
