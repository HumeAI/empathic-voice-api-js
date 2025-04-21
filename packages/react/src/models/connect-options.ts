export type AudioConstraints = {
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
};

export type ConnectOptions = {
  audioConstraints?: AudioConstraints;
};
