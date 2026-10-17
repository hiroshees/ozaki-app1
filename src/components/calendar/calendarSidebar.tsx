'use client';

import { useState } from 'react';
import { FaBars, FaPlus } from 'react-icons/fa6';
import type { View } from '@/lib/calendar/grid';
import { MiniCalendar } from '@/components/calendar/miniCalendar';

type CalendarSidebarProps = { view: View; dateKey: string; todayKey: string };

// PC 幅では常に表示し、スマートフォン幅では開閉できる
export function CalendarSidebar({
  view,
  dateKey,
  todayKey,
}: CalendarSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <aside className="border-b border-gray-200 md:w-64 md:shrink-0 md:border-b-0 md:border-r">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="calendar-sidebar-panel"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium outline-none hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 md:hidden"
      >
        <FaBars aria-hidden="true" />
        {open ? 'メニューを閉じる' : 'メニューを開く'}
      </button>
      <div
        id="calendar-sidebar-panel"
        className={`${open ? 'block' : 'hidden'} space-y-4 p-4 md:block`}
      >
        {/* 作成ダイアログは phase-6。それまでは押せない状態にしておく */}
        <button
          type="button"
          disabled
          title="予定の作成は準備中です"
          className="flex h-11 items-center gap-2 rounded-full border border-gray-300 px-5 text-sm font-medium shadow-sm disabled:cursor-not-allowed disabled:text-gray-400"
        >
          <FaPlus aria-hidden="true" />
          作成
        </button>
        {/* 表示中の日付が変わったら remount して、表示月をその日付の月に戻す */}
        <MiniCalendar
          key={dateKey}
          view={view}
          dateKey={dateKey}
          todayKey={todayKey}
        />
      </div>
    </aside>
  );
}
