import Link from 'next/link';
import { tv } from 'tailwind-variants';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { VIEWS, type View } from '@/lib/calendar/grid';
import { buildHeaderNav } from '@/lib/calendar/nav';

const VIEW_LABELS: Record<View, string> = {
  month: '月',
  week: '週',
  day: '日',
};

const control = tv({
  base: 'inline-flex items-center justify-center rounded-md text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
  variants: {
    kind: {
      outline: 'h-9 border border-gray-300 px-3 hover:bg-gray-100',
      icon: 'h-9 w-9 hover:bg-gray-100',
      segment: 'h-9 px-3',
    },
    selected: {
      true: 'bg-blue-100 text-blue-800',
      false: 'hover:bg-gray-100',
    },
  },
  defaultVariants: { selected: false },
});

type CalendarHeaderProps = {
  view: View;
  dateKey: string;
  todayKey: string;
  title: string;
};

// 今日・前へ/次へ・期間タイトル・月週日の切り替え。操作はすべて URL の更新（リンク）
export function CalendarHeader({
  view,
  dateKey,
  todayKey,
  title,
}: CalendarHeaderProps) {
  const nav = buildHeaderNav({ view, dateKey }, todayKey);

  return (
    <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-gray-200 px-4 py-2">
      <div className="flex items-center gap-1">
        <Link href={nav.todayHref} className={control({ kind: 'outline' })}>
          今日
        </Link>
        <Link
          href={nav.prevHref}
          aria-label={`前の${nav.unitLabel}`}
          className={control({ kind: 'icon' })}
        >
          <FaChevronLeft aria-hidden="true" />
        </Link>
        <Link
          href={nav.nextHref}
          aria-label={`次の${nav.unitLabel}`}
          className={control({ kind: 'icon' })}
        >
          <FaChevronRight aria-hidden="true" />
        </Link>
      </div>
      <h1 className="min-w-0 flex-1 truncate text-lg font-semibold sm:text-xl">
        {title}
      </h1>
      <nav
        aria-label="表示の切り替え"
        className="flex items-center rounded-md border border-gray-300 p-0.5"
      >
        {VIEWS.map((v) => (
          <Link
            key={v}
            href={nav.viewHrefs[v]}
            aria-current={v === view ? 'page' : undefined}
            className={control({ kind: 'segment', selected: v === view })}
          >
            {VIEW_LABELS[v]}
          </Link>
        ))}
      </nav>
    </header>
  );
}
