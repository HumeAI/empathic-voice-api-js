class BufferQueue {
  constructor() {
    this._length = 0;
    this._buffers = [];
    this._hasPushed = false;

    // For fading out
    this._fadeOutDurationMs = 100;
    // sampleRate is part of AudioWorkletGlobalScope
    // eslint-disable-next-line no-undef
    this._sampleRate = sampleRate;
    this._fadeOutSamplesCount = Math.floor(
      (this._fadeOutDurationMs * this._sampleRate) / 1000,
    );
    this._fadeOutActive = false;
    this._fadeOutCounter = 0;
  }

  push(buffer) {
    this._buffers.push(buffer);
    this._length += buffer.length;
    this._hasPushed = true;
  }

  clear() {
    this._length = 0;
    this._buffers = [];
    this._hasPushed = false;
  }

  read() {
    if (!this._hasPushed) {
      return null;
    }

    if (this._buffers.length === 0) {
      this._hasPushed = false;
      return null;
    }

    // Worklet process requires 128 samples of 32-bit float https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/process
    const needed = 128;
    const output = new Float32Array(needed);

    if (this._length > 0 && this._length < needed) {
      let offset = 0;
      while (this._buffers.length && offset < this._length) {
        const buf = this._buffers[0];
        const take = Math.min(buf.length, this._length - offset);
        output.set(buf.subarray(0, take), offset);

        if (take === buf.length) {
          this._buffers.shift();
        } else {
          this._buffers[0] = buf.subarray(take);
        }

        offset += take;
      }

      this._length = 0;
      this._hasPushed = false;
      return output;
    }

    let offset = 0;

    while (offset < needed) {
      const buf = this._buffers[0];
      const take = Math.min(buf.length, needed - offset);
      output.set(buf.subarray(0, take), offset);

      if (take === buf.length) {
        this._buffers.shift();
      } else {
        this._buffers[0] = buf.subarray(take);
      }

      this._length -= take;
      offset += take;
    }

    return output;
  }
}

class AudioStreamProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._bq = new BufferQueue();
    this.port.onmessage = (e) => {
      switch (e.data?.type) {
        case 'audio':
          this._bq.push(new Float32Array(e.data.data));
          break;
        case 'end':
          this._shouldStop = true;
          break;
        case 'fade':
          this._bq._fadeOutActive = true;
          this._bq._fadeOutCounter = 0;
          break;
        case 'clear':
          this._shouldStop = false;
          break;
      }
    };
    this._shouldStop = false;
  }

  process(inputs, outputs) {
    const output = outputs[0];
    const frames = output[0].length;
    const chans = output.length;

    const block = this._bq.read();

    if (block) {
      for (let ch = 0; ch < chans; ch++) {
        const out = output[ch];
        for (let i = 0; i < frames; i++) {
          let sample = block[i * chans + ch] ?? 0;

          // Apply automatic fade-out if active
          if (this._bq._fadeOutActive) {
            const fadeProgress =
              this._bq._fadeOutCounter / this._bq._fadeOutSamplesCount;
            const gain = 1 - Math.min(fadeProgress, 1);
            sample *= gain;
          }

          out[i] = sample;
        }
      }

      // If we're currently fading out, increment the counter and end if complete
      if (this._bq._fadeOutActive) {
        this._bq._fadeOutCounter += frames;

        if (this._bq._fadeOutCounter >= this._bq._fadeOutSamplesCount) {
          this._bq._fadeOutActive = false;
          this._bq._fadeOutCounter = 0;
          this._bq.clear();
          this.port.postMessage({ type: 'ended' });
        }
      }

      return true;
    }

    if (this._shouldStop) {
      // Stop worklet once we've finished playback
      this.port.postMessage({ type: 'ended' });
      return false;
    }

    // Fill output with silence during fade-out or between clips
    for (let ch = 0; ch < chans; ch++) {
      output[ch].fill(0);
    }

    return true;
  }
}

registerProcessor('audio-processor', AudioStreamProcessor);
