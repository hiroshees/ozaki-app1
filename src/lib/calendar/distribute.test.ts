import { describe, expect, it } from 'vitest';
import {
  buildWeekBands,
  distributeEventsByDay,
  limitVisible,
  type EventPeriod,
} from '@/lib/calendar/distribute';

type Ev = EventPeriod & { id: string };

const jst = (s: string) => new Date(`${s}+09:00`);
const ev = (id: string, start: string, end: string, allDay = false): Ev => ({
  id,
  startsAt: jst(start),
  endsAt: jst(end),
  allDay,
});

const DAYS = ['2026-10-16', '2026-10-17', '2026-10-18', '2026-10-19'];
const ids = (segs: { event: Ev }[]) => segs.map((s) => s.event.id);

describe('distributeEventsByDay（時間指定の予定）', () => {
  it('23:00〜翌1:00 は両日に入り、各日の切り出し時刻が正しい', () => {
    const r = distributeEventsByDay(
      [ev('a', '2026-10-17T23:00', '2026-10-18T01:00')],
      DAYS,
    );
    const d17 = r['2026-10-17'].timed[0];
    const d18 = r['2026-10-18'].timed[0];
    expect(d17.start).toEqual(jst('2026-10-17T23:00'));
    expect(d17.end).toEqual(jst('2026-10-18T00:00'));
    expect(d17.isStart).toBe(true);
    expect(d17.isEnd).toBe(false);
    expect(d18.start).toEqual(jst('2026-10-18T00:00'));
    expect(d18.end).toEqual(jst('2026-10-18T01:00'));
    expect(d18.isStart).toBe(false);
    expect(d18.isEnd).toBe(true);
    expect(r['2026-10-16'].timed).toEqual([]);
    expect(r['2026-10-19'].timed).toEqual([]);
  });

  it('終了ちょうど 0:00 の予定は翌日に入らない', () => {
    const r = distributeEventsByDay(
      [ev('a', '2026-10-17T22:00', '2026-10-18T00:00')],
      DAYS,
    );
    expect(ids(r['2026-10-17'].timed)).toEqual(['a']);
    expect(r['2026-10-18'].timed).toEqual([]);
  });

  it('UTC 換算で日付がずれる時刻でも JST の暦日に入る', () => {
    // JST 10/17 08:00 = UTC 10/16 23:00
    const r = distributeEventsByDay(
      [ev('a', '2026-10-17T08:00', '2026-10-17T09:00')],
      DAYS,
    );
    expect(ids(r['2026-10-17'].timed)).toEqual(['a']);
    expect(r['2026-10-16'].timed).toEqual([]);
  });

  it('同じ日の並びは開始時刻順、同時刻は終了が遅い順', () => {
    const r = distributeEventsByDay(
      [
        ev('late', '2026-10-17T15:00', '2026-10-17T16:00'),
        ev('short', '2026-10-17T09:00', '2026-10-17T10:00'),
        ev('long', '2026-10-17T09:00', '2026-10-17T12:00'),
      ],
      DAYS,
    );
    expect(ids(r['2026-10-17'].timed)).toEqual(['long', 'short', 'late']);
  });

  it('範囲外の予定は入らない', () => {
    const r = distributeEventsByDay(
      [ev('a', '2026-10-25T09:00', '2026-10-25T10:00')],
      DAYS,
    );
    for (const k of DAYS) expect(r[k].timed).toEqual([]);
  });
});

describe('distributeEventsByDay（終日予定）', () => {
  it('1日の終日予定（終了は翌日 0:00）はその日だけに入り、時間指定と分かれる', () => {
    const r = distributeEventsByDay(
      [
        ev('d', '2026-10-17T00:00', '2026-10-18T00:00', true),
        ev('t', '2026-10-17T09:00', '2026-10-17T10:00'),
      ],
      DAYS,
    );
    expect(ids(r['2026-10-17'].allDay)).toEqual(['d']);
    expect(ids(r['2026-10-17'].timed)).toEqual(['t']);
    expect(r['2026-10-18'].allDay).toEqual([]);
  });

  it('複数日の終日予定は正しい日数分に入り、何日目かが分かる', () => {
    const r = distributeEventsByDay(
      [ev('d', '2026-10-17T00:00', '2026-10-20T00:00', true)],
      DAYS,
    );
    const segs = ['2026-10-17', '2026-10-18', '2026-10-19'].map(
      (k) => r[k].allDay[0],
    );
    expect(segs.map((s) => s.dayIndex)).toEqual([0, 1, 2]);
    expect(segs.every((s) => s.totalDays === 3)).toBe(true);
    expect(segs.map((s) => s.isStart)).toEqual([true, false, false]);
    expect(segs.map((s) => s.isEnd)).toEqual([false, false, true]);
    expect(r['2026-10-16'].allDay).toEqual([]);
  });

  it('範囲より前から続く終日予定は dayIndex が正しい', () => {
    const r = distributeEventsByDay(
      [ev('d', '2026-10-14T00:00', '2026-10-18T00:00', true)],
      DAYS,
    );
    expect(r['2026-10-16'].allDay[0].dayIndex).toBe(2);
    expect(r['2026-10-16'].allDay[0].totalDays).toBe(4);
  });

  it('終日予定は長い順（開始が早い、同じなら終了が遅い）に並ぶ', () => {
    const r = distributeEventsByDay(
      [
        ev('one', '2026-10-17T00:00', '2026-10-18T00:00', true),
        ev('three', '2026-10-17T00:00', '2026-10-20T00:00', true),
        ev('prev', '2026-10-16T00:00', '2026-10-18T00:00', true),
      ],
      DAYS,
    );
    expect(ids(r['2026-10-17'].allDay)).toEqual(['prev', 'three', 'one']);
  });
});

describe('buildWeekBands（月表示の帯）', () => {
  const WEEK = [
    '2026-10-11',
    '2026-10-12',
    '2026-10-13',
    '2026-10-14',
    '2026-10-15',
    '2026-10-16',
    '2026-10-17',
  ];

  it('週内に収まる複数日の終日予定は1本の帯になる', () => {
    const bands = buildWeekBands(
      [ev('a', '2026-10-12T00:00', '2026-10-15T00:00', true)],
      WEEK,
    );
    expect(bands).toHaveLength(1);
    expect(bands[0]).toMatchObject({
      startCol: 1,
      endCol: 3,
      row: 0,
      continuesBefore: false,
      continuesAfter: false,
    });
  });

  it('週をまたぐ予定は週ごとに分割され、続きが分かる', () => {
    const e = ev('a', '2026-10-15T00:00', '2026-10-21T00:00', true);
    const w1 = buildWeekBands([e], WEEK);
    const w2 = buildWeekBands(
      [e],
      [
        '2026-10-18',
        '2026-10-19',
        '2026-10-20',
        '2026-10-21',
        '2026-10-22',
        '2026-10-23',
        '2026-10-24',
      ],
    );
    expect(w1[0]).toMatchObject({
      startCol: 4,
      endCol: 6,
      continuesBefore: false,
      continuesAfter: true,
    });
    expect(w2[0]).toMatchObject({
      startCol: 0,
      endCol: 2,
      continuesBefore: true,
      continuesAfter: false,
    });
  });

  it('時間指定でも日をまたぐ予定は帯になるが、1日で終わる時間指定は帯にならない', () => {
    const bands = buildWeekBands(
      [
        ev('multi', '2026-10-12T22:00', '2026-10-14T02:00'),
        ev('single', '2026-10-12T09:00', '2026-10-12T10:00'),
      ],
      WEEK,
    );
    expect(bands.map((b) => b.event.id)).toEqual(['multi']);
    expect(bands[0]).toMatchObject({ startCol: 1, endCol: 3 });
  });

  it('重なる帯は別の行に、重ならない帯は同じ行に入る', () => {
    const bands = buildWeekBands(
      [
        ev('a', '2026-10-11T00:00', '2026-10-14T00:00', true),
        ev('b', '2026-10-12T00:00', '2026-10-15T00:00', true),
        ev('c', '2026-10-14T00:00', '2026-10-16T00:00', true),
      ],
      WEEK,
    );
    const row = (id: string) => bands.find((b) => b.event.id === id)?.row;
    expect(row('a')).toBe(0);
    expect(row('b')).toBe(1);
    expect(row('c')).toBe(0);
  });

  it('その週に触れない予定は含まれない', () => {
    expect(
      buildWeekBands(
        [ev('a', '2026-10-25T00:00', '2026-10-26T00:00', true)],
        WEEK,
      ),
    ).toEqual([]);
  });
});

describe('limitVisible（「他 N 件」）', () => {
  it('上限以内なら全件表示で hiddenCount は 0', () => {
    expect(limitVisible([1, 2, 3], 3)).toEqual({
      visible: [1, 2, 3],
      hiddenCount: 0,
    });
  });

  it('上限を超えた分が hiddenCount になる', () => {
    expect(limitVisible([1, 2, 3, 4, 5], 3)).toEqual({
      visible: [1, 2, 3],
      hiddenCount: 2,
    });
  });

  it('上限 0 なら全件が隠れる', () => {
    expect(limitVisible([1, 2], 0)).toEqual({ visible: [], hiddenCount: 2 });
  });
});
