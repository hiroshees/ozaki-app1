import { format, startOfDay } from 'date-fns';
import { toJstDate, WEEKDAYS } from '@/lib/calendar/grid';

type Period = { startsAt: Date; endsAt: Date; allDay: boolean };

const dateText = (d: Date) =>
  `${format(d, 'yyyy年M月d日')}（${WEEKDAYS[d.getDay()]}）`;
const timeText = (d: Date) => format(d, 'H:mm');

// 予定の日時を JST で表示用の文字列にする
// 終日予定の終了は含まない日付（最終日の翌日 0:00）なので、1ms 戻して最終日を求める
export function formatEventPeriod(event: Period): string {
  const start = toJstDate(event.startsAt);

  if (event.allDay) {
    const last = startOfDay(toJstDate(new Date(event.endsAt.getTime() - 1)));
    const first = startOfDay(start);
    if (last.getTime() <= first.getTime()) return dateText(first);
    if (first.getFullYear() !== last.getFullYear()) {
      return `${dateText(first)}〜${dateText(last)}`;
    }
    const lastText =
      first.getMonth() === last.getMonth()
        ? `${last.getDate()}日（${WEEKDAYS[last.getDay()]}）`
        : `${last.getMonth() + 1}月${last.getDate()}日（${WEEKDAYS[last.getDay()]}）`;
    return `${dateText(first)}〜${lastText}`;
  }

  const end = toJstDate(event.endsAt);
  const endsAtMidnight = end.getTime() === startOfDay(end).getTime();
  // 翌日 0:00 ちょうどの終了は、開始と同じ日の 24:00 として扱う
  if (
    endsAtMidnight &&
    startOfDay(toJstDate(new Date(end.getTime() - 1))).getTime() ===
      startOfDay(start).getTime()
  ) {
    return `${dateText(start)}${timeText(start)}〜24:00`;
  }
  if (startOfDay(start).getTime() === startOfDay(end).getTime()) {
    return `${dateText(start)}${timeText(start)}〜${timeText(end)}`;
  }
  return `${dateText(start)}${timeText(start)}〜${dateText(end)}${timeText(end)}`;
}
