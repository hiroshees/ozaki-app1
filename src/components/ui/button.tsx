import { useMemo } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import {
  type ButtonProps,
  type LoadingButtonProps,
  type IconButtonProps,
  type CircleIconButtonProps,
} from "@/types/ui";
import {
  generateBtnStyle,
  generateCircleIconBtnStyle,
} from "@/components/ui/buttonStyle";

export function Button({
  type = "button",
  label,
  disabled,
  onClick,
  className,
  full,
  color,
  size,
}: ButtonProps) {
  const cn = useMemo(
    () => generateBtnStyle({ color, size, full, className }),
    [color, size, full, className],
  );
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cn}>
      {label}
    </button>
  );
}

export function LoadingButton({
  type = "button",
  label,
  disabled,
  onClick,
  className,
  full,
  color,
  size,
  isProcessing,
}: LoadingButtonProps) {
  const cn = useMemo(
    () => generateBtnStyle({ color, size, full, className }),
    [color, size, full, className],
  );
  return (
    <button type={type} className={cn} disabled={disabled} onClick={onClick}>
      {label}
      {isProcessing && (
        <AiOutlineLoading3Quarters className="inline-block h-6 w-6 ml-3 animate-spin" />
      )}
    </button>
  );
}

export function IconButton({
  type = "button",
  label,
  disabled,
  onClick,
  className,
  full,
  color,
  size,
  icon,
}: IconButtonProps) {
  const cn = useMemo(
    () => generateBtnStyle({ color, size, full, className }),
    [color, size, full, className],
  );
  return (
    <button type={type} className={cn} disabled={disabled} onClick={onClick}>
      {icon}
      <span className="align-middle">{label}</span>
    </button>
  );
}

export function CircleIconButton({
  type = "button",
  label,
  disabled = false,
  onClick,
  className,
  color,
  size,
  icon,
}: CircleIconButtonProps) {
  const cn = useMemo(
    () => generateCircleIconBtnStyle({ color, size, className }),
    [color, size, className],
  );
  return (
    <button
      type={type}
      className={cn}
      disabled={disabled}
      onClick={onClick}
      title={label}
    >
      {icon}
    </button>
  );
}
