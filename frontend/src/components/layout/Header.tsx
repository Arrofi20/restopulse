// Header — top bar with outlet name, user identity, and logout button (D-17).
//
// Always visible on all pages (desktop and mobile). On mobile the left side
// shows a hamburger button that toggles the sidebar overlay; the header
// logout button is hidden on mobile because the sidebar already has one
// (D-18), avoiding duplicate controls on small screens.

import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-gray-900 px-4">
      {/* Left: hamburger (mobile only) + outlet name */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="text-2xl leading-none text-gray-300 hover:text-white lg:hidden"
          aria-label="Buka menu"
        >
          ☰
        </button>
        <span className="text-lg font-semibold text-white">
          {/* Outlet name — hardcoded for now; Plan 02-04 wires this to the
              dashboard API data (D-17: outlet name from data). */}
          Resto Utama
        </span>
      </div>

      {/* Right: username + logout (logout hidden on mobile — sidebar has it) */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-300">
          {user?.username ?? '...'}
        </span>
        <button
          type="button"
          onClick={logout}
          className="hidden rounded-md px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white lg:block"
        >
          Keluar
        </button>
      </div>
    </header>
  );
}
