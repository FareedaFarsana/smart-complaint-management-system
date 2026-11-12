
import { useEffect, useState } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import "../styles/navbar.css";

function Navbar() {
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);
    // Navbar search state
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("users/me/");
                setProfile(response.data);
            } catch (error) {
                console.error("Failed to load navbar profile:", error);
            }
        };

        fetchProfile();
    }, [location.pathname]);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const response = await api.get("notifications/");
                const notifications = response.data;

                setUnreadCount(
                    notifications.filter(
                        (notification) => !notification.is_read
                    ).length
                );
            } catch (error) {
                console.error("Failed to fetch unread notifications:", error);
            }
        };

        fetchUnreadCount();

        window.addEventListener("notificationsUpdated", fetchUnreadCount);

        return () => {
            window.removeEventListener(
                "notificationsUpdated",
                fetchUnreadCount
            );
        };
    }, []);

    const roleLabel = {
        ADMIN: "Admin",
        STAFF: "Staff",
        USER: "User",
    };

    return (
        <header className="navbar">

            <div className="navbar-right">
                <div className="search-box">
                    <FiSearch />
                    {/* Search complaints */}
                    <input
                        type="text"
                        placeholder="Search complaints..."
                        aria-label="Search complaints"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && searchText.trim()) {
                                navigate(`/complaints?search=${encodeURIComponent(searchText.trim())}`);
                            }
                        }}
                    />
                </div>

                <button
                    className="notification-btn"
                    type="button"
                    aria-label="Open notifications"
                    onClick={() => navigate("/notifications")}
                >
                    <IoNotificationsOutline />
                    {unreadCount > 0 && (
                    <span className="notification-count">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
                </button>

                <button
                    className="profile"
                    type="button"
                    aria-label="Open profile"
                    onClick={() => navigate("/profile")}
                >
                    <FaUserCircle className="profile-icon" />
                    <span className="profile-info">
                        <strong>{profile?.username || "Loading..."}</strong>
                        <small>{roleLabel[profile?.role] || ""}</small>
                    </span>
                    <FiChevronDown className="profile-chevron" />
                </button>
            </div>
        </header>
    );
}

export default Navbar;
