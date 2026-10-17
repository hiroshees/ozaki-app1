import type { EventPeriod, WeekBand } from '@/lib/calendar/distribute';
import { buildMonthWeek } from '@/lib/calendar/month-week';

// 終日予定の欄に使える行数（「他 N 件」を含む）
export const ALL_DAY_MAX_ROWS = 3;

export type AllDayArea<T extends EventPeriod> = {
  // 表示する帯。列は dayKeys の並び（0 始まり）、行は 0 始まり
  bands: WeekBand<T>[];
  // 欄の高さ（行数）。「他 N 件」の行を含む
  rowCount: number;
  // 日ごとの「他 N 件」の N
  days: { key: string; hiddenCount: number }[];
};

// 週・日表示の上部にある終日予定の欄の中身を決める
// 対象は allDay の予定のみ。日をまたぐ時間指定の予定は時間グリッド側で日ごとに描画する
export function buildAllDayArea<T extends EventPeriod>(
  events: T[],
  dayKeys: string[],
  maxRows: number = ALL_DAY_MAX_ROWS,
): AllDayArea<T> {
  // 終日予定だけを渡すので、単日の時間指定の予定(timed)は常に空になる
  const week = buildMonthWeek(
    events.filter((e) => e.allDay),
    dayKeys,
    maxRows,
  );
  const hasMore = week.days.some((d) => d.hiddenCount > 0);
  return {
    bands: week.bands,
    rowCount: week.bandRows + (hasMore ? 1 : 0),
    days: week.days.map((d) => ({ key: d.key, hiddenCount: d.hiddenCount })),
  };
}
