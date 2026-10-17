import { differenceInMinutes, startOfDay } from 'date-fns';
import { formatDateKey, toJstDate } from '@/lib/calendar/grid';

// 時間グリッドの縦のスケール（1時間あたりの高さ）
export const HOUR_HEIGHT_PX = 48;
export const GRID_HEIGHT_PX = HOUR_HEIGHT_PX * 24;

const DEFAULT_SCROLL_HOUR = 8;
// 空き時間クリックで作る予定の長さと、開始時刻の刻み
export const SLOT_DURATION_MINUTES = 30;
const SLOT_STEP_MINUTES = 15;

// 0:00 からの分 → グリッド上端からの位置(px)
export const minutesToOffset = (minutes: number) =>
  (minutes / 60) * HOUR_HEIGHT_PX;

export const offsetToMinutes = (offset: number) =>
  (offset / HOUR_HEIGHT_PX) * 60;

// 時間グリッド左の時刻ラベル（0:00〜23:00）
export function hourLabels() {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    text: `${hour}:00`,
  }));
}

// JST の 0:00 からの分（秒は小数）。サーバーが UTC でも JST で計算する
export function minutesSinceMidnightJst(date: Date): number {
  const jst = toJstDate(date);
  const diffMs = jst.getTime() - startOfDay(jst).getTime();
  return diffMs / 60000;
}

// 現在時刻の線を引く列と時刻。今日が表示範囲に無ければ null
export function currentTimeMarker(
  now: Date,
  dayKeys: string[],
): { column: number; minutes: number } | null {
  const column = dayKeys.indexOf(formatDateKey(now));
  if (column === -1) return null;
  return { column, minutes: minutesSinceMidnightJst(now) };
}

// 初期のスクロール位置（0:00 からの分）。今日を含めば現在時刻の1時間前、含まなければ朝8時
export function initialScrollMinutes(
  now: Date,
  containsToday: boolean,
): number {
  if (!containsToday) return DEFAULT_SCROLL_HOUR * 60;
  const nowMinutes = differenceInMinutes(now, startOfDay(toJstDate(now)));
  return Math.max(0, Math.floor(nowMinutes / 60) * 60 - 60);
}

// 空き時間クリックの開始時刻（0:00 からの分）。クリック位置(px)を15分単位に切り下げ、
// 30分の予定が24:00を超えないよう、最後は 23:30 に収める
export function slotStartMinutes(offset: number): number {
  const snapped =
    Math.floor(offsetToMinutes(offset) / SLOT_STEP_MINUTES) * SLOT_STEP_MINUTES;
  return Math.min(Math.max(snapped, 0), 24 * 60 - SLOT_DURATION_MINUTES);
}
