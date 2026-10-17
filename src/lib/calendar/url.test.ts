import { describe, expect, it } from 'vitest';
import { formatDateKey, parseViewParams } from '@/lib/calendar/grid';
import { buildViewHref } from '@/lib/calendar/url';

const todayKey = '2026-10-17';

describe('buildViewHref', () => {
  it('view と date を searchParams にする', () => {
    expect(
      buildViewHref({ view: 'week', dateKey: '2026-10-20' }, todayKey),
    ).toBe('/?view=week&date=2026-10-20');
  });

  it('既定の月表示は view を省略する', () => {
    expect(
      buildViewHref({ view: 'month', dateKey: '2026-11-03' }, todayKey),
    ).toBe('/?date=2026-11-03');
  });

  it('今日の日付は date を省略する（共有しても「今日」を指す）', () => {
    expect(buildViewHref({ view: 'day', dateKey: todayKey }, todayKey)).toBe(
      '/?view=day',
    );
  });

  it('月表示で今日なら /', () => {
    expect(buildViewHref({ view: 'month', dateKey: todayKey }, todayKey)).toBe(
      '/',
    );
  });

  it('ビルドした URL を parseViewParams で解釈すると同じ状態に戻る', () => {
    const today = new Date('2026-10-16T15:00:00Z');
    for (const state of [
      { view: 'week' as const, dateKey: '2026-12-31' },
      { view: 'month' as const, dateKey: '2027-01-05' },
      { view: 'day' as const, dateKey: todayKey },
    ]) {
      const query = new URL(buildViewHref(state, todayKey), 'http://x')
        .searchParams;
      const parsed = parseViewParams(
        {
          view: query.get('view') ?? undefined,
          date: query.get('date') ?? undefined,
        },
        today,
      );
      expect(parsed.view).toBe(state.view);
      expect(formatDateKey(parsed.date)).toBe(state.dateKey);
    }
  });
});
