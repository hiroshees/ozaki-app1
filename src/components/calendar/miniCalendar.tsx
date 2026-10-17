'use client';

import { useState } from 'react';
import Link from 'next/link';
import { tv } from 'tailwind-variants';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import type { View } from '@/lib/calendar/grid';
import { buildMiniCalendar, monthKeyOf } from '@/lib/calendar/mini';

const dayCell = tv({
  base: 'mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
  variants: {
    inMonth: { true: 'text-gray-900', false: 'text-gray-400' },
    state: {
      selected: 'bg-blue-600 font-semibold text-white hover:bg-blue-700',
      today:
        'border border-blue-600 font-semibold text-blue-700 hover:bg-blue-50',
      normal: 'hover:bg-gray-100',
    },
  },
});

const monthButton =
  'flex h-8 w-8 items-center justify-center rounded-md outline-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-400';

type MiniCalendarProps = { view: View; dateKey: string; todayKey: string };

// 日付クリックで、view を保ったまま date を更新する。月送りはこの部品の中だけの状態
// （表示中の日付が変わったら、親が key を変えて表示月をその日付の月に戻す）
export function MiniCalendar({ view, dateKey, todayKey }: MiniCalendarProps) {
  const [monthKey, setMonthKey] = useState(monthKeyOf(dateKey));
  const mini = buildMiniCalendar({ view, dateKey }, todayKey, monthKey);

  return (
    <section aria-label="ミニカレンダー">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{mini.title}</h2>
        <div className="flex">
          <button
            type="button"
            aria-label="前の月を表示"
            className={monthButton}
            onClick={() => setMonthKey(mini.prevMonthKey)}
          >
            <FaChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="次の月を表示"
            className={monthButton}
            onClick={() => setMonthKey(mini.nextMonthKey)}
          >
            <FaChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
      <table className="w-full table-fixed text-center">
        <thead>
          <tr>
            {mini.weekdays.map((w) => (
              <th
                key={w}
                scope="col"
                className="pb-1 text-xs font-normal text-gray-500"
              >
                {w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mini.weeks.map((week) => (
            <tr key={week[0].key}>
              {week.map((d) => (
                <td key={d.key} className="p-0.5">
                  <Link
                    href={d.href}
                    aria-label={d.label}
                    aria-current={d.isToday ? 'date' : undefined}
                    className={dayCell({
                      inMonth: d.inMonth,
                      state: d.isSelected
                        ? 'selected'
                        : d.isToday
                          ? 'today'
                          : 'normal',
                    })}
                  >
                    {d.day}
                  </Link>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
