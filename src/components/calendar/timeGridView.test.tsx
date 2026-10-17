import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
// 時間グリッドの列は Client Component で、useRouter と Server Action を使う
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock('@/lib/events/actions', () => ({
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
}));

import { TimeGridView } from '@/components/calendar/timeGridView';
import type { CalendarEvent, EventColor } from '@/lib/events/types';

const render = (
  view: 'week' | 'day',
  dateKey: string,
  todayKey = '2026-10-17',
) =>
  renderToStaticMarkup(
    <TimeGridView view={view} dateKey={dateKey} todayKey={todayKey} />,
  );

const count = (html: string, needle: string) => html.split(needle).length - 1;

describe('TimeGridView', () => {
  it('週表示は日曜〜土曜の7列で、0〜24時の目盛りがある', () => {
    const html = render('week', '2026-10-14');
    expect(count(html, 'data-day="')).toBe(7);
    for (const key of ['2026-10-11', '2026-10-17'])
      expect(html).toContain(`data-day="${key}"`);
    for (const h of [0, 1, 12, 23]) expect(html).toContain(`>${h}:00<`);
    expect(count(html, ':00<')).toBe(24);
    expect(html).toContain('aria-label="週表示"');
  });

  it('日表示は基準日の1列だけ', () => {
    const html = render('day', '2026-10-14');
    expect(count(html, 'data-day="')).toBe(1);
    expect(html).toContain('data-day="2026-10-14"');
    expect(html).toContain('aria-label="日表示"');
  });

  it('1時間ごとの線を引くスタイルと、24時間分の高さがある', () => {
    const html = render('week', '2026-10-14');
    expect(html).toContain('background-size:100% 48px');
    expect(html).toContain('height:1152px');
  });

  it('今日の列見出しが強調され、日付は日表示へのリンク', () => {
    const html = render('week', '2026-10-14');
    expect(count(html, 'aria-current="date"')).toBe(1);
    expect(html).toContain('href="/?view=day&amp;date=2026-10-14"');
    // 今日(10/17)は date を省略
    expect(html).toContain('href="/?view=day"');
    expect(html).toContain('10月17日（土）の日表示');
  });

  it('今日が表示範囲に無ければ強調は無い', () => {
    expect(count(render('week', '2026-11-20'), 'aria-current="date"')).toBe(0);
  });

  it('現在時刻の線はサーバー描画に含まれない（ハイドレーションエラー対策）', () => {
    expect(render('week', '2026-10-17')).not.toContain('data-current-time');
    expect(render('day', '2026-10-17')).not.toContain('data-current-time');
  });
});

const jst = (s: string) => new Date(`${s}+09:00`);
let seq = 0;
const make = (
  title: string,
  start: string,
  end: string,
  { allDay = false, color = 'blue' as EventColor } = {},
): CalendarEvent => ({
  id: `00000000-0000-4000-8000-${String(++seq).padStart(12, '0')}`,
  title,
  startsAt: jst(start),
  endsAt: jst(end),
  allDay,
  color,
  memo: '',
  createdAt: jst('2026-10-01T00:00'),
  updatedAt: jst('2026-10-01T00:00'),
});
const allDayEvent = (
  title: string,
  first: string,
  lastExclusive: string,
  color?: EventColor,
) =>
  make(title, `${first}T00:00`, `${lastExclusive}T00:00`, {
    allDay: true,
    color,
  });

const renderWith = (
  view: 'week' | 'day',
  dateKey: string,
  events: CalendarEvent[],
) =>
  renderToStaticMarkup(
    <TimeGridView
      view={view}
      dateKey={dateKey}
      todayKey="2026-10-17"
      events={events}
    />,
  );

describe('TimeGridView の終日予定の欄', () => {
  it('終日予定が無ければ欄は出ない', () => {
    expect(render('week', '2026-10-14')).not.toContain('終日');
  });

  it('終日予定は時間グリッドの上（列見出しの下）の欄に出る', () => {
    const html = renderWith('week', '2026-10-14', [
      allDayEvent('休み', '2026-10-14', '2026-10-15'),
    ]);
    expect(html).toContain('aria-label="終日の予定"');
    expect(html.indexOf('>休み<')).toBeGreaterThan(-1);
    expect(html.indexOf('終日の予定')).toBeLessThan(html.indexOf('data-day="'));
    // 時間グリッドの列の中には出ない
    const grid = html.slice(html.indexOf('data-day="'));
    expect(grid).not.toContain('>休み<');
  });

  it('複数日の終日予定は、複数列にまたがる1本の帯', () => {
    const html = renderWith('week', '2026-10-14', [
      allDayEvent('合宿', '2026-10-12', '2026-10-15', 'red'),
    ]);
    expect(count(html, '>合宿<')).toBe(1);
    expect(html).toContain('grid-column:2 / 5');
    expect(html).toContain('bg-red-600');
  });

  it('範囲の前後へ続く終日予定は、端を丸めない', () => {
    const html = renderWith('week', '2026-10-14', [
      allDayEvent('長期', '2026-10-05', '2026-10-30'),
    ]);
    expect(html).toContain('rounded-l-none');
    expect(html).toContain('rounded-r-none');
    expect(html).toContain('grid-column:1 / 8');
  });

  it('日をまたぐ時間指定の予定は欄に出ない', () => {
    const html = renderWith('week', '2026-10-14', [
      make('夜', '2026-10-13T23:00', '2026-10-14T01:00'),
    ]);
    expect(html).not.toContain('終日');
    // 終日の欄は無く、予定は時間グリッド側の列にだけ出る
    expect(html.slice(0, html.indexOf('data-day="'))).not.toContain('>夜<');
  });

  it('あふれると最終行が「他 N 件」になる', () => {
    const events = [1, 2, 3, 4, 5].map((i) =>
      allDayEvent(`予定${i}`, '2026-10-13', '2026-10-14'),
    );
    const html = renderWith('week', '2026-10-14', events);
    expect(html).toContain('他 3 件');
    expect(count(html, '>予定')).toBe(2);
  });

  it('日表示でも、複数日の途中の日にかかる終日予定が出る', () => {
    const html = renderWith('day', '2026-10-14', [
      allDayEvent('出張', '2026-10-12', '2026-10-17'),
    ]);
    expect(count(html, '>出張<')).toBe(1);
    expect(html).toContain('grid-column:1 / 2');
  });

  it('日表示では、その日にかからない終日予定は出ない', () => {
    const html = renderWith('day', '2026-10-14', [
      allDayEvent('別日', '2026-10-20', '2026-10-21'),
    ]);
    expect(html).not.toContain('別日');
  });
});

const timed = (title: string, start: string, end: string, color?: EventColor) =>
  make(title, start, end, { color });

// 時間グリッドの列（data-day="..."）ごとの HTML を取り出す
const columnHtml = (html: string, dayKey: string) => {
  const start = html.indexOf(`data-day="${dayKey}"`);
  expect(start).toBeGreaterThan(-1);
  const next = html.indexOf('data-day="', start + 1);
  return html.slice(start, next === -1 ? undefined : next);
};

describe('TimeGridView の時間指定の予定', () => {
  it('予定が、その日の列の中に、時刻に対応した位置で描画される', () => {
    const html = renderWith('week', '2026-10-14', [
      timed('会議', '2026-10-14T09:00', '2026-10-14T10:30'),
    ]);
    const col = columnHtml(html, '2026-10-14');
    expect(col).toContain('>会議<');
    expect(col).toContain('top:432px');
    expect(col).toContain('height:72px');
    expect(columnHtml(html, '2026-10-13')).not.toContain('会議');
    // 終日の欄には出ない
    expect(html).not.toContain('終日');
  });

  it('時刻は JST で「開始〜終了」と表示される', () => {
    const html = renderWith('day', '2026-10-14', [
      timed('会議', '2026-10-14T09:00', '2026-10-14T10:30'),
    ]);
    expect(html).toContain('>9:00〜10:30<');
  });

  it('重なる予定は横に並び、互いに隠れない', () => {
    const html = renderWith('day', '2026-10-14', [
      timed('A', '2026-10-14T09:00', '2026-10-14T11:00'),
      timed('B', '2026-10-14T10:00', '2026-10-14T12:00'),
    ]);
    expect(html).toContain('left:0%;width:50%');
    expect(html).toContain('left:50%;width:50%');
  });

  it('日をまたぐ予定（23:00〜翌1:00）は両日の列に、その日の分だけ出る', () => {
    const html = renderWith('week', '2026-10-14', [
      timed('夜', '2026-10-14T23:00', '2026-10-15T01:00'),
    ]);
    const d14 = columnHtml(html, '2026-10-14');
    const d15 = columnHtml(html, '2026-10-15');
    expect(d14).toContain('>夜<');
    expect(d14).toContain('top:1104px');
    expect(d15).toContain('>夜<');
    expect(d15).toMatch(/top:0[;"]/);
    // 切り口の側は角を丸めない
    expect(d14).toContain('rounded-b-none');
    expect(d15).toContain('rounded-t-none');
  });

  it('15分の予定でも判別できる高さで、時刻は出さずタイトルのみ', () => {
    const html = renderWith('day', '2026-10-14', [
      timed('短い', '2026-10-14T09:00', '2026-10-14T09:15'),
    ]);
    expect(html).toContain('height:24px');
    expect(html).toContain('>短い<');
    expect(html).not.toContain('9:00〜9:15<');
  });

  it('6色すべてが区別できるクラスで描画される', () => {
    const colors: EventColor[] = [
      'blue',
      'red',
      'green',
      'yellow',
      'purple',
      'gray',
    ];
    const html = renderWith(
      'day',
      '2026-10-14',
      colors.map((c, i) =>
        timed(
          `色${c}`,
          `2026-10-14T0${i + 1}:00`,
          `2026-10-14T0${i + 1}:50`,
          c,
        ),
      ),
    );
    for (const c of [
      'bg-blue-100',
      'bg-red-100',
      'bg-green-100',
      'bg-yellow-100',
      'bg-purple-100',
      'bg-gray-100',
    ]) {
      expect(html).toContain(c);
    }
  });

  it('長いタイトルは省略表示のクラスが付く', () => {
    const html = renderWith('day', '2026-10-14', [
      timed('あ'.repeat(200), '2026-10-14T09:00', '2026-10-14T10:00'),
    ]);
    expect(html).toContain('truncate');
  });

  it('予定は現在時刻の線より背面（z-10 < z-20）', () => {
    const html = renderWith('day', '2026-10-14', [
      timed('会議', '2026-10-14T09:00', '2026-10-14T10:00'),
    ]);
    expect(html).toContain('z-10');
  });
});
