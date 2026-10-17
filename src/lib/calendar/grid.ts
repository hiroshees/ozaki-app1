import { TZDate } from '@date-fns/tz';
import {
  addDays,
  addMonths,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

// 表示・日付の区切りは常に Asia/Tokyo 基準（サーバーが UTC でも同じ結果にする）
export const TIME_ZONE = 'Asia/Tokyo';

export const VIEWS = ['month', 'week', 'day'] as const;
export type View = (typeof VIEWS)[number];

export const DEFAULT_VIEW: View = 'month';

export type GridDay = {
  date: TZDate;
  // yyyy-MM-dd（JST の暦日）
  key: string;
  inMonth: boolean;
  isToday: boolean;
};

export const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
const MONTH_GRID_DAYS = 42;

// 任意の時刻を、JST の同じ瞬間を表す TZDate にする
export function toJstDate(date: Date): TZDate {
  return new TZDate(date, TIME_ZONE);
}

export function formatDateKey(date: Date): string {
  return format(toJstDate(date), 'yyyy-MM-dd');
}

const toDay = (date: Date, base: Date, today: Date): GridDay => ({
  date: startOfDay(toJstDate(date)),
  key: formatDateKey(date),
  inMonth: isSameMonth(toJstDate(date), toJstDate(base)),
  isToday: isSameDay(toJstDate(date), toJstDate(today)),
});

// 月表示: 基準日の月を含む、日曜始まりの6週（42日）
export function getMonthGrid(base: Date, today: Date): GridDay[] {
  const first = startOfWeek(startOfMonth(toJstDate(base)));
  return Array.from({ length: MONTH_GRID_DAYS }, (_, i) =>
    toDay(addDays(first, i), base, today),
  );
}

// 週表示: 基準日を含む日曜〜土曜の7日
export function getWeekDays(base: Date, today: Date): GridDay[] {
  const first = startOfWeek(toJstDate(base));
  return Array.from({ length: 7 }, (_, i) =>
    toDay(addDays(first, i), base, today),
  );
}

// 取得関数に渡す表示範囲。終了は含まない（最終日の翌日 0:00）
export function getViewRange(
  view: View,
  base: Date,
): { start: Date; end: Date } {
  const b = startOfDay(toJstDate(base));
  const range = (start: Date, days: number) => ({
    // DB に渡すため TZDate ではなく通常の Date にする
    start: new Date(start.getTime()),
    end: new Date(addDays(start, days).getTime()),
  });
  if (view === 'month')
    return range(startOfWeek(startOfMonth(b)), MONTH_GRID_DAYS);
  if (view === 'week') return range(startOfWeek(b), 7);
  return range(b, 1);
}

// 前へ(-1) / 次へ(1) / 今日(0) の移動後の基準日
export function shiftDate(
  view: View,
  base: Date,
  direction: -1 | 0 | 1,
  today: Date,
): TZDate {
  const b = startOfDay(toJstDate(base));
  if (direction === 0) return startOfDay(toJstDate(today));
  if (view === 'month') return addMonths(b, direction);
  return addDays(b, view === 'week' ? 7 * direction : direction);
}

export function getPeriodTitle(view: View, base: Date): string {
  const b = startOfDay(toJstDate(base));
  if (view === 'month') return format(b, 'yyyy年M月');
  if (view === 'day')
    return `${format(b, 'yyyy年M月d日')}（${WEEKDAYS[b.getDay()]}）`;

  const start = startOfWeek(b);
  const end = addDays(start, 6);
  if (start.getFullYear() !== end.getFullYear()) {
    return `${format(start, 'yyyy年M月d日')}〜${format(end, 'yyyy年M月d日')}`;
  }
  if (start.getMonth() !== end.getMonth()) {
    return `${format(start, 'yyyy年M月d日')}〜${format(end, 'M月d日')}`;
  }
  return `${format(start, 'yyyy年M月d日')}〜${format(end, 'd日')}`;
}

type SearchParamValue = string | string[] | undefined;

const first = (v: SearchParamValue) => (Array.isArray(v) ? v[0] : v);

const isView = (v: string | undefined): v is View =>
  VIEWS.some((view) => view === v);

// yyyy-MM-dd の厳密な形式のみ受け付け、存在しない日付（2026-02-30 など）は null
export function parseDateKey(value: string | undefined): TZDate | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  const date = new TZDate(y, m - 1, d, TIME_ZONE);
  const valid =
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d;
  return valid ? date : null;
}

// searchParams（?view=week&date=2026-10-17）を解釈する。不正値は今日・月表示にフォールバック
export function parseViewParams(
  params: { view?: SearchParamValue; date?: SearchParamValue },
  today: Date,
): { view: View; date: TZDate } {
  const view = first(params.view);
  return {
    view: isView(view) ? view : DEFAULT_VIEW,
    date: parseDateKey(first(params.date)) ?? startOfDay(toJstDate(today)),
  };
}
