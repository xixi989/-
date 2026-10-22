import type { Product } from "@/types/commerce";

/** Material, care and delivery, kept as real content rather than an accordion. */
export function ProductDetails({ product }: { product: Product }) {
  return (
    <section aria-labelledby="details-heading" className="mt-20 border-t border-line pt-12 md:mt-28">
      <h2 id="details-heading" className="label text-mist">
        Details &amp; care
      </h2>

      <div className="mt-8 grid gap-10 md:grid-cols-3 md:gap-8">
        <div>
          <h3 className="text-[0.9rem] text-ink">Material</h3>
          <p className="mt-3 text-[0.8rem] leading-relaxed text-stone">{product.material}</p>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            {product.tags.map((tag) => (
              <li key={tag} className="label text-[0.6rem] text-mist">
                {tag}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[0.9rem] text-ink">Care</h3>
          <ul className="mt-3 space-y-2">
            {product.careInstructions.map((instruction) => (
              <li key={instruction} className="text-[0.8rem] leading-relaxed text-stone">
                {instruction}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[0.9rem] text-ink">Shipping &amp; returns</h3>
          <ul className="mt-3 space-y-2 text-[0.8rem] leading-relaxed text-stone">
            <li>Complimentary shipping on orders over $150.</li>
            <li>Dispatched within 1–2 working days from the studio.</li>
            <li>Free returns within 30 days, unworn and with tags attached.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
