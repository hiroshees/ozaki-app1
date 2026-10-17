import {
  DEFAULT_EVENT_COLOR,
  EVENT_COLORS,
  type CalendarEvent,
  type EventColor,
} from '@/lib/events/types';

// Supabase から返る events テーブルの行
export type EventRow = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  color: string;
  memo: string;
  created_at: string;
  updated_at: string;
};

const isEventColor = (value: string): value is EventColor =>
  (EVENT_COLORS as readonly string[]).includes(value);

export function toCalendarEvent(row: EventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    startsAt: new Date(row.starts_at),
    endsAt: new Date(row.ends_at),
    allDay: row.all_day,
    // 想定外の色が入っていても表示を壊さない
    color: isEventColor(row.color) ? row.color : DEFAULT_EVENT_COLOR,
    memo: row.memo,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
