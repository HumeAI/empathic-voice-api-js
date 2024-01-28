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
    barHeights[i] = average / max || .01;
  }

  return barHeights;
};

export { doMath };
