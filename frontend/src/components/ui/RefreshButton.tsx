// RefreshButton — manual refresh trigger (D-11) with loading feedback (D-12).
//
// Props:
//   - onClick: called when the user clicks the button (wired to useDashboard's
//              `refresh` in DashboardPage).
//   - loading: when true, the button is disabled, the icon swaps to <Spinner/>,
//              and the label becomes "Memperbarui..." so the user sees the
//              refresh is in flight (D-12 subtle indicator).
//
// Label is Indonesian ("Segarkan" = Refresh). Source: 02-05-PLAN.md Task 1.

import { Spinner } from './Spinner';

interface RefreshButtonProps {
  onClick: () => void;
  loading?: boolean;
}

export function RefreshButton({ onClick, loading = false }: RefreshButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label="Segarkan data"
      className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <Spinner />
          <span>Memperbarui...</span>
        </>
      ) : (
        <>
          <span aria-hidden="true">🔄</span>
          <span>Segarkan</span>
        </>
      )}
    </button>
  );
}
