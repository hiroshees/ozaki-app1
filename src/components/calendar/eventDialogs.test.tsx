// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CalendarEvent } from '@/lib/events/types';

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock('@/lib/events/actions', () => ({
  deleteEvent: vi.fn(),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
}));

import { EventButton } from '@/components/calendar/eventButton';
import { EventDialogProvider } from '@/components/calendar/eventDialogs';
import { CalendarSidebar } from '@/components/calendar/calendarSidebar';

const jst = (s: string) => new Date(`${s}+09:00`);
const make = (id: string, title: string): CalendarEvent => ({
  id,
  title,
  startsAt: jst('2026-10-17T09:00'),
  endsAt: jst('2026-10-17T10:00'),
  allDay: false,
  color: 'blue',
  memo: '',
  createdAt: jst('2026-10-01T00:00'),
  updatedAt: jst('2026-10-01T00:00'),
});
const a = make('00000000-0000-4000-8000-000000000001', '予定A');
const b = make('00000000-0000-4000-8000-000000000002', '予定B');

const tree = (events: CalendarEvent[]) => (
  <EventDialogProvider events={events}>
    {events.map((e) => (
      <EventButton key={e.id} eventId={e.id}>
        {e.title}ボタン
      </EventButton>
    ))}
  </EventDialogProvider>
);

describe('EventDialogProvider / EventButton', () => {
  it('予定のボタンをクリックすると、その予定の詳細ダイアログが開く', async () => {
    const user = userEvent.setup();
    render(tree([a, b]));
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(screen.getByRole('button', { name: '予定Bボタン' }));
    expect(screen.getByRole('dialog', { name: '予定B' })).toBeTruthy();
  });

  it('キーボード（Enter）でも開ける', async () => {
    const user = userEvent.setup();
    render(tree([a]));
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: '予定Aボタン' }),
    );
    await user.keyboard('{Enter}');
    expect(screen.getByRole('dialog', { name: '予定A' })).toBeTruthy();
  });

  it('閉じるとダイアログが消え、ボタンにフォーカスが戻る', async () => {
    const user = userEvent.setup();
    render(tree([a]));
    const button = screen.getByRole('button', { name: '予定Aボタン' });
    await user.click(button);
    await user.click(screen.getByRole('button', { name: '閉じる' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it('開いている予定が一覧から消えたら（削除後の更新など）自動的に閉じる', async () => {
    const user = userEvent.setup();
    const { rerender } = render(tree([a, b]));
    await user.click(screen.getByRole('button', { name: '予定Aボタン' }));
    expect(screen.getByRole('dialog', { name: '予定A' })).toBeTruthy();
    rerender(tree([b]));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Provider の外でボタンを描画しても落ちない', async () => {
    const user = userEvent.setup();
    render(<EventButton eventId="x">単独</EventButton>);
    await user.click(screen.getByRole('button', { name: '単独' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('詳細ダイアログの「編集」で、その予定の編集フォームが開く（詳細は閉じる）', async () => {
    const user = userEvent.setup();
    render(tree([a, b]));
    await user.click(screen.getByRole('button', { name: '予定Bボタン' }));
    await user.click(screen.getByRole('button', { name: '編集' }));
    expect(screen.getByRole('dialog', { name: '予定を編集' })).toBeTruthy();
    expect(
      (screen.getByRole('textbox', { name: 'タイトル' }) as HTMLInputElement)
        .value,
    ).toBe('予定B');
    expect(screen.queryByRole('dialog', { name: '予定B' })).toBeNull();
  });

  it('サイドバーの「作成」で、基準日の 9:00〜10:00 を初期値に作成フォームが開く', async () => {
    const user = userEvent.setup();
    render(
      <EventDialogProvider events={[]}>
        <CalendarSidebar
          view="month"
          dateKey="2026-11-20"
          todayKey="2026-10-17"
          rangeContainsToday={false}
        />
      </EventDialogProvider>,
    );
    await user.click(screen.getByRole('button', { name: '作成' }));
    expect(screen.getByRole('dialog', { name: '予定を作成' })).toBeTruthy();
    expect((screen.getByLabelText('開始日') as HTMLInputElement).value).toBe(
      '2026-11-20',
    );
    expect((screen.getByLabelText('開始時刻') as HTMLInputElement).value).toBe(
      '09:00',
    );
    expect((screen.getByLabelText('終了時刻') as HTMLInputElement).value).toBe(
      '10:00',
    );
  });

  it('作成フォームは開くたびに作り直され、前回の入力を引き継がない', async () => {
    const user = userEvent.setup();
    render(
      <EventDialogProvider events={[]}>
        <CalendarSidebar
          view="month"
          dateKey="2026-11-20"
          todayKey="2026-10-17"
          rangeContainsToday={false}
        />
      </EventDialogProvider>,
    );
    await user.click(screen.getByRole('button', { name: '作成' }));
    await user.type(
      screen.getByRole('textbox', { name: 'タイトル' }),
      '途中まで',
    );
    await user.click(screen.getByRole('button', { name: 'キャンセル' }));
    await user.click(screen.getByRole('button', { name: '作成' }));
    expect(
      (screen.getByRole('textbox', { name: 'タイトル' }) as HTMLInputElement)
        .value,
    ).toBe('');
  });
});
