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

// Locale-aware one-decimal formatter for compact Rupiah. Indonesian (id-ID)
// uses a comma as the decimal separator, so 12.0 -> "12,0" (NOT "12.0").
// `.toFixed(1)` would always emit a dot — wrong for the target locale and
// for the chart axis labels (plan: "Rp 12,3 jt"). One formatter instance,
// reused by both compact branches below.
const compactDecimalFormatter = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/**
 * Compact Rupiah for chart axis labels / tight UI:
 * - >= 1 billion  -> "Rp 1,2 M"
 * - >= 1 million  -> "Rp 12,3 jt"
 * - otherwise     -> falls back to formatRupiah
 *
 * Decimal separator is the Indonesian comma (not a dot) — verified by
 * Intl.NumberFormat('id-ID'). (Fixed in Plan 02-05: the original `.toFixed(1)`
 * emitted a dot, e.g. "Rp 12.0 jt", which is locale-incorrect.)
 */
export function formatCompactRupiah(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp ${compactDecimalFormatter.format(amount / 1_000_000_000)} M`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${compactDecimalFormatter.format(amount / 1_000_000)} jt`;
  }
  // Fallback for sub-million values: use the SAME regular-space id-ID grouping
  // pattern as the compact branches above. We deliberately do NOT delegate to
  // formatRupiah here — formatRupiah uses the currency-style formatter which
  // emits a non-breaking space (U+00A0) between "Rp" and the amount, while the
  // compact branches use a regular space. Delegating would mix NBSP and
  // regular-space outputs within one function (invisible to users but
  // inconsistent). Keeping a single regular-space pattern makes the compact
  // formatter self-consistent for chart axis labels.
  return `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;
}
