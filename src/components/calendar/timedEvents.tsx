'use client';

import { useDraggable } from '@dnd-kit/core';
import { format } from 'date-fns';
import { showsTimeRange, type TimedBlock } from '@/lib/calendar/day-column';
import { isDraggableBlock, shiftEventTimes } from '@/lib/calendar/drag-move';
import { toJstDate } from '@/lib/calendar/grid';
import { offsetToMinutes } from '@/lib/calendar/time-grid';
import type { CalendarEvent } from '@/lib/events/types';
import {
  blockShapeClasses,
  EVENT_COLOR_CLASSES,
} from '@/components/calendar/eventColors';
import { EventButton } from '@/components/calendar/eventButton';

const formatTime = (date: Date) => format(toJstDate(date), 'H:mm');
const formatRange = (start: Date, end: Date) =>
  `${formatTime(start)}〜${formatTime(end)}`;

type TimedEventsProps = {
  blocks: TimedBlock<CalendarEvent>[];
  // この列の位置と、表示中の列の数（ドラッグで動かせる範囲の計算に使う）
  columnIndex: number;
  columnCount: number;
  // 保存中の予定（再度ドラッグさせない）
  savingIds: ReadonlySet<string>;
  getColumnWidth: () => number;
};

// 1日の列に置く、時間指定の予定。重なる予定は横に並べる
export function TimedEvents({ blocks, ...rest }: TimedEventsProps) {
  return (
    <>
      {blocks.map((block) => (
        <TimedEventBlock key={block.segment.event.id} block={block} {...rest} />
      ))}
    </>
  );
}

export type DragData = {
  columnIndex: number;
  columnCount: number;
  topMinutes: number;
  durationMinutes: number;
};

function TimedEventBlock({
  block,
  columnIndex,
  columnCount,
  savingIds,
  getColumnWidth,
}: { block: TimedBlock<CalendarEvent> } & Omit<TimedEventsProps, 'blocks'>) {
  const { event, isStart, isEnd } = block.segment;
  const draggable = isDraggableBlock(block) && !savingIds.has(event.id);
  const data: DragData = {
    columnIndex,
    columnCount,
    topMinutes: block.topMinutes,
    durationMinutes:
      (event.endsAt.getTime() - event.startsAt.getTime()) / 60_000,
  };
  const { setNodeRef, listeners, transform, isDragging } = useDraggable({
    id: event.id,
    data,
    disabled: !draggable,
  });

  // ドラッグ中は、移動後の時刻を表示する（transform は 15分・日の列に丸められている）
  let range = formatRange(event.startsAt, event.endsAt);
  if (isDragging && transform) {
    const columnWidth = getColumnWidth();
    const days = columnWidth > 0 ? Math.round(transform.x / columnWidth) : 0;
    const moved = shiftEventTimes(
      event.startsAt,
      event.endsAt,
      Math.round(offsetToMinutes(transform.y)),
      days,
    );
    range = formatRange(moved.startsAt, moved.endsAt);
  }

  return (
    // 外側で位置と幅を決め、内側で見た目を作る（予定同士の間隔は外側の余白）
    <div
      ref={setNodeRef}
      {...listeners}
      className={`absolute px-px ${isDragging ? 'z-30 opacity-90 shadow-lg' : 'z-10'}`}
      style={{
        top: block.topPx,
        height: block.heightPx,
        left: `${block.leftPercent}%`,
        width: `${block.widthPercent}%`,
        ...(transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
          : {}),
      }}
    >
      <EventButton
        eventId={event.id}
        title={`${range} ${event.title}`}
        className={`block h-full w-full overflow-hidden border-l-4 px-1 text-left text-[10px] leading-4 outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:text-xs ${
          draggable ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''
        } ${EVENT_COLOR_CLASSES[event.color].block} ${blockShapeClasses(isStart, isEnd)}`}
      >
        {isDragging ? (
          <div className="truncate font-medium">{range}</div>
        ) : (
          <>
            <div className="truncate font-medium">{event.title}</div>
            {showsTimeRange(block.heightMinutes) && (
              <div className="truncate">{range}</div>
            )}
          </>
        )}
      </EventButton>
    </div>
  );
}
