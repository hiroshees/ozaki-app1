'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Modifier,
} from '@dnd-kit/core';
import { layoutDayColumns } from '@/lib/calendar/day-column';
import { computeMove, shiftEventTimes } from '@/lib/calendar/drag-move';
import {
  GRID_HEIGHT_PX,
  HOUR_HEIGHT_PX,
  minutesToOffset,
} from '@/lib/calendar/time-grid';
import { updateEvent } from '@/lib/events/actions';
import { moveEventTimes } from '@/lib/events/move';
import type { CalendarEvent } from '@/lib/events/types';
import { CurrentTimeLine } from '@/components/calendar/currentTimeLine';
import { TimeSlotLayer } from '@/components/calendar/timeSlotLayer';
import { TimedEvents, type DragData } from '@/components/calendar/timedEvents';

type Day = { key: string; isToday: boolean };

type Override = { startsAt: Date; endsAt: Date; saving: boolean };

const MOUSE_DISTANCE_PX = 5;
// タッチは、縦スクロールと区別するため、少し押し続けてからドラッグを始める
const TOUCH_DELAY_MS = 250;
const TOUCH_TOLERANCE_PX = 5;
const ERROR_VISIBLE_MS = 6000;

// 日の列と、その中の予定。時間指定の予定はドラッグして移動できる（15分単位、週表示では日も）
export function TimeGridColumns({
  days,
  events,
}: {
  days: Day[];
  events: CalendarEvent[];
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  // 移動の途中の表示。保存が済むまで（サーバーの最新の値が届くまで）移動後の位置に出す
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [error, setError] = useState<string | null>(null);

  // サーバーから最新の予定が届いたら、保存が済んだ分の仮の表示を捨てる
  useEffect(() => {
    setOverrides((prev) => {
      const pending = Object.fromEntries(
        Object.entries(prev).filter(([, o]) => o.saving),
      );
      return Object.keys(pending).length === Object.keys(prev).length
        ? prev
        : pending;
    });
  }, [events]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), ERROR_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [error]);

  const dayKeys = useMemo(() => days.map((d) => d.key), [days]);
  const shownEvents = useMemo(
    () =>
      events.map((e) => (overrides[e.id] ? { ...e, ...overrides[e.id] } : e)),
    [events, overrides],
  );
  const blocks = useMemo(
    () => layoutDayColumns(shownEvents, dayKeys),
    [shownEvents, dayKeys],
  );
  const savingIds = useMemo(
    () =>
      new Set(
        Object.entries(overrides)
          .filter(([, o]) => o.saving)
          .map(([id]) => id),
      ),
    [overrides],
  );

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: MOUSE_DISTANCE_PX },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: TOUCH_DELAY_MS,
        tolerance: TOUCH_TOLERANCE_PX,
      },
    }),
  );

  const getColumnWidth = () =>
    (containerRef.current?.getBoundingClientRect().width ?? 0) / days.length;

  // ドラッグ中の予定を、15分・日の列に丸めた位置に吸着させ、範囲外に出さない
  const snapToGrid: Modifier = ({ transform, active }) => {
    const data = active?.data.current as DragData | undefined;
    if (!data) return transform;
    const columnWidth = getColumnWidth();
    const move = computeMove({
      deltaX: transform.x,
      deltaY: transform.y,
      columnWidth,
      ...data,
    });
    return {
      ...transform,
      x: move.days * columnWidth,
      y: minutesToOffset(move.minutes),
    };
  };

  // ドラッグ直後の click は dnd-kit が打ち消すため、詳細ダイアログは開かない
  const handleDragEnd = async ({ active, delta }: DragEndEvent) => {
    const data = active.data.current as DragData | undefined;
    const event = events.find((e) => e.id === active.id);
    if (!data || !event) return;

    const move = computeMove({
      deltaX: delta.x,
      deltaY: delta.y,
      columnWidth: getColumnWidth(),
      ...data,
    });
    if (move.minutes === 0 && move.days === 0) return;

    const next = shiftEventTimes(
      event.startsAt,
      event.endsAt,
      move.minutes,
      move.days,
    );
    setError(null);
    setOverrides((prev) => ({
      ...prev,
      [event.id]: { ...next, saving: true },
    }));

    const result = await moveEventTimes(event, next, updateEvent);
    if (result.ok) {
      // 最新の予定が届くまでは移動後の位置のまま。届いたら上の effect で捨てる
      setOverrides((prev) => ({
        ...prev,
        [event.id]: { ...next, saving: false },
      }));
      router.refresh();
      return;
    }
    // 失敗したら元の位置に戻す
    setOverrides(({ [event.id]: _removed, ...rest }) => rest);
    setError(result.message);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        modifiers={[snapToGrid]}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={containerRef}
          className="grid min-w-0 flex-1"
          style={{
            gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
            height: GRID_HEIGHT_PX,
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
              <TimeSlotLayer dayKey={d.key} />
              <TimedEvents
                blocks={blocks[d.key]}
                columnIndex={col}
                columnCount={days.length}
                savingIds={savingIds}
                getColumnWidth={getColumnWidth}
              />
              {d.isToday && <CurrentTimeLine />}
            </div>
          ))}
        </div>
      </DndContext>
      {error && (
        <div
          role="alert"
          className="fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-3 rounded-md bg-red-700 px-4 py-2 text-sm text-white shadow-lg"
        >
          <span>{error}</span>
          <button
            type="button"
            aria-label="エラーを閉じる"
            onClick={() => setError(null)}
            className="rounded px-1 outline-none hover:bg-red-800 focus-visible:ring-2 focus-visible:ring-white"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
