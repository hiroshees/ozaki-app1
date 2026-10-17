import { format } from 'date-fns';
import {
  buildWeekBands,
  distributeEventsByDay,
  type DaySegment,
  type EventPeriod,
  type WeekBand,
} from '@/lib/calendar/distribute';
import { toJstDate } from '@/lib/calendar/grid';

export type MonthWeekDay<T extends EventPeriod> = {
  key: string;
  // 帯にならない、1日で終わる時間指定の予定のうち、表示するもの（開始時刻順）
  timed: DaySegment<T>[];
  // 「他 N 件」の N。表示しきれなかった帯と単日の予定の合計
  hiddenCount: number;
};

export type MonthWeek<T extends EventPeriod> = {
  // 表示する帯。行は 0 始まりで、単日の予定は帯の行数(bandRows)の下から並べる
  bands: WeekBand<T>[];
  bandRows: number;
  days: MonthWeekDay<T>[];
};

// 月表示の1週分の中身を決める
// 1日に使える行は maxRows。あふれる日は最終行を「他 N 件」に使うため、
// その週に1日でもあふれる日があれば、帯は maxRows - 1 行までにする
export function buildMonthWeek<T extends EventPeriod>(
  events: T[],
  weekDayKeys: string[],
  maxRows: number,
): MonthWeek<T> {
  const allBands = buildWeekBands(events, weekDayKeys);
  const distributed = distributeEventsByDay(events, weekDayKeys);
  // 日をまたぐ時間指定の予定は帯になるので、単日の予定だけを日別の一覧に残す
  const timedByDay = weekDayKeys.map((key) =>
    distributed[key].timed.filter((segment) => segment.totalDays === 1),
  );

  const compute = (bandRowLimit: number) => {
    const bands = allBands.filter((b) => b.row < bandRowLimit);
    const hiddenBands = allBands.filter((b) => b.row >= bandRowLimit);
    const bandRows = bands.length
      ? Math.max(...bands.map((b) => b.row)) + 1
      : 0;
    const capacity = maxRows - bandRows;

    const days = weekDayKeys.map((key, col) => {
      const timed = timedByDay[col];
      const hiddenBandCount = hiddenBands.filter(
        (b) => b.startCol <= col && col <= b.endCol,
      ).length;
      const overflow = hiddenBandCount > 0 || timed.length > capacity;
      // あふれる日は、最終行を「他 N 件」に使う分だけ表示数を減らす
      const shown = overflow
        ? Math.max(0, Math.min(timed.length, capacity - 1))
        : timed.length;
      return {
        day: {
          key,
          timed: timed.slice(0, shown),
          hiddenCount: hiddenBandCount + timed.length - shown,
        },
        overflow,
      };
    });
    return { bands, bandRows, days };
  };

  let result = compute(maxRows);
  if (result.days.some((d) => d.overflow))
    result = compute(Math.max(0, maxRows - 1));

  return {
    bands: result.bands,
    bandRows: result.bandRows,
    days: result.days.map((d) => d.day),
  };
}

type Labeled = { title: string; startsAt: Date; allDay: boolean };

// 予定の表示名。時間指定は JST の開始時刻をつける（withTime が false ならタイトルのみ）
export function formatEventLabel(event: Labeled, withTime: boolean): string {
  if (!withTime || event.allDay) return event.title;
  return `${format(toJstDate(event.startsAt), 'H:mm')} ${event.title}`;
}
