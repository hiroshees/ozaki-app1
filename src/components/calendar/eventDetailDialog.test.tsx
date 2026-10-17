// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CalendarEvent } from '@/lib/events/types';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
const deleteEvent = vi.fn();
vi.mock('@/lib/events/actions', () => ({
  deleteEvent: (id: string) => deleteEvent(id),
}));

import { EventDetailDialog } from '@/components/calendar/eventDetailDialog';

const jst = (s: string) => new Date(`${s}+09:00`);
const event: CalendarEvent = {
  id: '3f2b8c1e-6a4d-4c3b-9d5e-1a2b3c4d5e6f',
  title: '打ち合わせ',
  startsAt: jst('2026-10-17T09:00'),
  endsAt: jst('2026-10-17T10:30'),
  allDay: false,
  color: 'red',
  memo: '1行目\n2行目',
  createdAt: jst('2026-10-01T00:00'),
  updatedAt: jst('2026-10-01T00:00'),
};

beforeEach(() => {
  refresh.mockReset();
  deleteEvent.mockReset();
});

const open = (e: CalendarEvent | null = event, onClose = vi.fn()) => {
  render(<EventDetailDialog event={e} onClose={onClose} />);
  return { onClose, user: userEvent.setup() };
};

describe('EventDetailDialog の表示', () => {
  it('タイトル・日時（JST）・色・メモを表示する', () => {
    open();
    const dialog = screen.getByRole('dialog', { name: '打ち合わせ' });
    expect(dialog).toHaveProperty('open', true);
    expect(screen.getByText('2026年10月17日（土）9:00〜10:30')).toBeTruthy();
    expect(screen.getByText('赤')).toBeTruthy();
    const memo = screen.getByText(/1行目/);
    expect(memo.textContent).toBe('1行目\n2行目');
    expect(memo.className).toContain('whitespace-pre-wrap');
  });

  it('メモが空なら、メモの項目は出ない', () => {
    open({ ...event, memo: '' });
    expect(screen.queryByText('メモ')).toBeNull();
  });

  it('終日予定は日付だけを表示する', () => {
    open({
      ...event,
      allDay: true,
      startsAt: jst('2026-10-12T00:00'),
      endsAt: jst('2026-10-15T00:00'),
    });
    expect(screen.getByText('2026年10月12日（月）〜14日（水）')).toBeTruthy();
  });

  it('event が null のときは開かない', () => {
    open(null);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('「閉じる」と × ボタンで onClose が呼ばれる', async () => {
    const { user, onClose } = open();
    await user.click(screen.getByRole('button', { name: '閉じる' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    await user.click(
      screen.getByRole('button', { name: 'ダイアログを閉じる' }),
    );
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe('EventDetailDialog の削除', () => {
  it('「削除」を押しても、確認するまでは削除されない', async () => {
    const { user } = open();
    await user.click(screen.getByRole('button', { name: '削除' }));
    expect(screen.getByText('この予定を削除しますか？')).toBeTruthy();
    expect(deleteEvent).not.toHaveBeenCalled();
  });

  it('確認で「キャンセル」すると元に戻り、削除されない', async () => {
    const { user } = open();
    await user.click(screen.getByRole('button', { name: '削除' }));
    await user.click(screen.getByRole('button', { name: 'キャンセル' }));
    expect(screen.queryByText('この予定を削除しますか？')).toBeNull();
    expect(screen.getByRole('button', { name: '削除' })).toBeTruthy();
    expect(deleteEvent).not.toHaveBeenCalled();
  });

  it('確認で「削除する」を押すと deleteEvent を呼び、成功したら閉じて一覧を更新する', async () => {
    deleteEvent.mockResolvedValue({ success: true });
    const { user, onClose } = open();
    await user.click(screen.getByRole('button', { name: '削除' }));
    await user.click(screen.getByRole('button', { name: '削除する' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(deleteEvent).toHaveBeenCalledWith(event.id);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('失敗したらエラーを表示し、閉じない・更新しない', async () => {
    deleteEvent.mockResolvedValue({
      success: false,
      message: '削除する予定が見つかりません',
      fieldErrors: {},
    });
    const { user, onClose } = open();
    await user.click(screen.getByRole('button', { name: '削除' }));
    await user.click(screen.getByRole('button', { name: '削除する' }));
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe('削除する予定が見つかりません');
    expect(onClose).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it('通信などで例外になっても、エラーを表示して閉じない', async () => {
    deleteEvent.mockRejectedValue(new Error('network'));
    const { user, onClose } = open();
    await user.click(screen.getByRole('button', { name: '削除' }));
    await user.click(screen.getByRole('button', { name: '削除する' }));
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('削除に失敗しました');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('実行中はボタンが無効になり、二重に削除できない', async () => {
    let resolve: (v: { success: true }) => void = () => {};
    deleteEvent.mockReturnValue(new Promise((r) => (resolve = r)));
    const { user } = open();
    await user.click(screen.getByRole('button', { name: '削除' }));
    await user.click(screen.getByRole('button', { name: '削除する' }));

    const pending = await screen.findByRole('button', { name: '削除中…' });
    expect(pending).toHaveProperty('disabled', true);
    expect(screen.getByRole('button', { name: 'キャンセル' })).toHaveProperty(
      'disabled',
      true,
    );
    await user.click(pending);
    expect(deleteEvent).toHaveBeenCalledTimes(1);

    resolve({ success: true });
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
  });
});
