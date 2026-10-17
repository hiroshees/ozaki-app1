// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CalendarEvent } from '@/lib/events/types';

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock('@/lib/events/actions', () => ({
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
}));

import { EventDialogProvider } from '@/components/calendar/eventDialogs';
import { TimeGridView } from '@/components/calendar/timeGridView';

const jst = (s: string) => new Date(`${s}+09:00`);
const meeting: CalendarEvent = {
  id: '3f2b8c1e-6a4d-4c3b-9d5e-1a2b3c4d5e6f',
  title: '会議',
  startsAt: jst('2026-10-14T09:00'),
  endsAt: jst('2026-10-14T10:00'),
  allDay: false,
  color: 'blue',
  memo: '',
  createdAt: jst('2026-10-01T00:00'),
  updatedAt: jst('2026-10-01T00:00'),
};

const setup = (view: 'week' | 'day' = 'week', events: CalendarEvent[] = []) => {
  const { container } = render(
    <EventDialogProvider events={events}>
      <TimeGridView
        view={view}
        dateKey="2026-10-14"
        todayKey="2026-10-17"
        events={events}
      />
    </EventDialogProvider>,
  );
  const layer = (dayKey: string) =>
    container.querySelector<HTMLElement>(`[data-slot-layer="${dayKey}"]`)!;
  return { layer };
};

const value = (label: string) =>
  (screen.getByLabelText(label) as HTMLInputElement).value;

describe('空き時間クリックでの作成', () => {
  it('クリックした位置を15分単位に切り下げた時刻から、30分の作成フォームが開く', () => {
    const { layer } = setup('day');
    // 330px = 6:52.5 → 6:45
    fireEvent.click(layer('2026-10-14'), { clientY: 330 });
    expect(screen.getByRole('dialog', { name: '予定を作成' })).toBeTruthy();
    expect(value('開始日')).toBe('2026-10-14');
    expect(value('開始時刻')).toBe('06:45');
    expect(value('終了日')).toBe('2026-10-14');
    expect(value('終了時刻')).toBe('07:15');
    expect(
      (screen.getByRole('checkbox', { name: '終日' }) as HTMLInputElement)
        .checked,
    ).toBe(false);
  });

  it('週表示では、クリックした列の日付になる', () => {
    const { layer } = setup('week');
    fireEvent.click(layer('2026-10-11'), { clientY: 48 * 13 });
    expect(value('開始日')).toBe('2026-10-11');
    expect(value('開始時刻')).toBe('13:00');
    // 開いたフォームを閉じて、別の列をクリック
    fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }));
    fireEvent.click(layer('2026-10-17'), { clientY: 48 * 20 });
    expect(value('開始日')).toBe('2026-10-17');
    expect(value('開始時刻')).toBe('20:00');
  });

  it('一日の終わり付近のクリックは 23:30〜翌 0:00 に収まり、24:00 をはみ出さない', () => {
    const { layer } = setup('day');
    fireEvent.click(layer('2026-10-14'), { clientY: 48 * 24 - 2 });
    expect(value('開始時刻')).toBe('23:30');
    expect(value('終了日')).toBe('2026-10-15');
    expect(value('終了時刻')).toBe('00:00');
  });

  it('0:00 付近のクリックは 0:00 から', () => {
    const { layer } = setup('day');
    fireEvent.click(layer('2026-10-14'), { clientY: 3 });
    expect(value('開始時刻')).toBe('00:00');
    expect(value('終了時刻')).toBe('00:30');
  });

  it('予定をクリックしたときは詳細ダイアログが開き、作成フォームは開かない', async () => {
    const user = userEvent.setup();
    setup('day', [meeting]);
    await user.click(screen.getByRole('button', { name: /会議/ }));
    expect(screen.getByRole('dialog', { name: '会議' })).toBeTruthy();
    expect(screen.queryByRole('dialog', { name: '予定を作成' })).toBeNull();
  });

  it('クリックを受ける層は装飾（aria-hidden）で、フォーカス順を増やさない', () => {
    const { layer } = setup('day');
    expect(layer('2026-10-14').getAttribute('aria-hidden')).toBe('true');
    expect(layer('2026-10-14').tabIndex).toBe(-1);
  });
});
