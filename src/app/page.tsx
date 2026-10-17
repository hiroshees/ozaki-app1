import { APPNAME } from '@/config/data';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { fetchEventsInRange } from '@/lib/events/fetch';
import { resolveViewState, type SearchParams } from '@/lib/calendar/view-state';

type HomeProps = { searchParams: Promise<SearchParams> };

// カレンダー画面の仮置き。表示状態は URL の searchParams（view, date）から決める
// ヘッダー・サイドバー・各表示は phase-3 以降の Issue で差し替える
export default async function Home({ searchParams }: HomeProps) {
  const state = resolveViewState(await searchParams, new Date());
  const events = await fetchEventsInRange(state.range.start, state.range.end);

  return (
    <>
      <Header />
      <div className="mt-16 mb-16">
        <h1 className="p-5 text-center text-2xl font-semibold">{APPNAME}</h1>
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
      <Footer />
    </>
  );
}
