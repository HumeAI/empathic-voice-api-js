import { CircledText } from '@/components/CircledText';
import { motion } from 'framer-motion';

export const IntroScreen = ({ onConnect }: { onConnect: () => void }) => {
  return (
    <motion.div
      className="flex flex-col gap-8 px-4 items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, translateY: -4 }}
      transition={{ duration: 2 }}
    >
      <h2 className="text-3xl text-center">
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
          <button
            className={
              'px-4 flex h-[36px] items-center justify-center rounded-full border border-gray-700 bg-gray-800 text-base font-medium text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white focus:outline-none'
            }
            onClick={() => {
              onConnect();
            }}
          >
            Start Conversation
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};
