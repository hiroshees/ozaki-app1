import { describe, expect, it } from 'vitest';
import { formatEventPeriod } from '@/lib/events/format';

const jst = (s: string) => new Date(`${s}+09:00`);
const timed = (start: string, end: string) => ({
  startsAt: jst(start),
  endsAt: jst(end),
  allDay: false,
});
const allDay = (first: string, lastExclusive: string) => ({
  startsAt: jst(`${first}T00:00`),
  endsAt: jst(`${lastExclusive}T00:00`),
  allDay: true,
});

describe('formatEventPeriod', () => {
  it('同じ日の時間指定は、日付と「開始〜終了」', () => {
    expect(
      formatEventPeriod(timed('2026-10-17T09:00', '2026-10-17T10:30')),
    ).toBe('2026年10月17日（土）9:00〜10:30');
  });

  it('日をまたぐ時間指定は、両日の日付を出す', () => {
    expect(
      formatEventPeriod(timed('2026-10-17T23:00', '2026-10-18T01:00')),
    ).toBe('2026年10月17日（土）23:00〜2026年10月18日（日）1:00');
  });

  it('翌日 0:00 ちょうどの終了は、同じ日の 24:00 として表示する', () => {
    expect(
      formatEventPeriod(timed('2026-10-17T22:00', '2026-10-18T00:00')),
    ).toBe('2026年10月17日（土）22:00〜24:00');
  });

  it('1日の終日予定は日付だけ', () => {
    expect(formatEventPeriod(allDay('2026-10-17', '2026-10-18'))).toBe(
      '2026年10月17日（土）',
    );
  });

  it('複数日の終日予定は、最終日（終了の前日）までの期間（同じ月）', () => {
    expect(formatEventPeriod(allDay('2026-10-12', '2026-10-15'))).toBe(
      '2026年10月12日（月）〜14日（水）',
    );
  });

  it('複数日の終日予定（月またぎ）', () => {
    expect(formatEventPeriod(allDay('2026-10-30', '2026-11-03'))).toBe(
      '2026年10月30日（金）〜11月2日（月）',
    );
  });

  it('複数日の終日予定（年またぎ）', () => {
    expect(formatEventPeriod(allDay('2026-12-30', '2027-01-03'))).toBe(
      '2026年12月30日（水）〜2027年1月2日（土）',
    );
  });

  it('UTC では前日になる時刻でも JST で表示する', () => {
    // JST 10/17 00:30 = UTC 10/16 15:30
    expect(
      formatEventPeriod(timed('2026-10-17T00:30', '2026-10-17T01:30')),
    ).toBe('2026年10月17日（土）0:30〜1:30');
  });
});
