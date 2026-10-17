'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import {
  EVENT_COLOR_CLASSES,
  EVENT_COLOR_LABELS,
} from '@/components/calendar/eventColors';
import { deleteEvent } from '@/lib/events/actions';
import { formatEventPeriod } from '@/lib/events/format';
import type { CalendarEvent } from '@/lib/events/types';

const TITLE_ID = 'event-detail-title';

type EventDetailDialogProps = {
  // null のときは閉じている
  event: CalendarEvent | null;
  onClose: () => void;
  // 「編集」ボタンで呼ばれる。編集フォームを開く
  onEdit: (eventId: string) => void;
};

export function EventDetailDialog({
  event,
  onClose,
  onEdit,
}: EventDetailDialogProps) {
  return (
    <Dialog open={event !== null} onClose={onClose} labelledBy={TITLE_ID}>
      {/* 開くたびに状態（削除の確認など）を作り直す */}
      {event && (
        <EventDetail
          key={event.id}
          event={event}
          onClose={onClose}
          onEdit={onEdit}
        />
      )}
    </Dialog>
  );
}

function EventDetail({
  event,
  onClose,
  onEdit,
}: {
  event: CalendarEvent;
  onClose: () => void;
  onEdit: (eventId: string) => void;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteEvent(event.id);
        if (result.success) {
          onClose();
          router.refresh();
          return;
        }
        setError(result.message);
      } catch {
        setError('削除に失敗しました。時間をおいて再度お試しください');
      }
    });
  };

  return (
    <div className="p-5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${EVENT_COLOR_CLASSES[event.color].dot}`}
        />
        <h2
          id={TITLE_ID}
          className="min-w-0 flex-1 break-words text-lg font-semibold"
        >
          {event.title}
        </h2>
        <button
          type="button"
          aria-label="ダイアログを閉じる"
          onClick={onClose}
          className="-mr-2 -mt-1 h-8 w-8 shrink-0 rounded-md text-gray-500 outline-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          ×
        </button>
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-xs text-gray-500">日時</dt>
          <dd>{formatEventPeriod(event)}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">色</dt>
          <dd>{EVENT_COLOR_LABELS[event.color]}</dd>
        </div>
        {event.memo !== '' && (
          <div>
            <dt className="text-xs text-gray-500">メモ</dt>
            <dd className="whitespace-pre-wrap break-words">{event.memo}</dd>
          </div>
        )}
      </dl>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      {confirming ? (
        <div className="mt-5 border-t border-gray-200 pt-4">
          <p className="text-sm font-medium">この予定を削除しますか？</p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              autoFocus
              disabled={pending}
              onClick={() => setConfirming(false)}
              className="h-9 rounded-md border border-gray-300 px-4 text-sm outline-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleDelete}
              className="h-9 rounded-md bg-red-600 px-4 text-sm font-medium text-white outline-none hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50"
            >
              {pending ? '削除中…' : '削除する'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex justify-end gap-2 border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={() => onEdit(event.id)}
            className="h-9 rounded-md border border-gray-300 px-4 text-sm outline-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            編集
          </button>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="h-9 rounded-md border border-red-300 px-4 text-sm text-red-700 outline-none hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-400"
          >
            削除
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-gray-300 px-4 text-sm outline-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  );
}
