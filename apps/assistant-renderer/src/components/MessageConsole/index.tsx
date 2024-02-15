import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import type { TranscriptMessage } from '@humeai/assistant-react';
import { match } from 'ts-pattern';
import { expressionColors } from 'expression-colors';

type Emotion = keyof typeof expressionColors;

export const MessageConsole = ({
  messages,
}: {
  messages: TranscriptMessage[];
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formattedMessages = useMemo(() => {
    return messages.map((message) => {
      const sender = match(message.type)
        .with('user_message', () => 'user')
        .with('assistant_message', () => 'assistant')
        .otherwise(() => null);

      const prosodyModel = message.models.find(
        (model) => model.model === 'prosody',
      ) ?? { entries: [] };

      // Sort the emotions based on their scores in ascending order
      const sortedEmotions = prosodyModel.entries
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((entry) => {
          return { ...entry, score: Number(entry.score).toFixed(3) };
        });

      return {
        sender,
        message,
        sortedEmotions,
      };
    });
  }, [messages]);

  return (
    <div className="h-64 w-full overflow-auto px-6">
      {formattedMessages.map(({ message, sender, sortedEmotions }, index) => {
        return (
          <div
            key={index}
            className="flex w-full flex-row flex-wrap items-start pb-3"
          >
            <div className={'w-full'}>
              <div className={'font-mono text-[10px] uppercase text-gray-500'}>
                {sender}
              </div>
            </div>
            <div className={'basis-1/2'}>
              <div className={'pr-4 text-sm font-medium'}>
                {message.message.content}
              </div>
            </div>
            <div className="flex basis-1/2 flex-col gap-1">
              {sortedEmotions.map((e) => {
                const barColor =
                  expressionColors[e.name as Emotion]?.hex ?? 'white';
                return (
                  <div key={index + e.name + e.score} className={'text-xs'}>
                    <div className={'flex items-center pb-0.5'}>
                      <span
                        className={'grow truncate tracking-tight text-black'}
                      >
                        {e.name}
                      </span>
                      <span className={'grow-0 tabular-nums text-gray-400'}>
                        {e.score}
                      </span>
                    </div>
                    <div className={'relative h-[4px] w-full rounded-full'}>
                      <div
                        className={
                          'absolute left-0 top-0 h-full w-[var(--w)] rounded-full bg-black'
                        }
                        style={{
                          background: barColor,
                          width: '100%',
                          opacity: 0.1,
                        }}
                      />
                      <AnimatePresence>
                        <motion.div
                          className={
                            'absolute left-0 top-0 h-full w-[var(--w)] rounded-full bg-black'
                          }
                          initial={{
                            width: 0,
                          }}
                          animate={{
                            width: `${100 * Number(e.score)}%`,
                            transition: {
                              delay: 1.4,
                            },
                          }}
                          style={{
                            background: barColor,
                          }}
                        />
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
