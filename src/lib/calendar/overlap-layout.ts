import { startOfDay } from 'date-fns';
import { toJstDate } from '@/lib/calendar/grid';

export const MINUTES_PER_DAY = 24 * 60;

// その日に切り出し済みの時間指定の予定（DaySegment など）
export type TimedItem = { start: Date; end: Date };

export type LayoutOptions<T> = {
  // 最小の高さ（分）。短い予定の見えなさを防ぐ。重なり判定もこの高さで行う
  minMinutes?: number;
  // 同じ時間帯の予定の並びを入力順に依存させないための識別子
  key?: (item: T) => string;
};

export type LayoutItem<T> = {
  item: T;
  // その日の 0:00 からの分。縦位置は top / 1440、高さは height / 1440
  topMinutes: number;
  heightMinutes: number;
  // 横位置: 列番号(0始まり)と、重なりグループの列数（幅 = 1 / columnCount）
  column: number;
  columnCount: number;
};

const DEFAULT_MIN_MINUTES = 15;

// 週・日表示の時間グリッド用に、重なる予定を横並びにする
// 端が接するだけ（終了=次の開始）の予定は重ならない扱い
export function layoutOverlappingEvents<T extends TimedItem>(
  items: T[],
  { minMinutes = DEFAULT_MIN_MINUTES, key }: LayoutOptions<T> = {},
): LayoutItem<T>[] {
  const entries = items.map((item) => {
    const dayStart = startOfDay(toJstDate(item.start)).getTime();
    const top = (item.start.getTime() - dayStart) / 60000;
    const duration = (item.end.getTime() - item.start.getTime()) / 60000;
    // 日の終わりを超えないようにする
    const end = Math.min(top + Math.max(duration, minMinutes), MINUTES_PER_DAY);
    return { item, top, end };
  });

  // 開始が早い順、同じなら終了が遅い順、それでも同じなら key 順
  entries.sort(
    (a, b) =>
      a.top - b.top ||
      b.end - a.end ||
      (key ? key(a.item).localeCompare(key(b.item)) : 0),
  );

  const result: LayoutItem<T>[] = [];
  let group: LayoutItem<T>[] = [];
  let groupEnd = -1;
  // 列ごとの最後の予定の終了
  let columnEnds: number[] = [];

  const closeGroup = () => {
    for (const g of group) g.columnCount = columnEnds.length;
    group = [];
    columnEnds = [];
  };

  for (const { item, top, end } of entries) {
    // どの予定とも重ならなくなったらグループを閉じる
    if (top >= groupEnd) {
      closeGroup();
      groupEnd = -1;
    }

    let column = columnEnds.findIndex((columnEnd) => columnEnd <= top);
    if (column === -1) column = columnEnds.length;
    columnEnds[column] = end;
    groupEnd = Math.max(groupEnd, end);

    const layoutItem: LayoutItem<T> = {
      item,
      topMinutes: top,
      heightMinutes: end - top,
      column,
      columnCount: 1,
    };
    group.push(layoutItem);
    result.push(layoutItem);
  }
  closeGroup();

  return result;
}
