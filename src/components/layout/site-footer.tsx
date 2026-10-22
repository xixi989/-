import Link from "next/link";
import { Container } from "@/components/ui/container";
import { copyrightYear, footerColumns, legalLinks } from "@/data/site";
import { RegionSelector } from "./region-selector";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-bone">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-12 md:gap-8 md:py-20">
          <div className="md:col-span-4">
            <p className="label text-[0.8rem] tracking-[0.34em] text-ink">Aurel Studio</p>
            <p className="display mt-6 max-w-[22ch] text-[1.75rem] text-ink">
              Designed for the way you live.
            </p>
            <p className="mt-6 max-w-[34ch] text-[0.85rem] leading-relaxed text-stone">
              A small studio making fewer, better clothes — cut in natural fibres and
              finished by hand in limited runs.
            </p>
          </div>

          {footerColumns.map((column) => (
            <nav
              key={column.title}
              aria-label={column.title}
              className="md:col-span-2 md:col-start-auto"
            >
              <p className="label text-mist">{column.title}</p>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[0.85rem] text-ink/75 transition-colors duration-200 hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="md:col-span-2">
            <RegionSelector variant="footer" />
          </div>
        </div>

        <div className="flex flex-col gap-5 border-t border-line py-7 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[0.75rem] text-mist transition-colors duration-200 hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-[0.75rem] text-mist">
            © {copyrightYear} Aurel Studio. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
