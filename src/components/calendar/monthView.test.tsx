import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MonthView } from '@/components/calendar/monthView';
import {
  EVENT_COLORS,
  type CalendarEvent,
  type EventColor,
} from '@/lib/events/types';

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

const render = (events: CalendarEvent[], dateKey = '2026-10-17') =>
  renderToStaticMarkup(
    <MonthView events={events} dateKey={dateKey} todayKey="2026-10-17" />,
  );

const count = (html: string, needle: string) => html.split(needle).length - 1;

describe('MonthView', () => {
  it('曜日ヘッダーと6週42日のマスを描画し、前月・翌月の日付も含む', () => {
    const html = render([]);
    for (const w of ['日', '月', '火', '水', '木', '金', '土'])
      expect(html).toContain(`>${w}<`);
    // 日付の数字リンクは 42 個（1日は「11月1日」のように月つき）
    expect(count(html, 'href="/?')).toBe(
      42 - 0 /* 今日のリンクも含めた全マス */,
    );
    expect(html).toContain('date=2026-09-27');
    expect(html).toContain('date=2026-11-07');
  });

  it('今日に aria-current="date" が付く', () => {
    const html = render([]);
    expect(count(html, 'aria-current="date"')).toBe(1);
  });

  it('日付の数字は、その日の日表示へのリンク', () => {
    const html = render([]);
    expect(html).toContain('href="/?view=day&amp;date=2026-10-13"');
    // 今日は date を省略
    expect(html).toContain('href="/?view=day"');
  });

  it('前月の日付に属する予定も表示される', () => {
    const html = render([
      make('前月の予定', '2026-09-30T09:00', '2026-09-30T10:00'),
    ]);
    expect(html).toContain('9:00 前月の予定');
  });

  it('時間指定の予定は JST の開始時刻つきで表示される', () => {
    const html = render([make('会議', '2026-10-14T00:30', '2026-10-14T01:30')]);
    expect(html).toContain('>0:30 会議<');
  });

  it('複数日の終日予定は帯になり、週をまたぐと週ごとに表示される', () => {
    const html = render([
      make('合宿', '2026-10-12T00:00', '2026-10-15T00:00', {
        allDay: true,
        color: 'red',
      }),
      make('出張', '2026-10-16T00:00', '2026-10-20T00:00', { allDay: true }),
    ]);
    expect(html).toContain('bg-red-600');
    expect(count(html, '>合宿<')).toBe(1);
    expect(count(html, '>出張<')).toBe(2);
    // 週をまたぐ帯は、続きが分かるよう端を丸めない
    expect(html).toContain('rounded-l-none');
    expect(html).toContain('rounded-r-none');
  });

  it('日をまたぐ時間指定の予定（23:00〜翌1:00）は帯で両日にまたがって表示される', () => {
    const html = render([make('夜', '2026-10-13T23:00', '2026-10-14T01:00')]);
    expect(count(html, '>夜<')).toBe(1);
    expect(html).toContain('grid-column:3 / 5');
  });

  it('あふれた予定は「他 N 件」になり、その日の日表示へのリンクになる', () => {
    const events = [
      make('合宿', '2026-10-12T00:00', '2026-10-15T00:00', { allDay: true }),
      ...[1, 2, 3, 4, 5, 6].map((i) =>
        make(`予定${i}`, `2026-10-13T0${i}:00`, `2026-10-13T0${i}:30`),
      ),
    ];
    const html = render(events);
    // 帯 1 行 + 単日 2 件を表示し、残り 4 件
    expect(html).toContain('他 4 件');
    expect(html).toContain('>1:00 予定1<');
    expect(html).toContain('>2:00 予定2<');
    expect(html).not.toContain('3:00 予定3');
    expect(html).toMatch(
      /<a [^>]*href="\/\?view=day&amp;date=2026-10-13">他 4 件<\/a>/,
    );
  });

  it('6色すべてが区別できるクラスで描画される', () => {
    const events = EVENT_COLORS.map((color, i) =>
      make(`色${color}`, `2026-10-${12 + i}T00:00`, `2026-10-${13 + i}T00:00`, {
        allDay: true,
        color,
      }),
    );
    const html = render(events);
    for (const c of [
      'bg-blue-600',
      'bg-red-600',
      'bg-green-700',
      'bg-yellow-300',
      'bg-purple-600',
      'bg-gray-600',
    ]) {
      expect(html).toContain(c);
    }
  });

  it('長いタイトルは省略表示のクラスが付く（セルからはみ出さない）', () => {
    const html = render([
      make('あ'.repeat(200), '2026-10-14T09:00', '2026-10-14T10:00'),
    ]);
    expect(html).toContain('truncate');
    expect(html).toContain('min-w-0');
  });
});
