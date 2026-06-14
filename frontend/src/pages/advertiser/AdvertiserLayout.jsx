// =====================================================================
// AdVia Frontend — Advertiser Layout
// Wraps all /advertiser/* pages with the sidebar.
// =====================================================================
import { Outlet } from 'react-router-dom';
import { FaChartPie, FaBullhorn, FaChartLine, FaFileInvoiceDollar, FaBell } from 'react-icons/fa';
import DashboardSidebar from '../../components/DashboardSidebar';
import useNotifications from '../../hooks/useNotifications';

const NAV_ITEMS = [
  { to: '/advertiser/dashboard', label: 'Overview', icon: <FaChartPie /> },
  { to: '/advertiser/campaigns', label: 'My Campaigns', icon: <FaBullhorn /> },
  { to: '/advertiser/analytics', label: 'Analytics', icon: <FaChartLine /> },
  { to: '/advertiser/billing', label: 'Billing', icon: <FaFileInvoiceDollar /> },
  { to: '/advertiser/notifications', label: 'Notifications', icon: <FaBell /> },
];

export default function AdvertiserLayout() {
  const { unread } = useNotifications();

  return (
    <div className="app-shell">
      <DashboardSidebar navItems={NAV_ITEMS} roleLabel="ADVERTISER" unreadCount={unread} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
