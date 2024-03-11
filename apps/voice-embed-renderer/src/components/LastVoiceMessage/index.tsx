import { isExpressionColor } from '@/utils/isExpressionColor';
import { useVoice } from '@humeai/voice-react';
import { expressionColors } from 'expression-colors';
import { Circle } from 'lucide-react';
import { FC } from 'react';

type ProsodyScore = { name: string; score: string };

type LastVoiceMessageProps = {
  lastVoiceMessage: ReturnType<typeof useVoice>['lastVoiceMessage'];
};

export const LastVoiceMessage: FC<LastVoiceMessageProps> = ({
  lastVoiceMessage,
}) => {
  const prosody = lastVoiceMessage?.models[0].entries ?? [];
  const sortedEmotions: ProsodyScore[] = prosody
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => {
      return { ...entry, score: Number(entry.score).toFixed(3) };
    });

  return (
    <div className="flex min-h-28 flex-col gap-2">
      {sortedEmotions.map((emotion) => {
        const fill = isExpressionColor(emotion.name)
          ? expressionColors[emotion.name].hex
          : 'white';

        return (
          <div className="flex items-center gap-2 rounded-lg border border-white bg-tan-200/50 px-2 py-1 font-mono text-sm uppercase">
            <Circle fill={fill} stroke={'white'} />
            <span className="">{emotion.name}</span>
            <span className="ml-auto tabular-nums opacity-50">
              {emotion.score}
            </span>
          </div>
        );
      })}
    </div>
  );
};
