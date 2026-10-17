'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { EventDetailDialog } from '@/components/calendar/eventDetailDialog';
import {
  EventFormDialog,
  type EventFormTarget,
} from '@/components/calendar/eventFormDialog';
import type { EventFormValues } from '@/lib/events/form';
import type { CalendarEvent } from '@/lib/events/types';

type EventDialogContextValue = {
  // 予定の詳細を開く
  openEvent: (eventId: string) => void;
  // 予定の編集フォームを開く
  openEdit: (eventId: string) => void;
  // 作成フォームを、初期値つきで開く
  openCreate: (initial: EventFormValues) => void;
};

// Provider の外（テストなど）で描画しても落ちないよう、何もしない既定値を持たせる
const EventDialogContext = createContext<EventDialogContextValue>({
  openEvent: () => {},
  openEdit: () => {},
  openCreate: () => {},
});

export const useEventDialog = () => useContext(EventDialogContext);

type DialogState =
  | { kind: 'closed' }
  | { kind: 'detail'; eventId: string }
  | { kind: 'edit'; eventId: string }
  | { kind: 'create'; initial: EventFormValues; token: number };

// ダイアログの開閉状態はクライアント側で持つ（URL に持つのは表示状態 view, date だけ）
export function EventDialogProvider({
  events,
  children,
}: {
  events: CalendarEvent[];
  children: React.ReactNode;
}) {
  const [state, setState] = useState<DialogState>({ kind: 'closed' });
  const createCount = useRef(0);

  const close = useCallback(() => setState({ kind: 'closed' }), []);
  const value = useMemo<EventDialogContextValue>(
    () => ({
      openEvent: (eventId) => setState({ kind: 'detail', eventId }),
      openEdit: (eventId) => setState({ kind: 'edit', eventId }),
      // 開くたびに別のフォームとして作り直す（前回の入力を引き継がない）
      openCreate: (initial) =>
        setState({ kind: 'create', initial, token: ++createCount.current }),
    }),
    [],
  );

  // 更新や削除で一覧から消えた予定は、自動的に閉じた扱いになる
  const target =
    state.kind === 'detail' || state.kind === 'edit'
      ? (events.find((e) => e.id === state.eventId) ?? null)
      : null;
  const formTarget: EventFormTarget | null =
    state.kind === 'create'
      ? { kind: 'create', initial: state.initial, token: state.token }
      : state.kind === 'edit' && target
        ? { kind: 'edit', event: target }
        : null;

  return (
    <EventDialogContext.Provider value={value}>
      {children}
      <EventDetailDialog
        event={state.kind === 'detail' ? target : null}
        onClose={close}
        onEdit={value.openEdit}
      />
      <EventFormDialog target={formTarget} onClose={close} />
    </EventDialogContext.Provider>
  );
}
