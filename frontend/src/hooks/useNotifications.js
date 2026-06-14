// =====================================================================
// AdVia Frontend — useNotifications hook
// Fetches the logged-in user's notifications + unread count, and
// exposes helpers to mark one / all as read. Polls every 30s so the
// sidebar badge stays fresh without a full page reload.
// =====================================================================
import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';

export default function useNotifications({ poll = true } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnread(res.data.unread);
    } catch {
      // Silently ignore — badge just won't update this cycle.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    if (!poll) return;
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, poll]);

  async function markAsRead(id) {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
      setUnread((prev) => Math.max(prev - 1, 0));
    } catch {
      // ignore
    }
  }

  async function markAllAsRead() {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnread(0);
    } catch {
      // ignore
    }
  }

  return { notifications, unread, loading, markAsRead, markAllAsRead, refetch: fetchNotifications };
}
