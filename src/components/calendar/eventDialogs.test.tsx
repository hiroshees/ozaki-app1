// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CalendarEvent } from '@/lib/events/types';

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock('@/lib/events/actions', () => ({ deleteEvent: vi.fn() }));

import { EventButton } from '@/components/calendar/eventButton';
import { EventDialogProvider } from '@/components/calendar/eventDialogs';

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
});
