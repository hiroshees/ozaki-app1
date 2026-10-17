import {
  formatDateKey,
  getPeriodTitle,
  getViewRange,
  parseViewParams,
  type View,
} from '@/lib/calendar/grid';

export type SearchParams = Record<string, string | string[] | undefined>;

// searchParams から決まる表示状態。Server → Client に渡せるよう文字列と Date だけにする
export type ViewState = {
  view: View;
  dateKey: string;
  todayKey: string;
  title: string;
  // 表示範囲。終了は含まない
  range: { start: Date; end: Date };
  // 表示範囲に今日を含むか（作成フォームの初期値に使う）
  containsToday: boolean;
};

export function resolveViewState(params: SearchParams, now: Date): ViewState {
  const { view, date } = parseViewParams(params, now);
  const range = getViewRange(view, date);
  return {
    view,
    dateKey: formatDateKey(date),
    // サーバーは UTC で動くため、「今日」も JST の暦日で決める
    todayKey: formatDateKey(now),
    title: getPeriodTitle(view, date),
    range,
    containsToday:
      now.getTime() >= range.start.getTime() &&
      now.getTime() < range.end.getTime(),
  };
}
