// =====================================================================
// AdVia Frontend — App Root
// All routes: public marketing pages, auth, and two role-protected
// dashboard sections (driver / advertiser).
// =====================================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import DriverLayout from './pages/driver/DriverLayout';
import DriverDashboardPage from './pages/driver/DriverDashboardPage';
import DriverJobsPage from './pages/driver/DriverJobsPage';
import DriverEarningsPage from './pages/driver/DriverEarningsPage';
import DriverNotificationsPage from './pages/driver/DriverNotificationsPage';
import DriverProfilePage from './pages/driver/DriverProfilePage';

import AdvertiserLayout from './pages/advertiser/AdvertiserLayout';
import AdvertiserDashboardPage from './pages/advertiser/AdvertiserDashboardPage';
import AdvertiserCampaignsPage from './pages/advertiser/AdvertiserCampaignsPage';
import AdvertiserAnalyticsPage from './pages/advertiser/AdvertiserAnalyticsPage';
import AdvertiserBillingPage from './pages/advertiser/AdvertiserBillingPage';
import AdvertiserNotificationsPage from './pages/advertiser/AdvertiserNotificationsPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Driver dashboard */}
            <Route
              path="/driver"
              element={
                <ProtectedRoute role="driver">
                  <DriverLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DriverDashboardPage />} />
              <Route path="jobs" element={<DriverJobsPage />} />
              <Route path="earnings" element={<DriverEarningsPage />} />
              <Route path="notifications" element={<DriverNotificationsPage />} />
              <Route path="profile" element={<DriverProfilePage />} />
            </Route>

            {/* Advertiser dashboard */}
            <Route
              path="/advertiser"
              element={
                <ProtectedRoute role="advertiser">
                  <AdvertiserLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdvertiserDashboardPage />} />
              <Route path="campaigns" element={<AdvertiserCampaignsPage />} />
              <Route path="analytics" element={<AdvertiserAnalyticsPage />} />
              <Route path="billing" element={<AdvertiserBillingPage />} />
              <Route path="notifications" element={<AdvertiserNotificationsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
