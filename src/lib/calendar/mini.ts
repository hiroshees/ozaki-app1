import { addMonths, format } from 'date-fns';
import { getMonthGrid, parseDateKey, WEEKDAYS } from '@/lib/calendar/grid';
import { buildViewHref, type ViewSelection } from '@/lib/calendar/url';

export type MiniDay = {
  key: string;
  // 日付の数字
  day: number;
  inMonth: boolean;
  isToday: boolean;
  // 表示中の日付
  isSelected: boolean;
  // クリック先。view は維持して date だけ更新する
  href: string;
  label: string;
};

export type MiniCalendar = {
  title: string;
  weekdays: string[];
  weeks: MiniDay[][];
  prevMonthKey: string;
  nextMonthKey: string;
};

// yyyy-MM-dd → yyyy-MM
export const monthKeyOf = (dateKey: string) => dateKey.slice(0, 7);

const parseMonthKey = (monthKey: string) => {
  const first = parseDateKey(`${monthKey}-01`);
  if (!first) throw new Error(`月の形式が不正です: ${monthKey}`);
  return first;
};

// サイドバーのミニカレンダー。monthKey は表示する月で、表示中の日付とは独立（月送り用）
export function buildMiniCalendar(
  { view, dateKey }: ViewSelection,
  todayKey: string,
  monthKey: string,
): MiniCalendar {
  const first = parseMonthKey(monthKey);
  const today = parseDateKey(todayKey);
  if (!today) throw new Error(`日付の形式が不正です: ${todayKey}`);

  const days = getMonthGrid(first, today).map<MiniDay>((d) => ({
    key: d.key,
    day: d.date.getDate(),
    inMonth: d.inMonth,
    isToday: d.isToday,
    isSelected: d.key === dateKey,
    href: buildViewHref({ view, dateKey: d.key }, todayKey),
    label: `${format(d.date, 'yyyy年M月d日')}（${WEEKDAYS[d.date.getDay()]}）`,
  }));

  return {
    title: format(first, 'yyyy年M月'),
    weekdays: WEEKDAYS,
    weeks: Array.from({ length: 6 }, (_, i) => days.slice(i * 7, i * 7 + 7)),
    prevMonthKey: format(addMonths(first, -1), 'yyyy-MM'),
    nextMonthKey: format(addMonths(first, 1), 'yyyy-MM'),
  };
}
