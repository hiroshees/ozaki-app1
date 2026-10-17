'use client';

import { useEffect, useState } from 'react';
import {
  minutesSinceMidnightJst,
  minutesToOffset,
} from '@/lib/calendar/time-grid';

const UPDATE_INTERVAL_MS = 60_000;

// 現在時刻の赤線。今日の列の中に置く
// サーバーでは描画せず、マウント後に現在時刻を取得する（ハイドレーションエラー対策）
export function CurrentTimeLine() {
  const [minutes, setMinutes] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setMinutes(minutesSinceMidnightJst(new Date()));
    update();
    const timer = setInterval(update, UPDATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  if (minutes === null) return null;

  return (
    <div
      aria-hidden="true"
      data-current-time
      className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
      style={{ top: minutesToOffset(minutes) }}
    >
      <span className="-ml-1 h-2 w-2 shrink-0 rounded-full bg-red-600" />
      <span className="h-px flex-1 bg-red-600" />
    </div>
  );
}
