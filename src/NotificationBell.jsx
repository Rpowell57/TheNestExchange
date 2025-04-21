import { useState, useEffect } from "react";
import { Bell } from "lucide-react"; // or use an icon library you prefer
import "./NotificationBell.css"; // create your own styles

export default function NotificationBell({ userId }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/notifications/${userId}`);

    ws.onmessage = (event) => {
      const message = event.data;
      setNotifications((prev) => [...prev, { message, read: false }]);
      setUnreadCount((prev) => prev + 1);
      // Optional: Play sound
      new Audio("/notification.mp3").play();
    };

    return () => ws.close();
  }, [userId]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="notification-bell">
      <div onClick={toggleDropdown} className="bell-icon">
        <Bell />
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </div>

      {showDropdown && (
        <div className="notification-dropdown">
          {notifications.length === 0 ? (
            <p>No new notifications</p>
          ) : (
            notifications
              .slice()
              .reverse()
              .map((n, i) => (
                <p key={i} className={n.read ? "read" : "unread"}>
                  {n.message}
                </p>
              ))
          )}
        </div>
      )}
    </div>
  );
}
