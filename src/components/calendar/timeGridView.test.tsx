import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TimeGridView } from '@/components/calendar/timeGridView';

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

  it('renderDay の内容が各日の列の中に入る', () => {
    const html = renderToStaticMarkup(
      <TimeGridView
        view="day"
        dateKey="2026-10-14"
        todayKey="2026-10-17"
        renderDay={(key) => <i data-slot={key} />}
      />,
    );
    expect(html).toContain('data-slot="2026-10-14"');
  });
});
