"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { CURRENCIES, CURRENCY_LABELS } from "@/lib/commerce/currency";
import { usePreferences } from "@/lib/preferences/store";
import { COUNTRIES, countryByCode, type CountryCode } from "@/lib/region";
import { DEFAULT_LOCALE, LOCALES, LOCALE_LABELS } from "@/i18n/config";
import { useT } from "@/i18n/provider";

/**
 * Region, currency and language in one place, because they are one decision to
 * the shopper. Everything here is a display preference — the copy says so, so
 * nobody mistakes it for local shipping or settlement.
 */
export function RegionSelector({ variant = "footer" }: { variant?: "header" | "footer" }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const t = useT();

  const country = useSyncExternalStore(
    usePreferences.subscribe,
    () => usePreferences.getState().country,
    () => "US" as CountryCode,
  );
  const currency = useSyncExternalStore(
    usePreferences.subscribe,
    () => usePreferences.getState().currency,
    () => "USD" as const,
  );
  const locale = useSyncExternalStore(
    usePreferences.subscribe,
    () => usePreferences.getState().locale,
    () => DEFAULT_LOCALE,
  );

  const setCountry = usePreferences((state) => state.setCountry);
  const setCurrency = usePreferences((state) => state.setCurrency);
  const setLocale = usePreferences((state) => state.setLocale);

  useEffect(() => {
    if (!open) return;

    restoreRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      restoreRef.current?.focus();
    };
  }, [open]);

  const countryName = countryByCode(country)?.name ?? country;

  return (
    <>
      {variant === "footer" ? (
        <div>
          <p className="label text-mist">{t("region.region")}</p>
          <p className="mt-4 text-[0.85rem] leading-relaxed text-ink/75">
            {countryName}
            <br />
            {currency} · {CURRENCY_LABELS[currency]}
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-label={`${countryName}, ${currency}. Change region and currency`}
            className="label mt-4 border-b border-ink/30 pb-1 text-[0.6rem] text-ink/70 transition-colors hover:border-ink hover:text-ink"
          >
            {t("action.change")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-label={`${countryName}, ${currency}. Change region and currency`}
          className="label flex items-center gap-1.5 px-2 py-2 text-[0.6rem] text-stone transition-colors hover:text-ink"
        >
          {country} · {currency}
          <ChevronDown className="size-2.5" strokeWidth={2} aria-hidden />
        </button>
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        inert={!open}
        className={cn(
          "fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label={t("action.close")}
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-ink/45 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
        />

        <div
          className={cn(
            "relative z-10 max-h-[90svh] w-full max-w-lg overflow-y-auto bg-bone p-6 transition-transform duration-400 ease-[var(--ease-editorial)] sm:p-9",
            open ? "translate-y-0" : "translate-y-full sm:translate-y-4 sm:opacity-0",
          )}
        >
          <div className="flex items-start justify-between gap-6">
            <h2 id={titleId} className="display text-[clamp(1.4rem,3vw,1.9rem)] text-ink">
              {t("region.title")}
            </h2>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("action.close")}
              className="-mt-1 -mr-1 flex size-9 shrink-0 items-center justify-center text-ink/70 transition-colors hover:text-ink"
            >
              <X className="size-4" strokeWidth={1.25} aria-hidden />
            </button>
          </div>

          <fieldset className="mt-7 border-t border-line pt-6">
            <legend className="label text-mist">{t("region.region")}</legend>
            <ul className="mt-4 space-y-1">
              {COUNTRIES.map((entry) => {
                const active = entry.code === country;
                return (
                  <li key={entry.code}>
                    <button
                      type="button"
                      onClick={() => setCountry(entry.code)}
                      aria-pressed={active}
                      // Without this the accessible name runs the country and the
                      // currency code together ("United KingdomGBP").
                      aria-label={`${entry.name}, suggested currency ${entry.currency}`}
                      className={cn(
                        "flex w-full items-center justify-between gap-4 py-2 text-left text-[0.85rem] transition-colors",
                        active ? "text-ink" : "text-stone hover:text-ink",
                      )}
                    >
                      <span>{entry.name}</span>
                      <span className="label text-[0.6rem] text-mist">{entry.currency}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <fieldset className="mt-6 border-t border-line pt-6">
            <legend className="label text-mist">{t("region.currency")}</legend>
            <ul className="mt-4 flex flex-wrap gap-2">
              {CURRENCIES.map((code) => {
                const active = code === currency;
                return (
                  <li key={code}>
                    <button
                      type="button"
                      onClick={() => setCurrency(code)}
                      aria-pressed={active}
                      className={cn(
                        "label border px-3 py-2.5 text-[0.6rem] transition-colors",
                        active ? "border-ink bg-ink text-bone" : "border-line text-ink hover:border-ink",
                      )}
                    >
                      {code} · {CURRENCY_LABELS[code]}
                    </button>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <fieldset className="mt-6 border-t border-line pt-6">
            <legend className="label text-mist">{t("region.language")}</legend>
            <ul className="mt-4 flex flex-wrap gap-2">
              {LOCALES.map((code) => {
                const active = code === locale;
                return (
                  <li key={code}>
                    <button
                      type="button"
                      onClick={() => setLocale(code)}
                      aria-pressed={active}
                      className={cn(
                        "label border px-3 py-2.5 text-[0.6rem] transition-colors",
                        active ? "border-ink bg-ink text-bone" : "border-line text-ink hover:border-ink",
                      )}
                    >
                      {LOCALE_LABELS[code]}
                    </button>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <div className="mt-7 space-y-3 border-t border-line pt-5">
            <p className="text-[0.7rem] leading-relaxed text-stone">{t("region.rateNotice")}</p>
            <p className="text-[0.7rem] leading-relaxed text-mist">{t("region.demoNotice")}</p>
          </div>
        </div>
      </div>
    </>
  );
}
