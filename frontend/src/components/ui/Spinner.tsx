// Spinner — subtle loading indicator (D-12).
//
// CSS-only animated circle using Tailwind's `animate-spin`. Small (w-4 h-4)
// in the amber-400 accent so it stays "subtle" — the parent component decides
// placement. Per D-12 the spinner overlays/ accompanies a refresh WITHOUT
// replacing chart content, so this component renders nothing but the spinner
// itself (no text, no container padding).
//
// Source: 02-05-PLAN.md Task 1 (D-12) + 02-CONTEXT.md D-12.

export function Spinner() {
  return (
    <div
      className="flex items-center justify-center"
      role="status"
      aria-label="Memuat"
    >
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
    </div>
  );
}
