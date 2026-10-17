import { buildAllDayArea } from '@/lib/calendar/all-day';
import type { CalendarEvent } from '@/lib/events/types';
import {
  bandShapeClasses,
  EVENT_COLOR_CLASSES,
} from '@/components/calendar/eventColors';
import { EventButton } from '@/components/calendar/eventButton';

const ROW_HEIGHT = '1.25rem';

type AllDayAreaProps = {
  events: CalendarEvent[];
  dayKeys: string[];
  // 時間グリッドの時刻ラベル列と幅を揃えるためのクラス
  gutterClassName: string;
};

// 週・日表示の上部にある終日予定の欄。複数日の終日予定は帯で表示する
export function AllDayArea({
  events,
  dayKeys,
  gutterClassName,
}: AllDayAreaProps) {
  const area = buildAllDayArea(events, dayKeys);
  if (area.rowCount === 0) return null;

  const columns = `repeat(${dayKeys.length}, minmax(0, 1fr))`;

  return (
    <div
      className="flex border-b border-gray-200"
      aria-label="終日の予定"
      role="group"
    >
      <div
        className={`${gutterClassName} pr-1 pt-0.5 text-right text-[10px] text-gray-500`}
      >
        終日
      </div>
      <div className="relative min-w-0 flex-1 py-0.5">
        {/* 日ごとの区切り線 */}
        <div
          aria-hidden="true"
          className="absolute inset-0 grid"
          style={{ gridTemplateColumns: columns }}
        >
          {dayKeys.map((key) => (
            <div key={key} className="border-l border-gray-200" />
          ))}
        </div>
        <div
          className="relative grid gap-y-0.5"
          style={{
            gridTemplateColumns: columns,
            gridTemplateRows: `repeat(${area.rowCount}, ${ROW_HEIGHT})`,
          }}
        >
          {area.bands.map((band) => (
            <EventButton
              key={`${band.event.id}-${band.startCol}`}
              eventId={band.event.id}
              title={band.event.title}
              className={`min-w-0 truncate px-1 text-left text-[10px] leading-5 outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:text-xs ${
                EVENT_COLOR_CLASSES[band.event.color].band
              } ${bandShapeClasses(band.continuesBefore, band.continuesAfter)}`}
              style={{
                gridColumn: `${band.startCol + 1} / ${band.endCol + 2}`,
                gridRow: band.row + 1,
              }}
            >
              {band.event.title}
            </EventButton>
          ))}
          {area.days.map(
            (day, col) =>
              day.hiddenCount > 0 && (
                <span
                  key={day.key}
                  className="mx-0.5 min-w-0 truncate px-1 text-[10px] leading-5 text-gray-600 sm:text-xs"
                  style={{ gridColumn: col + 1, gridRow: area.rowCount }}
                >
                  他 {day.hiddenCount} 件
                </span>
              ),
          )}
        </div>
      </div>
    </div>
  );
}
