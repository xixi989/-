import { describe, expect, it } from "vitest";
import { catalog } from "@/data/catalog";
import { searchProducts, normalizeQuery, rankProducts } from "./search";

describe("normalizeQuery", () => {
  it("trims, lowercases and collapses whitespace", () => {
    expect(normalizeQuery("  Wool   COAT  ")).toBe("wool coat");
  });

  it("returns an empty string for whitespace only", () => {
    expect(normalizeQuery("   ")).toBe("");
  });
});

describe("searchProducts", () => {
  it("returns nothing for an empty or blank query", () => {
    expect(searchProducts(catalog, "")).toEqual([]);
    expect(searchProducts(catalog, "   ")).toEqual([]);
  });

  it("finds a product by name", () => {
    const results = searchProducts(catalog, "overcoat");
    expect(results[0]?.slug).toBe("wool-overcoat");
  });

  it("ignores case", () => {
    const lower = searchProducts(catalog, "wool overcoat").map((p) => p.slug);
    const upper = searchProducts(catalog, "WOOL OVERCOAT").map((p) => p.slug);
    expect(upper).toEqual(lower);
    expect(upper).toContain("wool-overcoat");
  });

  it("finds every product in a category when the category is searched", () => {
    const inCategory = catalog
      .filter((product) => product.collections.includes("knitwear"))
      .map((product) => product.slug);
    const found = searchProducts(catalog, "knitwear").map((product) => product.slug);

    expect(inCategory.length).toBeGreaterThan(0);
    for (const slug of inCategory) expect(found).toContain(slug);
  });

  it("matches a tag or fabric", () => {
    const results = searchProducts(catalog, "linen");
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every((product) =>
        `${product.tags.join(" ")} ${product.material} ${product.title}`.toLowerCase().includes("linen"),
      ),
    ).toBe(true);
  });

  it("matches a colour name", () => {
    const results = searchProducts(catalog, "espresso");
    expect(results.length).toBeGreaterThan(0);
  });

  it("requires every token to match, so multi-word queries stay precise", () => {
    const both = searchProducts(catalog, "wool tee");
    expect(both).toEqual([]);
  });

  it("returns nothing for a query that matches no field", () => {
    expect(searchProducts(catalog, "spacesuit")).toEqual([]);
  });

  it("ranks the intended product first and returns a positive score", () => {
    const ranked = rankProducts(catalog, "wool overcoat");
    expect(ranked[0].product.slug).toBe("wool-overcoat");
    expect(ranked[0].score).toBeGreaterThan(0);
  });

  it("orders a single-word search by score, best match first", () => {
    const ranked = rankProducts(catalog, "cotton");
    expect(ranked.length).toBeGreaterThan(1);
    for (let i = 1; i < ranked.length; i += 1) {
      expect(ranked[i - 1].score).toBeGreaterThanOrEqual(ranked[i].score);
    }
  });

  it("respects a result limit", () => {
    expect(searchProducts(catalog, "cotton", 2)).toHaveLength(2);
    expect(searchProducts(catalog, "cotton").length).toBeGreaterThanOrEqual(2);
  });
});
