import { describe, expect, it } from 'vitest';

import { keepLastN } from '.';

describe('keepLastN', () => {
  it.each([50, 100, 1000])(
    'should keep the last N elements of an array',
    (n) => {
      const arr = Array.from({ length: 5000 }, (_, i) => i);

      const result = keepLastN(n, arr);

      expect(result).toHaveLength(n);
      expect(result.at(0)).toBe(arr.length - n);
      expect(result.at(-1)).toBe(arr.length - 1);
    },
  );
});
