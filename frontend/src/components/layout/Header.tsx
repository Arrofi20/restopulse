// Header — top bar with editable outlet name and user identity (D-17).
//
// Always visible on all pages (desktop and mobile). On mobile the left side
// shows a hamburger button that toggles the sidebar overlay.
//
// Outlet name is editable inline: click to edit, press Enter or blur to save,
// press Escape to cancel.

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { get, patch } from '../../api/client';

interface HeaderProps {
  onMenuClick: () => void;
}

interface OutletData {
  success: boolean;
  data: {
    id: string;
    name: string;
    timezone: string;
  };
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const [outletName, setOutletName] = useState('Resto Utama');
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch current outlet name on mount
  useEffect(() => {
    get<OutletData>('/outlet')
      .then((res) => {
        if (res.success && res.data.name) {
          setOutletName(res.data.name);
        }
      })
      .catch(() => {
        // Silently fall back to default if fetch fails
      });
  }, []);

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = useCallback(() => {
    setEditValue(outletName);
    setIsEditing(true);
  }, [outletName]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditValue('');
  }, []);

  const saveOutletName = useCallback(async () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === outletName) {
      cancelEditing();
      return;
    }

    setIsSaving(true);
    try {
      const res = await patch<OutletData>('/outlet', { name: trimmed });
      if (res.success) {
        setOutletName(res.data.name);
      }
    } catch {
      // Silently revert on error
    } finally {
      setIsSaving(false);
      setIsEditing(false);
      setEditValue('');
    }
  }, [editValue, outletName, cancelEditing]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveOutletName();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEditing();
      }
    },
    [saveOutletName, cancelEditing]
  );

  const handleBlur = useCallback(() => {
    saveOutletName();
  }, [saveOutletName]);

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-gray-900 px-4">
      {/* Left: hamburger (mobile only) + outlet name */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex items-center justify-center min-w-[44px] min-h-[44px] text-2xl leading-none text-gray-300 hover:text-white lg:hidden"
          aria-label="Buka menu"
        >
          ☰
        </button>

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            disabled={isSaving}
            className="w-48 rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-lg font-semibold text-white outline-none ring-amber-500/50 focus:border-amber-500 focus:ring-1 disabled:opacity-50"
            aria-label="Nama outlet"
          />
        ) : (
          <button
            type="button"
            onClick={startEditing}
            className="text-lg font-semibold text-white hover:text-amber-400 transition-colors cursor-pointer"
            title="Klik untuk mengedit nama outlet"
          >
            {outletName}
          </button>
        )}
      </div>

      {/* Right: username */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-300">
          {user?.username ?? '...'}
        </span>
      </div>
    </header>
  );
}
