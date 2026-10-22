"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { primaryNav } from "@/data/site";
import { useSyncExternalStore } from "react";
import { usePreferences } from "@/lib/preferences/store";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const regionCountry = useSyncExternalStore(
    usePreferences.subscribe,
    () => usePreferences.getState().country,
    () => "US",
  );
  const regionCurrency = useSyncExternalStore(
    usePreferences.subscribe,
    () => usePreferences.getState().currency,
    () => "USD",
  );

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label="Open menu"
        className="-ml-2 flex size-10 items-center justify-center text-ink"
      >
        <Menu className="size-5" strokeWidth={1.25} aria-hidden />
      </button>

      <div
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
        className={cn(
          "fixed inset-0 z-[60] flex flex-col bg-bone transition-transform duration-500 ease-[var(--ease-editorial)] md:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-6">
          <span className="label text-[0.8rem] tracking-[0.34em] text-ink">Aurel Studio</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="-mr-2 flex size-10 items-center justify-center text-ink"
          >
            <X className="size-5" strokeWidth={1.25} aria-hidden />
          </button>
        </div>

        <nav
          aria-label="Mobile"
          className="flex-1 overflow-y-auto px-6 pt-4 pb-10"
        >
          <ul className="divide-y divide-line">
            {primaryNav.map((item) => (
              <li key={item.label} className="py-5">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="display block text-[2rem] leading-none text-ink"
                >
                  {item.label}
                </Link>

                {item.groups ? (
                  <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                    {item.groups.flatMap((group) => group.links).slice(0, 6).map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="text-[0.8rem] text-stone"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-line px-6 py-6">
          <div className="flex items-center justify-between">
            <span className="label text-mist">
              {regionCountry} · {regionCurrency}
            </span>
            <Link href="/account" className="label text-ink">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
