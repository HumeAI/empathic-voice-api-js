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
  const batches = [];
  for (let i = 0; i < n_batches; i++) {
    const batch = array.slice(i * batchSize, (i + 1) * batchSize);
    batches.push(batch);
  }

  return batches;
};

const getAverageBatchHeight = (array: Uint8Array): number[] => {
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

const drawBars = (
  analyserNode: AnalyserNode,
  dataArray: Uint8Array,
  canvasCtx: CanvasRenderingContext2D,
) => {
  const [height, width] = [canvasCtx.canvas.height, canvasCtx.canvas.width];

  const draw = () => {
    requestAnimationFrame(draw);
    analyserNode.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = '#ffffff';
    canvasCtx.fillRect(0, 0, width, height);

    let x = 0;
    const bars = getAverageBatchHeight(dataArray);
    const barWidth = width / bars.length;

    for (let bar = 0; bar < bars.length; bar++) {
      canvasCtx.fillStyle = 'rgb(50,50,50)';
      const barHeight = (bars[bar] / 2) * height;
      canvasCtx.fillRect(x, height / 2 - barHeight, barWidth, 2 * barHeight);

      x += barWidth + 1;
    }
  };
  draw();
};

export { drawBars };
