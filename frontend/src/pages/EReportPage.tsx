// EReportPage — placeholder for Phase 3.
//
// Renders a simple "coming in Phase 3" message. The sidebar/header chrome is
// provided by DashboardLayout via the ProtectedRoute wrapper in App.tsx, so
// this component only supplies the page body.

export function EReportPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-lg text-gray-300">
        E-Report akan tersedia di Phase 3
      </p>
    </div>
  );
}
