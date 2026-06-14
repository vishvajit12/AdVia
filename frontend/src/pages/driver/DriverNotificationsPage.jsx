// =====================================================================
// AdVia Frontend — Driver Notifications Page
// Shared design with the Advertiser notifications page — click a card
// to mark it read, with a "mark all as read" shortcut.
// =====================================================================
import { FaBell, FaCheckDouble } from 'react-icons/fa';
import useNotifications from '../../hooks/useNotifications';
import Spinner from '../../components/Spinner';

const TYPE_ICON_COLOR = {
  job: 'var(--c-accent)',
  payment: 'var(--c-primary)',
  info: 'var(--c-info)',
  system: 'var(--c-muted)',
};

export default function DriverNotificationsPage() {
  const { notifications, unread, loading, markAsRead, markAllAsRead } = useNotifications({ poll: false });

  if (loading) return <Spinner label="Loading notifications..." />;

  return (
    <div className="flex-col gap-3">
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Notifications</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>
            {unread > 0 ? `${unread} unread` : 'All caught up!'}
          </p>
        </div>
        {unread > 0 && (
          <button className="btn btn-outline btn-sm" onClick={markAllAsRead}>
            <FaCheckDouble /> Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px 16px' }}>
          <FaBell style={{ fontSize: '1.8rem', color: 'var(--c-muted)', marginBottom: 10 }} />
          <p className="text-muted">No notifications yet.</p>
        </div>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => !n.is_read && markAsRead(n.id)}
            className="card card-hover"
            style={{
              cursor: n.is_read ? 'default' : 'pointer',
              borderLeft: !n.is_read ? '3px solid var(--c-accent)' : '1px solid var(--c-border)',
              background: !n.is_read ? 'var(--c-accent-light)' : 'var(--c-surface)',
            }}
          >
            <div className="flex-between" style={{ marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
              <div className="flex gap-1" style={{ alignItems: 'center' }}>
                <FaBell style={{ color: TYPE_ICON_COLOR[n.type] || 'var(--c-muted)', fontSize: '0.9rem' }} />
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{n.title}</span>
              </div>
              <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                {new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--c-ink)' }}>{n.message}</p>
            {!n.is_read && (
              <div style={{ fontSize: '0.75rem', color: 'var(--c-accent)', marginTop: 8, fontWeight: 500 }}>
                Tap to mark as read
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
