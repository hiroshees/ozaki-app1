import { describe, expect, it } from 'vitest';
import {
  formatDateKey,
  getMonthGrid,
  getPeriodTitle,
  getViewRange,
  getWeekDays,
  parseViewParams,
  shiftDate,
  toJstDate,
} from '@/lib/calendar/grid';

// JST の 2026-10-17 00:00（= UTC の 2026-10-16 15:00）
const today = new Date('2026-10-16T15:00:00Z');
const jst = (key: string) => toJstDate(new Date(`${key}T00:00:00+09:00`));
const keys = (days: { key: string }[]) => days.map((d) => d.key);

describe('toJstDate / formatDateKey', () => {
  it('UTC では前日でも JST の暦日で扱う', () => {
    // UTC 2026-10-16 16:00 は JST では 10/17 01:00
    expect(formatDateKey(new Date('2026-10-16T16:00:00Z'))).toBe('2026-10-17');
    expect(formatDateKey(new Date('2026-10-16T14:59:59Z'))).toBe('2026-10-16');
  });
});

describe('getMonthGrid', () => {
  it('日曜始まりの6週42日で、前月・翌月の日付を含む（2026年10月）', () => {
    const grid = getMonthGrid(jst('2026-10-17'), today);
    expect(grid).toHaveLength(42);
    expect(grid[0].key).toBe('2026-09-27');
    expect(grid[41].key).toBe('2026-11-07');
    expect(grid[0].date.getDay()).toBe(0);
  });

  it('当月かどうか・今日かどうかを持つ', () => {
    const grid = getMonthGrid(jst('2026-10-17'), today);
    expect(grid.find((d) => d.key === '2026-09-30')?.inMonth).toBe(false);
    expect(grid.find((d) => d.key === '2026-10-01')?.inMonth).toBe(true);
    expect(grid.find((d) => d.key === '2026-11-01')?.inMonth).toBe(false);
    expect(grid.filter((d) => d.isToday).map((d) => d.key)).toEqual([
      '2026-10-17',
    ]);
  });

  it('月初が日曜の月は、前月を含まず1日から始まる（2026年2月）', () => {
    const grid = getMonthGrid(jst('2026-02-10'), today);
    expect(grid[0].key).toBe('2026-02-01');
    expect(grid[41].key).toBe('2026-03-14');
  });

  it('年またぎ（2026年12月）', () => {
    const grid = getMonthGrid(jst('2026-12-15'), today);
    expect(grid[0].key).toBe('2026-11-29');
    expect(grid[41].key).toBe('2027-01-09');
  });

  it('うるう年の2月29日を含む（2028年2月）', () => {
    const grid = getMonthGrid(jst('2028-02-10'), today);
    expect(grid[0].key).toBe('2028-01-30');
    expect(keys(grid)).toContain('2028-02-29');
    expect(grid.find((d) => d.key === '2028-02-29')?.inMonth).toBe(true);
    expect(grid.find((d) => d.key === '2028-03-01')?.inMonth).toBe(false);
  });

  it('日付が連続している', () => {
    const grid = getMonthGrid(jst('2026-10-17'), today);
    for (let i = 1; i < grid.length; i++) {
      expect(grid[i].date.getTime() - grid[i - 1].date.getTime()).toBe(
        24 * 60 * 60 * 1000,
      );
    }
  });
});

describe('getWeekDays', () => {
  it('基準日を含む日曜〜土曜の7日', () => {
    expect(keys(getWeekDays(jst('2026-10-17'), today))).toEqual([
      '2026-10-11',
      '2026-10-12',
      '2026-10-13',
      '2026-10-14',
      '2026-10-15',
      '2026-10-16',
      '2026-10-17',
    ]);
  });

  it('日曜が基準日でもその日から始まる', () => {
    expect(getWeekDays(jst('2026-10-11'), today)[0].key).toBe('2026-10-11');
  });

  it('月またぎ', () => {
    const days = getWeekDays(jst('2026-11-01'), today);
    expect(days[0].key).toBe('2026-11-01');
    expect(getWeekDays(jst('2026-10-31'), today)[6].key).toBe('2026-10-31');
  });
});

describe('getViewRange（終了は含まない）', () => {
  it('月: グリッドの先頭日の 0:00 〜 末尾日の翌日 0:00（JST）', () => {
    const r = getViewRange('month', jst('2026-10-17'));
    expect(r.start.toISOString()).toBe('2026-09-26T15:00:00.000Z');
    expect(r.end.toISOString()).toBe('2026-11-07T15:00:00.000Z');
  });

  it('週: 日曜 0:00 〜 次の日曜 0:00', () => {
    const r = getViewRange('week', jst('2026-10-17'));
    expect(r.start.toISOString()).toBe('2026-10-10T15:00:00.000Z');
    expect(r.end.toISOString()).toBe('2026-10-17T15:00:00.000Z');
  });

  it('日: 当日 0:00 〜 翌日 0:00', () => {
    const r = getViewRange('day', jst('2026-10-17'));
    expect(r.start.toISOString()).toBe('2026-10-16T15:00:00.000Z');
    expect(r.end.toISOString()).toBe('2026-10-17T15:00:00.000Z');
  });
});

describe('shiftDate（前へ・次へ・今日）', () => {
  it('月: ±1か月。月末は存在する日に丸める', () => {
    expect(formatDateKey(shiftDate('month', jst('2026-01-31'), 1, today))).toBe(
      '2026-02-28',
    );
    expect(
      formatDateKey(shiftDate('month', jst('2026-03-31'), -1, today)),
    ).toBe('2026-02-28');
    expect(formatDateKey(shiftDate('month', jst('2026-12-15'), 1, today))).toBe(
      '2027-01-15',
    );
    expect(
      formatDateKey(shiftDate('month', jst('2027-01-15'), -1, today)),
    ).toBe('2026-12-15');
  });

  it('週: ±7日', () => {
    expect(formatDateKey(shiftDate('week', jst('2026-10-17'), 1, today))).toBe(
      '2026-10-24',
    );
    expect(formatDateKey(shiftDate('week', jst('2026-10-03'), -1, today))).toBe(
      '2026-09-26',
    );
  });

  it('日: ±1日（月またぎ）', () => {
    expect(formatDateKey(shiftDate('day', jst('2026-10-31'), 1, today))).toBe(
      '2026-11-01',
    );
    expect(formatDateKey(shiftDate('day', jst('2026-11-01'), -1, today))).toBe(
      '2026-10-31',
    );
  });

  it('0 を渡すと今日に戻る', () => {
    expect(formatDateKey(shiftDate('week', jst('2020-01-01'), 0, today))).toBe(
      '2026-10-17',
    );
  });
});

describe('getPeriodTitle', () => {
  it('月', () => {
    expect(getPeriodTitle('month', jst('2026-10-17'))).toBe('2026年10月');
  });

  it('週（同じ月）', () => {
    expect(getPeriodTitle('week', jst('2026-10-17'))).toBe(
      '2026年10月11日〜17日',
    );
  });

  it('週（月またぎ）', () => {
    expect(getPeriodTitle('week', jst('2026-10-01'))).toBe(
      '2026年9月27日〜10月3日',
    );
  });

  it('週（年またぎ）', () => {
    expect(getPeriodTitle('week', jst('2026-12-31'))).toBe(
      '2026年12月27日〜2027年1月2日',
    );
  });

  it('日（曜日つき）', () => {
    expect(getPeriodTitle('day', jst('2026-10-17'))).toBe(
      '2026年10月17日（土）',
    );
  });
});

describe('parseViewParams', () => {
  it('正しい値はそのまま使う', () => {
    const r = parseViewParams({ view: 'week', date: '2026-10-17' }, today);
    expect(r.view).toBe('week');
    expect(formatDateKey(r.date)).toBe('2026-10-17');
  });

  it('不正な view は month にフォールバック', () => {
    expect(
      parseViewParams({ view: 'year', date: '2026-10-17' }, today).view,
    ).toBe('month');
    expect(parseViewParams({}, today).view).toBe('month');
  });

  it('不正な date は今日にフォールバック', () => {
    for (const date of [
      'abc',
      '2026-02-30',
      '2026-13-01',
      '2026-1-1',
      '',
      undefined,
    ]) {
      expect(formatDateKey(parseViewParams({ date }, today).date)).toBe(
        '2026-10-17',
      );
    }
  });

  it('配列で渡された場合は先頭を使う（searchParams の仕様）', () => {
    const r = parseViewParams(
      { view: ['day', 'week'], date: ['2026-10-01'] },
      today,
    );
    expect(r.view).toBe('day');
    expect(formatDateKey(r.date)).toBe('2026-10-01');
  });
});
