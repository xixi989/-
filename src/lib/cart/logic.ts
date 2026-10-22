import type { CartLine } from "@/types/commerce";

/**
 * Pure cart reducers. The Zustand store is a thin wrapper around these, which is
 * what makes the merge/clamp rules testable without a browser or a store.
 */

export function addLineToCart(lines: CartLine[], incoming: CartLine): CartLine[] {
  const quantity = Math.min(incoming.quantity, incoming.maxQuantity);
  if (quantity <= 0) return lines;

  const existing = lines.find((line) => line.variantId === incoming.variantId);
  if (!existing) return [...lines, { ...incoming, quantity }];

  // Same SKU again: merge and clamp to what is actually on hand.
  return lines.map((line) =>
    line.variantId === incoming.variantId
      ? { ...line, quantity: Math.min(line.quantity + incoming.quantity, line.maxQuantity) }
      : line,
  );
}

export function removeLineFromCart(lines: CartLine[], variantId: string): CartLine[] {
  return lines.filter((line) => line.variantId !== variantId);
}

export function setLineQuantity(
  lines: CartLine[],
  variantId: string,
  quantity: number,
): CartLine[] {
  if (quantity <= 0) return removeLineFromCart(lines, variantId);

  return lines.map((line) =>
    line.variantId === variantId
      ? { ...line, quantity: Math.min(quantity, line.maxQuantity) }
      : line,
  );
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.unitPrice.amount * line.quantity, 0);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export const FREE_SHIPPING_THRESHOLD = 15000;
