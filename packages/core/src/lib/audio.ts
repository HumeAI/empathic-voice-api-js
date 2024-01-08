export enum Channels {
  /** Mono */
  MONO = 1,
  /** Stereo */
  STEREO = 2,
}

export enum AudioEncoding {
  /** 16-bit signed little-endian (PCM) */
  LINEAR16 = 'linear16',
  /** Ogg Opus */
  OPUS = 'opus',
}

export function arrayBufferToBlob(arrayBuffer: ArrayBuffer, mimeType?: string) {
  return new Blob([arrayBuffer], { type: mimeType });
}
