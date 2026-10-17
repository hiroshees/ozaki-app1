import { describe, expect, it } from 'vitest';
import { buildHeaderNav } from '@/lib/calendar/nav';

const todayKey = '2026-10-17';

describe('buildHeaderNav', () => {
  it('月: 前へ/次へは ±1か月、今日は date を省略', () => {
    const n = buildHeaderNav(
      { view: 'month', dateKey: '2026-10-17' },
      todayKey,
    );
    expect(n.prevHref).toBe('/?date=2026-09-17');
    expect(n.nextHref).toBe('/?date=2026-11-17');
    expect(n.todayHref).toBe('/');
  });

  it('週: ±7日', () => {
    const n = buildHeaderNav({ view: 'week', dateKey: '2026-10-20' }, todayKey);
    expect(n.prevHref).toBe('/?view=week&date=2026-10-13');
    expect(n.nextHref).toBe('/?view=week&date=2026-10-27');
    expect(n.todayHref).toBe('/?view=week');
  });

  it('日: ±1日（月またぎ）', () => {
    const n = buildHeaderNav({ view: 'day', dateKey: '2026-10-31' }, todayKey);
    expect(n.nextHref).toBe('/?view=day&date=2026-11-01');
    expect(n.prevHref).toBe('/?view=day&date=2026-10-30');
  });

  it('1/31 の次月は 2/28 に丸める（月末の挙動）', () => {
    const n = buildHeaderNav(
      { view: 'month', dateKey: '2026-01-31' },
      todayKey,
    );
    expect(n.nextHref).toBe('/?date=2026-02-28');
    expect(
      buildHeaderNav({ view: 'month', dateKey: '2026-03-31' }, todayKey)
        .prevHref,
    ).toBe('/?date=2026-02-28');
  });

  it('年またぎ', () => {
    expect(
      buildHeaderNav({ view: 'month', dateKey: '2026-12-15' }, todayKey)
        .nextHref,
    ).toBe('/?date=2027-01-15');
    expect(
      buildHeaderNav({ view: 'week', dateKey: '2027-01-02' }, todayKey)
        .prevHref,
    ).toBe('/?view=week&date=2026-12-26');
  });

  it('view の切り替えは基準日を保つ', () => {
    const n = buildHeaderNav(
      { view: 'month', dateKey: '2026-12-01' },
      todayKey,
    );
    expect(n.viewHrefs.month).toBe('/?date=2026-12-01');
    expect(n.viewHrefs.week).toBe('/?view=week&date=2026-12-01');
    expect(n.viewHrefs.day).toBe('/?view=day&date=2026-12-01');
  });

  it('今日を表示中の view 切り替えは date を省略', () => {
    const n = buildHeaderNav({ view: 'week', dateKey: todayKey }, todayKey);
    expect(n.viewHrefs).toEqual({
      month: '/',
      week: '/?view=week',
      day: '/?view=day',
    });
  });

  it('前へ/次へのラベルは view に合わせる', () => {
    expect(
      buildHeaderNav({ view: 'month', dateKey: todayKey }, todayKey).unitLabel,
    ).toBe('月');
    expect(
      buildHeaderNav({ view: 'week', dateKey: todayKey }, todayKey).unitLabel,
    ).toBe('週');
    expect(
      buildHeaderNav({ view: 'day', dateKey: todayKey }, todayKey).unitLabel,
    ).toBe('日');
  });
});
