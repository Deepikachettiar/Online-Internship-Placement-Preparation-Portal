import { useEffect, useState } from "react";
import axios from "axios";

// Integration starter. Update API base URL/auth credentials to match your app.
export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      setError("");
      const { data } = await axios.get("/api/notifications");
      setItems(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      setError("Notifications could not be loaded.");
    }
  }

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const { data } = await axios.get("/api/notifications");
        if (!ignore) {
          setItems(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
          setError("");
        }
      } catch {
        if (!ignore) {
          setError("Notifications could not be loaded.");
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };

  }, []);

  async function markRead(item) {
    if (item.isRead) return;
    try {
      await axios.patch(`/api/notifications/${item._id}/read`);
      setItems(current =>
        current.map(n => n._id === item._id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(count => Math.max(0, count - 1));
    } catch {
      setError("Could not mark notification as read.");
    }
  }

  return (
    <div className="bell">
      <button
        type="button"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={open}
        onClick={() => { setOpen(value => !value); if (!open) refresh(); }}
        className="secondary bell-btn"
      >
        🔔
        {unreadCount > 0 && (
          <span className="bell-count">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="bell-panel">
          <div className="bell-head">
            <strong>Notifications</strong>
            <button type="button" onClick={refresh}>Refresh</button>
          </div>
          {error && <p role="alert">{error}</p>}
          {items.length === 0 ? (
            <p>No notifications yet.</p>
          ) : (
            <ul className="bell-list">
              {items.map(item => (
                <li key={item._id} className={item.isRead ? "" : "unread"}>
                  <button type="button" className="bell-item" onClick={() => markRead(item)}>
                    <span className="bell-title">{item.title}</span>
                    <span className="bell-msg">{item.message}</span>
                    {!item.isRead && <span className="bell-hint">Mark as read</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
