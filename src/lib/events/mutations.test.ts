import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  createEventRecord,
  deleteEventRecord,
  updateEventRecord,
} from '@/lib/events/mutations';
import type { EventRow } from '@/lib/events/mapper';

const ID = '3f2b8c1e-6a4d-4c3b-9d5e-1a2b3c4d5e6f';
const row: EventRow = {
  id: ID,
  title: '会議',
  starts_at: '2026-10-17T01:00:00+00:00',
  ends_at: '2026-10-17T02:00:00+00:00',
  all_day: false,
  color: 'blue',
  memo: '',
  created_at: '2026-10-16T00:00:00+00:00',
  updated_at: '2026-10-16T00:00:00+00:00',
};
const valid = {
  title: '会議',
  startsAt: '2026-10-17T01:00:00Z',
  endsAt: '2026-10-17T02:00:00Z',
};

type Result = { data: unknown; error: { message: string } | null };

// from().insert/update/delete()...select() のチェーンを模したクライアント
const fakeClient = (result: Result) => {
  const select = vi.fn().mockResolvedValue(result);
  const eq = vi.fn(() => ({ select }));
  const insert = vi.fn(() => ({ select }));
  const update = vi.fn(() => ({ eq }));
  const del = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ insert, update, delete: del }));
  return {
    client: { from } as unknown as SupabaseClient,
    insert,
    update,
    del,
    eq,
  };
};

describe('createEventRecord', () => {
  it('不正な入力は保存されず、項目別のエラーが返る', async () => {
    const f = fakeClient({ data: [row], error: null });
    const r = await createEventRecord(f.client, { ...valid, title: '' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.fieldErrors.title).toContain('タイトルは必須です');
    expect(f.insert).not.toHaveBeenCalled();
  });

  it('終了 < 開始は保存されない', async () => {
    const f = fakeClient({ data: [row], error: null });
    const r = await createEventRecord(f.client, {
      ...valid,
      endsAt: '2026-10-17T00:00:00Z',
    });
    expect(r.success).toBe(false);
    expect(f.insert).not.toHaveBeenCalled();
  });

  it('正常な入力は snake_case の行として INSERT され、予定が返る', async () => {
    const f = fakeClient({ data: [row], error: null });
    const r = await createEventRecord(f.client, valid);
    expect(f.insert).toHaveBeenCalledWith({
      title: '会議',
      starts_at: '2026-10-17T01:00:00.000Z',
      ends_at: '2026-10-17T02:00:00.000Z',
      all_day: false,
      color: 'blue',
      memo: '',
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.event?.id).toBe(ID);
  });

  it('DB エラー時は失敗を返す', async () => {
    const f = fakeClient({ data: null, error: { message: 'boom' } });
    const r = await createEventRecord(f.client, valid);
    expect(r.success).toBe(false);
  });
});

describe('updateEventRecord', () => {
  it('id が uuid でなければ更新しない', async () => {
    const f = fakeClient({ data: [row], error: null });
    const r = await updateEventRecord(f.client, { ...valid, id: 'x' });
    expect(r.success).toBe(false);
    expect(f.update).not.toHaveBeenCalled();
  });

  it('対象が無ければ失敗を返す', async () => {
    const f = fakeClient({ data: [], error: null });
    const r = await updateEventRecord(f.client, { ...valid, id: ID });
    expect(r.success).toBe(false);
  });

  it('正常に更新できる（id は更新対象に含めない）', async () => {
    const f = fakeClient({ data: [row], error: null });
    const r = await updateEventRecord(f.client, { ...valid, id: ID });
    expect(r.success).toBe(true);
    expect(f.eq).toHaveBeenCalledWith('id', ID);
    expect(f.update.mock.calls[0]).not.toHaveProperty('id');
  });
});

describe('deleteEventRecord', () => {
  it('id が uuid でなければ削除しない', async () => {
    const f = fakeClient({ data: [{ id: ID }], error: null });
    const r = await deleteEventRecord(f.client, 'x');
    expect(r.success).toBe(false);
    expect(f.del).not.toHaveBeenCalled();
  });

  it('正常に削除できる', async () => {
    const f = fakeClient({ data: [{ id: ID }], error: null });
    const r = await deleteEventRecord(f.client, ID);
    expect(r.success).toBe(true);
    expect(f.eq).toHaveBeenCalledWith('id', ID);
  });

  it('対象が無ければ失敗を返す', async () => {
    const f = fakeClient({ data: [], error: null });
    expect((await deleteEventRecord(f.client, ID)).success).toBe(false);
  });
});
