import { describe, expect, it } from 'vitest';
import { buildAllDayArea, ALL_DAY_MAX_ROWS } from '@/lib/calendar/all-day';
import type { EventPeriod } from '@/lib/calendar/distribute';

type Ev = EventPeriod & { id: string };

const WEEK = [
  '2026-10-11',
  '2026-10-12',
  '2026-10-13',
  '2026-10-14',
  '2026-10-15',
  '2026-10-16',
  '2026-10-17',
];
const jst = (s: string) => new Date(`${s}+09:00`);
const allDay = (
  id: string,
  firstDay: string,
  lastDayExclusive: string,
): Ev => ({
  id,
  startsAt: jst(`${firstDay}T00:00`),
  endsAt: jst(`${lastDayExclusive}T00:00`),
  allDay: true,
});
const timed = (id: string, start: string, end: string): Ev => ({
  id,
  startsAt: jst(start),
  endsAt: jst(end),
  allDay: false,
});

describe('buildAllDayArea', () => {
  it('終日予定が無ければ空（行なし）', () => {
    const a = buildAllDayArea<Ev>([], WEEK);
    expect(a.bands).toEqual([]);
    expect(a.rowCount).toBe(0);
    expect(a.days.every((d) => d.hiddenCount === 0)).toBe(true);
  });

  it('時間指定の予定は、日をまたぐものも含めて欄に出ない', () => {
    const a = buildAllDayArea(
      [
        timed('night', '2026-10-13T23:00', '2026-10-14T01:00'),
        timed('long', '2026-10-12T09:00', '2026-10-15T09:00'),
        timed('single', '2026-10-13T09:00', '2026-10-13T10:00'),
      ],
      WEEK,
    );
    expect(a.bands).toEqual([]);
    expect(a.rowCount).toBe(0);
  });

  it('複数日の終日予定は複数列にまたがる1本の帯', () => {
    const a = buildAllDayArea([allDay('a', '2026-10-12', '2026-10-15')], WEEK);
    expect(a.bands).toHaveLength(1);
    expect(a.bands[0]).toMatchObject({ startCol: 1, endCol: 3, row: 0 });
    expect(a.rowCount).toBe(1);
  });

  it('範囲の前後へ続く終日予定は、続きが分かる', () => {
    const a = buildAllDayArea([allDay('a', '2026-10-08', '2026-10-20')], WEEK);
    expect(a.bands[0]).toMatchObject({
      startCol: 0,
      endCol: 6,
      continuesBefore: true,
      continuesAfter: true,
    });
  });

  it('重なる終日予定は別の行になる', () => {
    const a = buildAllDayArea(
      [
        allDay('a', '2026-10-12', '2026-10-15'),
        allDay('b', '2026-10-13', '2026-10-16'),
      ],
      WEEK,
    );
    expect(a.bands.map((b) => b.row).sort()).toEqual([0, 1]);
    expect(a.rowCount).toBe(2);
  });

  it(`上限(${ALL_DAY_MAX_ROWS}行)に収まれば「他 N 件」は出ない`, () => {
    const events = [1, 2, 3].map((i) =>
      allDay(`e${i}`, '2026-10-12', '2026-10-13'),
    );
    const a = buildAllDayArea(events, WEEK);
    expect(a.rowCount).toBe(ALL_DAY_MAX_ROWS);
    expect(a.days.every((d) => d.hiddenCount === 0)).toBe(true);
  });

  it('上限を超えると最終行が「他 N 件」になり、N が正しい（その日だけに付く）', () => {
    const events = [1, 2, 3, 4, 5].map((i) =>
      allDay(`e${i}`, '2026-10-12', '2026-10-13'),
    );
    const a = buildAllDayArea(events, WEEK);
    // 3行のうち最終行を「他 N 件」に使う → 帯は 2 行まで
    expect(a.bands).toHaveLength(2);
    expect(a.rowCount).toBe(ALL_DAY_MAX_ROWS);
    expect(a.days[1].hiddenCount).toBe(3);
    expect(a.days[0].hiddenCount).toBe(0);
    expect(a.days[2].hiddenCount).toBe(0);
  });

  it('表示した帯 + 「他 N 件」 = その日の終日予定の総数', () => {
    const events = [
      allDay('a', '2026-10-11', '2026-10-15'),
      allDay('b', '2026-10-12', '2026-10-14'),
      allDay('c', '2026-10-12', '2026-10-13'),
      allDay('d', '2026-10-12', '2026-10-13'),
      allDay('e', '2026-10-13', '2026-10-17'),
    ];
    const a = buildAllDayArea(events, WEEK);
    WEEK.forEach((key, col) => {
      const total = events.filter(
        (e) =>
          e.startsAt.getTime() < jst(`${key}T00:00`).getTime() + 86400000 &&
          e.endsAt.getTime() > jst(`${key}T00:00`).getTime(),
      ).length;
      const shown = a.bands.filter(
        (b) => b.startCol <= col && col <= b.endCol,
      ).length;
      expect(shown + a.days[col].hiddenCount).toBe(total);
    });
  });

  it('日表示（1列）でも、その日にかかる終日予定（複数日の途中を含む）が出る', () => {
    const a = buildAllDayArea(
      [allDay('a', '2026-10-12', '2026-10-17')],
      ['2026-10-14'],
    );
    expect(a.bands).toHaveLength(1);
    expect(a.bands[0]).toMatchObject({
      startCol: 0,
      endCol: 0,
      continuesBefore: true,
      continuesAfter: true,
    });
  });

  it('その日にかからない終日予定は出ない', () => {
    const a = buildAllDayArea(
      [allDay('a', '2026-10-15', '2026-10-16')],
      ['2026-10-14'],
    );
    expect(a.bands).toEqual([]);
    expect(a.rowCount).toBe(0);
  });
});
