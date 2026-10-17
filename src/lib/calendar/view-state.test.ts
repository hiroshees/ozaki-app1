import { describe, expect, it } from 'vitest';
import { resolveViewState } from '@/lib/calendar/view-state';

// UTC の 2026-10-16 16:00 は JST では 2026-10-17 01:00
const now = new Date('2026-10-16T16:00:00Z');

describe('resolveViewState', () => {
  it('searchParams が無ければ今日(JST)の月表示になる', () => {
    const s = resolveViewState({}, now);
    expect(s.view).toBe('month');
    expect(s.dateKey).toBe('2026-10-17');
    expect(s.todayKey).toBe('2026-10-17');
    expect(s.title).toBe('2026年10月');
  });

  it('?view=week&date=2026-10-17 はその週の範囲(JST)を返す', () => {
    const s = resolveViewState({ view: 'week', date: '2026-10-17' }, now);
    expect(s.view).toBe('week');
    expect(s.range.start.toISOString()).toBe('2026-10-10T15:00:00.000Z');
    expect(s.range.end.toISOString()).toBe('2026-10-17T15:00:00.000Z');
    expect(s.title).toBe('2026年10月11日〜17日');
  });

  it('月表示の範囲は6週分（終了を含まない）', () => {
    const s = resolveViewState({ view: 'month', date: '2026-10-17' }, now);
    expect(s.range.start.toISOString()).toBe('2026-09-26T15:00:00.000Z');
    expect(s.range.end.toISOString()).toBe('2026-11-07T15:00:00.000Z');
  });

  it('不正な view / date はエラーにならず、月表示・今日にフォールバックする', () => {
    const s = resolveViewState({ view: 'year', date: 'abc' }, now);
    expect(s.view).toBe('month');
    expect(s.dateKey).toBe('2026-10-17');
  });

  it('表示日が今日と違っても todayKey は今日(JST)のまま', () => {
    const s = resolveViewState({ date: '2026-12-01' }, now);
    expect(s.dateKey).toBe('2026-12-01');
    expect(s.todayKey).toBe('2026-10-17');
  });

  it('クライアントに渡せるよう、返す値は文字列と通常の Date だけ（TZDate を含まない）', () => {
    const s = resolveViewState({ view: 'day' }, now);
    expect(typeof s.dateKey).toBe('string');
    expect(s.range.start.constructor).toBe(Date);
    expect(s.range.end.constructor).toBe(Date);
  });
});
