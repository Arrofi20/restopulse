// DashboardLayout — composes Sidebar + Header + scrollable main content area.
//
// This is the shell for every authenticated page. Per D-16 the chart grid
// itself is the responsibility of DashboardPage; this layout only provides
// the sidebar/header chrome and a padded main slot for page content.
//
// Layout: a flex row at h-screen. The sidebar is a static flex child on
// desktop (w-64) and a fixed overlay on mobile. The right column is a flex
// column containing the header (fixed height) and the scrollable main area.

import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
