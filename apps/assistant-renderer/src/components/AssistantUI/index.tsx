import { ComponentRef, FC, useCallback, useRef, useState } from 'react';
import { parentDispatch } from '../../utils/parentDispatch';
import { motion, AnimatePresence } from 'framer-motion';
import { HumeLogo } from '../HumeLogo';
import { ConversationUI } from '../ConversationUI';
import { useButton, mergeProps } from 'react-aria';
import { useSafeMotion } from '../../utils/useSafeMotion';
import { X } from 'lucide-react';
import {
  COLLAPSE_WIDGET_ACTION,
  EXPAND_WIDGET_ACTION,
} from '@humeai/assistant-react';

export type AssistantUIProps = {
  apiKey: string;
};

export const AssistantUI: FC<AssistantUIProps> = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleOrSetExpanded = useCallback(
    (nextIsExpanded?: boolean) => {
      console.log('toggleExpanded', { isExpanded });
      setIsExpanded((prev) => {
        const nextValue = nextIsExpanded ?? !prev;
        parentDispatch(
          nextValue ? EXPAND_WIDGET_ACTION : COLLAPSE_WIDGET_ACTION,
        );
        return nextValue;
      });
    },
    [isExpanded],
  );

  const openButtonRef = useRef<ComponentRef<typeof motion.div>>(null);
  const { buttonProps: openButtonProps } = useButton(
    {
      onPress: () => toggleOrSetExpanded(true),
    },
    openButtonRef,
  );

  const closeButtonRef = useRef<ComponentRef<typeof motion.div>>(null);
  const { buttonProps: closeButtonProps } = useButton(
    {
      onPress: () => toggleOrSetExpanded(false),
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
    <>
      <motion.div
        className={[
          'h-[52px]',
          'bg-black/60 backdrop-blur-sm',
          'absolute bottom-0 right-0 rounded-full text-white flex items-center justify-center',
        ]
          .filter(Boolean)
          .join(' ')}
        animate={{
          width: isExpanded ? '348px' : '52px',
        }}
        data-testid={'assistant-ui-root'}
      >
        <AnimatePresence mode={'wait'}>
          {isExpanded ? (
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
              className={
                'w-full overflow-hidden min-w-0 flex flex-row items-center justify-center'
              }
            >
              <motion.div
                className={'grow px-4'}
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
                <ConversationUI />
              </motion.div>
              <motion.div className={'grow-0 shrink-0 px-2'}>
                <motion.div
                  ref={closeButtonRef}
                  className={
                    'size-[36px] grid place-content-center cursor-pointer bg-red rounded-full text-white'
                  }
                  {...mergeProps(closeButtonProps, buttonTransition)}
                >
                  <X className={'w-5 h-5'} />
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              ref={openButtonRef}
              className={
                'absolute inset-0 grid place-content-center h-[52px] cursor-pointer w-full'
              }
              {...mergeProps(openButtonProps, buttonTransition)}
            >
              <HumeLogo className={'w-5 h-5'} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
