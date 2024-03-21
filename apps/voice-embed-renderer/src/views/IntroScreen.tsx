import { Button } from '@/components/Button';
import { CircledText } from '@/components/CircledText';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

export const IntroScreen = ({
  onConnect,
  isConnecting,
}: {
  onConnect: () => void;
  isConnecting: boolean;
}) => {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, translateY: -4 }}
      transition={{ duration: 2 }}
    >
      <h2 className="text-center text-3xl">
        Meet EVI, our <CircledText>empathic</CircledText> AI voice
      </h2>
      <div className="w-fit">
        <motion.div
          variants={{
            initial: {
              y: '100%',
              opacity: 0,
            },
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                opacity: {
                  duration: 0.7,
                  ease: 'easeInOut',
                },
                y: {
                  duration: 1.1,
                  ease: 'easeInOut',
                },
              },
            },
            exit: {
              opacity: 0,
            },
          }}
        >
          <Button
            onClick={() => {
              onConnect();
            }}
            isLoading={isConnecting}
            loadingText={'Connecting...'}
          >
            Start Conversation
          </Button>
          <div className='absolute right-4 top-4'>
            <Tooltip.Provider delayDuration={400}>
            <Tooltip.Root>
              <Tooltip.Trigger>
                <div className='grid size-[36px] cursor-pointer place-content-center rounded-full bg-tan-600/20 text-black transition-colors hover:bg-tan-600/50'>
                  <a href="https://share.hsforms.com/15hCR14R4S-e-dlMwN42tkwcjsur" target='_blank'><Bell className='size-4'/></a>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content
                className={
                  'rounded-md bg-black px-2 py-1 text-xs text-white shadow-sm'
                }
                side={'left'}
                sideOffset={5}
              >
                Notify me of public access
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
