'use client';

import { useEffect, useRef } from 'react';
import {
  initialScrollMinutes,
  minutesToOffset,
} from '@/lib/calendar/time-grid';

type TimeGridScrollerProps = {
  containsToday: boolean;
  children: React.ReactNode;
};

// 縦スクロール領域。初回表示時に、今日を含むなら現在時刻付近、含まなければ朝8時付近へ移動する
export function TimeGridScroller({
  containsToday,
  children,
}: TimeGridScrollerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.scrollTop = minutesToOffset(
      initialScrollMinutes(new Date(), containsToday),
    );
  }, [containsToday]);

  return (
    <div
      ref={ref}
      className="h-[70vh] min-h-80 overflow-y-auto overflow-x-hidden"
    >
      {children}
    </div>
  );
}
