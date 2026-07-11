/** Shared demo shop rates (INR). Keep in sync with web print-config/constants. */
export const PRICE_PER_BW = 2;
export const PRICE_PER_COLOR = 8;

/**
 * Authoritative price calculation — never trust the client amount.
 */
export function computeEstimatedPrice(
  colorPages: number[],
  bwPages: number[],
  copies: number,
): number {
  const pageTotal =
    colorPages.length * PRICE_PER_COLOR + bwPages.length * PRICE_PER_BW;
  return Math.max(0, Math.round(pageTotal * copies));
}
