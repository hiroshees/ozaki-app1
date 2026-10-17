import Link from 'next/link';
import { format } from 'date-fns';
import {
  getWeekDays,
  parseDateKey,
  WEEKDAYS,
  type GridDay,
} from '@/lib/calendar/grid';
import {
  GRID_HEIGHT_PX,
  HOUR_HEIGHT_PX,
  hourLabels,
  minutesToOffset,
} from '@/lib/calendar/time-grid';
import { buildViewHref } from '@/lib/calendar/url';
import { CurrentTimeLine } from '@/components/calendar/currentTimeLine';
import { TimeGridScroller } from '@/components/calendar/timeGridScroller';

type TimeGridViewProps = {
  view: 'week' | 'day';
  dateKey: string;
  todayKey: string;
  // 各日の列に重ねる内容（予定など）。列は position: relative
  renderDay?: (dayKey: string) => React.ReactNode;
};

const GUTTER = 'w-12 shrink-0';

function dayColumns(
  view: 'week' | 'day',
  dateKey: string,
  todayKey: string,
): GridDay[] {
  const base = parseDateKey(dateKey);
  const today = parseDateKey(todayKey);
  if (!base || !today) throw new Error('表示する日付が不正です');
  const week = getWeekDays(base, today);
  return view === 'week' ? week : week.filter((d) => d.key === dateKey);
}

// 週・日表示の時間グリッド（0〜24時）。予定の描画は renderDay で差し込む
export function TimeGridView({
  view,
  dateKey,
  todayKey,
  renderDay,
}: TimeGridViewProps) {
  const days = dayColumns(view, dateKey, todayKey);
  const todayColumn = days.findIndex((d) => d.isToday);

  return (
    <section aria-label={view === 'week' ? '週表示' : '日表示'}>
      {/* 列見出し: 曜日 + 日付。日付をクリックすると日表示へ */}
      <div className="flex border-b border-gray-200">
        <div className={GUTTER} />
        <div
          className="grid min-w-0 flex-1"
          style={{
            gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
          }}
        >
          {days.map((d) => (
            <div key={d.key} className="flex flex-col items-center py-1">
              <span
                className={`text-xs ${d.isToday ? 'text-blue-700' : 'text-gray-500'}`}
              >
                {WEEKDAYS[d.date.getDay()]}
              </span>
              <Link
                href={buildViewHref({ view: 'day', dateKey: d.key }, todayKey)}
                aria-label={`${format(d.date, 'M月d日')}（${WEEKDAYS[d.date.getDay()]}）の日表示`}
                aria-current={d.isToday ? 'date' : undefined}
                className={`flex h-8 min-w-8 items-center justify-center rounded-full px-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                  d.isToday
                    ? 'bg-blue-600 font-semibold text-white hover:bg-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                {d.date.getDate()}
              </Link>
            </div>
          ))}
        </div>
      </div>

      <TimeGridScroller containsToday={todayColumn !== -1}>
        <div className="flex" style={{ height: GRID_HEIGHT_PX }}>
          <div className={`${GUTTER} relative`} aria-hidden="true">
            {hourLabels().map(({ hour, text }) => (
              <span
                key={hour}
                className="absolute right-1 -translate-y-1/2 text-[10px] text-gray-500"
                // 0:00 は上端で見切れるため、少し下げる
                style={{
                  top: minutesToOffset(hour * 60) + (hour === 0 ? 6 : 0),
                }}
              >
                {text}
              </span>
            ))}
          </div>
          <div
            className="grid min-w-0 flex-1"
            style={{
              gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
            }}
          >
            {days.map((d, col) => (
              <div
                key={d.key}
                data-day={d.key}
                className="relative border-l border-gray-200"
                // 1時間ごとの横線
                style={{
                  backgroundImage:
                    'linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
                  backgroundSize: `100% ${HOUR_HEIGHT_PX}px`,
                }}
              >
                {renderDay?.(d.key)}
                {col === todayColumn && <CurrentTimeLine />}
              </div>
            ))}
          </div>
        </div>
      </TimeGridScroller>
    </section>
  );
}
