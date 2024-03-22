## :toolbox: Functions

- [generateEmptyFft](#gear-generateemptyfft)
- [useSoundPlayer](#gear-usesoundplayer)
- [useMicrophone](#gear-usemicrophone)
- [useVoiceClient](#gear-usevoiceclient)

### :gear: generateEmptyFft

| Function | Type |
| ---------- | ---------- |
| `generateEmptyFft` | `() => number[]` |

### :gear: useSoundPlayer

| Function | Type |
| ---------- | ---------- |
| `useSoundPlayer` | `(props: { onError: (message: string) => void; onPlayAudio: (id: string) => void; }) => { addToQueue: (message: { type: "audio_output"; data: string; id: string; } and { receivedAt: Date; }) => void; ... 4 more ...; clearQueue: () => void; }` |

### :gear: useMicrophone

| Function | Type |
| ---------- | ---------- |
| `useMicrophone` | `(props: MicrophoneProps) => { start: () => void; stop: () => void; mute: () => void; unmute: () => void; isMuted: boolean; fft: number[]; }` |

### :gear: useVoiceClient

| Function | Type |
| ---------- | ---------- |
| `useVoiceClient` | `(props: { onAudioMessage?: ((message: { type: "audio_output"; data: string; id: string; } and { receivedAt: Date; }) => void) or undefined; onMessage?: ((message: any) => void) or undefined; onError?: ((message: string, error?: Error or undefined) => void) or undefined; onOpen?: (() => void) or undefined; onClose?: (() => ...` |



## :cocktail: Types

- [MicrophoneProps](#gear-microphoneprops)
- [ConnectionMessage](#gear-connectionmessage)

### :gear: MicrophoneProps

| Type | Type |
| ---------- | ---------- |
| `MicrophoneProps` | `{
  streamRef: MutableRefObject<MediaStream or null>;
  onAudioCaptured: (b: ArrayBuffer) => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onError: (message: string) => void;
}` |

### :gear: ConnectionMessage

| Type | Type |
| ---------- | ---------- |
| `ConnectionMessage` | `| {
      type: 'socket_connected';
      receivedAt: Date;
    }
  or {
      type: 'socket_disconnected';
      receivedAt: Date;
    }` |

