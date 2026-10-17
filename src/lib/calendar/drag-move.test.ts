import { describe, expect, it } from 'vitest';
import {
  computeMove,
  DRAG_STEP_MINUTES,
  isDraggableBlock,
  shiftEventTimes,
} from '@/lib/calendar/drag-move';
import { HOUR_HEIGHT_PX, minutesToOffset } from '@/lib/calendar/time-grid';

const jst = (s: string) => new Date(`${s}+09:00`);

// 9:00〜10:00（60分）の予定、週表示の4列目（0始まりで 3）、列の幅 100px
const base = {
  columnWidth: 100,
  columnIndex: 3,
  columnCount: 7,
  topMinutes: 9 * 60,
  durationMinutes: 60,
};

describe('computeMove（縦: 15分単位）', () => {
  it('動かしていなければ 0', () => {
    expect(computeMove({ ...base, deltaX: 0, deltaY: 0 })).toEqual({
      minutes: 0,
      days: 0,
    });
  });

  it('15分単位に丸める（1時間 = HOUR_HEIGHT_PX）', () => {
    expect(DRAG_STEP_MINUTES).toBe(15);
    // 1時間下へ
    expect(
      computeMove({ ...base, deltaX: 0, deltaY: HOUR_HEIGHT_PX }).minutes,
    ).toBe(60);
    // 上へ 1時間
    expect(
      computeMove({ ...base, deltaX: 0, deltaY: -HOUR_HEIGHT_PX }).minutes,
    ).toBe(-60);
    // 8分は15分の半分(7.5)を超えるので 15 分、7分は超えないので 0
    expect(
      computeMove({ ...base, deltaX: 0, deltaY: minutesToOffset(8) }).minutes,
    ).toBe(15);
    expect(
      computeMove({ ...base, deltaX: 0, deltaY: minutesToOffset(7) }).minutes,
    ).toBe(0);
    expect(
      computeMove({ ...base, deltaX: 0, deltaY: minutesToOffset(-8) }).minutes,
    ).toBe(-15);
  });

  it('0:00 より上には動かせない', () => {
    // 9:00 開始 → 最大 540 分戻せる
    expect(
      computeMove({ ...base, deltaX: 0, deltaY: -HOUR_HEIGHT_PX * 20 }).minutes,
    ).toBe(-540);
  });

  it('24:00 より下には動かせない（長さ分を除く）', () => {
    // 9:00〜10:00 → 開始は最大 23:00。24*60 - 60 - 540 = 840 分進められる
    expect(
      computeMove({ ...base, deltaX: 0, deltaY: HOUR_HEIGHT_PX * 30 }).minutes,
    ).toBe(840);
  });

  it('長さが長い予定は、それだけ下に動かせる範囲が狭い', () => {
    const r = computeMove({
      ...base,
      durationMinutes: 180,
      deltaX: 0,
      deltaY: HOUR_HEIGHT_PX * 30,
    });
    expect(r.minutes).toBe(24 * 60 - 180 - 540);
  });
});

describe('computeMove（横: 日）', () => {
  it('列の幅ごとに日数へ丸める（半分を超えたら隣の日）', () => {
    expect(computeMove({ ...base, deltaX: 49, deltaY: 0 }).days).toBe(0);
    expect(computeMove({ ...base, deltaX: 51, deltaY: 0 }).days).toBe(1);
    expect(computeMove({ ...base, deltaX: -151, deltaY: 0 }).days).toBe(-2);
  });

  it('表示中の日の範囲外には動かせない', () => {
    // 4列目(index 3)は、左へ最大 3 日、右へ最大 3 日
    expect(computeMove({ ...base, deltaX: -1000, deltaY: 0 }).days).toBe(-3);
    expect(computeMove({ ...base, deltaX: 1000, deltaY: 0 }).days).toBe(3);
  });

  it('日表示（1列）では横には動かない', () => {
    expect(
      computeMove({
        ...base,
        columnIndex: 0,
        columnCount: 1,
        deltaX: 500,
        deltaY: 0,
      }).days,
    ).toBe(0);
  });

  it('列の幅が 0（未計測）でも落ちず、横には動かない', () => {
    expect(
      computeMove({ ...base, columnWidth: 0, deltaX: 300, deltaY: 0 }).days,
    ).toBe(0);
  });

  it('縦と横を同時に動かせる', () => {
    expect(
      computeMove({ ...base, deltaX: 100, deltaY: HOUR_HEIGHT_PX / 2 }),
    ).toEqual({
      minutes: 30,
      days: 1,
    });
  });
});

describe('shiftEventTimes', () => {
  const start = jst('2026-10-17T09:00');
  const end = jst('2026-10-17T10:30');

  it('長さを保ったまま、分と日を動かす', () => {
    const r = shiftEventTimes(start, end, 75, 0);
    expect(r.startsAt).toEqual(jst('2026-10-17T10:15'));
    expect(r.endsAt).toEqual(jst('2026-10-17T11:45'));
    expect(r.endsAt.getTime() - r.startsAt.getTime()).toBe(
      end.getTime() - start.getTime(),
    );
  });

  it('日を動かすと、JST の同じ時刻のまま別の日になる（月・年またぎ）', () => {
    expect(shiftEventTimes(start, end, 0, 1).startsAt).toEqual(
      jst('2026-10-18T09:00'),
    );
    expect(
      shiftEventTimes(jst('2026-12-31T09:00'), jst('2026-12-31T10:00'), 0, 1)
        .startsAt,
    ).toEqual(jst('2027-01-01T09:00'));
    expect(shiftEventTimes(start, end, 0, -17).startsAt).toEqual(
      jst('2026-09-30T09:00'),
    );
  });

  it('分と日を同時に動かせる', () => {
    const r = shiftEventTimes(start, end, -30, -1);
    expect(r.startsAt).toEqual(jst('2026-10-16T08:30'));
  });

  it('元の Date は変更しない', () => {
    shiftEventTimes(start, end, 60, 1);
    expect(start).toEqual(jst('2026-10-17T09:00'));
  });
});

describe('isDraggableBlock', () => {
  const seg = (isStart: boolean, isEnd: boolean, allDay = false) => ({
    segment: { isStart, isEnd, event: { allDay } },
  });

  it('1つの日の列に収まる時間指定の予定だけがドラッグできる', () => {
    expect(isDraggableBlock(seg(true, true))).toBe(true);
  });

  it('日をまたぐ予定（日ごとに分割されたもの）はドラッグできない', () => {
    expect(isDraggableBlock(seg(true, false))).toBe(false);
    expect(isDraggableBlock(seg(false, true))).toBe(false);
    expect(isDraggableBlock(seg(false, false))).toBe(false);
  });

  it('終日予定はドラッグできない', () => {
    expect(isDraggableBlock(seg(true, true, true))).toBe(false);
  });
});
