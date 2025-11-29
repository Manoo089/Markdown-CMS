import Link from "next/link";
import { ReactNode } from "react";

interface TextCellProps {
  children: ReactNode;
  variant?: "default" | "muted" | "bold" | "mono";
  size?: "sm" | "base";
}

export function TextCell({
  children,
  variant = "default",
  size = "base",
}: TextCellProps) {
  const variants = {
    default: "text-text",
    muted: "text-text-muted",
    bold: "font-medium text-text",
    mono: "font-mono text-text-muted",
  };

  const sizes = {
    sm: "text-sm",
    base: "",
  };

  return (
    <div className={`${variants[variant]} ${sizes[size]}`}>{children}</div>
  );
}

export interface LinkCellProps {
  href: string;
  children: ReactNode;
}

export function LinkCell({ href, children }: LinkCellProps) {
  return (
    <Link href={href} className="text-primary hover:underline">
      {children}
    </Link>
  );
}
