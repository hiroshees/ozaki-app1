'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { EventDetailDialog } from '@/components/calendar/eventDetailDialog';
import type { CalendarEvent } from '@/lib/events/types';

type EventDialogContextValue = { openEvent: (eventId: string) => void };

// Provider の外（テストなど）で描画しても落ちないよう、何もしない既定値を持たせる
const EventDialogContext = createContext<EventDialogContextValue>({
  openEvent: () => {},
});

export const useEventDialog = () => useContext(EventDialogContext);

// ダイアログの開閉状態はクライアント側で持つ（URL に持つのは表示状態 view, date だけ）
export function EventDialogProvider({
  events,
  children,
}: {
  events: CalendarEvent[];
  children: React.ReactNode;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const value = useMemo(() => ({ openEvent: setSelectedId }), []);
  // 更新や削除で一覧から消えた予定は、自動的に閉じた扱いになる
  const selected = events.find((e) => e.id === selectedId) ?? null;

  return (
    <EventDialogContext.Provider value={value}>
      {children}
      <EventDetailDialog event={selected} onClose={() => setSelectedId(null)} />
    </EventDialogContext.Provider>
  );
}
