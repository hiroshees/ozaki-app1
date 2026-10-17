// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CalendarEvent } from '@/lib/events/types';
import type { EventFormValues } from '@/lib/events/form';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
const createEvent = vi.fn();
const updateEvent = vi.fn();
vi.mock('@/lib/events/actions', () => ({
  createEvent: (input: unknown) => createEvent(input),
  updateEvent: (input: unknown) => updateEvent(input),
  deleteEvent: vi.fn(),
}));

import {
  EventFormDialog,
  type EventFormTarget,
} from '@/components/calendar/eventFormDialog';

const initial: EventFormValues = {
  title: '',
  allDay: false,
  startDate: '2026-10-17',
  startTime: '09:00',
  endDate: '2026-10-17',
  endTime: '10:00',
  color: 'blue',
  memo: '',
};
const create: EventFormTarget = { kind: 'create', initial, token: 1 };

const jst = (s: string) => new Date(`${s}+09:00`);
const existing: CalendarEvent = {
  id: '3f2b8c1e-6a4d-4c3b-9d5e-1a2b3c4d5e6f',
  title: '既存の予定',
  startsAt: jst('2026-10-20T13:00'),
  endsAt: jst('2026-10-20T14:30'),
  allDay: false,
  color: 'green',
  memo: 'メモ',
  createdAt: jst('2026-10-01T00:00'),
  updatedAt: jst('2026-10-01T00:00'),
};

beforeEach(() => {
  refresh.mockReset();
  createEvent.mockReset();
  updateEvent.mockReset();
});

const open = (target: EventFormTarget | null = create) => {
  const onClose = vi.fn();
  render(<EventFormDialog target={target} onClose={onClose} />);
  return { onClose, user: userEvent.setup() };
};

const titleInput = () => screen.getByRole('textbox', { name: 'タイトル' });
const save = () => screen.getByRole('button', { name: /^保存/ });

describe('EventFormDialog の表示', () => {
  it('target が null のときは開かない', () => {
    open(null);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('作成フォームは初期値つきで開き、タイトルにフォーカスする', () => {
    open();
    expect(screen.getByRole('dialog', { name: '予定を作成' })).toBeTruthy();
    expect((screen.getByLabelText('開始日') as HTMLInputElement).value).toBe(
      '2026-10-17',
    );
    expect((screen.getByLabelText('開始時刻') as HTMLInputElement).value).toBe(
      '09:00',
    );
    expect((screen.getByLabelText('終了時刻') as HTMLInputElement).value).toBe(
      '10:00',
    );
    expect(
      (screen.getByRole('radio', { name: '青' }) as HTMLInputElement).checked,
    ).toBe(true);
  });

  it('編集フォームは既存の値で開く（JST）', () => {
    open({ kind: 'edit', event: existing });
    expect(screen.getByRole('dialog', { name: '予定を編集' })).toBeTruthy();
    expect((titleInput() as HTMLInputElement).value).toBe('既存の予定');
    expect((screen.getByLabelText('開始日') as HTMLInputElement).value).toBe(
      '2026-10-20',
    );
    expect((screen.getByLabelText('開始時刻') as HTMLInputElement).value).toBe(
      '13:00',
    );
    expect((screen.getByLabelText('終了時刻') as HTMLInputElement).value).toBe(
      '14:30',
    );
    expect(
      (screen.getByRole('radio', { name: '緑' }) as HTMLInputElement).checked,
    ).toBe(true);
    expect(
      (screen.getByRole('textbox', { name: 'メモ' }) as HTMLTextAreaElement)
        .value,
    ).toBe('メモ');
  });

  it('色は6色すべてを選べる（色名がラベル）', () => {
    open();
    for (const name of ['青', '赤', '緑', '黄', '紫', 'グレー']) {
      expect(screen.getByRole('radio', { name })).toBeTruthy();
    }
  });

  it('終日にすると時刻の入力が隠れ、終了は「最終日」になる', async () => {
    const { user } = open();
    await user.click(screen.getByRole('checkbox', { name: '終日' }));
    expect(screen.queryByLabelText('開始時刻')).toBeNull();
    expect(screen.queryByLabelText('終了時刻')).toBeNull();
    expect(screen.getByText('終了（最終日）')).toBeTruthy();
  });
});

describe('EventFormDialog の入力エラー', () => {
  it('空のタイトルは保存されず、エラーが出て、タイトルにフォーカスが移る', async () => {
    const { user, onClose } = open();
    await user.click(save());
    const input = titleInput();
    await waitFor(() =>
      expect(input.getAttribute('aria-invalid')).toBe('true'),
    );
    expect(screen.getByText('タイトルは必須です')).toBeTruthy();
    expect(input.getAttribute('aria-describedby')).toBe(
      screen.getByText('タイトルは必須です').id,
    );
    expect(document.activeElement).toBe(input);
    expect(createEvent).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('101 文字のタイトルはエラー', async () => {
    const { user } = open();
    fireEvent.change(titleInput(), { target: { value: 'あ'.repeat(101) } });
    await user.click(save());
    expect(
      await screen.findByText('タイトルは100文字以内にしてください'),
    ).toBeTruthy();
    expect(createEvent).not.toHaveBeenCalled();
  });

  it('1001 文字のメモはエラー', async () => {
    const { user } = open();
    fireEvent.change(titleInput(), { target: { value: '予定' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'メモ' }), {
      target: { value: 'a'.repeat(1001) },
    });
    await user.click(save());
    expect(
      await screen.findByText('メモは1000文字以内にしてください'),
    ).toBeTruthy();
    expect(screen.getByText('1001/1000')).toBeTruthy();
    expect(createEvent).not.toHaveBeenCalled();
  });

  it('開始より前の終了時刻はエラーで、終了の欄に付く', async () => {
    const { user } = open();
    fireEvent.change(titleInput(), { target: { value: '予定' } });
    fireEvent.change(screen.getByLabelText('終了時刻'), {
      target: { value: '08:00' },
    });
    await user.click(save());
    expect(
      await screen.findByText('終了は開始より後にしてください'),
    ).toBeTruthy();
    expect(screen.getByLabelText('終了日').getAttribute('aria-invalid')).toBe(
      'true',
    );
    expect(createEvent).not.toHaveBeenCalled();
  });

  it('直して再度保存すると、エラーが消えて保存される', async () => {
    createEvent.mockResolvedValue({ success: true });
    const { user } = open();
    await user.click(save());
    await screen.findByText('タイトルは必須です');
    fireEvent.change(titleInput(), { target: { value: '予定' } });
    await user.click(save());
    await waitFor(() => expect(createEvent).toHaveBeenCalledTimes(1));
    expect(screen.queryByText('タイトルは必須です')).toBeNull();
  });
});

describe('EventFormDialog の保存', () => {
  it('作成: JST の日時を UTC の ISO 文字列にして createEvent を呼び、成功したら閉じて更新する', async () => {
    createEvent.mockResolvedValue({ success: true });
    const { user, onClose } = open();
    fireEvent.change(titleInput(), { target: { value: '打ち合わせ' } });
    await user.click(screen.getByRole('radio', { name: '赤' }));
    await user.click(save());
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(createEvent).toHaveBeenCalledWith({
      title: '打ち合わせ',
      startsAt: '2026-10-17T00:00:00.000Z',
      endsAt: '2026-10-17T01:00:00.000Z',
      allDay: false,
      color: 'red',
      memo: '',
    });
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('日をまたぐ予定（23:00〜翌1:00）を保存できる', async () => {
    createEvent.mockResolvedValue({ success: true });
    const { user } = open();
    fireEvent.change(titleInput(), { target: { value: '夜' } });
    fireEvent.change(screen.getByLabelText('開始時刻'), {
      target: { value: '23:00' },
    });
    fireEvent.change(screen.getByLabelText('終了日'), {
      target: { value: '2026-10-18' },
    });
    fireEvent.change(screen.getByLabelText('終了時刻'), {
      target: { value: '01:00' },
    });
    await user.click(save());
    await waitFor(() => expect(createEvent).toHaveBeenCalledTimes(1));
    expect(createEvent.mock.calls[0][0]).toMatchObject({
      startsAt: '2026-10-17T14:00:00.000Z',
      endsAt: '2026-10-17T16:00:00.000Z',
    });
  });

  it('終日: 開始日 00:00 JST 〜 最終日の翌日 00:00 JST で保存する', async () => {
    createEvent.mockResolvedValue({ success: true });
    const { user } = open();
    fireEvent.change(titleInput(), { target: { value: '合宿' } });
    await user.click(screen.getByRole('checkbox', { name: '終日' }));
    fireEvent.change(screen.getByLabelText('終了日'), {
      target: { value: '2026-10-19' },
    });
    await user.click(save());
    await waitFor(() => expect(createEvent).toHaveBeenCalledTimes(1));
    expect(createEvent.mock.calls[0][0]).toMatchObject({
      allDay: true,
      startsAt: '2026-10-16T15:00:00.000Z', // 10/17 00:00 JST
      endsAt: '2026-10-19T15:00:00.000Z', // 10/20 00:00 JST
    });
  });

  it('編集: id つきで updateEvent を呼ぶ', async () => {
    updateEvent.mockResolvedValue({ success: true });
    const { user, onClose } = open({ kind: 'edit', event: existing });
    fireEvent.change(titleInput(), { target: { value: '変更後' } });
    await user.click(save());
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(updateEvent).toHaveBeenCalledWith({
      id: existing.id,
      title: '変更後',
      startsAt: '2026-10-20T04:00:00.000Z',
      endsAt: '2026-10-20T05:30:00.000Z',
      allDay: false,
      color: 'green',
      memo: 'メモ',
    });
    expect(createEvent).not.toHaveBeenCalled();
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('サーバーの検証エラーは項目の下とフォーム上部に出し、入力は失われず閉じない', async () => {
    createEvent.mockResolvedValue({
      success: false,
      message: '入力内容を確認してください',
      fieldErrors: {
        title: ['サーバー側のタイトルエラー'],
        endsAt: ['サーバー側の終了エラー'],
      },
    });
    const { user, onClose } = open();
    fireEvent.change(titleInput(), { target: { value: '予定' } });
    await user.click(save());
    expect(await screen.findByText('サーバー側のタイトルエラー')).toBeTruthy();
    expect(screen.getByText('サーバー側の終了エラー')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toBe(
      '入力内容を確認してください',
    );
    expect((titleInput() as HTMLInputElement).value).toBe('予定');
    expect(onClose).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it('通信などの例外でもエラーを表示し、入力は失われない', async () => {
    createEvent.mockRejectedValue(new Error('network'));
    const { user, onClose } = open();
    fireEvent.change(titleInput(), { target: { value: '予定' } });
    await user.click(save());
    expect((await screen.findByRole('alert')).textContent).toContain(
      '保存に失敗しました',
    );
    expect((titleInput() as HTMLInputElement).value).toBe('予定');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('実行中は保存ボタンが無効になり、Enter や連打でも二重に保存されない', async () => {
    let resolve: (v: { success: true }) => void = () => {};
    createEvent.mockReturnValue(new Promise((r) => (resolve = r)));
    const { user } = open();
    fireEvent.change(titleInput(), { target: { value: '予定' } });
    await user.click(save());

    const pending = await screen.findByRole('button', { name: '保存中…' });
    expect(pending).toHaveProperty('disabled', true);
    await user.click(pending);
    await user.type(titleInput(), '{Enter}');
    expect(createEvent).toHaveBeenCalledTimes(1);

    resolve({ success: true });
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
  });

  it('「キャンセル」で閉じ、保存はされない', async () => {
    const { user, onClose } = open();
    await user.click(screen.getByRole('button', { name: 'キャンセル' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(createEvent).not.toHaveBeenCalled();
  });
});
