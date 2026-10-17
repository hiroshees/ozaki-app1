import type { SupabaseClient } from '@supabase/supabase-js';
import { toCalendarEvent, type EventRow } from '@/lib/events/mapper';
import {
  eventInputSchema,
  eventUpdateSchema,
  type EventInput,
} from '@/lib/events/schema';
import type { CalendarEvent } from '@/lib/events/types';
import { z } from 'zod';

export type FieldErrors = Record<string, string[] | undefined>;

export type ActionResult =
  | { success: true; event?: CalendarEvent }
  | { success: false; message: string; fieldErrors: FieldErrors };

const failure = (
  message: string,
  fieldErrors: FieldErrors = {},
): ActionResult => ({
  success: false,
  message,
  fieldErrors,
});

const validationFailure = (error: z.ZodError): ActionResult =>
  failure('入力内容を確認してください', error.flatten().fieldErrors);

// 入力（camelCase）を events テーブルの列（snake_case）に変換する
const toColumns = (v: EventInput) => ({
  title: v.title,
  starts_at: v.startsAt.toISOString(),
  ends_at: v.endsAt.toISOString(),
  all_day: v.allDay,
  color: v.color,
  memo: v.memo,
});

export async function createEventRecord(
  client: SupabaseClient,
  input: unknown,
): Promise<ActionResult> {
  const parsed = eventInputSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  const { data, error } = await client
    .from('events')
    .insert(toColumns(parsed.data))
    .select();
  if (error || !data?.length) return failure('予定の作成に失敗しました');
  return { success: true, event: toCalendarEvent(data[0] as EventRow) };
}

export async function updateEventRecord(
  client: SupabaseClient,
  input: unknown,
): Promise<ActionResult> {
  const parsed = eventUpdateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  const { id, ...values } = parsed.data;
  const { data, error } = await client
    .from('events')
    .update(toColumns(values))
    .eq('id', id)
    .select();
  if (error) return failure('予定の更新に失敗しました');
  if (!data?.length) return failure('更新する予定が見つかりません');
  return { success: true, event: toCalendarEvent(data[0] as EventRow) };
}

export async function deleteEventRecord(
  client: SupabaseClient,
  id: unknown,
): Promise<ActionResult> {
  const parsed = z.string().uuid('IDが不正です').safeParse(id);
  if (!parsed.success) return validationFailure(parsed.error);

  const { data, error } = await client
    .from('events')
    .delete()
    .eq('id', parsed.data)
    .select('id');
  if (error) return failure('予定の削除に失敗しました');
  if (!data?.length) return failure('削除する予定が見つかりません');
  return { success: true };
}
