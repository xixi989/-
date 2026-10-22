import { describe, expect, it } from "vitest";
import type { Product, SizeCode } from "@/types/commerce";
import {
  applyFilters,
  buildQuery,
  colorFacets,
  filterAndSort,
  parseFilters,
  parseSort,
  sizeFacets,
  sortProducts,
  toggleValue,
  activeFilterCount,
  EMPTY_FILTERS,
} from "./filters";

function product(
  slug: string,
  options: {
    price: number;
    colors?: string[];
    sizes?: SizeCode[];
    soldOutSizes?: SizeCode[];
    isNew?: boolean;
    isBestSeller?: boolean;
    releasedAt?: string;
  },
): Product {
  const sizes = options.sizes ?? ["S", "M", "L"];
  const colors = options.colors ?? ["bone"];
  const soldOut = options.soldOutSizes ?? [];

  return {
    id: `id-${slug}`,
    slug,
    title: slug,
    subtitle: "",
    description: "",
    category: "women",
    collections: ["women"],
    tags: [],
    price: { amount: options.price, currency: "USD" },
    colors: colors.map((slug) => ({
      name: slug,
      slug,
      hex: "#000",
      images: [{ src: "/images/x.jpg", alt: slug }],
    })),
    sizes,
    variants: colors.flatMap((color) =>
      sizes.map((size) => ({
        id: `${slug}-${color}-${size}`,
        sku: `${slug}-${color}-${size}`,
        colorSlug: color,
        size,
        price: { amount: options.price, currency: "USD" as const },
        inventory: soldOut.includes(size) ? 0 : 6,
      })),
    ),
    material: "",
    careInstructions: [],
    fit: "",
    isNew: options.isNew ?? false,
    isBestSeller: options.isBestSeller ?? false,
    releasedAt: options.releasedAt ?? "2026-01-01",
  };
}

describe("parseFilters / buildQuery", () => {
  it("reads lists from the query string", () => {
    const params = new URLSearchParams("color=bone,ink&size=M,L&price=under-100");
    expect(parseFilters(params)).toEqual({
      colors: ["bone", "ink"],
      sizes: ["M", "L"],
      priceBands: ["under-100"],
    });
  });

  it("drops values it does not recognise instead of trusting the URL", () => {
    const params = new URLSearchParams("size=XXXL&price=free&color=bone");
    expect(parseFilters(params)).toEqual({
      colors: ["bone"],
      sizes: [],
      priceBands: [],
    });
  });

  it("parses sort with a safe default", () => {
    expect(parseSort(new URLSearchParams("sort=price-asc"))).toBe("price-asc");
    expect(parseSort(new URLSearchParams("sort=nonsense"))).toBe("featured");
    expect(parseSort(new URLSearchParams())).toBe("featured");
  });

  it("omits default sort and empty filters", () => {
    expect(buildQuery(EMPTY_FILTERS, "featured")).toBe("");
  });

  it("orders sizes by the canonical size run, not alphabetically", () => {
    const query = buildQuery({ colors: [], sizes: ["L", "XS", "M"], priceBands: [] }, "newest");
    expect(query).toBe("?size=XS,M,L&sort=newest");
  });

  it("round-trips what it writes", () => {
    const filters = { colors: ["ink", "bone"], sizes: ["M" as SizeCode], priceBands: ["over-200"] };
    const query = buildQuery(filters, "price-desc");
    const parsed = parseFilters(new URLSearchParams(query.slice(1)));
    expect(parsed.colors).toEqual(["bone", "ink"]); // buildQuery sorts colour slugs
    expect(parsed.sizes).toEqual(["M"]);
    expect(parsed.priceBands).toEqual(["over-200"]);
    expect(query).toBe("?color=bone,ink&size=M&price=over-200&sort=price-desc");
  });
});

describe("applyFilters", () => {
  const products = [
    product("bone-tee", { price: 6800, colors: ["bone", "ink"] }),
    product("ink-coat", { price: 42000, colors: ["ink"] }),
    product("oat-knit", { price: 15000, colors: ["oat"] }),
    product("sold-out-tee", { price: 5000, soldOutSizes: ["M", "L"] }),
  ];

  it("returns everything with no filters", () => {
    expect(applyFilters(products, EMPTY_FILTERS)).toHaveLength(4);
  });

  it("matches any selected colour", () => {
    const result = applyFilters(products, { ...EMPTY_FILTERS, colors: ["ink"] });
    expect(result.map((entry) => entry.slug)).toEqual(["bone-tee", "ink-coat"]);
  });

  it("requires every selected size to be buyable", () => {
    const result = applyFilters(products, { ...EMPTY_FILTERS, sizes: ["M", "L"] });
    // sold-out-tee offers M and L but neither is in stock, so it is excluded.
    expect(result.map((entry) => entry.slug)).toEqual(["bone-tee", "ink-coat", "oat-knit"]);
  });

  it("excludes a product whose size is offered but out of stock", () => {
    const result = applyFilters(products, { ...EMPTY_FILTERS, sizes: ["L"] });
    expect(result.some((entry) => entry.slug === "sold-out-tee")).toBe(false);
  });

  it("treats price bands as half-open ranges", () => {
    const under = applyFilters(products, { ...EMPTY_FILTERS, priceBands: ["under-100"] });
    expect(under.map((entry) => entry.slug).sort()).toEqual(["bone-tee", "sold-out-tee"]);

    const mid = applyFilters(products, { ...EMPTY_FILTERS, priceBands: ["100-200"] });
    // 15000 lands in 100–200; 10000 exactly would also belong here, not below.
    expect(mid.map((entry) => entry.slug)).toEqual(["oat-knit"]);
  });

  it("unions multiple price bands", () => {
    const result = applyFilters(products, { ...EMPTY_FILTERS, priceBands: ["under-100", "over-200"] });
    expect(result.map((entry) => entry.slug)).toEqual(["bone-tee", "ink-coat", "sold-out-tee"]);
  });

  it("combines colour and price with AND", () => {
    const result = applyFilters(products, {
      colors: ["ink"],
      sizes: [],
      priceBands: ["under-100"],
    });
    expect(result.map((entry) => entry.slug)).toEqual(["bone-tee"]);
  });
});

describe("sortProducts", () => {
  const products = [
    product("mid", { price: 15000, releasedAt: "2026-05-01" }),
    product("cheap-new", { price: 5000, releasedAt: "2026-09-01", isNew: true }),
    product("pricey-best", { price: 40000, releasedAt: "2026-03-01", isBestSeller: true }),
  ];

  it("sorts by price both ways", () => {
    expect(sortProducts(products, "price-asc").map((entry) => entry.slug)).toEqual([
      "cheap-new",
      "mid",
      "pricey-best",
    ]);
    expect(sortProducts(products, "price-desc").map((entry) => entry.slug)).toEqual([
      "pricey-best",
      "mid",
      "cheap-new",
    ]);
  });

  it("sorts newest first by release date", () => {
    expect(sortProducts(products, "newest").map((entry) => entry.slug)).toEqual([
      "cheap-new",
      "mid",
      "pricey-best",
    ]);
  });

  it("puts best sellers ahead of new arrivals for the featured order", () => {
    expect(sortProducts(products, "featured").map((entry) => entry.slug)).toEqual([
      "pricey-best",
      "cheap-new",
      "mid",
    ]);
  });

  it("does not mutate the input array", () => {
    const original = [...products];
    sortProducts(products, "price-asc");
    expect(products).toEqual(original);
  });
});

describe("facets and helpers", () => {
  const products = [
    product("a", { price: 100, colors: ["bone", "ink"], sizes: ["S", "M"] }),
    product("b", { price: 200, colors: ["bone"], sizes: ["M", "L"] }),
  ];

  it("counts how many products carry each colour", () => {
    const facets = colorFacets(products);
    expect(facets.find((entry) => entry.slug === "bone")?.count).toBe(2);
    expect(facets.find((entry) => entry.slug === "ink")?.count).toBe(1);
  });

  it("returns sizes in canonical order", () => {
    expect(sizeFacets(products)).toEqual(["S", "M", "L"]);
  });

  it("counts active filters and toggles values", () => {
    expect(activeFilterCount({ colors: ["a"], sizes: ["M"], priceBands: ["x"] })).toBe(3);
    expect(toggleValue(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleValue(["a", "b"], "a")).toEqual(["b"]);
  });

  it("filters and sorts in one call", () => {
    const result = filterAndSort(products, { ...EMPTY_FILTERS, colors: ["bone"] }, "price-desc");
    expect(result.map((entry) => entry.slug)).toEqual(["b", "a"]);
  });
});
