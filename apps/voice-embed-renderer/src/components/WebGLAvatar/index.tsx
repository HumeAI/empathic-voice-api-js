import { useRef, useEffect, FC, ElementRef, useLayoutEffect } from 'react';
import { useVoice } from '@humeai/voice-react';
import { AvatarState, AvatarVisualization } from './viz';
import { EmotionScores } from '@humeai/voice-embed-react';

export type WebGLAvatarProps = {
  fft: ReturnType<typeof useVoice>['fft'];
  isPlaying: ReturnType<typeof useVoice>['isPlaying'];
  prosody: EmotionScores;
  width: number;
  height: number;
};

export const WebGLAvatar: FC<WebGLAvatarProps> = ({
  fft,
  isPlaying,
  prosody,
  width,
  height,
}) => {
  const container = useRef<ElementRef<'div'>>(null);
  const viz = useRef<AvatarVisualization | null>(null);

  const initialWidth = useRef(width);
  const initialHeight = useRef(height);

  useEffect(() => {
    if (container.current) {
      viz.current = new AvatarVisualization({
        container: container.current,
        width: initialWidth.current,
        height: initialHeight.current,
      });

      queueMicrotask(() => {
        // delay starting animation until queue is empty
        viz.current?.start();
      });
    }

    return () => {
      viz.current?.destroy();
      viz.current = null;
    };
  }, []);

  useEffect(() => {
    const state = isPlaying ? AvatarState.BOUBA : AvatarState.LISTENING;
    viz.current?.startTransitionTo(state);
  }, [isPlaying]);

  useEffect(() => {
    viz.current?.updateFFT(fft);
  }, [fft]);

  useEffect(() => {
    viz.current?.updateProsody(prosody);
  }, [prosody]);

  useLayoutEffect(() => {
    viz.current?.resize(width, height);
  }, [width, height]);

  return (
    <div
      className={'pointer-events-none absolute isolate'}
      style={{ width: `${width}px`, height: `${height}px` }}
      ref={container}
    />
  );
};
