'use client';

import { useEventDialog } from '@/components/calendar/eventDialogs';
import { slotStartMinutes } from '@/lib/calendar/time-grid';
import { buildSlotDefaults } from '@/lib/events/form';

// 日の列の背面に敷く、空き時間のクリックを受け取る層
// 予定（z-10）や現在時刻の線（z-20）はこの層より前面にあるため、予定のクリックとは干渉しない
// キーボードでは選べないため、代わりに「作成」ボタン（サイドバー）を使う。装飾として扱い、フォーカス順は増やさない
export function TimeSlotLayer({ dayKey }: { dayKey: string }) {
  const { openCreate } = useEventDialog();

  return (
    <div
      aria-hidden="true"
      data-slot-layer={dayKey}
      className="absolute inset-0 z-0 cursor-pointer"
      onClick={(e) => {
        // 列内の縦位置（px）→ 15分単位の開始時刻
        const top = e.currentTarget.getBoundingClientRect().top;
        openCreate(
          buildSlotDefaults(dayKey, slotStartMinutes(e.clientY - top)),
        );
      }}
    />
  );
}
