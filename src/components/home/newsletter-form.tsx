"use client";

import { useId, useState } from "react";

/**
 * Demo-only signup: no network call, no email stored. Phase 5 replaces the
 * handler with the real newsletter endpoint.
 */
export function NewsletterForm() {
  const inputId = useId();
  const [status, setStatus] = useState<"idle" | "done">("idle");

  if (status === "done") {
    return (
      <p
        role="status"
        className="border-t border-ink pt-5 text-[0.9rem] leading-relaxed text-ink"
      >
        Thank you — you are on the list. Look out for the next set of studio notes.
      </p>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setStatus("done");
      }}
    >
      <label htmlFor={inputId} className="label text-mist">
        Email address
      </label>

      <div className="mt-4 flex items-center gap-6 border-b border-ink/35 pb-3 transition-colors focus-within:border-ink">
        <input
          id={inputId}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full bg-transparent text-[0.95rem] text-ink placeholder:text-stone focus:outline-none"
        />
        <button
          type="submit"
          className="label shrink-0 text-ink transition-opacity duration-300 hover:opacity-60"
        >
          Subscribe
        </button>
      </div>

      <p className="mt-4 text-[0.75rem] leading-relaxed text-mist">
        By subscribing you agree to our privacy policy. One email a month, no more.
      </p>
    </form>
  );
}
