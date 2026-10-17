import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { toCalendarEvent, type EventRow } from '@/lib/events/mapper';
import { buildRangeFilter } from '@/lib/events/range';
import type { CalendarEvent } from '@/lib/events/types';

// 表示範囲と重なる予定を開始日時の昇順で取得する（読み取り専用）
export async function fetchEventsInRange(
  rangeStart: Date,
  rangeEnd: Date,
  client: SupabaseClient = createClient(),
): Promise<CalendarEvent[]> {
  const { startsBefore, endsAfter } = buildRangeFilter(rangeStart, rangeEnd);

  const { data, error } = await client
    .from('events')
    .select('*')
    .lt('starts_at', startsBefore)
    .gt('ends_at', endsAfter)
    .order('starts_at', { ascending: true });

  if (error) throw new Error(`予定の取得に失敗しました: ${error.message}`);
  // select('*') の戻りは events 行（生成型を使わないためここで型を付ける）
  return ((data ?? []) as EventRow[]).map(toCalendarEvent);
}
