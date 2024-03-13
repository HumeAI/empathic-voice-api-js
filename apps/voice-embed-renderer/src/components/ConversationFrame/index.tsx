import { motion } from 'framer-motion';
import { CloseButton } from '../CloseButton';
import { FC, PropsWithChildren } from 'react';
import { MuteButton } from '@/components/MuteButton';
import { useVoice } from '@humeai/voice-react';
import { ExpandButton } from '../ExpandButton';
import * as Tooltip from '@radix-ui/react-tooltip';

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
      className={'flex size-full min-w-0 flex-col overflow-hidden'}
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
        className={'z-10 flex shrink-0 grow-0 items-center gap-2 p-2'}
      >
        {status.value === 'connected' && (
          <Tooltip.Provider delayDuration={400} skipDelayDuration={500}>
            <Tooltip.Root>
              <Tooltip.Trigger>
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
              </Tooltip.Trigger>
              <Tooltip.Content
                className={
                  'isolate rounded-md bg-black px-2 py-1 text-xs text-white shadow-sm'
                }
                side={'top'}
                sideOffset={5}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </Tooltip.Content>
            </Tooltip.Root>
            <Tooltip.Root>
              <Tooltip.Trigger>
                <ExpandButton
                  onPress={() => {
                    window.open('https://voice-demo.hume.ai/');
                  }}
                />
              </Tooltip.Trigger>
              <Tooltip.Content
                className={'rounded-md bg-black px-2 py-1 text-xs text-white'}
                side={'top'}
                sideOffset={5}
              >
                View full demo
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        )}

        <div className="ml-auto">
          <CloseButton onPress={() => onClose()} />
        </div>
      </motion.div>
    </motion.div>
  );
};
