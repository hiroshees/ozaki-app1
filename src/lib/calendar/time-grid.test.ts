import { describe, expect, it } from 'vitest';
import {
  currentTimeMarker,
  GRID_HEIGHT_PX,
  HOUR_HEIGHT_PX,
  hourLabels,
  initialScrollMinutes,
  minutesSinceMidnightJst,
  minutesToOffset,
  offsetToMinutes,
  slotStartMinutes,
} from '@/lib/calendar/time-grid';

const jst = (s: string) => new Date(`${s}+09:00`);
const WEEK = [
  '2026-10-11',
  '2026-10-12',
  '2026-10-13',
  '2026-10-14',
  '2026-10-15',
  '2026-10-16',
  '2026-10-17',
];

describe('minutesToOffset / offsetToMinutes', () => {
  it('1時間は HOUR_HEIGHT_PX、24時間で GRID_HEIGHT_PX', () => {
    expect(minutesToOffset(60)).toBe(HOUR_HEIGHT_PX);
    expect(minutesToOffset(0)).toBe(0);
    expect(minutesToOffset(24 * 60)).toBe(GRID_HEIGHT_PX);
    expect(GRID_HEIGHT_PX).toBe(HOUR_HEIGHT_PX * 24);
  });

  it('位置と分は相互に変換できる', () => {
    expect(offsetToMinutes(minutesToOffset(95))).toBeCloseTo(95);
    expect(minutesToOffset(30)).toBe(HOUR_HEIGHT_PX / 2);
  });
});

describe('hourLabels', () => {
  it('0〜23時の24個', () => {
    const labels = hourLabels();
    expect(labels).toHaveLength(24);
    expect(labels[0]).toEqual({ hour: 0, text: '0:00' });
    expect(labels[23]).toEqual({ hour: 23, text: '23:00' });
  });
});

describe('minutesSinceMidnightJst', () => {
  it('JST の 0:00 からの分を返す', () => {
    expect(minutesSinceMidnightJst(jst('2026-10-17T00:00'))).toBe(0);
    expect(minutesSinceMidnightJst(jst('2026-10-17T09:30'))).toBe(570);
    expect(minutesSinceMidnightJst(jst('2026-10-17T23:59'))).toBe(23 * 60 + 59);
  });

  it('UTC では前日になる時刻でも JST で計算する', () => {
    // JST 01:15 = UTC 前日 16:15
    expect(minutesSinceMidnightJst(new Date('2026-10-16T16:15:00Z'))).toBe(75);
  });

  it('秒も小数の分として含む', () => {
    expect(minutesSinceMidnightJst(jst('2026-10-17T00:00:30'))).toBeCloseTo(
      0.5,
    );
  });
});

describe('currentTimeMarker', () => {
  it('今日が表示範囲にあれば、その列番号と時刻を返す', () => {
    expect(currentTimeMarker(jst('2026-10-14T10:30'), WEEK)).toEqual({
      column: 3,
      minutes: 630,
    });
  });

  it('JST の日付で今日を判定する（UTC 前日の時刻でも）', () => {
    // UTC 2026-10-16 16:00 は JST 10/17 01:00 → 最終列
    expect(currentTimeMarker(new Date('2026-10-16T16:00:00Z'), WEEK)).toEqual({
      column: 6,
      minutes: 60,
    });
  });

  it('表示範囲に今日が無ければ null', () => {
    expect(currentTimeMarker(jst('2026-10-20T10:00'), WEEK)).toBeNull();
  });

  it('日表示（1列）でも使える', () => {
    expect(currentTimeMarker(jst('2026-10-17T08:00'), ['2026-10-17'])).toEqual({
      column: 0,
      minutes: 480,
    });
    expect(
      currentTimeMarker(jst('2026-10-17T08:00'), ['2026-10-18']),
    ).toBeNull();
  });
});

describe('initialScrollMinutes', () => {
  it('今日を含む表示では、現在時刻の少し前', () => {
    expect(initialScrollMinutes(jst('2026-10-17T15:00'), true)).toBe(14 * 60);
  });

  it('現在時刻が早朝なら 0 より前にはならない', () => {
    expect(initialScrollMinutes(jst('2026-10-17T00:20'), true)).toBe(0);
  });

  it('今日を含まない表示では朝8時', () => {
    expect(initialScrollMinutes(jst('2026-10-17T15:00'), false)).toBe(8 * 60);
  });
});

describe('slotStartMinutes（空き時間クリックの開始時刻）', () => {
  it('クリック位置を15分単位に切り下げる', () => {
    expect(slotStartMinutes(0)).toBe(0);
    expect(slotStartMinutes(minutesToOffset(60))).toBe(60);
    // 1:14 → 1:00、1:15 → 1:15
    expect(slotStartMinutes(minutesToOffset(74))).toBe(60);
    expect(slotStartMinutes(minutesToOffset(75))).toBe(75);
    expect(slotStartMinutes(minutesToOffset(89.9))).toBe(75);
  });

  it('30分の予定が24:00を超えないよう、最後は23:30に収める', () => {
    expect(slotStartMinutes(minutesToOffset(23 * 60 + 29))).toBe(23 * 60 + 15);
    expect(slotStartMinutes(minutesToOffset(23 * 60 + 40))).toBe(23 * 60 + 30);
    expect(slotStartMinutes(GRID_HEIGHT_PX)).toBe(23 * 60 + 30);
    expect(slotStartMinutes(GRID_HEIGHT_PX + 100)).toBe(23 * 60 + 30);
  });

  it('範囲外（負の位置）は 0:00', () => {
    expect(slotStartMinutes(-10)).toBe(0);
  });
});
