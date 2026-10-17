import { addDays, format, startOfDay } from 'date-fns';
import { formatDateKey, parseDateKey, toJstDate } from '@/lib/calendar/grid';
import { minutesSinceMidnightJst } from '@/lib/calendar/time-grid';
import { eventInputSchema } from '@/lib/events/schema';
import {
  DEFAULT_EVENT_COLOR,
  type CalendarEvent,
  type EventColor,
} from '@/lib/events/types';

// 作成・編集フォームの入力値。日時はすべて JST の文字列（input type="date" / "time" の値）
export type EventFormValues = {
  title: string;
  allDay: boolean;
  startDate: string; // yyyy-MM-dd
  startTime: string; // HH:mm
  // 終日のときは「含む最終日」。保存時に翌日 0:00 へ変換する
  endDate: string;
  endTime: string;
  color: EventColor;
  memo: string;
};

export type EventFormField = keyof EventFormValues;
export type EventFormErrors = Partial<Record<EventFormField, string>>;

// Server Action に渡す値（日時は ISO 文字列）
export type EventPayload = {
  title: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  color: EventColor;
  memo: string;
};

const INVALID = 'invalid';
const DEFAULT_START_TIME = '09:00';
const DEFAULT_END_TIME = '10:00';
const SLOT_MINUTES = 30;
const LAST_START_MINUTES = 23 * 60;

// 不正な値でも例外にせず、検証でエラーにできる値を返す
// TZDate の toISOString は +09:00 付きになるため、UTC の ISO 文字列に揃える
const toIso = (date: Date) =>
  Number.isNaN(date.getTime())
    ? INVALID
    : new Date(date.getTime()).toISOString();

const jstDateTime = (dateKey: string, time: string) =>
  toIso(new Date(`${dateKey}T${time}:00+09:00`));

const startOfJstDay = (dateKey: string) => parseDateKey(dateKey);

// フォームの入力値 → 保存する値
// 終日は、開始日 00:00 JST 〜 最終日の翌日 00:00 JST（終了は含まない）
export function formValuesToInput(values: EventFormValues): EventPayload {
  let startsAt: string;
  let endsAt: string;
  if (values.allDay) {
    const first = startOfJstDay(values.startDate);
    const last = startOfJstDay(values.endDate);
    startsAt = first ? toIso(first) : INVALID;
    endsAt = last ? toIso(addDays(last, 1)) : INVALID;
  } else {
    startsAt = jstDateTime(values.startDate, values.startTime);
    endsAt = jstDateTime(values.endDate, values.endTime);
  }
  return {
    title: values.title,
    startsAt,
    endsAt,
    allDay: values.allDay,
    color: values.color,
    memo: values.memo,
  };
}

// 予定 → フォームの入力値（編集用）。終日は終了を「含む最終日」に戻す
export function eventToFormValues(event: CalendarEvent): EventFormValues {
  const start = toJstDate(event.startsAt);
  const common = {
    title: event.title,
    allDay: event.allDay,
    color: event.color,
    memo: event.memo,
  };

  if (event.allDay) {
    const first = startOfDay(start);
    const lastCandidate = startOfDay(
      toJstDate(new Date(event.endsAt.getTime() - 1)),
    );
    const last =
      lastCandidate.getTime() < first.getTime() ? first : lastCandidate;
    return {
      ...common,
      startDate: formatDateKey(first),
      startTime: DEFAULT_START_TIME,
      endDate: formatDateKey(last),
      endTime: DEFAULT_END_TIME,
    };
  }

  const end = toJstDate(event.endsAt);
  return {
    ...common,
    startDate: formatDateKey(start),
    startTime: format(start, 'HH:mm'),
    endDate: formatDateKey(end),
    endTime: format(end, 'HH:mm'),
  };
}

// zod / サーバーの項目名 → フォームの欄
const FIELD_OF: Record<string, EventFormField | undefined> = {
  title: 'title',
  startsAt: 'startDate',
  endsAt: 'endDate',
  allDay: 'allDay',
  color: 'color',
  memo: 'memo',
};

export type ValidationResult =
  { ok: true; input: EventPayload } | { ok: false; errors: EventFormErrors };

// サーバーと同じ zod スキーマで検証し、エラーをフォームの欄に対応づける
export function validateFormValues(values: EventFormValues): ValidationResult {
  const input = formValuesToInput(values);
  const parsed = eventInputSchema.safeParse(input);
  if (parsed.success) return { ok: true, input };

  const errors: EventFormErrors = {};
  for (const issue of parsed.error.issues) {
    const field = FIELD_OF[String(issue.path[0])];
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return { ok: false, errors };
}

// Server Action が返した項目別のエラー（fieldErrors）をフォームの欄に対応づける
export function serverErrorsToFormErrors(
  fieldErrors: Record<string, string[] | undefined>,
): EventFormErrors {
  const errors: EventFormErrors = {};
  for (const [key, messages] of Object.entries(fieldErrors)) {
    const field = FIELD_OF[key];
    if (field && messages?.[0]) errors[field] = messages[0];
  }
  return errors;
}

type CreateDefaultsArgs = {
  dateKey: string;
  todayKey: string;
  // 表示範囲に今日を含むか
  rangeContainsToday: boolean;
  now: Date;
};

const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

// 新規作成の初期値。今日を含む表示なら今日の現在時刻の次の30分刻みから1時間、含まなければ基準日の 9:00〜10:00
export function buildCreateDefaults({
  dateKey,
  todayKey,
  rangeContainsToday,
  now,
}: CreateDefaultsArgs): EventFormValues {
  const base = {
    title: '',
    allDay: false,
    color: DEFAULT_EVENT_COLOR,
    memo: '',
  };

  if (!rangeContainsToday) {
    return {
      ...base,
      startDate: dateKey,
      startTime: DEFAULT_START_TIME,
      endDate: dateKey,
      endTime: DEFAULT_END_TIME,
    };
  }

  // 23:00 より後は 23:00〜翌 0:00 に収める
  const start = Math.min(
    Math.ceil(minutesSinceMidnightJst(now) / SLOT_MINUTES) * SLOT_MINUTES,
    LAST_START_MINUTES,
  );
  const end = start + 60;
  const today = parseDateKey(todayKey);
  const endDate =
    end >= 24 * 60 && today ? formatDateKey(addDays(today, 1)) : todayKey;
  return {
    ...base,
    startDate: todayKey,
    startTime: toTime(start),
    endDate,
    endTime: toTime(end % (24 * 60)),
  };
}
