// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { CalendarEvent } from '@/lib/events/types';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
const updateEvent = vi.fn();
vi.mock('@/lib/events/actions', () => ({
  createEvent: vi.fn(),
  updateEvent: (input: unknown) => updateEvent(input),
  deleteEvent: vi.fn(),
}));

import { EventDialogProvider } from '@/components/calendar/eventDialogs';
import { TimeGridColumns } from '@/components/calendar/timeGridColumns';

const jst = (s: string) => new Date(`${s}+09:00`);
const make = (
  id: string,
  title: string,
  start: string,
  end: string,
  allDay = false,
): CalendarEvent => ({
  id,
  title,
  startsAt: jst(start),
  endsAt: jst(end),
  allDay,
  color: 'blue',
  memo: 'メモ',
  createdAt: jst('2026-10-01T00:00'),
  updatedAt: jst('2026-10-01T00:00'),
});

const A = '00000000-0000-4000-8000-00000000000a';
const meeting = make(A, '会議', '2026-10-14T09:00', '2026-10-14T10:00');
const days = [
  '2026-10-12',
  '2026-10-13',
  '2026-10-14',
  '2026-10-15',
  '2026-10-16',
].map((key) => ({
  key,
  isToday: false,
}));

// 列の幅を 100px にする（jsdom は位置・大きさを持たないため）
let rectSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  refresh.mockReset();
  updateEvent.mockReset();
  rectSpy = vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockReturnValue({
      width: 500,
      height: 1152,
      top: 0,
      left: 0,
      right: 500,
      bottom: 1152,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
});
afterEach(() => rectSpy.mockRestore());

const setup = (events: CalendarEvent[] = [meeting], columnDays = days) =>
  render(
    <EventDialogProvider events={events}>
      <TimeGridColumns days={columnDays} events={events} />
    </EventDialogProvider>,
  );

// 予定のブロック（ドラッグの受け口になる外側の要素）
const blockOf = (title: string) =>
  screen.getByRole('button', { name: new RegExp(title) })
    .parentElement as HTMLElement;

// マウスで dx, dy だけドラッグして離す
// dnd-kit は、距離の条件を満たして「開始」した後の mousemove から移動量を数えるため、2 回動かす
const drag = async (el: HTMLElement, dx: number, dy: number) => {
  const move = async (x: number, y: number) =>
    act(async () => {
      fireEvent.mouseMove(document, { clientX: x, clientY: y });
      await new Promise((r) => setTimeout(r, 30));
    });
  fireEvent.mouseDown(el, { button: 0, clientX: 100, clientY: 100 });
  await move(100 + Math.sign(dx) * 10, 100 + Math.sign(dy) * 10);
  await move(100 + dx, 100 + dy);
  await act(async () => {
    fireEvent.mouseUp(document, { clientX: 100 + dx, clientY: 100 + dy });
  });
};

describe('予定のドラッグ移動', () => {
  it('縦にドラッグすると、15分単位で時刻が変わり、updateEvent で保存される', async () => {
    updateEvent.mockResolvedValue({ success: true });
    setup();
    // 60px = 75分 → 9:00 が 10:15 に
    await drag(blockOf('会議'), 0, 60);
    await waitFor(() => expect(updateEvent).toHaveBeenCalledTimes(1));
    expect(updateEvent).toHaveBeenCalledWith({
      id: A,
      title: '会議',
      startsAt: '2026-10-14T01:15:00.000Z',
      endsAt: '2026-10-14T02:15:00.000Z',
      allDay: false,
      color: 'blue',
      memo: 'メモ',
    });
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
  });

  it('15分未満しか動かさなければ、保存しない', async () => {
    setup();
    await drag(blockOf('会議'), 0, 5);
    expect(updateEvent).not.toHaveBeenCalled();
  });

  it('横にドラッグすると、別の日の同じ時刻に移る（列の幅ごとに1日）', async () => {
    updateEvent.mockResolvedValue({ success: true });
    setup();
    // 列の幅は 500 / 5 = 100px。+160px → +2 日（10/14 → 10/16）
    await drag(blockOf('会議'), 160, 0);
    await waitFor(() => expect(updateEvent).toHaveBeenCalledTimes(1));
    expect(updateEvent.mock.calls[0][0]).toMatchObject({
      startsAt: '2026-10-16T00:00:00.000Z',
      endsAt: '2026-10-16T01:00:00.000Z',
    });
  });

  it('表示中の日の範囲外には動かせない', async () => {
    updateEvent.mockResolvedValue({ success: true });
    setup();
    // 10/14 は3列目。右へは最大 2 日（10/16）、上へは 0:00 まで
    await drag(blockOf('会議'), 1000, -1000);
    await waitFor(() => expect(updateEvent).toHaveBeenCalledTimes(1));
    expect(updateEvent.mock.calls[0][0]).toMatchObject({
      startsAt: '2026-10-15T15:00:00.000Z', // 10/16 0:00 JST
      endsAt: '2026-10-15T16:00:00.000Z',
    });
  });

  it('移動した直後に、移動後の位置へ即座に表示される（楽観的更新）', async () => {
    let resolve: (v: { success: true }) => void = () => {};
    updateEvent.mockReturnValue(new Promise((r) => (resolve = r)));
    setup();
    await drag(blockOf('会議'), 0, 48);
    await waitFor(() => expect(updateEvent).toHaveBeenCalled());
    // 9:00（432px）の1時間下 = 10:00（480px）
    expect(blockOf('会議').style.top).toBe('480px');
    resolve({ success: true });
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it('保存に失敗したら元の位置に戻り、エラーが表示される', async () => {
    updateEvent.mockResolvedValue({
      success: false,
      message: '更新する予定が見つかりません',
      fieldErrors: {},
    });
    setup();
    const before = blockOf('会議').style.top;
    await drag(blockOf('会議'), 0, 48);
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('更新する予定が見つかりません');
    expect(blockOf('会議').style.top).toBe(before);
    expect(refresh).not.toHaveBeenCalled();
  });

  it('保存中の予定は、再度ドラッグしても保存されない（二重送信防止）', async () => {
    updateEvent.mockReturnValue(new Promise(() => {}));
    setup();
    await drag(blockOf('会議'), 0, 48);
    await waitFor(() => expect(updateEvent).toHaveBeenCalledTimes(1));
    await drag(blockOf('会議'), 0, 48);
    expect(updateEvent).toHaveBeenCalledTimes(1);
  });

  it('ドラッグした直後の click では詳細ダイアログが開かず、その後のクリックなら開く', async () => {
    updateEvent.mockResolvedValue({ success: true });
    setup();
    await drag(blockOf('会議'), 0, 48);
    // ブラウザはドラッグの後に click を出す。dnd-kit がこれを打ち消す
    fireEvent.click(screen.getByRole('button', { name: /会議/ }));
    expect(document.querySelector('dialog[open]')).toBeNull();
    await waitFor(() => expect(refresh).toHaveBeenCalled());

    // しばらく後の、ドラッグを伴わないクリックでは開く
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });
    fireEvent.click(screen.getByRole('button', { name: /会議/ }));
    expect(screen.getByRole('dialog', { name: '会議' })).toBeTruthy();
  });

  it('ドラッグせずにクリックしただけなら、詳細ダイアログが開く', async () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /会議/ }));
    expect(screen.getByRole('dialog', { name: '会議' })).toBeTruthy();
    expect(updateEvent).not.toHaveBeenCalled();
  });

  it('終日予定・日をまたぐ予定はドラッグできない', async () => {
    const night = make(
      '00000000-0000-4000-8000-0000000000b1',
      '夜勤',
      '2026-10-14T23:00',
      '2026-10-15T01:00',
    );
    setup([night]);
    // 2日に分割され、どちらの断片もドラッグ不可
    const blocks = screen.getAllByRole('button', { name: /夜勤/ });
    expect(blocks).toHaveLength(2);
    for (const b of blocks) await drag(b.parentElement as HTMLElement, 0, 60);
    expect(updateEvent).not.toHaveBeenCalled();
  });

  it('日表示（1列）では横には動かない', async () => {
    updateEvent.mockResolvedValue({ success: true });
    setup([meeting], [{ key: '2026-10-14', isToday: false }]);
    await drag(blockOf('会議'), 300, 48);
    await waitFor(() => expect(updateEvent).toHaveBeenCalledTimes(1));
    // 9:00 の1時間下 = 10:00 JST（= 01:00Z）。横に 300px 動かしても日は変わらない
    expect(updateEvent.mock.calls[0][0].startsAt).toBe(
      '2026-10-14T01:00:00.000Z',
    );
  });
});
