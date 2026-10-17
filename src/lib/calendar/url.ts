import { DEFAULT_VIEW, type View } from '@/lib/calendar/grid';

// クライアントコンポーネントにも渡せるよう、日付は yyyy-MM-dd の文字列で持つ
export type ViewSelection = { view: View; dateKey: string };

// 表示状態から URL を作る。URL が表示状態の唯一の置き場
// 既定の月表示は view を、今日の日付は date を省略する（共有しても「今日」を指す）
export function buildViewHref(
  { view, dateKey }: ViewSelection,
  todayKey: string,
): string {
  const params = new URLSearchParams();
  if (view !== DEFAULT_VIEW) params.set('view', view);
  if (dateKey !== todayKey) params.set('date', dateKey);
  const query = params.toString();
  return query ? `/?${query}` : '/';
}
