import { motion } from 'framer-motion';
import { CloseButton } from '../CloseButton';
import { FC, PropsWithChildren } from 'react';

export type ConversationFrameProps = PropsWithChildren;

export const ConversationFrame: FC<ConversationFrameProps> = ({ children }) => {
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
        className={'grow px-4 flex items-center justify-center grow-1 flex-col'}
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
        className={
          'grow-0 shrink-0 px-2 h-[50px] flex items-center justify-end'
        }
      >
        <CloseButton />
      </motion.div>
    </motion.div>
  );
};
