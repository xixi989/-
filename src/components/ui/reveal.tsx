"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fades a block in once, when it first enters the viewport.
 *
 * Deliberate constraints:
 * - Elements already on screen at mount never hide, so the first paint is never
 *   empty and there is no flash of missing content.
 * - `prefers-reduced-motion` skips the effect entirely.
 * - The hidden state is applied by JS only; with JavaScript off the content
 *   renders plainly.
 */
export function Reveal({
  children,
  className,
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "pending" | "shown">("idle");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const { top } = element.getBoundingClientRect();
    if (top < window.innerHeight * 0.92) return;

    setState("pending");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          window.setTimeout(() => setState("shown"), delayMs);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [delayMs]);

  return (
    <div ref={ref} data-reveal={state === "idle" ? undefined : state} className={className}>
      {children}
    </div>
  );
}
