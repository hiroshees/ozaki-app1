import { addDays, differenceInCalendarDays, startOfDay } from 'date-fns';
import { formatDateKey, parseDateKey, toJstDate } from '@/lib/calendar/grid';
import { overlapsRange } from '@/lib/events/range';

// 振り分けに必要な最小限の項目。CalendarEvent など、これを満たす型をそのまま渡せる
export type EventPeriod = {
  startsAt: Date;
  endsAt: Date;
  allDay: boolean;
};

// 1つの予定の、ある日(JST)に属する部分
export type DaySegment<T extends EventPeriod> = {
  event: T;
  dayKey: string;
  // その日の範囲(0:00〜翌0:00)に切り出した開始・終了
  start: Date;
  end: Date;
  isStart: boolean;
  isEnd: boolean;
  // 予定の何日目か(0始まり)と、予定全体の日数
  dayIndex: number;
  totalDays: number;
};

export type DayEvents<T extends EventPeriod> = {
  allDay: DaySegment<T>[];
  timed: DaySegment<T>[];
};

// 予定が占める最初と最後の暦日(JST)。終了ちょうど 0:00 は最終日に含めない
// 終日予定(開始 0:00・終了は最終日の翌日 0:00)も同じ規則で扱える
function eventDays(event: EventPeriod) {
  const first = startOfDay(toJstDate(event.startsAt));
  const lastCandidate = startOfDay(
    toJstDate(new Date(event.endsAt.getTime() - 1)),
  );
  const last =
    lastCandidate.getTime() < first.getTime() ? first : lastCandidate;
  return { first, last };
}

const byStartThenLongerEnd = <T extends EventPeriod>(a: T, b: T) =>
  a.startsAt.getTime() - b.startsAt.getTime() ||
  b.endsAt.getTime() - a.endsAt.getTime();

// 指定した各日(yyyy-MM-dd)に表示する予定を、終日と時間指定に分けて返す
export function distributeEventsByDay<T extends EventPeriod>(
  events: T[],
  dayKeys: string[],
): Record<string, DayEvents<T>> {
  const result: Record<string, DayEvents<T>> = {};
  const sorted = [...events].sort(byStartThenLongerEnd);

  for (const dayKey of dayKeys) {
    const dayStart = parseDateKey(dayKey);
    if (!dayStart) throw new Error(`日付の形式が不正です: ${dayKey}`);
    const dayEnd = addDays(dayStart, 1);
    const day: DayEvents<T> = { allDay: [], timed: [] };

    for (const event of sorted) {
      if (!overlapsRange(event, dayStart, dayEnd)) continue;
      const { first, last } = eventDays(event);
      const segment: DaySegment<T> = {
        event,
        dayKey,
        start: new Date(Math.max(event.startsAt.getTime(), dayStart.getTime())),
        end: new Date(Math.min(event.endsAt.getTime(), dayEnd.getTime())),
        isStart: formatDateKey(first) === dayKey,
        isEnd: formatDateKey(last) === dayKey,
        dayIndex: differenceInCalendarDays(dayStart, first),
        totalDays: differenceInCalendarDays(last, first) + 1,
      };
      (event.allDay ? day.allDay : day.timed).push(segment);
    }
    result[dayKey] = day;
  }
  return result;
}

// 月表示の1週分の帯(終日予定、または日をまたぐ予定)
export type WeekBand<T extends EventPeriod> = {
  event: T;
  // 週内の列(0〜6)。両端を含む
  startCol: number;
  endCol: number;
  row: number;
  // 前の週・次の週へ続くか(帯の端を丸めない等の表示に使う)
  continuesBefore: boolean;
  continuesAfter: boolean;
};

export function buildWeekBands<T extends EventPeriod>(
  events: T[],
  weekDayKeys: string[],
): WeekBand<T>[] {
  const weekFirst = weekDayKeys[0];
  const weekLast = weekDayKeys[weekDayKeys.length - 1];

  const candidates = events.flatMap((event) => {
    const { first, last } = eventDays(event);
    const firstKey = formatDateKey(first);
    const lastKey = formatDateKey(last);
    // 1日で終わる時間指定の予定は帯にしない
    if (!event.allDay && firstKey === lastKey) return [];

    const cols = weekDayKeys.flatMap((k, i) =>
      k >= firstKey && k <= lastKey ? [i] : [],
    );
    if (cols.length === 0) return [];
    return [
      {
        event,
        startCol: cols[0],
        endCol: cols[cols.length - 1],
        continuesBefore: firstKey < weekFirst,
        continuesAfter: lastKey > weekLast,
      },
    ];
  });

  // 左から、同じ開始なら長いものを先に配置し、空いている最初の行に入れる
  candidates.sort(
    (a, b) =>
      a.startCol - b.startCol ||
      b.endCol - a.endCol ||
      byStartThenLongerEnd(a.event, b.event),
  );

  const rowEnds: number[] = [];
  return candidates.map((c) => {
    let row = rowEnds.findIndex((end) => end < c.startCol);
    if (row === -1) row = rowEnds.length;
    rowEnds[row] = c.endCol;
    return { ...c, row };
  });
}

// 表示上限で切り、「他 N 件」の N を返す
export function limitVisible<T>(items: T[], limit: number) {
  const visible = items.slice(0, Math.max(0, limit));
  return { visible, hiddenCount: items.length - visible.length };
}
