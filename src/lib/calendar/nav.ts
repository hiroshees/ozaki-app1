import {
  formatDateKey,
  parseDateKey,
  shiftDate,
  VIEWS,
  type View,
} from '@/lib/calendar/grid';
import { buildViewHref, type ViewSelection } from '@/lib/calendar/url';

const UNIT_LABELS: Record<View, string> = {
  month: '月',
  week: '週',
  day: '日',
};

export type HeaderNav = {
  prevHref: string;
  nextHref: string;
  todayHref: string;
  // 月・週・日の切り替え先（基準日は保つ）
  viewHrefs: Record<View, string>;
  // 「前の月」「次の週」などのラベル用
  unitLabel: string;
};

// ヘッダーの各リンク先を決める。UI にロジックを書かないため、ここで計算する
export function buildHeaderNav(
  { view, dateKey }: ViewSelection,
  todayKey: string,
): HeaderNav {
  const base = parseDateKey(dateKey);
  if (!base) throw new Error(`日付の形式が不正です: ${dateKey}`);
  // direction が ±1 のとき today は使われない
  const move = (direction: -1 | 1) =>
    buildViewHref(
      { view, dateKey: formatDateKey(shiftDate(view, base, direction, base)) },
      todayKey,
    );

  return {
    prevHref: move(-1),
    nextHref: move(1),
    todayHref: buildViewHref({ view, dateKey: todayKey }, todayKey),
    viewHrefs: Object.fromEntries(
      VIEWS.map((v) => [v, buildViewHref({ view: v, dateKey }, todayKey)]),
    ) as Record<View, string>,
    unitLabel: UNIT_LABELS[view],
  };
}
