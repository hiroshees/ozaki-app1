import { tv } from "tailwind-variants";
import { twMerge } from "tailwind-merge";
import {
  type InputStyleArgsType,
  type LabelStyleArgsType,
  type HelpStyleArgsType,
} from "@/types/form";

export const inputStlye = tv({
  base: "block outline-none border",
  variants: {
    color: {
      default:
        "text-gray-900 bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500",
      success:
        "text-gray-900 bg-gray-50 border-green-300  focus:ring-blue-500 focus:border-blue-500",
      failure:
        "text-gray-900 bg-gray-50 border-red-300 focus:ring-blue-500 focus:border-blue-500",
    },
    size: {
      small: "text-sm p-2 rounded-lg",
      base: "text-sm p-2.5 rounded-lg",
      large: "text-base p-4 rounded-lg",
    },
    full: {
      base: "",
      full: "w-full",
    },
  },
  defaultVariants: {
    color: "default",
    size: "base",
    full: "base",
  },
});

export const labelStlye = tv({
  base: "block mb-2",
  variants: {
    color: {
      default: "text-gray-600 peer-focus:text-blue-600",
      success: "text-green-600 peer-focus:text-blue-600",
      failure: "text-red-600 peer-focus:text-blue-600",
    },
    size: {
      small: "text-sm",
      base: "text-sm",
      large: "text-base",
    },
  },
  defaultVariants: {
    color: "default",
    size: "base",
  },
});

export const helpStlye = tv({
  base: "mt-2",
  variants: {
    color: {
      default: "text-gray-600",
      success: "text-green-600",
      failure: "text-red-600",
    },
    size: {
      small: "text-sm",
      base: "text-sm",
      large: "text-base",
    },
  },
  defaultVariants: {
    color: "default",
    size: "base",
  },
});

export function generateInputStyle({
  color,
  size,
  full,
  className,
}: InputStyleArgsType) {
  const base = inputStlye({ color, size, full: full ? "full" : "base" });
  return twMerge(base, className);
}

export function generateLabelStyle({
  color,
  size,
  className,
}: LabelStyleArgsType) {
  const base = labelStlye({ color, size });
  return twMerge(base, className);
}

export function generateHelpStyle({
  color,
  size,
  className,
}: HelpStyleArgsType) {
  const base = helpStlye({ color, size });
  return twMerge(base, className);
}
