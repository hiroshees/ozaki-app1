'use client';

import { useEventDialog } from '@/components/calendar/eventDialogs';

type EventButtonProps = {
  eventId: string;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

// 予定の表示をクリック（とキーボード操作）で詳細ダイアログを開く部品
export function EventButton({
  eventId,
  title,
  className,
  style,
  children,
}: EventButtonProps) {
  const { openEvent } = useEventDialog();
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      title={title}
      className={className}
      style={style}
      onClick={() => openEvent(eventId)}
    >
      {children}
    </button>
  );
}
