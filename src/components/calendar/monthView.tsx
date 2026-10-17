import Link from 'next/link';
import { format } from 'date-fns';
import {
  getMonthGrid,
  parseDateKey,
  WEEKDAYS,
  type GridDay,
} from '@/lib/calendar/grid';
import { buildMonthWeek, formatEventLabel } from '@/lib/calendar/month-week';
import { buildViewHref } from '@/lib/calendar/url';
import type { CalendarEvent } from '@/lib/events/types';
import {
  bandShapeClasses,
  EVENT_COLOR_CLASSES,
} from '@/components/calendar/eventColors';
import { EventButton } from '@/components/calendar/eventButton';

// 1日に表示できる行数（「他 N 件」を含む）
const MAX_ROWS = 4;
const DATE_ROW_HEIGHT = '1.75rem';
const EVENT_ROW_HEIGHT = '1.25rem';

type MonthViewProps = {
  events: CalendarEvent[];
  dateKey: string;
  todayKey: string;
};

const dayHref = (key: string, todayKey: string) =>
  buildViewHref({ view: 'day', dateKey: key }, todayKey);

function WeekRow({
  week,
  events,
  todayKey,
}: {
  week: GridDay[];
  events: CalendarEvent[];
  todayKey: string;
}) {
  const monthWeek = buildMonthWeek(
    events,
    week.map((d) => d.key),
    MAX_ROWS,
  );

  return (
    <div className="relative border-b border-gray-200">
      {/* 日付ごとの区切り線と、当月外の背景 */}
      <div aria-hidden="true" className="absolute inset-0 grid grid-cols-7">
        {week.map((d) => (
          <div
            key={d.key}
            className={`border-l border-gray-200 first:border-l-0 ${d.inMonth ? '' : 'bg-gray-50'}`}
          />
        ))}
      </div>
      <div
        className="relative grid grid-cols-7 gap-y-0.5 pb-1"
        style={{
          gridTemplateRows: `${DATE_ROW_HEIGHT} repeat(${MAX_ROWS}, ${EVENT_ROW_HEIGHT})`,
        }}
      >
        {week.map((d, col) => (
          <div
            key={d.key}
            className="flex justify-center pt-1"
            style={{ gridColumn: col + 1, gridRow: 1 }}
          >
            <Link
              href={dayHref(d.key, todayKey)}
              aria-current={d.isToday ? 'date' : undefined}
              className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                d.isToday
                  ? 'bg-blue-600 font-semibold text-white hover:bg-blue-700'
                  : `hover:bg-gray-100 ${d.inMonth ? 'text-gray-900' : 'text-gray-400'}`
              }`}
            >
              {d.date.getDate() === 1
                ? format(d.date, 'M月d日')
                : d.date.getDate()}
            </Link>
          </div>
        ))}

        {monthWeek.bands.map((band) => (
          <EventButton
            key={`${band.event.id}-${band.startCol}`}
            eventId={band.event.id}
            title={band.event.title}
            className={`min-w-0 truncate px-1 text-left text-[10px] leading-5 outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:text-xs ${
              EVENT_COLOR_CLASSES[band.event.color].band
            } ${bandShapeClasses(band.continuesBefore, band.continuesAfter)}`}
            style={{
              gridColumn: `${band.startCol + 1} / ${band.endCol + 2}`,
              gridRow: band.row + 2,
            }}
          >
            {formatEventLabel(band.event, false)}
          </EventButton>
        ))}

        {monthWeek.days.map((day, col) => (
          <DayEvents
            key={day.key}
            day={day}
            col={col}
            firstRow={monthWeek.bandRows + 2}
            todayKey={todayKey}
          />
        ))}
      </div>
    </div>
  );
}

function DayEvents({
  day,
  col,
  firstRow,
  todayKey,
}: {
  day: ReturnType<typeof buildMonthWeek<CalendarEvent>>['days'][number];
  col: number;
  firstRow: number;
  todayKey: string;
}) {
  return (
    <>
      {day.timed.map((segment, i) => (
        <EventButton
          key={segment.event.id}
          eventId={segment.event.id}
          title={formatEventLabel(segment.event, true)}
          className="mx-0.5 flex min-w-0 items-center gap-1 rounded text-left text-[10px] leading-5 outline-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-400 sm:text-xs"
          style={{ gridColumn: col + 1, gridRow: firstRow + i }}
        >
          <span
            aria-hidden="true"
            className={`h-2 w-2 shrink-0 rounded-full ${EVENT_COLOR_CLASSES[segment.event.color].dot}`}
          />
          <span className="truncate">
            {formatEventLabel(segment.event, true)}
          </span>
        </EventButton>
      ))}
      {day.hiddenCount > 0 && (
        <Link
          href={dayHref(day.key, todayKey)}
          className="mx-0.5 min-w-0 truncate rounded px-1 text-[10px] leading-5 text-gray-600 outline-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-400 sm:text-xs"
          style={{ gridColumn: col + 1, gridRow: firstRow + day.timed.length }}
        >
          他 {day.hiddenCount} 件
        </Link>
      )}
    </>
  );
}

// 月表示: 6週分のマスに、帯（終日・日またぎ）と単日の予定を並べる
export function MonthView({ events, dateKey, todayKey }: MonthViewProps) {
  const base = parseDateKey(dateKey);
  const today = parseDateKey(todayKey);
  if (!base || !today) throw new Error('表示する日付が不正です');

  const days = getMonthGrid(base, today);
  const weeks = Array.from({ length: 6 }, (_, i) =>
    days.slice(i * 7, i * 7 + 7),
  );

  return (
    <section aria-label="月表示" className="border-t border-gray-200">
      <div className="grid grid-cols-7 border-b border-gray-200 text-center text-xs text-gray-500">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>
      {weeks.map((week) => (
        <WeekRow
          key={week[0].key}
          week={week}
          events={events}
          todayKey={todayKey}
        />
      ))}
    </section>
  );
}
