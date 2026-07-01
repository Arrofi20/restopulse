// Sidebar — left navigation with Dashboard + E-Report links (D-14),
// mobile hamburger overlay (D-15), and logout at the bottom (D-18).
//
// Responsive behavior (RESEARCH.md Anti-Patterns: "Tailwind responsive
// classes + React state"):
//   - Desktop (lg+): always-visible static sidebar, w-64, full height.
//   - Mobile (<lg): fixed overlay that slides in from the left; a dark
//     backdrop behind it closes the menu on click. A × button sits in the
//     top-right corner of the sidebar.

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinkBase =
  'flex items-center gap-3 px-3 py-3 rounded-md text-base transition-colors';

function navLinkClass(isActive: boolean): string {
  return isActive
    ? `${navLinkBase} bg-gray-800 text-amber-400`
    : `${navLinkBase} text-gray-400 hover:bg-gray-800 hover:text-white`;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile backdrop — clicking it closes the overlay. */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-800 bg-gray-900 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand + mobile close button */}
        <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
          <span className="text-lg font-bold text-amber-400">RestoPulse</span>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] text-2xl leading-none text-gray-400 hover:text-white lg:hidden"
            aria-label="Tutup menu"
          >
            ×
          </button>
        </div>

        {/* Primary navigation (D-14) */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className={({ isActive }) => navLinkClass(isActive)}
          >
            <span aria-hidden="true">📊</span>
            <span>Dasbor</span>
          </NavLink>
          <NavLink
            to="/e-report"
            onClick={onClose}
            className={({ isActive }) => navLinkClass(isActive)}
          >
            <span aria-hidden="true">📄</span>
            <span>E-Report</span>
          </NavLink>
          <NavLink
            to="/data"
            onClick={onClose}
            className={({ isActive }) => navLinkClass(isActive)}
          >
            <span aria-hidden="true">🗂️</span>
            <span>Data Management</span>
          </NavLink>
          <NavLink
            to="/catering"
            onClick={onClose}
            className={({ isActive }) => navLinkClass(isActive)}
          >
            <span aria-hidden="true">🍽️</span>
            <span>Catering</span>
          </NavLink>
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) => navLinkClass(isActive)}
          >
            <span aria-hidden="true">⚙️</span>
            <span>Settings</span>
          </NavLink>
        </nav>

        {/* Logout at the bottom (D-18) */}
        <div className="border-t border-gray-800 px-2 py-4">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          >
            <span aria-hidden="true">🚪</span>
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
