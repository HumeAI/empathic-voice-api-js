import { motion } from 'framer-motion';
import { useRef, ComponentRef, FC } from 'react';
import { useButton, mergeProps } from 'react-aria';
import { useSafeMotion } from '../../utils/useSafeMotion';
import { Mic, MicOff } from 'lucide-react';

export type MuteButtonProps = {
  onPress: () => void;
  isMuted: boolean;
};

export const MuteButton: FC<MuteButtonProps> = ({ onPress, isMuted }) => {
  const MuteButtonRef = useRef<ComponentRef<typeof motion.div>>(null);
  const { buttonProps: MuteButtonProps } = useButton(
    {
      onPress: () => {
        onPress();
      },
    },
    MuteButtonRef,
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

  const Icon = isMuted ? MicOff : Mic;
  const descriptiveText = isMuted ? 'Unmute' : 'Mute';

  return (
    <motion.div
      ref={MuteButtonRef}
      className={
        'z-10 grid size-[36px] cursor-pointer place-content-center rounded-full bg-tan-600/20 text-black transition-colors hover:bg-tan-600/50'
      }
      {...mergeProps(MuteButtonProps, buttonTransition)}
    >
      <Icon className={'size-5'} />
      <span className="sr-only">{descriptiveText}</span>
    </motion.div>
  );
};
