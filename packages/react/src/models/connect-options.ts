import type { Hume } from 'hume';

import type { SocketConfig } from '../lib/useVoiceClient';

export type AudioConstraints = {
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
};

export type ConnectOptions = Omit<SocketConfig, 'reconnectAttempts'> & {
  audioConstraints?: AudioConstraints;
  sessionSettings?: Hume.empathicVoice.SessionSettings;
};
