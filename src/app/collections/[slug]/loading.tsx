import { Container } from "@/components/ui/container";

/**
 * Skeleton that mirrors the real grid, so the layout does not jump when the
 * filtered view resolves.
 */
export default function CollectionLoading() {
  return (
    <div className="pb-24 md:pb-32">
      <Container>
        <div className="pt-8 md:pt-10">
          <div className="h-3 w-32 animate-pulse bg-sand" />
        </div>

        <div className="mt-8 md:mt-12">
          <div className="h-10 w-2/3 animate-pulse bg-sand md:h-14" />
          <div className="mt-5 h-3 w-1/2 animate-pulse bg-sand" />
        </div>

        <div className="mt-10 h-11 border-y border-line" />

        <div className="mt-10 flex gap-10 lg:mt-12">
          <div className="hidden w-[210px] shrink-0 space-y-3 lg:block">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-3.5 animate-pulse bg-sand" />
            ))}
          </div>

          <div className="min-w-0 flex-1">
            <div className="h-3 w-24 animate-pulse bg-sand" />
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <li key={index}>
                  <div className="aspect-3/4 animate-pulse bg-sand" />
                  <div className="mt-4 h-3 w-3/4 animate-pulse bg-sand" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </div>
  );
}
