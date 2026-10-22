/** Minimal class joiner. No dependency needed for the handful of cases we hit. */
export function cn(
  ...values: Array<string | false | null | undefined>
): string {
  return values.filter(Boolean).join(" ");
}
