import { tv } from "tailwind-variants";
import { twMerge } from "tailwind-merge";
import { type SpinnerStyleArgsType } from "@/types/ui";

export const spinnerStlye = tv({
  base: "inline text-gray-200 animate-spin",
  variants: {
    color: {
      red: "fill-red-600",
      orange: "fill-orange-600",
      amber: "fill-amber-600",
      yellow: "fill-yellow-600",
      lime: "fill-lime-600",
      green: "fill-green-600",
      emerald: "fill-emerald-600",
      teal: "fill-teal-600",
      cyan: "fill-cyan-600",
      sky: "fill-sky-600",
      blue: "fill-blue-600",
      indigo: "fill-indigo-600",
      violet: "fill-violet-600",
      purple: "fill-purple-600",
      fuchsia: "fill-fuchsia-600",
      pink: "fill-pink-600",
      rose: "fill-rose-600",
      slate: "fill-slate-600",
      gray: "fill-gray-600",
      zinc: "fill-zinc-600",
      neutral: "fill-neutral-600",
      stone: "fill-stone-600",
    },
    size: {
      small: "w-6 h-6",
      base: "w-8 h-8",
      large: "w-12 h-12",
    },
  },
  defaultVariants: {
    color: "blue",
    size: "base",
  },
});

export function generateSpinnerStyle({
  color,
  size,
  className,
}: SpinnerStyleArgsType) {
  const base = spinnerStlye({ color, size });
  return twMerge(base, className);
}
