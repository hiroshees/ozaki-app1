import { tv } from "tailwind-variants";
import { twMerge } from "tailwind-merge";
import {
  type BtnStyleArgsType,
  type CircleIconBtnStyleArgsType,
} from "@/types/ui";

export const btnStlye = tv({
  base: "text-white outline-none",
  variants: {
    color: {
      red: "bg-red-400 focus:ring focus:ring-4 focus:ring-red-200 active:ring active:ring-4 active:ring-red-200 active:bg-red-600 hover:bg-red-700 hover:ring hover:ring-4 hover:ring-red-200 disabled:bg-red-100 disabled:hover:ring-0",
      orange:
        "bg-orange-400 focus:ring focus:ring-4 focus:ring-orange-200 active:ring active:ring-4 active:ring-orange-200 active:bg-orange-600 hover:bg-orange-700 hover:ring hover:ring-4 hover:ring-orange-200 disabled:bg-orange-100 disabled:hover:ring-0",
      amber:
        "bg-amber-400 focus:ring focus:ring-4 focus:ring-amber-200 active:ring active:ring-4 active:ring-amber-200 active:bg-amber-600 hover:bg-amber-700 hover:ring hover:ring-4 hover:ring-amber-200 disabled:bg-amber-100 disabled:hover:ring-0",
      yellow:
        "bg-yellow-400 focus:ring focus:ring-4 focus:ring-yellow-200 active:ring active:ring-4 active:ring-yellow-200 active:bg-yellow-600 hover:bg-yellow-700 hover:ring hover:ring-4 hover:ring-yellow-200 disabled:bg-yellow-100 disabled:hover:ring-0",
      lime: "bg-lime-400 focus:ring focus:ring-4 focus:ring-lime-200 active:ring active:ring-4 active:ring-lime-200 active:bg-lime-600 hover:bg-lime-700 hover:ring hover:ring-4 hover:ring-lime-200 disabled:bg-lime-100 disabled:hover:ring-0",
      green:
        "bg-green-400 focus:ring focus:ring-4 focus:ring-green-200 active:ring active:ring-4 active:ring-green-200 active:bg-green-600 hover:bg-green-700 hover:ring hover:ring-4 hover:ring-green-200 disabled:bg-green-100 disabled:hover:ring-0",
      emerald:
        "bg-emerald-400 focus:ring focus:ring-4 focus:ring-emerald-200 active:ring active:ring-4 active:ring-emerald-200 active:bg-emerald-600 hover:bg-emerald-700 hover:ring hover:ring-4 hover:ring-emerald-200 disabled:bg-emerald-100 disabled:hover:ring-0",
      teal: "bg-teal-400 focus:ring focus:ring-4 focus:ring-teal-200 active:ring active:ring-4 active:ring-teal-200 active:bg-teal-600 hover:bg-teal-700 hover:ring hover:ring-4 hover:ring-teal-200 disabled:bg-teal-100 disabled:hover:ring-0",
      cyan: "bg-cyan-400 focus:ring focus:ring-4 focus:ring-cyan-200 active:ring active:ring-4 active:ring-cyan-200 active:bg-cyan-600 hover:bg-cyan-700 hover:ring hover:ring-4 hover:ring-cyan-200 disabled:bg-cyan-100 disabled:hover:ring-0",
      sky: "bg-sky-400 focus:ring focus:ring-4 focus:ring-sky-200 active:ring active:ring-4 active:ring-sky-200 active:bg-sky-600 hover:bg-sky-700 hover:ring hover:ring-4 hover:ring-sky-200 disabled:bg-sky-100 disabled:hover:ring-0",
      blue: "bg-blue-400 focus:ring focus:ring-4 focus:ring-blue-200 active:ring active:ring-4 active:ring-blue-200 active:bg-blue-600 hover:bg-blue-700 hover:ring hover:ring-4 hover:ring-blue-200 disabled:bg-blue-100 disabled:hover:ring-0",
      indigo:
        "bg-indigo-400 focus:ring focus:ring-4 focus:ring-indigo-200 active:ring active:ring-4 active:ring-indigo-200 active:bg-indigo-600 hover:bg-indigo-700 hover:ring hover:ring-4 hover:ring-indigo-200 disabled:bg-indigo-100 disabled:hover:ring-0",
      violet:
        "bg-violet-400 focus:ring focus:ring-4 focus:ring-violet-200 active:ring active:ring-4 active:ring-violet-200 active:bg-violet-600 hover:bg-violet-700 hover:ring hover:ring-4 hover:ring-violet-200 disabled:bg-violet-100 disabled:hover:ring-0",
      purple:
        "bg-purple-400 focus:ring focus:ring-4 focus:ring-purple-200 active:ring active:ring-4 active:ring-purple-200 active:bg-purple-600 hover:bg-purple-700 hover:ring hover:ring-4 hover:ring-purple-200 disabled:bg-purple-100 disabled:hover:ring-0",
      fuchsia:
        "bg-fuchsia-400 focus:ring focus:ring-4 focus:ring-fuchsia-200 active:ring active:ring-4 active:ring-fuchsia-200 active:bg-fuchsia-600 hover:bg-fuchsia-700 hover:ring hover:ring-4 hover:ring-fuchsia-200 disabled:bg-fuchsia-100 disabled:hover:ring-0",
      pink: "bg-pink-400 focus:ring focus:ring-4 focus:ring-pink-200 active:ring active:ring-4 active:ring-pink-200 active:bg-pink-600 hover:bg-pink-700 hover:ring hover:ring-4 hover:ring-pink-200 disabled:bg-pink-100 disabled:hover:ring-0",
      rose: "bg-rose-400 focus:ring focus:ring-4 focus:ring-rose-200 active:ring active:ring-4 active:ring-rose-200 active:bg-rose-600 hover:bg-rose-700 hover:ring hover:ring-4 hover:ring-rose-200 disabled:bg-rose-100 disabled:hover:ring-0",
      slate:
        "bg-slate-400 focus:ring focus:ring-4 focus:ring-slate-200 active:ring active:ring-4 active:ring-slate-200 active:bg-slate-600 hover:bg-slate-700 hover:ring hover:ring-4 hover:ring-slate-200 disabled:bg-slate-100 disabled:hover:ring-0",
      gray: "bg-gray-400 focus:ring focus:ring-4 focus:ring-gray-200 active:ring active:ring-4 active:ring-gray-200 active:bg-gray-600 hover:bg-gray-700 hover:ring hover:ring-4 hover:ring-gray-200 disabled:bg-gray-100 disabled:hover:ring-0",
      zinc: "bg-zinc-400 focus:ring focus:ring-4 focus:ring-zinc-200 active:ring active:ring-4 active:ring-zinc-200 active:bg-zinc-600 hover:bg-zinc-700 hover:ring hover:ring-4 hover:ring-zinc-200 disabled:bg-zinc-100 disabled:hover:ring-0",
      neutral:
        "bg-neutral-400 focus:ring focus:ring-4 focus:ring-neutral-200 active:ring active:ring-4 active:ring-neutral-200 active:bg-neutral-600 hover:bg-neutral-700 hover:ring hover:ring-4 hover:ring-neutral-200 disabled:bg-neutral-100 disabled:hover:ring-0",
      stone:
        "bg-stone-400 focus:ring focus:ring-4 focus:ring-stone-200 active:ring active:ring-4 active:ring-stone-200 active:bg-stone-600 hover:bg-stone-700 hover:ring hover:ring-4 hover:ring-stone-200 disabled:bg-stone-100 disabled:hover:ring-0",
    },
    size: {
      small: "text-sm px-3 py-2 rounded-sm",
      base: "text-sm px-5 py-2.5 rounded-md",
      large: "text-base px-7 py-3 rounded-lg",
    },
    full: {
      base: "",
      full: "w-full",
    },
  },
  defaultVariants: {
    color: "blue",
    size: "base",
    full: "base",
  },
});

export const circleIconButtonStlye = tv({
  base: "text-white outline-none inline-flex items-center text-center rounded-full",
  variants: {
    color: {
      red: "bg-red-400 focus:ring focus:ring-4 focus:ring-red-200 active:ring active:ring-4 active:ring-red-200 active:bg-red-600 hover:bg-red-700 hover:ring hover:ring-4 hover:ring-red-200 disabled:bg-red-100 disabled:hover:ring-0",
      orange:
        "bg-orange-400 focus:ring focus:ring-4 focus:ring-orange-200 active:ring active:ring-4 active:ring-orange-200 active:bg-orange-600 hover:bg-orange-700 hover:ring hover:ring-4 hover:ring-orange-200 disabled:bg-orange-100 disabled:hover:ring-0",
      amber:
        "bg-amber-400 focus:ring focus:ring-4 focus:ring-amber-200 active:ring active:ring-4 active:ring-amber-200 active:bg-amber-600 hover:bg-amber-700 hover:ring hover:ring-4 hover:ring-amber-200 disabled:bg-amber-100 disabled:hover:ring-0",
      yellow:
        "bg-yellow-400 focus:ring focus:ring-4 focus:ring-yellow-200 active:ring active:ring-4 active:ring-yellow-200 active:bg-yellow-600 hover:bg-yellow-700 hover:ring hover:ring-4 hover:ring-yellow-200 disabled:bg-yellow-100 disabled:hover:ring-0",
      lime: "bg-lime-400 focus:ring focus:ring-4 focus:ring-lime-200 active:ring active:ring-4 active:ring-lime-200 active:bg-lime-600 hover:bg-lime-700 hover:ring hover:ring-4 hover:ring-lime-200 disabled:bg-lime-100 disabled:hover:ring-0",
      green:
        "bg-green-400 focus:ring focus:ring-4 focus:ring-green-200 active:ring active:ring-4 active:ring-green-200 active:bg-green-600 hover:bg-green-700 hover:ring hover:ring-4 hover:ring-green-200 disabled:bg-green-100 disabled:hover:ring-0",
      emerald:
        "bg-emerald-400 focus:ring focus:ring-4 focus:ring-emerald-200 active:ring active:ring-4 active:ring-emerald-200 active:bg-emerald-600 hover:bg-emerald-700 hover:ring hover:ring-4 hover:ring-emerald-200 disabled:bg-emerald-100 disabled:hover:ring-0",
      teal: "bg-teal-400 focus:ring focus:ring-4 focus:ring-teal-200 active:ring active:ring-4 active:ring-teal-200 active:bg-teal-600 hover:bg-teal-700 hover:ring hover:ring-4 hover:ring-teal-200 disabled:bg-teal-100 disabled:hover:ring-0",
      cyan: "bg-cyan-400 focus:ring focus:ring-4 focus:ring-cyan-200 active:ring active:ring-4 active:ring-cyan-200 active:bg-cyan-600 hover:bg-cyan-700 hover:ring hover:ring-4 hover:ring-cyan-200 disabled:bg-cyan-100 disabled:hover:ring-0",
      sky: "bg-sky-400 focus:ring focus:ring-4 focus:ring-sky-200 active:ring active:ring-4 active:ring-sky-200 active:bg-sky-600 hover:bg-sky-700 hover:ring hover:ring-4 hover:ring-sky-200 disabled:bg-sky-100 disabled:hover:ring-0",
      blue: "bg-blue-400 focus:ring focus:ring-4 focus:ring-blue-200 active:ring active:ring-4 active:ring-blue-200 active:bg-blue-600 hover:bg-blue-700 hover:ring hover:ring-4 hover:ring-blue-200 disabled:bg-blue-100 disabled:hover:ring-0",
      indigo:
        "bg-indigo-400 focus:ring focus:ring-4 focus:ring-indigo-200 active:ring active:ring-4 active:ring-indigo-200 active:bg-indigo-600 hover:bg-indigo-700 hover:ring hover:ring-4 hover:ring-indigo-200 disabled:bg-indigo-100 disabled:hover:ring-0",
      violet:
        "bg-violet-400 focus:ring focus:ring-4 focus:ring-violet-200 active:ring active:ring-4 active:ring-violet-200 active:bg-violet-600 hover:bg-violet-700 hover:ring hover:ring-4 hover:ring-violet-200 disabled:bg-violet-100 disabled:hover:ring-0",
      purple:
        "bg-purple-400 focus:ring focus:ring-4 focus:ring-purple-200 active:ring active:ring-4 active:ring-purple-200 active:bg-purple-600 hover:bg-purple-700 hover:ring hover:ring-4 hover:ring-purple-200 disabled:bg-purple-100 disabled:hover:ring-0",
      fuchsia:
        "bg-fuchsia-400 focus:ring focus:ring-4 focus:ring-fuchsia-200 active:ring active:ring-4 active:ring-fuchsia-200 active:bg-fuchsia-600 hover:bg-fuchsia-700 hover:ring hover:ring-4 hover:ring-fuchsia-200 disabled:bg-fuchsia-100 disabled:hover:ring-0",
      pink: "bg-pink-400 focus:ring focus:ring-4 focus:ring-pink-200 active:ring active:ring-4 active:ring-pink-200 active:bg-pink-600 hover:bg-pink-700 hover:ring hover:ring-4 hover:ring-pink-200 disabled:bg-pink-100 disabled:hover:ring-0",
      rose: "bg-rose-400 focus:ring focus:ring-4 focus:ring-rose-200 active:ring active:ring-4 active:ring-rose-200 active:bg-rose-600 hover:bg-rose-700 hover:ring hover:ring-4 hover:ring-rose-200 disabled:bg-rose-100 disabled:hover:ring-0",
      slate:
        "bg-slate-400 focus:ring focus:ring-4 focus:ring-slate-200 active:ring active:ring-4 active:ring-slate-200 active:bg-slate-600 hover:bg-slate-700 hover:ring hover:ring-4 hover:ring-slate-200 disabled:bg-slate-100 disabled:hover:ring-0",
      gray: "bg-gray-400 focus:ring focus:ring-4 focus:ring-gray-200 active:ring active:ring-4 active:ring-gray-200 active:bg-gray-600 hover:bg-gray-700 hover:ring hover:ring-4 hover:ring-gray-200 disabled:bg-gray-100 disabled:hover:ring-0",
      zinc: "bg-zinc-400 focus:ring focus:ring-4 focus:ring-zinc-200 active:ring active:ring-4 active:ring-zinc-200 active:bg-zinc-600 hover:bg-zinc-700 hover:ring hover:ring-4 hover:ring-zinc-200 disabled:bg-zinc-100 disabled:hover:ring-0",
      neutral:
        "bg-neutral-400 focus:ring focus:ring-4 focus:ring-neutral-200 active:ring active:ring-4 active:ring-neutral-200 active:bg-neutral-600 hover:bg-neutral-700 hover:ring hover:ring-4 hover:ring-neutral-200 disabled:bg-neutral-100 disabled:hover:ring-0",
      stone:
        "bg-stone-400 focus:ring focus:ring-4 focus:ring-stone-200 active:ring active:ring-4 active:ring-stone-200 active:bg-stone-600 hover:bg-stone-700 hover:ring hover:ring-4 hover:ring-stone-200 disabled:bg-stone-100 disabled:hover:ring-0",
    },
    size: {
      small: "text-sm p-2",
      base: "text-base p-3",
      large: "text-2xl p-3.5",
    },
  },
  defaultVariants: {
    color: "blue",
    size: "base",
  },
});

export function generateBtnStyle({
  color,
  size,
  full,
  className,
}: BtnStyleArgsType) {
  const base = btnStlye({ color, size, full: full ? "full" : "base" });
  return twMerge(base, className);
}

export function generateCircleIconBtnStyle({
  color,
  size,
  className,
}: CircleIconBtnStyleArgsType) {
  const base = circleIconButtonStlye({ color, size });
  return twMerge(base, className);
}
