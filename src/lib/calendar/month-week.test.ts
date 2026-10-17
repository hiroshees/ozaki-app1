import { describe, expect, it } from 'vitest';
import { buildMonthWeek, formatEventLabel } from '@/lib/calendar/month-week';
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
const ev = (id: string, start: string, end: string, allDay = false): Ev => ({
  id,
  startsAt: jst(start),
  endsAt: jst(end),
  allDay,
});
const allDay = (id: string, firstDay: string, lastDayExclusive: string) =>
  ev(id, `${firstDay}T00:00`, `${lastDayExclusive}T00:00`, true);
const timed = (id: string, day: string, from: string, to: string) =>
  ev(id, `${day}T${from}`, `${day}T${to}`);

const ids = (segs: { event: Ev }[]) => segs.map((s) => s.event.id);
const dayOf = (week: ReturnType<typeof buildMonthWeek<Ev>>, key: string) =>
  week.days.find((d) => d.key === key)!;

describe('buildMonthWeek', () => {
  it('予定が無ければ、帯も日別の予定も無い', () => {
    const w = buildMonthWeek<Ev>([], WEEK, 4);
    expect(w.bands).toEqual([]);
    expect(w.bandRows).toBe(0);
    expect(w.days).toHaveLength(7);
    expect(
      w.days.every((d) => d.timed.length === 0 && d.hiddenCount === 0),
    ).toBe(true);
  });

  it('1日で終わる時間指定の予定は、その日に開始時刻順で入り、帯にはならない', () => {
    const w = buildMonthWeek(
      [
        timed('b', '2026-10-13', '15:00', '16:00'),
        timed('a', '2026-10-13', '09:00', '10:00'),
      ],
      WEEK,
      4,
    );
    expect(w.bands).toEqual([]);
    expect(ids(dayOf(w, '2026-10-13').timed)).toEqual(['a', 'b']);
  });

  it('終日予定は帯になる。日をまたぐ時間指定の予定も帯になり、日別の一覧には入らない', () => {
    const w = buildMonthWeek(
      [
        allDay('d', '2026-10-12', '2026-10-15'),
        ev('n', '2026-10-13T23:00', '2026-10-14T01:00'),
      ],
      WEEK,
      4,
    );
    expect(w.bands.map((b) => b.event.id).sort()).toEqual(['d', 'n']);
    expect(w.days.every((d) => d.timed.length === 0)).toBe(true);
  });

  it('bandRows は表示する帯の行数', () => {
    const w = buildMonthWeek(
      [
        allDay('a', '2026-10-11', '2026-10-14'),
        allDay('b', '2026-10-12', '2026-10-15'),
      ],
      WEEK,
      4,
    );
    expect(w.bandRows).toBe(2);
  });

  it('収まる場合は全て表示し、「他 N 件」は 0', () => {
    const w = buildMonthWeek(
      [1, 2, 3, 4].map((i) =>
        timed(`t${i}`, '2026-10-13', `0${i}:00`, `0${i}:30`),
      ),
      WEEK,
      4,
    );
    const d = dayOf(w, '2026-10-13');
    expect(d.timed).toHaveLength(4);
    expect(d.hiddenCount).toBe(0);
  });

  it('あふれる日は最終行を「他 N 件」に使い、N は隠れた数', () => {
    const w = buildMonthWeek(
      [1, 2, 3, 4, 5, 6].map((i) =>
        timed(`t${i}`, '2026-10-13', `0${i}:00`, `0${i}:30`),
      ),
      WEEK,
      4,
    );
    const d = dayOf(w, '2026-10-13');
    expect(ids(d.timed)).toEqual(['t1', 't2', 't3']);
    expect(d.hiddenCount).toBe(3);
    // 他の日には影響しない
    expect(dayOf(w, '2026-10-14').hiddenCount).toBe(0);
  });

  it('帯が行を使う分、単日の予定の表示数が減る', () => {
    const base = [allDay('band', '2026-10-12', '2026-10-15')];
    const three = [1, 2, 3].map((i) =>
      timed(`t${i}`, '2026-10-13', `0${i}:00`, `0${i}:30`),
    );
    const w3 = buildMonthWeek([...base, ...three], WEEK, 4);
    expect(dayOf(w3, '2026-10-13').timed).toHaveLength(3);
    expect(dayOf(w3, '2026-10-13').hiddenCount).toBe(0);

    const four = [...three, timed('t4', '2026-10-13', '04:00', '04:30')];
    const w4 = buildMonthWeek([...base, ...four], WEEK, 4);
    expect(dayOf(w4, '2026-10-13').timed).toHaveLength(2);
    expect(dayOf(w4, '2026-10-13').hiddenCount).toBe(2);
  });

  it('行が足りず隠れた帯も「他 N 件」に数え、その帯が通る日だけに付く', () => {
    const bands = [
      allDay('a', '2026-10-11', '2026-10-18'),
      allDay('b', '2026-10-11', '2026-10-18'),
      allDay('c', '2026-10-11', '2026-10-18'),
      allDay('d', '2026-10-11', '2026-10-18'),
      allDay('e', '2026-10-12', '2026-10-14'),
    ];
    const w = buildMonthWeek(bands, WEEK, 4);
    // 最終行を「他 N 件」用に空ける → 帯は 3 行まで
    expect(w.bands.every((b) => b.row < 3)).toBe(true);
    expect(w.bandRows).toBe(3);
    // 通常の日: d が隠れて 1 件、e が通る 10/12・10/13 は 2 件
    expect(dayOf(w, '2026-10-11').hiddenCount).toBe(1);
    expect(dayOf(w, '2026-10-12').hiddenCount).toBe(2);
    expect(dayOf(w, '2026-10-13').hiddenCount).toBe(2);
    expect(dayOf(w, '2026-10-14').hiddenCount).toBe(1);
  });

  it('どの日でも、表示した件数 + 「他 N 件」 = その日の予定の総数', () => {
    const events = [
      allDay('a', '2026-10-11', '2026-10-14'),
      allDay('b', '2026-10-12', '2026-10-16'),
      allDay('c', '2026-10-12', '2026-10-13'),
      ev('multi', '2026-10-13T22:00', '2026-10-15T02:00'),
      ...[1, 2, 3, 4, 5].map((i) =>
        timed(`t${i}`, '2026-10-13', `0${i}:00`, `0${i}:30`),
      ),
      timed('x', '2026-10-16', '09:00', '10:00'),
    ];
    const w = buildMonthWeek(events, WEEK, 4);
    WEEK.forEach((key, col) => {
      const total = events.filter((e) => {
        const first = e.startsAt.getTime();
        const last = e.endsAt.getTime() - 1;
        const day0 = jst(`${key}T00:00`).getTime();
        return first < day0 + 86400000 && last >= day0;
      }).length;
      const shownBands = w.bands.filter(
        (b) => b.startCol <= col && col <= b.endCol,
      ).length;
      const d = dayOf(w, key);
      expect(shownBands + d.timed.length + d.hiddenCount).toBe(total);
    });
  });
});

describe('formatEventLabel', () => {
  const e = { title: '会議', startsAt: jst('2026-10-17T09:05'), allDay: false };

  it('時間指定は JST の開始時刻をつける', () => {
    expect(formatEventLabel(e, true)).toBe('9:05 会議');
  });

  it('時刻をつけない指定や終日はタイトルのみ', () => {
    expect(formatEventLabel(e, false)).toBe('会議');
    expect(formatEventLabel({ ...e, allDay: true }, true)).toBe('会議');
  });

  it('UTC では前日になる時刻でも JST で表示する', () => {
    // JST 00:30 = UTC 前日 15:30
    expect(
      formatEventLabel({ ...e, startsAt: jst('2026-10-17T00:30') }, true),
    ).toBe('0:30 会議');
  });
});
