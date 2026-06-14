// =====================================================================
// AdVia Frontend — Driver Layout
// Wraps all /driver/* pages with the sidebar. Notification count comes
// from useNotifications and is shared with child pages via context-free
// prop drilling isn't possible across <Outlet/>, so each page that needs
// notification actions uses its own useNotifications() instance — they
// share the same backend state, just refetch on mount.
// =====================================================================
import { Outlet } from 'react-router-dom';
import { FaHome, FaBriefcase, FaWallet, FaBell, FaCar } from 'react-icons/fa';
import DashboardSidebar from '../../components/DashboardSidebar';
import useNotifications from '../../hooks/useNotifications';

const NAV_ITEMS = [
  { to: '/driver/dashboard', label: 'Dashboard', icon: <FaHome /> },
  { to: '/driver/jobs', label: 'Job Offers', icon: <FaBriefcase /> },
  { to: '/driver/earnings', label: 'Earnings', icon: <FaWallet /> },
  { to: '/driver/notifications', label: 'Notifications', icon: <FaBell /> },
  { to: '/driver/profile', label: 'My Vehicle', icon: <FaCar /> },
];

export default function DriverLayout() {
  const { unread } = useNotifications();

  return (
    <div className="app-shell">
      <DashboardSidebar navItems={NAV_ITEMS} roleLabel="DRIVER" unreadCount={unread} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
