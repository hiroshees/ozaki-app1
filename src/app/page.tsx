import { CalendarHeader } from '@/components/calendar/calendarHeader';
import { CalendarSidebar } from '@/components/calendar/calendarSidebar';
import { EventDialogProvider } from '@/components/calendar/eventDialogs';
import { MonthView } from '@/components/calendar/monthView';
import { TimeGridView } from '@/components/calendar/timeGridView';
import { fetchEventsInRange } from '@/lib/events/fetch';
import { resolveViewState, type SearchParams } from '@/lib/calendar/view-state';

type HomeProps = { searchParams: Promise<SearchParams> };

// 表示状態は URL の searchParams（view, date）から決める
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
          <EventDialogProvider events={events}>
            {state.view === 'month' ? (
              <MonthView
                events={events}
                dateKey={state.dateKey}
                todayKey={state.todayKey}
              />
            ) : (
              <TimeGridView
                events={events}
                view={state.view}
                dateKey={state.dateKey}
                todayKey={state.todayKey}
              />
            )}
          </EventDialogProvider>
        </main>
      </div>
    </>
  );
}
