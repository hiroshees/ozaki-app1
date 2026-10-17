import { describe, expect, it } from 'vitest';
import {
  buildCreateDefaults,
  buildSlotDefaults,
  eventToFormValues,
  formValuesToInput,
  serverErrorsToFormErrors,
  validateFormValues,
  type EventFormValues,
} from '@/lib/events/form';
import type { CalendarEvent } from '@/lib/events/types';

const jst = (s: string) => new Date(`${s}+09:00`);

const base: EventFormValues = {
  title: '打ち合わせ',
  allDay: false,
  startDate: '2026-10-17',
  startTime: '09:00',
  endDate: '2026-10-17',
  endTime: '10:00',
  color: 'blue',
  memo: '',
};

const event = (over: Partial<CalendarEvent>): CalendarEvent => ({
  id: '3f2b8c1e-6a4d-4c3b-9d5e-1a2b3c4d5e6f',
  title: '予定',
  startsAt: jst('2026-10-17T09:00'),
  endsAt: jst('2026-10-17T10:30'),
  allDay: false,
  color: 'green',
  memo: 'メモ',
  createdAt: jst('2026-10-01T00:00'),
  updatedAt: jst('2026-10-01T00:00'),
  ...over,
});

describe('formValuesToInput', () => {
  it('時間指定は JST の日時として保存する値になる', () => {
    const input = formValuesToInput(base);
    expect(input.startsAt).toBe('2026-10-17T00:00:00.000Z');
    expect(input.endsAt).toBe('2026-10-17T01:00:00.000Z');
    expect(input).toMatchObject({
      title: '打ち合わせ',
      allDay: false,
      color: 'blue',
      memo: '',
    });
  });

  it('日をまたぐ予定（23:00〜翌1:00）', () => {
    const input = formValuesToInput({
      ...base,
      startTime: '23:00',
      endDate: '2026-10-18',
      endTime: '01:00',
    });
    expect(input.startsAt).toBe('2026-10-17T14:00:00.000Z');
    expect(input.endsAt).toBe('2026-10-17T16:00:00.000Z');
  });

  it('終日は「開始日 00:00 JST 〜 最終日の翌日 00:00 JST」で保存する（時刻の入力は無視）', () => {
    const input = formValuesToInput({
      ...base,
      allDay: true,
      startDate: '2026-10-12',
      endDate: '2026-10-14',
      startTime: '13:00',
      endTime: '14:00',
    });
    expect(input.startsAt).toBe('2026-10-11T15:00:00.000Z'); // 10/12 00:00 JST
    expect(input.endsAt).toBe('2026-10-14T15:00:00.000Z'); // 10/15 00:00 JST
  });

  it('終日で月末・年末の最終日でも、翌日 0:00 に正しく繰り上がる', () => {
    const input = formValuesToInput({
      ...base,
      allDay: true,
      startDate: '2026-12-31',
      endDate: '2026-12-31',
    });
    expect(input.startsAt).toBe('2026-12-30T15:00:00.000Z');
    expect(input.endsAt).toBe('2026-12-31T15:00:00.000Z'); // 2027-01-01 00:00 JST
  });

  it('不正な日時は例外にならず、検証でエラーにできる値になる', () => {
    const input = formValuesToInput({ ...base, startDate: '', startTime: '' });
    expect(typeof input.startsAt).toBe('string');
    expect(validateFormValues({ ...base, startDate: '' }).ok).toBe(false);
  });
});

describe('eventToFormValues', () => {
  it('時間指定の予定を JST の日付・時刻に戻す', () => {
    expect(eventToFormValues(event({}))).toMatchObject({
      title: '予定',
      allDay: false,
      startDate: '2026-10-17',
      startTime: '09:00',
      endDate: '2026-10-17',
      endTime: '10:30',
      color: 'green',
      memo: 'メモ',
    });
  });

  it('終日は終了を「含む最終日」で表示する（終了の前日）', () => {
    const v = eventToFormValues(
      event({
        allDay: true,
        startsAt: jst('2026-10-12T00:00'),
        endsAt: jst('2026-10-15T00:00'),
      }),
    );
    expect(v).toMatchObject({
      allDay: true,
      startDate: '2026-10-12',
      endDate: '2026-10-14',
    });
  });

  it('保存 → 編集で再表示しても、終日の最終日がずれない', () => {
    const values: EventFormValues = {
      ...base,
      allDay: true,
      startDate: '2026-12-30',
      endDate: '2027-01-02',
    };
    const input = formValuesToInput(values);
    const restored = eventToFormValues(
      event({
        allDay: true,
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt),
      }),
    );
    expect(restored).toMatchObject({
      startDate: '2026-12-30',
      endDate: '2027-01-02',
    });
  });

  it('UTC では前日になる時刻でも JST で復元する', () => {
    // JST 00:30 = UTC 前日 15:30
    const v = eventToFormValues(
      event({
        startsAt: jst('2026-10-17T00:30'),
        endsAt: jst('2026-10-17T01:30'),
      }),
    );
    expect(v).toMatchObject({ startDate: '2026-10-17', startTime: '00:30' });
  });

  it('時間指定 → 保存値 → 再表示で元に戻る', () => {
    const input = formValuesToInput(base);
    const restored = eventToFormValues(
      event({
        title: base.title,
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt),
        color: 'blue',
        memo: '',
      }),
    );
    expect(restored).toEqual(base);
  });
});

describe('validateFormValues', () => {
  it('正常な入力は通る', () => {
    const r = validateFormValues(base);
    expect(r.ok).toBe(true);
  });

  it('空のタイトルはエラー', () => {
    const r = validateFormValues({ ...base, title: '' });
    expect(r).toMatchObject({
      ok: false,
      errors: { title: 'タイトルは必須です' },
    });
  });

  it('101 文字のタイトル、1001 文字のメモはエラー（100・1000 文字は通る）', () => {
    expect(validateFormValues({ ...base, title: 'あ'.repeat(101) }).ok).toBe(
      false,
    );
    expect(validateFormValues({ ...base, title: 'あ'.repeat(100) }).ok).toBe(
      true,
    );
    expect(validateFormValues({ ...base, memo: 'a'.repeat(1001) }).ok).toBe(
      false,
    );
    expect(validateFormValues({ ...base, memo: 'a'.repeat(1000) }).ok).toBe(
      true,
    );
  });

  it('開始より前・同時刻の終了はエラーで、終了の日付欄に付く', () => {
    const before = validateFormValues({ ...base, endTime: '08:00' });
    expect(before).toMatchObject({
      ok: false,
      errors: { endDate: '終了は開始より後にしてください' },
    });
    expect(validateFormValues({ ...base, endTime: '09:00' }).ok).toBe(false);
  });

  it('終日で最終日が開始日より前ならエラー、同じ日なら通る', () => {
    const allDay = { ...base, allDay: true };
    expect(validateFormValues({ ...allDay, endDate: '2026-10-16' }).ok).toBe(
      false,
    );
    expect(validateFormValues({ ...allDay, endDate: '2026-10-17' }).ok).toBe(
      true,
    );
  });

  it('不正な日付は開始・終了の欄にエラーが付く', () => {
    const r = validateFormValues({ ...base, startDate: '' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.startDate).toBeTruthy();
  });

  it('正常なら保存用の値（ISO 文字列）を返す', () => {
    const r = validateFormValues(base);
    expect(r.ok && r.input.startsAt).toBe('2026-10-17T00:00:00.000Z');
  });
});

describe('serverErrorsToFormErrors', () => {
  it('サーバーの項目名（startsAt / endsAt）をフォームの欄に対応づける', () => {
    expect(
      serverErrorsToFormErrors({
        title: ['タイトルは必須です'],
        startsAt: ['開始日時が不正です'],
        endsAt: ['終了は開始より後にしてください'],
        memo: ['メモは1000文字以内にしてください'],
      }),
    ).toEqual({
      title: 'タイトルは必須です',
      startDate: '開始日時が不正です',
      endDate: '終了は開始より後にしてください',
      memo: 'メモは1000文字以内にしてください',
    });
  });

  it('未知の項目は無視する', () => {
    expect(serverErrorsToFormErrors({ id: ['IDが不正です'] })).toEqual({});
  });
});

describe('buildCreateDefaults', () => {
  const today = '2026-10-17';

  it('今日を含まない表示では、基準日の 9:00〜10:00', () => {
    const v = buildCreateDefaults({
      dateKey: '2026-11-20',
      todayKey: today,
      rangeContainsToday: false,
      now: jst('2026-10-17T15:10'),
    });
    expect(v).toMatchObject({
      allDay: false,
      startDate: '2026-11-20',
      startTime: '09:00',
      endDate: '2026-11-20',
      endTime: '10:00',
      color: 'blue',
      title: '',
      memo: '',
    });
  });

  it('今日を含む表示では、今日の現在時刻の次の30分刻みから1時間（基準日ではなく今日）', () => {
    const v = buildCreateDefaults({
      dateKey: '2026-10-20',
      todayKey: today,
      rangeContainsToday: true,
      now: jst('2026-10-17T15:10'),
    });
    expect(v).toMatchObject({
      startDate: today,
      startTime: '15:30',
      endDate: today,
      endTime: '16:30',
    });
  });

  it('30分ちょうどならその時刻から', () => {
    const v = buildCreateDefaults({
      dateKey: today,
      todayKey: today,
      rangeContainsToday: true,
      now: jst('2026-10-17T10:00'),
    });
    expect(v).toMatchObject({ startTime: '10:00', endTime: '11:00' });
  });

  it('日付が変わる直前は、23:00〜翌 0:00 に収める', () => {
    const v = buildCreateDefaults({
      dateKey: today,
      todayKey: today,
      rangeContainsToday: true,
      now: jst('2026-10-17T23:40'),
    });
    expect(v).toMatchObject({
      startDate: today,
      startTime: '23:00',
      endDate: '2026-10-18',
      endTime: '00:00',
    });
  });

  it('UTC では前日になる時刻でも、JST の今日で決まる', () => {
    // UTC 10/16 16:10 = JST 10/17 01:10
    const v = buildCreateDefaults({
      dateKey: today,
      todayKey: today,
      rangeContainsToday: true,
      now: new Date('2026-10-16T16:10:00Z'),
    });
    expect(v).toMatchObject({ startDate: today, startTime: '01:30' });
  });
});

describe('buildSlotDefaults（空き時間クリックの初期値）', () => {
  it('クリックした日の、開始時刻から30分の予定（終日はオフ）', () => {
    expect(buildSlotDefaults('2026-10-20', 9 * 60 + 15)).toEqual({
      title: '',
      allDay: false,
      startDate: '2026-10-20',
      startTime: '09:15',
      endDate: '2026-10-20',
      endTime: '09:45',
      color: 'blue',
      memo: '',
    });
  });

  it('0:00 から始まる予定', () => {
    expect(buildSlotDefaults('2026-10-20', 0)).toMatchObject({
      startTime: '00:00',
      endTime: '00:30',
    });
  });

  it('23:30 の予定は、終了が翌日の 0:00（24:00 を超えない）', () => {
    expect(buildSlotDefaults('2026-10-31', 23 * 60 + 30)).toMatchObject({
      startDate: '2026-10-31',
      startTime: '23:30',
      endDate: '2026-11-01',
      endTime: '00:00',
    });
  });

  it('年末の 23:30 は、終了が翌年 1/1 の 0:00', () => {
    expect(buildSlotDefaults('2026-12-31', 23 * 60 + 30)).toMatchObject({
      endDate: '2027-01-01',
      endTime: '00:00',
    });
  });

  it('そのまま保存できる値になる（検証を通り、JST で正しい）', () => {
    const result = validateFormValues({
      ...buildSlotDefaults('2026-10-20', 23 * 60 + 30),
      title: '予定',
    });
    expect(result.ok && result.input.startsAt).toBe('2026-10-20T14:30:00.000Z');
    expect(result.ok && result.input.endsAt).toBe('2026-10-20T15:00:00.000Z');
  });
});
