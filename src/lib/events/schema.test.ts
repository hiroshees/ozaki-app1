import { describe, expect, it } from 'vitest';
import { eventInputSchema, eventUpdateSchema } from '@/lib/events/schema';

const base = {
  title: '打ち合わせ',
  startsAt: new Date('2026-10-17T01:00:00Z'),
  endsAt: new Date('2026-10-17T02:00:00Z'),
  allDay: false,
  color: 'blue',
  memo: '',
};

const messages = (input: unknown) => {
  const r = eventInputSchema.safeParse(input);
  return r.success ? [] : r.error.issues.map((i) => i.message);
};

describe('eventInputSchema', () => {
  it('正常な入力は通り、色とメモの省略時は既定値になる', () => {
    const { color, memo, ...rest } = base;
    const r = eventInputSchema.parse(rest);
    expect(r.color).toBe('blue');
    expect(r.memo).toBe('');
    expect(color).toBe('blue');
    expect(memo).toBe('');
  });

  it('ISO 文字列の日時を Date に変換する', () => {
    const r = eventInputSchema.parse({
      ...base,
      startsAt: '2026-10-17T01:00:00Z',
      endsAt: '2026-10-17T02:00:00Z',
    });
    expect(r.startsAt).toBeInstanceOf(Date);
  });

  it('空タイトルはエラー', () => {
    expect(messages({ ...base, title: '' })).toContain('タイトルは必須です');
  });

  it('101 文字のタイトルはエラー、100 文字は通る', () => {
    expect(messages({ ...base, title: 'あ'.repeat(101) })).toContain(
      'タイトルは100文字以内にしてください',
    );
    expect(messages({ ...base, title: 'あ'.repeat(100) })).toEqual([]);
  });

  it('1001 文字のメモはエラー、1000 文字は通る', () => {
    expect(messages({ ...base, memo: 'a'.repeat(1001) })).toContain(
      'メモは1000文字以内にしてください',
    );
    expect(messages({ ...base, memo: 'a'.repeat(1000) })).toEqual([]);
  });

  it('色が範囲外ならエラー', () => {
    expect(messages({ ...base, color: 'pink' }).length).toBeGreaterThan(0);
  });

  it('開始より前の終了時刻はエラーになり、終了欄にメッセージが付く', () => {
    const r = eventInputSchema.safeParse({
      ...base,
      endsAt: new Date('2026-10-17T00:00:00Z'),
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.flatten().fieldErrors.endsAt).toContain(
        '終了は開始より後にしてください',
      );
    }
  });

  it('開始と同時刻の終了もエラー（DB の CHECK 制約と揃える）', () => {
    expect(messages({ ...base, endsAt: base.startsAt })).toContain(
      '終了は開始より後にしてください',
    );
  });

  it('終日予定も終了 <= 開始ならエラー', () => {
    expect(
      messages({ ...base, allDay: true, endsAt: base.startsAt }),
    ).toContain('終了は開始より後にしてください');
  });

  it('不正な日時はエラー', () => {
    expect(messages({ ...base, startsAt: 'abc' }).length).toBeGreaterThan(0);
  });
});

describe('eventUpdateSchema', () => {
  it('uuid の id が必要', () => {
    expect(eventUpdateSchema.safeParse({ ...base, id: 'x' }).success).toBe(
      false,
    );
    expect(
      eventUpdateSchema.safeParse({
        ...base,
        id: '3f2b8c1e-6a4d-4c3b-9d5e-1a2b3c4d5e6f',
      }).success,
    ).toBe(true);
  });
});
