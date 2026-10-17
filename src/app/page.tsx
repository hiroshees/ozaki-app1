import { APPNAME } from '@/config/data';
import { CalendarHeader } from '@/components/calendar/calendarHeader';
import { CalendarSidebar } from '@/components/calendar/calendarSidebar';
import { MonthView } from '@/components/calendar/monthView';
import { fetchEventsInRange } from '@/lib/events/fetch';
import { resolveViewState, type SearchParams } from '@/lib/calendar/view-state';

type HomeProps = { searchParams: Promise<SearchParams> };

// カレンダー画面の仮置き。表示状態は URL の searchParams（view, date）から決める
// 週・日表示は phase-5 で差し替える
export default async function Home({ searchParams }: HomeProps) {
  const state = resolveViewState(await searchParams, new Date());
  const events = await fetchEventsInRange(state.range.start, state.range.end);

  return (
    <>
      <CalendarHeader
        view={state.view}
        dateKey={state.dateKey}
        todayKey={state.todayKey}
        title={state.title}
      />
      <div className="md:flex">
        <CalendarSidebar
          view={state.view}
          dateKey={state.dateKey}
          todayKey={state.todayKey}
        />
        <main className="min-w-0 flex-1">
          {state.view === 'month' ? (
            <MonthView
              events={events}
              dateKey={state.dateKey}
              todayKey={state.todayKey}
            />
          ) : (
            // 週・日表示は phase-5 で差し替える
            <div className="pt-4">
              <p className="p-5 text-center text-2xl font-semibold">
                {APPNAME}
              </p>
              <dl className="mx-auto max-w-md space-y-1 px-4 text-sm">
                <div className="flex justify-between">
                  <dt>表示</dt>
                  <dd>{state.view}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>基準日</dt>
                  <dd>{state.dateKey}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>期間</dt>
                  <dd>{state.title}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>予定の件数</dt>
                  <dd>{events.length}</dd>
                </div>
              </dl>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
