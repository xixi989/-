import Link from "next/link";
import { Container } from "@/components/ui/container";
import { primaryNav } from "@/data/site";
import { CartButton } from "./cart-button";
import { RegionSelector } from "./region-selector";
import { SearchTrigger } from "./search-trigger";
import { WishlistLink } from "./wishlist-link";
import { MobileNav } from "./mobile-nav";

/**
 * Server component by default: the mega menu is pure CSS (hover + focus-within),
 * so only the mobile drawer needs to ship client JavaScript.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bone">
      <Container className="relative">
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center md:h-[76px]">
          {/* Left — desktop navigation */}
          <div className="hidden md:block">
            <nav aria-label="Primary">
              <ul className="flex h-full items-stretch gap-7">
                {primaryNav.map((item) => (
                  <li key={item.label} className="group flex items-center">
                    <Link
                      href={item.href}
                      className="label py-2 text-ink/75 transition-colors duration-300 hover:text-ink group-focus-within:text-ink"
                    >
                      {item.label}
                    </Link>

                    {item.groups ? (
                      <div
                        className="pointer-events-none invisible absolute inset-x-0 top-full z-40 translate-y-[-6px] border-b border-line bg-bone opacity-0 transition-[opacity,transform] duration-300 ease-[var(--ease-editorial)] group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
                      >
                        <Container className="grid grid-cols-[1fr_1fr_1.4fr] gap-10 py-12">
                          {item.groups.map((group) => (
                            <div key={group.title}>
                              <p className="label text-mist">{group.title}</p>
                              <ul className="mt-5 space-y-3">
                                {group.links.map((link) => (
                                  <li key={link.href}>
                                    <Link
                                      href={link.href}
                                      className="text-[0.9rem] text-ink/80 transition-colors duration-200 hover:text-ink"
                                    >
                                      {link.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}

                          <div className="border-l border-line pl-10">
                            <p className="label text-mist">Featured</p>
                            <p className="display mt-5 text-3xl">
                              The AW26
                              <br />
                              atelier notes
                            </p>
                            <Link
                              href="/editorial"
                              className="label mt-6 inline-block border-b border-ink pb-1 text-ink"
                            >
                              Read the story
                            </Link>
                          </div>
                        </Container>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Left — mobile menu trigger */}
          <div className="flex md:hidden">
            <MobileNav />
          </div>

          {/* Centre — wordmark */}
          <Link
            href="/"
            aria-label="AUREL STUDIO — home"
            className="justify-self-center text-center"
          >
            <span className="label block text-[0.8rem] tracking-[0.34em] text-ink">
              Aurel Studio
            </span>
            <span className="mt-1 block text-[0.7rem] tracking-[0.28em] text-mist uppercase">
              Est. 2026
            </span>
          </Link>

          {/* Right — actions */}
          <div className="flex items-center justify-end gap-1 md:gap-2">
            <div className="hidden lg:block">
              <RegionSelector variant="header" />
            </div>
            <SearchTrigger />
            <WishlistLink />
            <CartButton />
          </div>
        </div>
      </Container>
    </header>
  );
}
