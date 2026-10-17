import { offsetToMinutes } from '@/lib/calendar/time-grid';

// ドラッグで動かせる時刻の刻み
export const DRAG_STEP_MINUTES = 15;

const MINUTES_PER_DAY = 24 * 60;
const DAY_MS = MINUTES_PER_DAY * 60_000;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

type MoveInput = {
  // ドラッグ量(px)
  deltaX: number;
  deltaY: number;
  // 日の列の幅(px)。未計測(0)なら横には動かさない
  columnWidth: number;
  // 予定がある列（0 始まり）と、表示中の列の数
  columnIndex: number;
  columnCount: number;
  // 予定の開始（その日の 0:00 からの分）と長さ
  topMinutes: number;
  durationMinutes: number;
};

export type Move = { minutes: number; days: number };

// ドラッグ量 → 移動量。縦は15分単位に丸め、元の日の 0:00〜24:00 に収める。横は日の列に丸め、表示中の日の範囲に収める
export function computeMove(input: MoveInput): Move {
  const snapped =
    Math.round(offsetToMinutes(input.deltaY) / DRAG_STEP_MINUTES) *
    DRAG_STEP_MINUTES;
  const minutes = clamp(
    snapped,
    -input.topMinutes,
    MINUTES_PER_DAY - input.durationMinutes - input.topMinutes,
  );

  const rawDays =
    input.columnWidth > 0 ? Math.round(input.deltaX / input.columnWidth) : 0;
  const days = clamp(
    rawDays,
    -input.columnIndex,
    input.columnCount - 1 - input.columnIndex,
  );

  // -0 を 0 にそろえる
  return { minutes: minutes || 0, days: days || 0 };
}

// 長さを保ったまま、開始・終了を動かす。JST は夏時間が無いため、1日 = 24時間で足せる
export function shiftEventTimes(
  startsAt: Date,
  endsAt: Date,
  minutes: number,
  days: number,
) {
  const shiftMs = minutes * 60_000 + days * DAY_MS;
  return {
    startsAt: new Date(startsAt.getTime() + shiftMs),
    endsAt: new Date(endsAt.getTime() + shiftMs),
  };
}

type DraggableCandidate = {
  segment: { isStart: boolean; isEnd: boolean; event: { allDay: boolean } };
};

// ドラッグできるのは、時間指定で、1つの日の列に収まる予定だけ
// 終日予定と、日をまたぐ予定（日ごとに分割されたもの）は対象外
export const isDraggableBlock = ({ segment }: DraggableCandidate) =>
  !segment.event.allDay && segment.isStart && segment.isEnd;
