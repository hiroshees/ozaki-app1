import Link from "next/link";
import { useMemo } from "react";
import { type ButtonLinkProps, type IconButtonLinkProps } from "@/types/ui";
import { generateBtnLinkStyle } from "@/components/ui/linkStyle";

export function ButtonLink({
  href,
  text,
  blank,
  className,
  full,
  color,
  size,
}: ButtonLinkProps) {
  const cn = useMemo(
    () => generateBtnLinkStyle({ color, size, full, className }),
    [color, size, full, className],
  );
  return (
    <Link className={cn} href={href} {...(blank && { target: "_blank" })}>
      {text}
    </Link>
  );
}

export function IconButtonLink({
  href,
  text,
  blank,
  className,
  full,
  color,
  size,
  icon,
}: IconButtonLinkProps) {
  const cn = useMemo(
    () => generateBtnLinkStyle({ color, size, full, className }),
    [color, size, full, className],
  );
  return (
    <Link className={cn} href={href} {...(blank && { target: "_blank" })}>
      {icon}
      <span className="align-middle">{text}</span>
    </Link>
  );
}
