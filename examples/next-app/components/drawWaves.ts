/**
 * returns bar heights scaled from 0 to 1
 */

const N_BARS = 20;

const getMax = (array: Uint8Array) => {
  return array.reduce((a, b) => {
    if (a > b) {
      return a;
    } else {
      return b;
    }
  }, 0);
};

const getAverage = (array: Uint8Array) => {
  const count = array.length;
  return array.reduce((a, b) => {
    return a + b / count;
  }, 0);
};

const getBatches = (array: Uint8Array, n_batches: number) => {
  const batchSize = array.length / n_batches;
  let batches = [];
  for (let i = 0; i < n_batches; i++) {
    const batch = array.slice(i * batchSize, (i + 1) * batchSize);
    batches.push(batch);
  }

  return batches;
};

const doMath = (array: Uint8Array): number[] => {
  const barHeights: number[] = [];
  const batches = getBatches(array, N_BARS);

  for (let i = 0; i < N_BARS; i++) {
    const batch = batches[i];
    const average = getAverage(batch);
    const max = getMax(batch);
    barHeights[i] = average / max || 0.01;
  }

  return barHeights;
};

const getHexFromNumber = (x: number) => {
  if (x >= 256) {
    throw new Error('Not valid hex value.');
  }
  const [first, second] = [parseInt(`${x / 16}`), parseInt(`${x % 16}`)];
  const keys = '01234567890abcdef'.split('');
  return `${keys[first]}${keys[second]}`;
};

const getRandomColor = () => {
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const num = parseInt(`${256 * Math.random()}`);
    const hex = getHexFromNumber(num);

    color = color.concat(hex);
  }

  return color;
};

const drawWaves = (
  analyserNode: AnalyserNode,
  dataArray: Uint8Array,
  canvasCtx: CanvasRenderingContext2D,
) => {
  const [height, width] = [canvasCtx.canvas.height, canvasCtx.canvas.width];
  console.log(height, width);

  const draw = () => {
    requestAnimationFrame(draw);
    analyserNode.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = '#ffffff';
    canvasCtx.fillRect(0, 0, width, height);

    const bars = doMath(dataArray);

    for (let bar = 0; bar < bars.length; bar++) {
      const gradient = canvasCtx.createRadialGradient(
        width / 2,
        height / 2,
        height / 2,
        width,
        height,
        height,
      );
      gradient.addColorStop(bar / bars.length, getRandomColor());

      canvasCtx.fillStyle = gradient;
      canvasCtx.fillRect(0, 0, width, height);
    }
  };
  draw();
};

export { drawWaves };
