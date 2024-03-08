import { motion } from 'framer-motion';
import { CloseButton } from '../CloseButton';
import { FC, PropsWithChildren } from 'react';
import { MuteButton } from '@/components/MuteButton';
import { useVoice } from '@humeai/voice-react';

export type ConversationFrameProps = PropsWithChildren<{
  onClose: () => void;
}>;

export const ConversationFrame: FC<ConversationFrameProps> = ({
  onClose,
  children,
}) => {
  const { isMuted, mute, unmute, status } = useVoice();
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className={'flex h-full w-full min-w-0 flex-col overflow-hidden'}
    >
      <motion.div
        className={'flex grow flex-col items-center justify-center px-4'}
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
        }}
        transition={{
          delay: 0.1,
          duration: 0.3,
        }}
      >
        {children}
      </motion.div>

      <motion.div
        className={'flex h-[50px] shrink-0 grow-0 items-center gap-2 px-2'}
      >
        {status.value === 'connected' && (
          <MuteButton
            onPress={() => {
              if (isMuted) {
                unmute();
              } else {
                mute();
              }
            }}
            isMuted={isMuted}
          />
        )}

        <div className="ml-auto">
          <CloseButton onPress={() => onClose()} />
        </div>
      </motion.div>
    </motion.div>
  );
};
