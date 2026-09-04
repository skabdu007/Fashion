import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";

const typeLabel = {
  INVITE: "Room Invite",
  ORDER: "Order Update",
  PAYMENT: "Payment",
  SYSTEM: "System"
};

export default function Notification() {
  const navigate = useNavigate();
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const userId = user?.user_id || user?._id;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications]
  );

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await api.get(`/notifications/${userId}`);
        setNotifications(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/mark-read/${notificationId}`);
      setNotifications((current) =>
        current.map((item) =>
          item._id === notificationId ? { ...item, is_read: true } : item
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put(`/notifications/mark-read-all/${userId}`);
      setNotifications((current) =>
        current.map((item) => ({ ...item, is_read: true }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification._id);
    }

    if (notification.room_code) {
      navigate(`/auction/join?code=${notification.room_code}`);
      return;
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  if (!user) {
    return <h2 style={{ padding: "20px" }}>Please login</h2>;
  }

  return (
    <div className="shop-shell fade-in-page notification-page">
      <div className="shop-container">
        <div className="shop-hero">
          <div>
            <h1>Notifications</h1>
            <p>
              Stay updated with room invites, order updates, and payment
              activity.
            </p>
          </div>

          <div className="premium-badge">Unread: {unreadCount}</div>
        </div>

        <div className="glass-card stack-card">
          <div
            className="flex-between"
            style={{ marginBottom: "18px", gap: "12px", flexWrap: "wrap" }}
          >
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Inbox
            </h2>
            <button
              className="btn-secondary-modern"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </button>
          </div>

          {loading ? (
            <p className="center-msg">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <div className="empty-state">No notifications yet.</div>
          ) : (
            <div className="line-items">
              {notifications.map((item) => (
                <article key={item._id} className="line-item hover-lift">
                  <div>
                    <div className="line-item-title">{item.title}</div>
                    <div className="line-item-meta">
                      {typeLabel[item.type] || item.type} |{" "}
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                    <p style={{ marginTop: "10px" }}>{item.message}</p>
                  </div>

                  <div style={{ display: "grid", gap: "10px", justifyItems: "end" }}>
                    <span className={`status ${item.is_read ? "DELIVERED" : "PENDING"}`}>
                      {item.is_read ? "Read" : "Unread"}
                    </span>

                    <button
                      className="btn-modern hover-scale"
                      onClick={() => handleOpen(item)}
                    >
                      Open
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
