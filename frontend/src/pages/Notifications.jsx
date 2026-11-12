import { useEffect,useState } from "react"
import api from "../services/api"
import "../styles/notifications.css"

function Notifications() {

    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get("notifications/");
            console.log(response.data);
            setNotifications(response.data);
        } catch (error) {
            console.log("Notification error:", error);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            const response = await api.patch(
                `notifications/${notificationId}/`,
                {
                    is_read: true
                }
            );

            console.log("Notification marked as read:", response.data);

            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, is_read: true }
                        : notification
                )
            );

        } catch (error) {
            console.log("Mark as read error:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter(
                (notification) => !notification.is_read
            );

            await Promise.all(
                unreadNotifications.map((notification) =>
                    api.patch(`notifications/${notification.id}/`, {
                        is_read: true
                    })
                )
            );

            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) => ({
                    ...notification,
                    is_read: true
                }))
            );

            window.dispatchEvent(new Event("notificationsUpdated"));
            window.dispatchEvent(new Event("notificationsUpdated"));

        } catch (error) {
            console.error("Mark all as read error:", error);
            await fetchNotifications();
        }
    };


    return (
        <div className="notifications-page">

            <div className="notifications-header">
                <div>
                    <h1>Notifications</h1>
                    <p>
                        Stay updated on your complaints and their latest status.
                    </p>
                </div>

                <button
                    className="mark-all-btn"
                    onClick={handleMarkAllAsRead}
                    disabled={!notifications.some(
                        (notification) => !notification.is_read
                    )}
                >
                    Mark all as read
                </button>
            </div>

            <div className="notifications-list">

                {notifications.length > 0 ? (
                    notifications.map((notification) => (

                        <div
                            className={`notification-card ${
                                !notification.is_read ? "unread" : ""
                            }`}
                            key={notification.id}
                        >

                            <div className="notification-icon">
                                🔔
                            </div>

                            <div className="notification-content">

                                <div className="notification-top">
                                    <h3>Complaint Status Updated</h3>

                                    <span className="notification-time">
                                        {new Date(
                                            notification.created_at
                                        ).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </span>
                                </div>

                                <p>{notification.message}</p>

                                {!notification.is_read && (
                                    <button
                                        className="mark-read-btn"
                                        onClick={() => handleMarkAsRead(notification.id)}
                                    >
                                        Mark as read
                                    </button>
                                )}

                            </div>

                            {!notification.is_read && (
                                <span className="unread-dot"></span>
                            )}

                        </div>

                    ))
                ) : (

                    <div className="notification-empty">

                        <div className="empty-icon">
                            🔔
                        </div>

                        <h3>No notifications</h3>

                        <p>
                            You're all caught up. New complaint updates
                            will appear here.
                        </p>

                    </div>

                )}

            </div>

        </div>
    );
}

export default Notifications