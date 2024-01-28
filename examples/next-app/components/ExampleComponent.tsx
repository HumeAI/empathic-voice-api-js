'use client';

import { useAssistant } from '@humeai/assistant-react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { match } from 'ts-pattern';

export const ExampleComponent = ({ apiKey }: { apiKey: string }) => {
  const {
    connect,
    disconnect,
    fft,
    status,
    isMuted,
    isPlaying,
    mute,
    readyState,
    unmute,
    micFft,
    analyserNodeRef,
  } = useAssistant({
    apiKey,
    hostname: 'api.hume.ai',
  });

  const normalizedFft = useMemo(() => {
    const max = 2.5;
    const min = Math.min(...fft);

    // define a minimum possible value because we want the bar to have
    // a height even when the audio is off
    const minNormalizedValue = 0.01;
    return Array.from(fft).map((x) => {
      // normalize & avoid divide by zero
      const normalized = max === min ? max : (x - min) / (max - min);
      const lowerBounded = Math.max(minNormalizedValue, normalized);
      const upperBounded = Math.min(1, lowerBounded);
      return Math.round(upperBounded * 100);
    });
  }, [fft]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const visualize = () => {
    const bars = 20;

    const analyserNode = analyserNodeRef.current;
    const canvas = canvasRef.current;
    const canvasCtx = canvas?.getContext('2d');
    if (!analyserNode || !canvas || !canvasCtx) {
      console.log('no node or canvas context');
      return;
    }
    const bufferLength = analyserNode.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const [height, width] = [canvasCtx.canvas.height, canvasCtx.canvas.width];
    console.log(height, width);

    const barWidth = width / bars;
    const frequenciesPerBar = bufferLength / bars;

    const draw = () => {
      requestAnimationFrame(draw);
      analyserNode.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = '#ffffff';
      canvasCtx.fillRect(0, 0, width, height);

      let barHeight;
      let x = 0;

      for (let bar = 0; bar < bars; bar++) {
        const leftMostFreq = bar * frequenciesPerBar;
        const rightMostFreq =
          (bar + 1) * frequenciesPerBar > bufferLength
            ? bufferLength
            : undefined;
        const frequencies = dataArray.slice(leftMostFreq, rightMostFreq);

        const averageFreq = frequencies.reduce((a, b) => {
          return a + b / frequencies.length;
        }, 0);
        const maxFreq = frequencies.reduce((a, b) => {
          if (a > b) {
            return a;
          } else {
            return b;
          }
        }, -1);

        const barHeight = (averageFreq / maxFreq) * height;

        canvasCtx.fillStyle = 'rgb(50,50,50)';
        canvasCtx.fillRect(x, height / 2 - barHeight, barWidth, 2 * barHeight);

        x += barWidth + 1;
      }
      // for (let i = 0; i < bufferLength; i++) {
      //   barHeight = dataArray[i];
      //   canvasCtx.fillStyle = 'rgb(50,50,50)';
      //   canvasCtx.fillRect(x, height - barHeight / 2, barWidth, barHeight / 2);

      //   x += barWidth + 1;
      // }
    };
    draw();
  };

  return (
    <div>
      <div className={'font-light'}>
        <div>Playing: {isPlaying ? 'true' : 'false'}</div>
        <div>Ready State: {readyState}</div>
        <div className="flex max-w-sm flex-col gap-4">
          {match(status.value)
            .with('connected', () => (
              <button
                className="rounded border border-neutral-500 p-2"
                onClick={() => {
                  disconnect();
                }}
              >
                Disconnect
              </button>
            ))
            .with('disconnected', () => (
              <button
                className="rounded border border-neutral-500 p-2"
                onClick={async () => {
                  await connect();
                  visualize();
                }}
              >
                Connect to assistant
              </button>
            ))
            .with('connecting', () => (
              <button
                className="cursor-not-allowed rounded border border-neutral-500 p-2"
                disabled
              >
                Connecting...
              </button>
            ))
            .with('error', () => (
              <div className="flex flex-col gap-4">
                <button
                  className="rounded border border-neutral-500 p-2"
                  onClick={() => {
                    void connect();
                    visualize();
                  }}
                >
                  Connect to assistant
                </button>
              </div>
            ))
            .exhaustive()}

          {isMuted ? (
            <button
              className="rounded border border-neutral-500 p-2"
              onClick={() => unmute()}
            >
              Unmute mic
            </button>
          ) : (
            <button
              className="rounded border border-neutral-500 p-2"
              onClick={() => mute()}
            >
              Mute mic
            </button>
          )}
        </div>

        {status.value === 'error' && (
          <span className="text-red-500">{status.reason}</span>
        )}

        <div className="grid h-32 grid-cols-1 grid-rows-2 p-4">
          <div className="flex items-end gap-1">
            {normalizedFft.map((val, i) => {
              return (
                <div
                  key={`fft-top-${i}`}
                  style={{ height: `${val}%` }}
                  className={
                    'w-2 rounded-full bg-neutral-500 transition-all duration-75'
                  }
                ></div>
              );
            })}
          </div>
          <div className="flex items-start gap-1">
            {normalizedFft.map((val, i) => {
              return (
                <div
                  key={`fft-bottom-${i}`}
                  style={{ height: `${val}%` }}
                  className={
                    'w-2 rounded-full bg-neutral-500 transition-all duration-75'
                  }
                ></div>
              );
            })}
          </div>
        </div>
      </div>
      <div
        style={{
          border: '1px solid black',
        }}
      >
        <canvas ref={canvasRef} className="audio-react-recorder__canvas" />
      </div>
    </div>
  );
};
