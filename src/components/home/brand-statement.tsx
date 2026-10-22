import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

const pillars = [
  {
    title: "Natural fibres only",
    body: "Cotton, wool and linen from mills we have visited. No blends that pill, nothing that needs dry cleaning to survive a year.",
  },
  {
    title: "Cut for real days",
    body: "Every pattern is tested on bodies that sit, cycle and carry children — not on a sample size photographed once.",
  },
  {
    title: "Small, deliberate runs",
    body: "We produce in short runs and restock only what earns it. Fewer pieces, worn far more often.",
  },
];

export function BrandStatement() {
  return (
    <section aria-labelledby="approach-heading" className="py-24 md:py-36">
      <Container>
        <div className="grid gap-10 md:grid-cols-12">
          <p className="label text-mist md:col-span-2">Our approach</p>

          <div className="md:col-span-8 md:col-start-4">
            <Reveal>
              <h2
                id="approach-heading"
                className="display text-[clamp(1.7rem,3.8vw,3.1rem)] text-ink"
              >
                We make fewer things, and we make them to be worn for years.
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
              {pillars.map((pillar, index) => (
                <Reveal key={pillar.title} delayMs={index * 80}>
                  <div className="border-t border-line pt-5">
                    <h3 className="text-[0.9rem] text-ink">{pillar.title}</h3>
                    <p className="mt-3 text-[0.8rem] leading-relaxed text-stone">
                      {pillar.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
