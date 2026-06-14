// =====================================================================
// AdVia Frontend — Dashboard Sidebar
// Shared sidebar shell for both Driver and Advertiser dashboards.
// `navItems` is provided by each layout; this component handles the
// active-link highlighting, notification badge, and logout.
// =====================================================================
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function DashboardSidebar({ navItems, roleLabel, unreadCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-brand">
        <span className="brand-mark" style={{ width: 30, height: 30, fontSize: '0.95rem' }}>🚐</span>
        AdVia
      </Link>

      <div className="sidebar-section-label">{roleLabel}</div>

      <nav className="flex-col gap-1" style={{ flex: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <span style={{ fontSize: '1rem', display: 'flex' }}>{item.icon}</span>
              {item.label}
              {item.to.endsWith('notifications') && unreadCount > 0 && (
                <span className="nav-badge">{unreadCount}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-link" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </aside>
  );
}
