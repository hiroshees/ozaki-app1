import { describe, expect, it } from 'vitest';
import { buildMiniCalendar, monthKeyOf } from '@/lib/calendar/mini';

const todayKey = '2026-10-17';

describe('monthKeyOf', () => {
  it('yyyy-MM-dd から yyyy-MM を取り出す', () => {
    expect(monthKeyOf('2026-10-17')).toBe('2026-10');
  });
});

describe('buildMiniCalendar', () => {
  const mini = buildMiniCalendar(
    { view: 'week', dateKey: '2026-10-20' },
    todayKey,
    '2026-10',
  );
  const days = mini.weeks.flat();
  const day = (key: string) => days.find((d) => d.key === key)!;

  it('6週×7日で、前月・翌月の日付を含む（日曜始まり）', () => {
    expect(mini.weeks).toHaveLength(6);
    expect(mini.weeks.every((w) => w.length === 7)).toBe(true);
    expect(days[0].key).toBe('2026-09-27');
    expect(days[41].key).toBe('2026-11-07');
    expect(mini.weekdays).toEqual(['日', '月', '火', '水', '木', '金', '土']);
  });

  it('当月外の日付は inMonth が false', () => {
    expect(day('2026-09-30').inMonth).toBe(false);
    expect(day('2026-10-01').inMonth).toBe(true);
    expect(day('2026-10-31').inMonth).toBe(true);
    expect(day('2026-11-01').inMonth).toBe(false);
  });

  it('今日と表示中の日付を区別する', () => {
    expect(days.filter((d) => d.isToday).map((d) => d.key)).toEqual([
      '2026-10-17',
    ]);
    expect(days.filter((d) => d.isSelected).map((d) => d.key)).toEqual([
      '2026-10-20',
    ]);
  });

  it('日付のリンクは view を維持して date を更新する（今日は date を省略）', () => {
    expect(day('2026-10-25').href).toBe('/?view=week&date=2026-10-25');
    expect(day('2026-10-17').href).toBe('/?view=week');
    const monthView = buildMiniCalendar(
      { view: 'month', dateKey: '2026-10-20' },
      todayKey,
      '2026-10',
    );
    expect(
      monthView.weeks.flat().find((d) => d.key === '2026-11-03')?.href,
    ).toBe('/?date=2026-11-03');
  });

  it('当月外の日付をクリックしても、その日付へ移動するリンクになる', () => {
    expect(day('2026-09-30').href).toBe('/?view=week&date=2026-09-30');
  });

  it('aria-label に日付と曜日が入る', () => {
    expect(day('2026-10-17').label).toBe('2026年10月17日（土）');
    expect(day('2026-10-20').label).toBe('2026年10月20日（火）');
  });

  it('見出しと前月・翌月のキー（年またぎ）', () => {
    expect(mini.title).toBe('2026年10月');
    expect(mini.prevMonthKey).toBe('2026-09');
    expect(mini.nextMonthKey).toBe('2026-11');
    const dec = buildMiniCalendar(
      { view: 'month', dateKey: '2026-12-15' },
      todayKey,
      '2026-12',
    );
    expect(dec.nextMonthKey).toBe('2027-01');
    const jan = buildMiniCalendar(
      { view: 'month', dateKey: '2027-01-15' },
      todayKey,
      '2027-01',
    );
    expect(jan.prevMonthKey).toBe('2026-12');
  });

  it('表示月は表示中の日付と独立に指定できる（月送り）', () => {
    const next = buildMiniCalendar(
      { view: 'month', dateKey: '2026-10-20' },
      todayKey,
      '2026-11',
    );
    expect(next.title).toBe('2026年11月');
    expect(next.weeks.flat().some((d) => d.isSelected)).toBe(false);
  });
});
