"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { copyrightYear, footerBrand, footerColumns, legalLinks } from "@/data/site";
import { useT } from "@/i18n/provider";
import { RegionSelector } from "./region-selector";

export function SiteFooter() {
  const t = useT();

  return (
    <footer className="border-t border-line bg-bone">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-12 md:gap-8 md:py-20">
          <div className="md:col-span-4">
            <p className="label text-[0.8rem] tracking-[0.34em] text-ink">{footerBrand.name}</p>
            <p className="display mt-6 max-w-[22ch] text-[1.75rem] text-ink">
              {footerBrand.tagline}
            </p>
            <p className="mt-6 max-w-[34ch] text-[0.85rem] leading-relaxed text-stone">
              {footerBrand.blurb}
            </p>
          </div>

          {footerColumns.map((column) => (
            <nav
              key={column.titleKey}
              aria-label={t(column.titleKey)}
              className="md:col-span-2 md:col-start-auto"
            >
              <p className="label text-mist">{t(column.titleKey)}</p>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[0.85rem] text-ink/75 transition-colors duration-200 hover:text-ink"
                    >
                      {t(link.labelKey)}
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
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-[0.75rem] text-mist">
            © {copyrightYear} {footerBrand.name}. {t("footer.rights")}
          </p>
        </div>
      </Container>
    </footer>
  );
}
