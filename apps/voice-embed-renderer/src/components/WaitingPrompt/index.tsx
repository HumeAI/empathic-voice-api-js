import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const prompts = [
    "What is Hume's mission?",
    'Where can I learn more about EVI?',
    'How do you define well-being?',
    'What makes you different?',
    'Can you give me a compliment?',
];

export const WaitingPrompt = () => {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromptIndex((prevIndex) =>
        prevIndex === prompts.length - 1 ? 0 : prevIndex + 1,
      );
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="flex select-none flex-col justify-center gap-8 text-center"
    >
      <div className="font-mono uppercase text-black/50">Try saying...</div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPromptIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="rounded-full bg-tan-200/50 px-3 py-1"
          >
            "{prompts[currentPromptIndex]}"
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
