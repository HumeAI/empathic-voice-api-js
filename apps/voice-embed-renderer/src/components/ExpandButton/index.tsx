import { motion } from 'framer-motion';
import { useRef, ComponentRef, FC } from 'react';
import { useButton, mergeProps } from 'react-aria';
import { useSafeMotion } from '../../utils/useSafeMotion';
import { ArrowUpRight } from 'lucide-react';


export type ExpandButtonProps = {
  onPress: () => void;
};

export const ExpandButton: FC<ExpandButtonProps> = ({ onPress }) => {
  const ExpandButtonRef = useRef<ComponentRef<typeof motion.div>>(null);
  const { buttonProps: ExpandButtonProps } = useButton(
    {
      onPress: () => {
        onPress();
      },
    },
    ExpandButtonRef,
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
      ref={ExpandButtonRef}
      className={
        'z-10 grid size-[36px] cursor-pointer place-content-center rounded-full bg-tan-600/20 text-black transition-colors hover:bg-tan-600/50'
      }
      {...mergeProps(ExpandButtonProps, buttonTransition)}
    >
      <ArrowUpRight className={'size-5'} />
      <span className="sr-only">Learn more</span>
    </motion.div>
  );
};
