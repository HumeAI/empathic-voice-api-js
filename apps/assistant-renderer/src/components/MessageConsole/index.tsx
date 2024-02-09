import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import type { TranscriptMessage } from '@humeai/assistant-react';
import { match } from 'ts-pattern';

const emotionColors: Record<string, string> = {
  Admiration: '#FFC58F',
  Adoration: '#FFC6CC',
  'Aesthetic Appreciation': '#E2CBFF',
  Amusement: '#FEBF52',
  Anger: '#B21816',
  Anxiety: '#6E42CC',
  Awe: '#7DABD3',
  Awkwardness: '#D7D99D',
  Boredom: '#A4A4A4',
  Calmness: '#A9CCE1',
  Concentration: '#336CFF',
  Contemplation: '#B0AEEF',
  Confusion: '#C66A26',
  Contempt: '#76842D',
  Contentment: '#E5C6B4',
  Craving: '#54591C',
  Determination: '#FF5C00',
  Disappointment: '#006C7C',
  Disgust: '#1A7A41',
  Distress: '#C5F264',
  Doubt: '#998644',
  Ecstasy: '#FF48A4',
  Embarrassment: '#63C653',
  'Empathic Pain': '#CA5555',
  Entrancement: '#7554D6',
  Envy: '#1D4921',
  Excitement: '#FFF974',
  Fear: '#D1C9EF',
  Guilt: '#879AA1',
  Horror: '#772E7A',
  Interest: '#A9CCE1',
  Joy: '#FFD600',
  Love: '#F44F4C',
  Neutral: '#879AA1',
  Nostalgia: '#B087A1',
  Pain: '#8C1D1D',
  Pride: '#9A4CB6',
  Realization: '#217AA8',
  Relief: '#FE927A',
  Romance: '#F0CC86',
  Sadness: '#305575',
  Satisfaction: '#A6DDAF',
  'Sexual Desire': '#AA0D59',
  Shame: '#8A6262',
  Surprise: '#70E63A',
  'Surprise (negative)': '#70E63A',
  'Surprise (positive)': '#7AFFFF',
  Sympathy: '#7F88E0',
  Tiredness: '#757575',
  Triumph: '#EC8132',
};

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
              <div className={'font-mono text-[10px] uppercase text-beige'}>
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
                return (
                  <div key={index + e.name + e.score} className={'text-xs'}>
                    <div className={'flex items-center pb-0.5'}>
                      <span
                        className={'grow truncate tracking-tight text-white'}
                      >
                        {e.name}
                      </span>
                      <span className={'grow-0 tabular-nums text-beige'}>
                        {e.score}
                      </span>
                    </div>
                    <div className={'relative h-[4px] w-full rounded-full'}>
                      <div
                        className={
                          'absolute left-0 top-0 h-full w-[var(--w)] rounded-full bg-beige'
                        }
                        style={{
                          background: emotionColors[e.name] ?? 'black',
                          width: '100%',
                          opacity: 0.1,
                        }}
                      />
                      <AnimatePresence>
                        <motion.div
                          className={
                            'absolute left-0 top-0 h-full w-[var(--w)] rounded-full bg-beige'
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
                            background: emotionColors[e.name] ?? 'black',
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
