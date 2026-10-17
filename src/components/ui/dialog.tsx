'use client';

import { useEffect, useRef } from 'react';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  // タイトル要素の id。ダイアログの名前として読み上げられる
  labelledBy: string;
  children: React.ReactNode;
};

// ネイティブの <dialog> を使ったモーダル
// フォーカストラップと Esc で閉じる動作はブラウザが行う。背景のクリックでも閉じ、閉じたら元の要素にフォーカスを戻す
export function Dialog({ open, onClose, labelledBy, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      opener.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleClose = () => {
    opener.current?.focus();
    opener.current = null;
    onClose();
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={handleClose}
      // ダイアログ自身へのクリック（内容の外側 = 背景）だけを拾う
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg p-0 shadow-xl backdrop:bg-black/40"
    >
      <div className="max-h-[85vh] overflow-y-auto">{children}</div>
    </dialog>
  );
}
