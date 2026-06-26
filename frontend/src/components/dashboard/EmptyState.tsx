// EmptyState — shown when the selected date range has no sales data (D-09).
//
// Renders the exact Indonesian message from D-09 plus a sub-message and an
// optional "Tambah Data" CTA button. When `onAddData` is not provided the CTA
// is hidden but the message still renders (e.g. when there is no data-entry
// destination to route to).
//
// Source: 02-05-PLAN.md Task 1 (D-09) + 02-CONTEXT.md D-09.

interface EmptyStateProps {
  onAddData?: () => void;
}

export function EmptyState({ onAddData }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-5xl" aria-hidden="true">
        📊
      </div>
      <p className="text-lg text-gray-300">
        Belum ada data penjualan untuk periode ini
      </p>
      <p className="mt-1 text-sm text-gray-500">
        Gunakan formulir input data atau suntik data simulasi untuk memulai.
      </p>
      {onAddData && (
        <button
          type="button"
          onClick={onAddData}
          className="mt-6 rounded-lg bg-amber-500 px-4 py-2 font-semibold text-black transition-colors hover:bg-amber-400"
        >
          Tambah Data
        </button>
      )}
    </div>
  );
}
