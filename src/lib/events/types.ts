// 予定の色（6色から選択）
export const EVENT_COLORS = [
  'blue',
  'red',
  'green',
  'yellow',
  'purple',
  'gray',
] as const;

export type EventColor = (typeof EVENT_COLORS)[number];

export const DEFAULT_EVENT_COLOR: EventColor = 'blue';

export const TITLE_MAX_LENGTH = 100;
export const MEMO_MAX_LENGTH = 1000;

// 画面・Server Actions で扱う予定（DB 行を camelCase にしたもの）
export type CalendarEvent = {
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  allDay: boolean;
  color: EventColor;
  memo: string;
  createdAt: Date;
  updatedAt: Date;
};
