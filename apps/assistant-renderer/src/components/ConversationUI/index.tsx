import { useAssistant } from '@humeai/assistant-react';
import { motion } from 'framer-motion';
import { CloseButton } from '../CloseButton';
import { FC } from 'react';

export type ConversationUIProps = {
  apiKey: string;
};

export const ConversationUI: FC<ConversationUIProps> = ({ apiKey }) => {
  const { readyState } = useAssistant({
    apiKey,
  });

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
      className={'w-full h-full overflow-hidden min-w-0 flex flex-col'}
    >
      <motion.div
        className={'grow px-4 flex items-center justify-center'}
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
        <div className={'font-medium'}>[connection: {readyState}]</div>
      </motion.div>
      <motion.div
        className={
          'grow-0 shrink-0 px-2 h-[50px] flex items-center justify-end'
        }
      >
        <CloseButton />
      </motion.div>
    </motion.div>
  );
};
