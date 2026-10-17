import { describe, expect, it } from 'vitest';
import { toCalendarEvent, type EventRow } from '@/lib/events/mapper';

const row: EventRow = {
  id: '3f2b8c1e-6a4d-4c3b-9d5e-1a2b3c4d5e6f',
  title: '会議',
  starts_at: '2026-10-17T01:00:00+00:00',
  ends_at: '2026-10-17T02:00:00+00:00',
  all_day: false,
  color: 'red',
  memo: 'メモ',
  created_at: '2026-10-16T00:00:00+00:00',
  updated_at: '2026-10-16T00:00:00+00:00',
};

describe('toCalendarEvent', () => {
  it('snake_case の DB 行を camelCase に変換し、日時を Date にする', () => {
    const e = toCalendarEvent(row);
    expect(e.id).toBe(row.id);
    expect(e.allDay).toBe(false);
    expect(e.startsAt).toEqual(new Date('2026-10-17T01:00:00Z'));
    expect(e.endsAt).toEqual(new Date('2026-10-17T02:00:00Z'));
    expect(e.color).toBe('red');
    expect(e.createdAt).toBeInstanceOf(Date);
  });

  it('未知の色は既定色（blue）に丸める', () => {
    expect(toCalendarEvent({ ...row, color: 'pink' }).color).toBe('blue');
  });
});
