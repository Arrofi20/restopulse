// Rupiah formatting utilities.
// Source: RESEARCH.md § Code Examples (lines 537-565) + PATTERNS.md §11.
// Uses Intl.NumberFormat('id-ID') for locale-correct thousands separator (.)
// and currency symbol placement ("Rp 1.234.567").

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Format a number as Rupiah, e.g. formatRupiah(1234567) -> "Rp 1.234.567".
 * Revenue should never be negative; no special-casing for negatives.
 */
export function formatRupiah(amount: number): string {
  return rupiahFormatter.format(amount);
}

/**
 * Compact Rupiah for chart axis labels / tight UI:
 * - >= 1 billion  -> "Rp 1,2 M"
 * - >= 1 million  -> "Rp 12,3 jt"
 * - otherwise     -> falls back to formatRupiah
 */
export function formatCompactRupiah(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} jt`;
  }
  return formatRupiah(amount);
}
