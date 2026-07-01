// App — router + protected-route shell.
//
// Routes:
//   /login     → LoginPage (bounces to /dashboard if already authenticated)
//   /dashboard → ProtectedRoute → DashboardLayout + DashboardPage
//   /e-report  → ProtectedRoute → DashboardLayout + EReportPage
//   /          → Navigate to /dashboard (which itself redirects to /login
//                when unauthenticated, satisfying the must_have truth
//                "Visiting / redirects unauthenticated users to /login")
//   *          → Navigate to /dashboard
//
// ProtectedRoute reads useAuth(); unauthenticated users are redirected to
// /login (T-02-12 mitigation). The login page uses its own layout — the
// DashboardLayout (sidebar + header) wraps only authenticated pages.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EReportPage } from './pages/EReportPage';
import { DataManagementPage } from './pages/DataManagementPage';
import { CateringPage } from './pages/CateringPage';
import DashboardPage from './pages/DashboardPage';
import { DashboardLayout } from './components/layout/DashboardLayout';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/e-report"
          element={
            <ProtectedRoute>
              <EReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data"
          element={
            <ProtectedRoute>
              <DataManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/catering"
          element={
            <ProtectedRoute>
              <CateringPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/data-entry" element={<Navigate to="/data" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
