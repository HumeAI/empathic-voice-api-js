import { motion } from 'framer-motion';
import { useRef, ComponentRef, FC } from 'react';
import { useButton, mergeProps } from 'react-aria';
import { useSafeMotion } from '../../utils/useSafeMotion';
import { X } from 'lucide-react';

export type CloseButtonProps = {
  onPress: () => void;
};

export const CloseButton: FC<CloseButtonProps> = ({ onPress }) => {
  const closeButtonRef = useRef<ComponentRef<typeof motion.div>>(null);
  const { buttonProps: closeButtonProps } = useButton(
    {
      onPress: () => {
        onPress();
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
        'grid size-[36px] cursor-pointer place-content-center rounded-full bg-red-500 text-white'
      }
      {...mergeProps(closeButtonProps, buttonTransition)}
    >
      <X className={'h-5 w-5'} />
    </motion.div>
  );
};
