'use client';

import Meyda from 'meyda';
import { useMemo, useRef, useState } from 'react';

// import { useAssistant } from '@humeai/assistant-react';

export const ExampleComponent = ({ apiKey }: { apiKey: string }) => {
  // const { isPlaying, readyState, mute, unmute, isMuted } = useAssistant({
  //   apiKey,
  //   hostname: 'api.hume.ai',
  // });
  // return (
  //   <div>
  //     <div className={'font-light'}>
  //       <div>Playing: {isPlaying ? 'true' : 'false'}</div>
  //       <div>Ready State: {readyState}</div>
  //       <div className="flex gap-4">
  //         {isMuted ? (
  //           <button onClick={() => unmute()}>Unmute</button>
  //         ) : (
  //           <button onClick={() => mute()}>Mute</button>
  //         )}
  //       </div>
  //     </div>
  //   </div>
  // );

  const meydaAnalyzer = useRef();
  const [fft, setFft] = useState([]);

  const normalized = useMemo(() => {
    const max = Math.max(...fft);
    const min = Math.min(...fft);
    return Array.from(fft).map((x) => {
      const norm = (x - min) / (max - min);
      return Math.round(norm * 100);
    });
  }, [fft]);

  console.log('normalized', normalized);

  return (
    <div>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        controls
        loop
        crossOrigin="anonymous"
        id="audio"
        src="https://storage.googleapis.com/playground-sample-files/media/Toxicity/toxicity_nontoxic_001.mp3"
        onPlay={() => {
          console.log('playing');
          const audioContext = new AudioContext();
          // Select the Audio Element from the DOM
          const htmlAudioElement = document.getElementById('audio');
          // Create an "Audio Node" from the Audio Element
          const source =
            audioContext.createMediaElementSource(htmlAudioElement);
          // Connect the Audio Node to your speakers. Now that the audio lives in the
          // Audio Context, you have to explicitly connect it to the speakers in order to
          // hear it
          source.connect(audioContext.destination);

          const bufferSize = 512;

          const analyzer = Meyda.createMeydaAnalyzer({
            audioContext: audioContext,
            source,
            bufferSize,
            featureExtractors: ['loudness'],
            callback: (features) => {
              const fft = features?.loudness?.specific || [];
              setFft(() => fft);
            },
          });
          meydaAnalyzer.current = analyzer;
          meydaAnalyzer.current.start();
        }}
        onPause={() => {
          console.log('apuse', meydaAnalyzer.current);
          meydaAnalyzer.current.stop();
        }}
      ></audio>
      <div className="grid h-32 grid-cols-1 grid-rows-2 p-4">
        <div className="flex items-end gap-1">
          {normalized.map((val, i) => {
            return (
              <div
                key={`fft-top-${i}`}
                style={{ '--size': `${val}%` }}
                className={`h-[--size] w-2 rounded-full bg-neutral-500 transition-all duration-75`}
              ></div>
            );
          })}
        </div>
        <div className="flex items-start gap-1">
          {normalized.map((val, i) => {
            return (
              <div
                key={`fft-bottom-${i}`}
                style={{ '--size': `${val}%` }}
                className={`h-[--size] w-2 rounded-full bg-neutral-500 transition-all duration-75`}
              ></div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
