import {
  distributeEventsByDay,
  type DaySegment,
  type EventPeriod,
} from '@/lib/calendar/distribute';
import { layoutOverlappingEvents } from '@/lib/calendar/overlap-layout';
import { minutesToOffset } from '@/lib/calendar/time-grid';

// 短い予定でも判別できるよう確保する最小の高さ（分）。48px/時 で 24px
export const MIN_BLOCK_MINUTES = 30;
// この高さ（分）以上のときだけ、タイトルに加えて時刻も表示する
const TIME_RANGE_MIN_MINUTES = 45;

export type TimedBlock<T extends EventPeriod> = {
  segment: DaySegment<T>;
  // その日の 0:00 からの分と、最小の高さを反映した高さ（分）
  topMinutes: number;
  heightMinutes: number;
  topPx: number;
  heightPx: number;
  // 横位置（列の幅に対する割合）。重なる予定は列数で等分する
  column: number;
  columnCount: number;
  leftPercent: number;
  widthPercent: number;
};

export const showsTimeRange = (heightMinutes: number) =>
  heightMinutes >= TIME_RANGE_MIN_MINUTES;

// 週・日表示の時間グリッドに置く、時間指定の予定の位置を日ごとに決める
// 日をまたぐ予定は日ごとに切り出す。終日予定は対象外（上部の欄で扱う）
export function layoutDayColumns<T extends EventPeriod & { id: string }>(
  events: T[],
  dayKeys: string[],
): Record<string, TimedBlock<T>[]> {
  const distributed = distributeEventsByDay(events, dayKeys);

  return Object.fromEntries(
    dayKeys.map((key) => {
      const laid = layoutOverlappingEvents(distributed[key].timed, {
        minMinutes: MIN_BLOCK_MINUTES,
        key: (segment) => segment.event.id,
      });
      const blocks = laid.map<TimedBlock<T>>((l) => ({
        segment: l.item,
        topMinutes: l.topMinutes,
        heightMinutes: l.heightMinutes,
        topPx: minutesToOffset(l.topMinutes),
        heightPx: minutesToOffset(l.heightMinutes),
        column: l.column,
        columnCount: l.columnCount,
        leftPercent: (l.column / l.columnCount) * 100,
        widthPercent: 100 / l.columnCount,
      }));
      return [key, blocks];
    }),
  );
}
