import { useMemo } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { type SpinnerProps } from "@/types/ui";
import { generateSpinnerStyle } from "@/components/ui/spinnerStyle";

export function LoadingSpinner({ className, color, size }: SpinnerProps) {
  const cn = useMemo(
    () => generateSpinnerStyle({ color, size, className }),
    [color, size, className],
  );
  return (
    <div className="text-center">
      <AiOutlineLoading3Quarters className={cn} />
    </div>
  );
}
