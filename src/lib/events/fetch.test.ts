import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchEventsInRange } from '@/lib/events/fetch';
import type { EventRow } from '@/lib/events/mapper';

const row: EventRow = {
  id: '3f2b8c1e-6a4d-4c3b-9d5e-1a2b3c4d5e6f',
  title: '会議',
  starts_at: '2026-10-17T01:00:00+00:00',
  ends_at: '2026-10-17T02:00:00+00:00',
  all_day: false,
  color: 'blue',
  memo: '',
  created_at: '2026-10-16T00:00:00+00:00',
  updated_at: '2026-10-16T00:00:00+00:00',
};

// from().select().lt().gt().order() のチェーンを模したクライアント
const fakeClient = (result: {
  data: EventRow[] | null;
  error: { message: string } | null;
}) => {
  const order = vi.fn().mockResolvedValue(result);
  const gt = vi.fn(() => ({ order }));
  const lt = vi.fn(() => ({ gt }));
  const select = vi.fn(() => ({ lt }));
  const from = vi.fn(() => ({ select }));
  return { client: { from } as unknown as SupabaseClient, from, lt, gt, order };
};

const start = new Date('2026-10-17T00:00:00Z');
const end = new Date('2026-10-18T00:00:00Z');

describe('fetchEventsInRange', () => {
  it('範囲の条件で events を開始日時の昇順に取得し、CalendarEvent に変換する', async () => {
    const f = fakeClient({ data: [row], error: null });
    const events = await fetchEventsInRange(start, end, f.client);
    expect(f.from).toHaveBeenCalledWith('events');
    expect(f.lt).toHaveBeenCalledWith('starts_at', '2026-10-18T00:00:00.000Z');
    expect(f.gt).toHaveBeenCalledWith('ends_at', '2026-10-17T00:00:00.000Z');
    expect(f.order).toHaveBeenCalledWith('starts_at', { ascending: true });
    expect(events).toHaveLength(1);
    expect(events[0].startsAt).toEqual(new Date('2026-10-17T01:00:00Z'));
  });

  it('data が null で error も無ければ空配列', async () => {
    const f = fakeClient({ data: null, error: null });
    expect(await fetchEventsInRange(start, end, f.client)).toEqual([]);
  });

  it('Supabase のエラー時は例外を投げる', async () => {
    const f = fakeClient({ data: null, error: { message: 'boom' } });
    await expect(fetchEventsInRange(start, end, f.client)).rejects.toThrow(
      'boom',
    );
  });
});
