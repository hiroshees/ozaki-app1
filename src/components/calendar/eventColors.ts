import type { EventColor } from '@/lib/events/types';

// 予定の色ごとの表示クラス（Tailwind が検出できるよう、クラス名は完全な文字列で書く）
// band: 帯（背景色 + 文字色。文字のコントラスト比は 4.5:1 以上）
// dot: 月表示の時間指定の予定の点
// block: 時間グリッドの予定（薄い背景 + 左の濃い線 + 濃い文字）
export const EVENT_COLOR_CLASSES: Record<
  EventColor,
  { band: string; dot: string; block: string }
> = {
  blue: {
    band: 'bg-blue-600 text-white',
    dot: 'bg-blue-600',
    block: 'border-blue-600 bg-blue-100 text-blue-900',
  },
  red: {
    band: 'bg-red-600 text-white',
    dot: 'bg-red-600',
    block: 'border-red-600 bg-red-100 text-red-900',
  },
  green: {
    band: 'bg-green-700 text-white',
    dot: 'bg-green-700',
    block: 'border-green-700 bg-green-100 text-green-900',
  },
  yellow: {
    band: 'bg-yellow-300 text-gray-900',
    dot: 'bg-yellow-400',
    block: 'border-yellow-500 bg-yellow-100 text-yellow-900',
  },
  purple: {
    band: 'bg-purple-600 text-white',
    dot: 'bg-purple-600',
    block: 'border-purple-600 bg-purple-100 text-purple-900',
  },
  gray: {
    band: 'bg-gray-600 text-white',
    dot: 'bg-gray-600',
    block: 'border-gray-600 bg-gray-100 text-gray-900',
  },
};

// 帯の端の形。前後へ続く側は丸めず、続きが分かるようにする
export function bandShapeClasses(
  continuesBefore: boolean,
  continuesAfter: boolean,
): string {
  return [
    continuesBefore ? 'rounded-l-none' : 'ml-0.5 rounded-l',
    continuesAfter ? 'rounded-r-none' : 'mr-0.5 rounded-r',
  ].join(' ');
}

// 時間グリッドの予定の上下の形。日をまたぐ予定の切り口の側は丸めない
export function blockShapeClasses(isStart: boolean, isEnd: boolean): string {
  return [
    isStart ? 'rounded-t' : 'rounded-t-none',
    isEnd ? 'rounded-b' : 'rounded-b-none',
  ].join(' ');
}

// 色の名前（詳細ダイアログなど、色を文字で伝える場面で使う）
export const EVENT_COLOR_LABELS: Record<EventColor, string> = {
  blue: '青',
  red: '赤',
  green: '緑',
  yellow: '黄',
  purple: '紫',
  gray: 'グレー',
};
