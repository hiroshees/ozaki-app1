import { format } from 'date-fns';
import { showsTimeRange, type TimedBlock } from '@/lib/calendar/day-column';
import { toJstDate } from '@/lib/calendar/grid';
import type { CalendarEvent } from '@/lib/events/types';
import {
  blockShapeClasses,
  EVENT_COLOR_CLASSES,
} from '@/components/calendar/eventColors';
import { EventButton } from '@/components/calendar/eventButton';

const formatTime = (date: Date) => format(toJstDate(date), 'H:mm');

// 1日の列に置く、時間指定の予定。重なる予定は横に並べる
export function TimedEvents({
  blocks,
}: {
  blocks: TimedBlock<CalendarEvent>[];
}) {
  return (
    <>
      {blocks.map((block) => {
        const { event, isStart, isEnd } = block.segment;
        const range = `${formatTime(event.startsAt)}〜${formatTime(event.endsAt)}`;
        return (
          // 外側で位置と幅を決め、内側で見た目を作る（予定同士の間隔は外側の余白）
          <div
            key={event.id}
            className="absolute z-10 px-px"
            style={{
              top: block.topPx,
              height: block.heightPx,
              left: `${block.leftPercent}%`,
              width: `${block.widthPercent}%`,
            }}
          >
            <EventButton
              eventId={event.id}
              title={`${range} ${event.title}`}
              className={`block h-full w-full overflow-hidden border-l-4 px-1 text-left text-[10px] leading-4 outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:text-xs ${
                EVENT_COLOR_CLASSES[event.color].block
              } ${blockShapeClasses(isStart, isEnd)}`}
            >
              <div className="truncate font-medium">{event.title}</div>
              {showsTimeRange(block.heightMinutes) && (
                <div className="truncate">{range}</div>
              )}
            </EventButton>
          </div>
        );
      })}
    </>
  );
}
