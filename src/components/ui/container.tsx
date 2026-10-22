import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Shared page gutter. One container for the whole site so the vertical
 * rhythm of the homepage lines up with every future page.
 */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1560px] px-6 md:px-10 lg:px-14", className)}
    >
      {children}
    </div>
  );
}
