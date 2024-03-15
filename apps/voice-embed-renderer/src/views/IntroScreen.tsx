import { Button } from '@/components/Button';
import { CircledText } from '@/components/CircledText';
import { motion } from 'framer-motion';

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
        </motion.div>
      </div>
    </motion.div>
  );
};
