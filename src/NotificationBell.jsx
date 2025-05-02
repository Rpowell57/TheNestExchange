import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import axios from "axios";
import "./NotificationBell.css";

export default function NotificationBell({ userId }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!userId || fetched) return;

    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/listings/rejected/${userId}`
        );

        if (Array.isArray(response.data)) {
          const newNotifications = response.data.map((item) => ({
            listID: item.listID,
            reason: item.reason,
            read: false,
          }));

          setNotifications(newNotifications);
          setUnreadCount(newNotifications.length);
          //new Audio("/notification.mp3").play();
          setFetched(true);
        }
      } catch (error) {
        console.error("Error fetching notifications", error);
      }
    };

    fetchNotifications();
  }, [userId, fetched]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    setUnreadCount(0);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
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
                <div key={i} className={n.read ? "read" : "unread"}>
                  <p><strong>Listing ID:</strong> {n.listID}
                  <strong>  Reason:</strong> {n.reason}</p>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}
