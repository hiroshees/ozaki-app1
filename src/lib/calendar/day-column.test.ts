import { describe, expect, it } from 'vitest';
import {
  layoutDayColumns,
  MIN_BLOCK_MINUTES,
  showsTimeRange,
} from '@/lib/calendar/day-column';
import { HOUR_HEIGHT_PX } from '@/lib/calendar/time-grid';
import type { EventPeriod } from '@/lib/calendar/distribute';

type Ev = EventPeriod & { id: string };

const jst = (s: string) => new Date(`${s}+09:00`);
const ev = (id: string, start: string, end: string, allDay = false): Ev => ({
  id,
  startsAt: jst(start),
  endsAt: jst(end),
  allDay,
});
const D1 = '2026-10-17';
const D2 = '2026-10-18';
const at = (day: string, hm: string) => `${day}T${hm}`;

const blocks = (events: Ev[], day = D1, days = [D1, D2]) =>
  layoutDayColumns(events, days)[day];
const byId = (events: Ev[], day = D1) =>
  Object.fromEntries(blocks(events, day).map((b) => [b.segment.event.id, b]));

describe('layoutDayColumns', () => {
  it('予定が無い日は空配列', () => {
    expect(layoutDayColumns<Ev>([], [D1, D2])).toEqual({ [D1]: [], [D2]: [] });
  });

  it('重ならない予定は幅いっぱいで、縦位置と高さが時刻に対応する', () => {
    const b = byId([ev('a', at(D1, '09:00'), at(D1, '10:30'))]);
    expect(b.a).toMatchObject({
      topMinutes: 540,
      heightMinutes: 90,
      leftPercent: 0,
      widthPercent: 100,
    });
    expect(b.a.topPx).toBe((540 / 60) * HOUR_HEIGHT_PX);
    expect(b.a.heightPx).toBe((90 / 60) * HOUR_HEIGHT_PX);
  });

  it('重なる2件は横に半分ずつ並ぶ', () => {
    const b = byId([
      ev('a', at(D1, '09:00'), at(D1, '11:00')),
      ev('b', at(D1, '10:00'), at(D1, '12:00')),
    ]);
    expect(b.a).toMatchObject({ leftPercent: 0, widthPercent: 50 });
    expect(b.b).toMatchObject({ leftPercent: 50, widthPercent: 50 });
  });

  it('3件が全て重なると3列', () => {
    const b = byId([
      ev('a', at(D1, '09:00'), at(D1, '12:00')),
      ev('b', at(D1, '09:30'), at(D1, '12:00')),
      ev('c', at(D1, '10:00'), at(D1, '12:00')),
    ]);
    expect([b.a, b.b, b.c].map((x) => x.column)).toEqual([0, 1, 2]);
    expect(b.a.widthPercent).toBeCloseTo(100 / 3);
    expect(b.c.leftPercent).toBeCloseTo((100 / 3) * 2);
  });

  it('A–B、B–C が重なり A–C が重ならないとき、A と C は同じ列で列数を共有する', () => {
    const b = byId([
      ev('a', at(D1, '09:00'), at(D1, '10:30')),
      ev('b', at(D1, '10:00'), at(D1, '12:00')),
      ev('c', at(D1, '11:00'), at(D1, '12:30')),
    ]);
    expect(b.a.column).toBe(0);
    expect(b.c.column).toBe(0);
    expect(b.b.column).toBe(1);
    expect([b.a, b.b, b.c].every((x) => x.widthPercent === 50)).toBe(true);
  });

  it('日付をまたぐ予定（23:00〜翌1:00）は両日に、その日の分だけ描画される', () => {
    const events = [ev('night', at(D1, '23:00'), at(D2, '01:00'))];
    const day1 = byId(events, D1).night;
    const day2 = byId(events, D2).night;
    expect(day1).toMatchObject({ topMinutes: 1380, heightMinutes: 60 });
    expect(day1.segment).toMatchObject({ isStart: true, isEnd: false });
    expect(day2).toMatchObject({ topMinutes: 0, heightMinutes: 60 });
    expect(day2.segment).toMatchObject({ isStart: false, isEnd: true });
  });

  it('終了ちょうど 0:00 の予定は翌日に出ない', () => {
    const events = [ev('a', at(D1, '22:00'), at(D2, '00:00'))];
    expect(blocks(events, D2)).toEqual([]);
    expect(byId(events, D1).a).toMatchObject({
      topMinutes: 1320,
      heightMinutes: 120,
    });
  });

  it('終日予定は含まれない', () => {
    const events = [ev('d', at(D1, '00:00'), at(D2, '00:00'), true)];
    expect(blocks(events, D1)).toEqual([]);
  });

  it('15分の予定でも、判別できる最小の高さを確保する', () => {
    const b = byId([ev('a', at(D1, '09:00'), at(D1, '09:15'))]);
    expect(b.a.heightMinutes).toBe(MIN_BLOCK_MINUTES);
    expect(b.a.heightPx).toBeGreaterThanOrEqual(20);
  });

  it('最小の高さに伸びた分も重なりとして扱う', () => {
    const b = byId([
      ev('a', at(D1, '09:00'), at(D1, '09:10')),
      ev('b', at(D1, '09:20'), at(D1, '10:00')),
    ]);
    expect(b.a.widthPercent).toBe(50);
    expect(b.b.leftPercent).toBe(50);
  });

  it('日の終わりに近い予定も 24:00 を超えない', () => {
    const b = byId([ev('a', at(D1, '23:50'), at(D2, '00:00'))]);
    expect(b.a.topMinutes + b.a.heightMinutes).toBeLessThanOrEqual(1440);
  });

  it('UTC では前日になる時刻でも JST の日に描画される', () => {
    // JST 10/17 08:00 = UTC 10/16 23:00
    const events = [ev('a', at(D1, '08:00'), at(D1, '09:00'))];
    expect(byId(events, D1).a.topMinutes).toBe(480);
  });

  it('入力順に依存しない', () => {
    const events = [
      ev('a', at(D1, '09:00'), at(D1, '10:30')),
      ev('b', at(D1, '10:00'), at(D1, '12:00')),
      ev('c', at(D1, '11:00'), at(D1, '12:30')),
    ];
    expect(layoutDayColumns([...events].reverse(), [D1, D2])).toEqual(
      layoutDayColumns(events, [D1, D2]),
    );
  });
});

describe('showsTimeRange', () => {
  it('高さが足りないときは時刻を出さない', () => {
    expect(showsTimeRange(30)).toBe(false);
    expect(showsTimeRange(44)).toBe(false);
  });

  it('45分以上なら時刻も出す', () => {
    expect(showsTimeRange(45)).toBe(true);
    expect(showsTimeRange(120)).toBe(true);
  });
});
