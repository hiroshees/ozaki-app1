import { describe, expect, it } from 'vitest';
import {
  layoutOverlappingEvents,
  MINUTES_PER_DAY,
} from '@/lib/calendar/overlap-layout';

type Seg = { id: string; start: Date; end: Date };

// 2026-10-17(JST) の HH:mm。'24:00' は翌日 0:00
const at = (hm: string) => {
  const [h, m] = hm.split(':').map(Number);
  return new Date(
    new Date('2026-10-17T00:00:00+09:00').getTime() + (h * 60 + m) * 60000,
  );
};
const seg = (id: string, start: string, end: string): Seg => ({
  id,
  start: at(start),
  end: at(end),
});

const layout = (segs: Seg[], minMinutes = 0) =>
  layoutOverlappingEvents(segs, { minMinutes, key: (s) => s.id });

const byId = (segs: Seg[], minMinutes = 0) =>
  Object.fromEntries(layout(segs, minMinutes).map((l) => [l.item.id, l]));

describe('layoutOverlappingEvents', () => {
  it('重ならない予定は全て列数1で、縦位置が開始・長さに対応する', () => {
    const r = byId([seg('a', '09:00', '10:00'), seg('b', '13:30', '15:00')]);
    expect(r.a).toMatchObject({
      column: 0,
      columnCount: 1,
      topMinutes: 540,
      heightMinutes: 60,
    });
    expect(r.b).toMatchObject({
      column: 0,
      columnCount: 1,
      topMinutes: 810,
      heightMinutes: 90,
    });
  });

  it('2件が重なると列数2で別の列に入る', () => {
    const r = byId([seg('a', '09:00', '11:00'), seg('b', '10:00', '12:00')]);
    expect(r.a).toMatchObject({ column: 0, columnCount: 2 });
    expect(r.b).toMatchObject({ column: 1, columnCount: 2 });
  });

  it('A–B、B–C が重なり A–C は重ならない場合、列数を共有し A と C は同じ列', () => {
    const r = byId([
      seg('a', '09:00', '10:30'),
      seg('b', '10:00', '12:00'),
      seg('c', '11:00', '12:30'),
    ]);
    expect(r.a).toMatchObject({ column: 0, columnCount: 2 });
    expect(r.b).toMatchObject({ column: 1, columnCount: 2 });
    expect(r.c).toMatchObject({ column: 0, columnCount: 2 });
  });

  it('終了=開始で接する予定は別グループ（列数1）', () => {
    const r = byId([seg('a', '09:00', '10:00'), seg('b', '10:00', '11:00')]);
    expect(r.a).toMatchObject({ column: 0, columnCount: 1 });
    expect(r.b).toMatchObject({ column: 0, columnCount: 1 });
  });

  it('同じ開始時刻は終了が遅い順に並び、遅い方が先の列に入る', () => {
    const r = layout([
      seg('short', '09:00', '10:00'),
      seg('long', '09:00', '12:00'),
    ]);
    expect(r.map((l) => l.item.id)).toEqual(['long', 'short']);
    expect(r[0].column).toBe(0);
    expect(r[1].column).toBe(1);
  });

  it('3件が全て重なると列数3', () => {
    const r = byId([
      seg('a', '09:00', '12:00'),
      seg('b', '09:30', '12:00'),
      seg('c', '10:00', '12:00'),
    ]);
    expect([r.a.column, r.b.column, r.c.column]).toEqual([0, 1, 2]);
    expect([r.a.columnCount, r.b.columnCount, r.c.columnCount]).toEqual([
      3, 3, 3,
    ]);
  });

  it('別々のグループは列数を共有しない', () => {
    const r = byId([
      seg('a', '09:00', '10:00'),
      seg('b', '09:30', '10:30'),
      seg('c', '14:00', '15:00'),
    ]);
    expect(r.a.columnCount).toBe(2);
    expect(r.c.columnCount).toBe(1);
  });

  it('入力順に依存せず結果が同じになる', () => {
    const segs = [
      seg('a', '09:00', '10:30'),
      seg('b', '10:00', '12:00'),
      seg('c', '11:00', '12:30'),
      seg('d', '09:00', '09:45'),
      seg('e', '15:00', '16:00'),
    ];
    const base = layout(segs);
    for (const shuffled of [
      [...segs].reverse(),
      [segs[2], segs[4], segs[0], segs[3], segs[1]],
    ]) {
      expect(layout(shuffled)).toEqual(base);
    }
  });

  it('同じ時間帯の予定は key の順で安定して列が決まる', () => {
    const a = layout([seg('x', '09:00', '10:00'), seg('y', '09:00', '10:00')]);
    const b = layout([seg('y', '09:00', '10:00'), seg('x', '09:00', '10:00')]);
    expect(a).toEqual(b);
  });

  it('日の終わり（24:00）まで続く予定の高さが正しい', () => {
    const r = byId([seg('a', '23:00', '24:00')]);
    expect(r.a).toMatchObject({ topMinutes: 1380, heightMinutes: 60 });
    expect(r.a.topMinutes + r.a.heightMinutes).toBe(MINUTES_PER_DAY);
  });

  it('短い予定は最小の高さが確保され、その分の重なりも考慮される', () => {
    const r = byId(
      [seg('a', '09:00', '09:05'), seg('b', '09:10', '10:00')],
      15,
    );
    expect(r.a.heightMinutes).toBe(15);
    expect(r.a.columnCount).toBe(2);
    expect(r.b.column).toBe(1);
    // 最小時間を指定しなければ重ならない
    const r2 = byId(
      [seg('a', '09:00', '09:05'), seg('b', '09:10', '10:00')],
      0,
    );
    expect(r2.a.heightMinutes).toBe(5);
    expect(r2.a.columnCount).toBe(1);
  });

  it('日の終わりに近い短い予定も 24:00 を超えない', () => {
    const r = byId([seg('a', '23:55', '24:00')], 15);
    expect(r.a.topMinutes + r.a.heightMinutes).toBeLessThanOrEqual(
      MINUTES_PER_DAY,
    );
  });

  it('予定が無ければ空配列', () => {
    expect(layout([])).toEqual([]);
  });
});
