import type { EventColor } from '@/lib/events/types';

// 予定の色ごとの表示クラス（Tailwind が検出できるよう、クラス名は完全な文字列で書く）
// band: 帯（背景色 + 文字色。文字のコントラスト比は 4.5:1 以上）、dot: 時間指定の予定の点
export const EVENT_COLOR_CLASSES: Record<
  EventColor,
  { band: string; dot: string }
> = {
  blue: { band: 'bg-blue-600 text-white', dot: 'bg-blue-600' },
  red: { band: 'bg-red-600 text-white', dot: 'bg-red-600' },
  green: { band: 'bg-green-700 text-white', dot: 'bg-green-700' },
  yellow: { band: 'bg-yellow-300 text-gray-900', dot: 'bg-yellow-400' },
  purple: { band: 'bg-purple-600 text-white', dot: 'bg-purple-600' },
  gray: { band: 'bg-gray-600 text-white', dot: 'bg-gray-600' },
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
