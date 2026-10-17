import { describe, expect, it, vi } from 'vitest';
import { moveEventTimes } from '@/lib/events/move';
import type { CalendarEvent } from '@/lib/events/types';

const jst = (s: string) => new Date(`${s}+09:00`);
const event: CalendarEvent = {
  id: '3f2b8c1e-6a4d-4c3b-9d5e-1a2b3c4d5e6f',
  title: '会議',
  startsAt: jst('2026-10-17T09:00'),
  endsAt: jst('2026-10-17T10:00'),
  allDay: false,
  color: 'red',
  memo: 'メモ',
  createdAt: jst('2026-10-01T00:00'),
  updatedAt: jst('2026-10-01T00:00'),
};
const next = {
  startsAt: jst('2026-10-17T10:15'),
  endsAt: jst('2026-10-17T11:15'),
};

describe('moveEventTimes', () => {
  it('他の項目を保ったまま、開始・終了だけを変えて更新する', async () => {
    const update = vi.fn().mockResolvedValue({ success: true });
    const result = await moveEventTimes(event, next, update);
    expect(result).toEqual({ ok: true });
    expect(update).toHaveBeenCalledWith({
      id: event.id,
      title: '会議',
      startsAt: '2026-10-17T01:15:00.000Z',
      endsAt: '2026-10-17T02:15:00.000Z',
      allDay: false,
      color: 'red',
      memo: 'メモ',
    });
  });

  it('更新が失敗したら、サーバーのメッセージを返す', async () => {
    const update = vi.fn().mockResolvedValue({
      success: false,
      message: '更新する予定が見つかりません',
      fieldErrors: {},
    });
    expect(await moveEventTimes(event, next, update)).toEqual({
      ok: false,
      message: '更新する予定が見つかりません',
    });
  });

  it('例外になっても、メッセージを返す（投げない）', async () => {
    const update = vi.fn().mockRejectedValue(new Error('network'));
    const result = await moveEventTimes(event, next, update);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.message).toContain('移動に失敗しました');
  });
});
