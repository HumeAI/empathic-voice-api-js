export const keepLastN = <T>(n: number, arr: T[]): T[] => {
  if (arr.length <= n) {
    return arr;
  }
  return arr.slice(arr.length - n);
};
