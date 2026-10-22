import { Container } from "@/components/ui/container";
import { NewsletterForm } from "./newsletter-form";

export function Newsletter() {
  return (
    <section aria-labelledby="newsletter-heading" className="border-t border-line py-20 md:py-24">
      <Container>
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <h2
              id="newsletter-heading"
              className="display text-[clamp(1.6rem,2.8vw,2.35rem)] text-ink"
            >
              Notes from the studio, once a month.
            </h2>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <NewsletterForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
