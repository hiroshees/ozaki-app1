// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from '@/components/ui/dialog';

const setup = (open: boolean, onClose = vi.fn()) => {
  const view = render(
    <Dialog open={open} onClose={onClose} labelledBy="t">
      <h2 id="t">タイトル</h2>
      <button type="button">内側のボタン</button>
    </Dialog>,
  );
  const dialog = view.container.querySelector('dialog')!;
  return { ...view, dialog, onClose };
};

describe('Dialog', () => {
  it('open が false の間は開かない', () => {
    const { dialog } = setup(false);
    expect(dialog.hasAttribute('open')).toBe(false);
  });

  it('open が true になると開き、タイトルと関連づけられる', () => {
    const { dialog } = setup(true);
    expect(dialog.hasAttribute('open')).toBe(true);
    expect(screen.getByRole('dialog', { name: 'タイトル' })).toBe(dialog);
  });

  it('open が false に戻ると閉じる', () => {
    const { dialog, rerender, onClose } = setup(true);
    rerender(
      <Dialog open={false} onClose={onClose} labelledBy="t">
        <h2 id="t">タイトル</h2>
      </Dialog>,
    );
    expect(dialog.hasAttribute('open')).toBe(false);
    // 親が閉じた場合は、親に onClose で知らせない（状態を二重に書き換えない）
    expect(onClose).not.toHaveBeenCalled();
  });

  it('背景（ダイアログ自身）のクリックで閉じ、内容のクリックでは閉じない', async () => {
    const user = userEvent.setup();
    const { dialog, onClose } = setup(true);
    await user.click(screen.getByRole('button', { name: '内側のボタン' }));
    expect(onClose).not.toHaveBeenCalled();
    expect(dialog.hasAttribute('open')).toBe(true);

    await user.click(dialog);
    expect(dialog.hasAttribute('open')).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ブラウザが close イベントを出したとき（Esc など）に onClose を呼ぶ', () => {
    const { dialog, onClose } = setup(true);
    fireEvent(dialog, new Event('close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('閉じたら、開く前にフォーカスのあった要素にフォーカスを戻す', () => {
    const onClose = vi.fn();
    const Host = ({ open }: { open: boolean }) => (
      <>
        <button type="button">開くボタン</button>
        <Dialog open={open} onClose={onClose} labelledBy="t">
          <h2 id="t">タイトル</h2>
        </Dialog>
      </>
    );
    const { rerender } = render(<Host open={false} />);
    const opener = screen.getByRole('button', { name: '開くボタン' });
    opener.focus();

    rerender(<Host open />);
    (document.activeElement as HTMLElement).blur();
    rerender(<Host open={false} />);
    expect(document.activeElement).toBe(opener);
  });
});
