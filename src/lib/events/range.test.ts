import { describe, expect, it } from 'vitest';
import { buildRangeFilter, overlapsRange } from '@/lib/events/range';

const d = (s: string) => new Date(s);
const rangeStart = d('2026-10-17T00:00:00Z');
const rangeEnd = d('2026-10-18T00:00:00Z');

const overlaps = (s: string, e: string) =>
  overlapsRange({ startsAt: d(s), endsAt: d(e) }, rangeStart, rangeEnd);

describe('overlapsRange', () => {
  it('範囲内の予定は含まれる', () => {
    expect(overlaps('2026-10-17T01:00:00Z', '2026-10-17T02:00:00Z')).toBe(true);
  });

  it('終了ちょうどに開始する予定は含まれない', () => {
    expect(overlaps('2026-10-18T00:00:00Z', '2026-10-18T01:00:00Z')).toBe(
      false,
    );
  });

  it('開始ちょうどに終了する予定は含まれない', () => {
    expect(overlaps('2026-10-16T23:00:00Z', '2026-10-17T00:00:00Z')).toBe(
      false,
    );
  });

  it('日付をまたぐ予定（前日から当日）は含まれる', () => {
    expect(overlaps('2026-10-16T23:00:00Z', '2026-10-17T01:00:00Z')).toBe(true);
  });

  it('日付をまたぐ予定（当日から翌日）は含まれる', () => {
    expect(overlaps('2026-10-17T23:00:00Z', '2026-10-18T01:00:00Z')).toBe(true);
  });

  it('範囲を内包する予定は含まれる', () => {
    expect(overlaps('2026-10-10T00:00:00Z', '2026-10-30T00:00:00Z')).toBe(true);
  });

  it('範囲外の予定は含まれない', () => {
    expect(overlaps('2026-10-20T00:00:00Z', '2026-10-21T00:00:00Z')).toBe(
      false,
    );
  });
});

describe('buildRangeFilter', () => {
  it('starts_at < 範囲の終わり AND ends_at > 範囲の始まり の値を ISO 文字列で返す', () => {
    expect(buildRangeFilter(rangeStart, rangeEnd)).toEqual({
      startsBefore: '2026-10-18T00:00:00.000Z',
      endsAfter: '2026-10-17T00:00:00.000Z',
    });
  });

  it('範囲の終わりが始まり以前ならエラー', () => {
    expect(() => buildRangeFilter(rangeEnd, rangeStart)).toThrow();
    expect(() => buildRangeFilter(rangeStart, rangeStart)).toThrow();
  });

  it('不正な日付はエラー', () => {
    expect(() => buildRangeFilter(new Date('x'), rangeEnd)).toThrow();
  });
});
