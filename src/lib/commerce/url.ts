/**
 * Filter URLs are built from the pathname plus a query string. On `/search`
 * there is an extra `q` that must survive every filter change, so these helpers
 * read the live URL instead of threading searchParams through every component
 * (which would force a Suspense boundary on prerendered collection pages).
 */

export function currentParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

export function withPreservedQuery(pathname: string, query: string): string {
  const keyword = currentParam("q");
  if (!keyword) return query ? `${pathname}${query}` : pathname;

  const filters = query.startsWith("?") ? query.slice(1) : query;
  return `${pathname}?${filters ? `${filters}&` : ""}q=${encodeURIComponent(keyword)}`;
}
