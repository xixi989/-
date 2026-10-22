"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { SIZE_CODES } from "@/types/commerce";

const TOPS = [
  { size: "XS", chest: "82–86", length: "62" },
  { size: "S", chest: "86–90", length: "64" },
  { size: "M", chest: "90–96", length: "66" },
  { size: "L", chest: "96–102", length: "68" },
  { size: "XL", chest: "102–108", length: "70" },
];

const BOTTOMS = [
  { size: "XS", waist: "62–66", inseam: "76" },
  { size: "S", waist: "66–70", inseam: "77" },
  { size: "M", waist: "70–76", inseam: "78" },
  { size: "L", waist: "76–82", inseam: "79" },
  { size: "XL", waist: "82–88", inseam: "80" },
];

export function SizeGuide({ onClose }: { onClose: () => void }) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close size guide"
        onClick={onClose}
        className="absolute inset-0 bg-ink/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto bg-bone p-6 sm:p-10"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="label text-mist">Size guide</p>
            <h2 id={titleId} className="display mt-3 text-[clamp(1.4rem,3vw,2rem)] text-ink">
              Measurements in centimetres
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mt-1 -mr-1 flex size-9 shrink-0 items-center justify-center text-ink/70 transition-colors hover:text-ink"
          >
            <X className="size-4" strokeWidth={1.25} aria-hidden />
          </button>
        </div>

        <p className="mt-4 text-[0.8rem] leading-relaxed text-stone">
          Measured flat on the garment, not on the body. If you are between sizes,
          take the smaller one for knitwear and the larger one for outerwear.
        </p>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="label mb-3 text-left text-mist">Tops &amp; knitwear</caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="label py-2 pr-4 text-[0.6rem] text-stone">Size</th>
                <th scope="col" className="label py-2 pr-4 text-[0.6rem] text-stone">Chest</th>
                <th scope="col" className="label py-2 text-[0.6rem] text-stone">Body length</th>
              </tr>
            </thead>
            <tbody>
              {TOPS.map((row) => (
                <tr key={row.size} className="border-b border-line/60">
                  <th scope="row" className="py-2.5 pr-4 text-[0.8rem] font-medium text-ink">
                    {row.size}
                  </th>
                  <td className="tnum py-2.5 pr-4 text-[0.8rem] text-stone">{row.chest}</td>
                  <td className="tnum py-2.5 text-[0.8rem] text-stone">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="label mb-3 text-left text-mist">Trousers</caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="label py-2 pr-4 text-[0.6rem] text-stone">Size</th>
                <th scope="col" className="label py-2 pr-4 text-[0.6rem] text-stone">Waist</th>
                <th scope="col" className="label py-2 text-[0.6rem] text-stone">Inseam</th>
              </tr>
            </thead>
            <tbody>
              {BOTTOMS.map((row) => (
                <tr key={row.size} className="border-b border-line/60">
                  <th scope="row" className="py-2.5 pr-4 text-[0.8rem] font-medium text-ink">
                    {row.size}
                  </th>
                  <td className="tnum py-2.5 pr-4 text-[0.8rem] text-stone">{row.waist}</td>
                  <td className="tnum py-2.5 text-[0.8rem] text-stone">{row.inseam}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-[0.7rem] text-mist">
          Sizes run {SIZE_CODES.join(" · ")}. Footwear is sized 40–45 EU.
        </p>
      </div>
    </div>
  );
}
