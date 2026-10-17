import { describe, expect, it } from 'vitest';
import { getRandom } from '@/lib/functions';

// Vitest と @/ エイリアスの動作確認用
describe('getRandom', () => {
  it('min 以上 max 以下の整数を返す', () => {
    for (let i = 0; i < 100; i++) {
      const n = getRandom(1, 3);
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(3);
    }
  });
});
