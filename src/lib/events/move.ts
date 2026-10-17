import type { ActionResult } from '@/lib/events/mutations';
import type { CalendarEvent } from '@/lib/events/types';

export type MoveResult = { ok: true } | { ok: false; message: string };

// 予定の開始・終了だけを変えて保存する。他の項目は今の値を保つ
// update には Server Action の updateEvent を渡す（テストで差し替えられるよう引数にしている）
export async function moveEventTimes(
  event: CalendarEvent,
  next: { startsAt: Date; endsAt: Date },
  update: (input: unknown) => Promise<ActionResult>,
): Promise<MoveResult> {
  try {
    const result = await update({
      id: event.id,
      title: event.title,
      startsAt: next.startsAt.toISOString(),
      endsAt: next.endsAt.toISOString(),
      allDay: event.allDay,
      color: event.color,
      memo: event.memo,
    });
    if (result.success) return { ok: true };
    return { ok: false, message: result.message };
  } catch {
    return {
      ok: false,
      message: '移動に失敗しました。時間をおいて再度お試しください',
    };
  }
}
