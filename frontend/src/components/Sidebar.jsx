
import { useEffect, useState } from "react";
import api from "../services/api";

import { MdDashboard } from "react-icons/md";

import {
    FaClipboardList,
    FaPlusCircle,
    FaUserCircle,
    FaStar,
    FaHistory,
    FaClock
} from "react-icons/fa";

import { IoNotifications } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";

import { NavLink } from "react-router-dom";

import "../styles/sidebar.css";

function Sidebar({ isOpen, onClose }) {

    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("users/me/");
                setProfile(response.data);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        };

        fetchProfile();
    }, []);

    const isAdmin = profile?.role === "ADMIN";
    const isUser = profile?.role === "USER";

    return (
        <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>

            <div className="sidebar-logo">
                <h2>SCMS</h2>
                <span>Complaint Management System</span>
            </div>

            <nav>

                <NavLink to="/dashboard" onClick={onClose}>
                    <MdDashboard />
                    Dashboard
                </NavLink>

                {/* Admin only */}
                {isAdmin && (
                    <NavLink to="/admin/users" onClick={onClose}>
                        <FaUserCircle />
                        Manage Users
                    </NavLink>
                )}

                {/* Admin only */}
                {isAdmin && (
                    <NavLink to="/admin/deadlines" onClick={onClose}>
                        <FaClock />
                        Deadline Management
                    </NavLink>
                )}

                <NavLink to="/complaints" onClick={onClose}>
                    <FaClipboardList />
                    All Complaints
                </NavLink>

                {isUser && (
                    <NavLink to="/complaint-timeline" onClick={onClose}>
                        <FaHistory />
                        Complaint Timeline
                    </NavLink>
                )}

                {/* Admin and Student */}
                {(isAdmin || isUser) && (
                    <NavLink to="/feedback" onClick={onClose}>
                        <FaStar />
                        Feedback
                    </NavLink>
                )}

                {/* Only regular users */}
                {isUser && (
                    <NavLink to="/create" onClick={onClose}>
                        <FaPlusCircle />
                        New Complaint
                    </NavLink>
                )}

                <NavLink to="/notifications" onClick={onClose}>
                    <IoNotifications />
                    Notifications
                </NavLink>

                <NavLink to="/profile" onClick={onClose}>
                    <FaUserCircle />
                    Profile
                </NavLink>

            </nav>

            <div className="sidebar-bottom">

                <div className="sidebar-profile">

                    <div className="sidebar-profile-avatar">
                        <FaUserCircle />
                    </div>

                    <div className="sidebar-profile-info">
                        <strong>{profile?.username || "Loading..."}</strong>
                        <span>{profile?.role || "Loading..."}</span>
                    </div>

                </div>

                <button
                    className="logout-btn"
                    onClick={async () => {

                        const refreshToken = localStorage.getItem("refresh");

                        try {
                            if (refreshToken) {
                                await api.post("users/logout/", {
                                    refresh: refreshToken,
                                });
                            }
                        } catch (error) {
                            console.error("Logout API failed:", error);
                        } finally {
                            localStorage.removeItem("access");
                            localStorage.removeItem("refresh");
                            window.location.replace("/");
                        }
                    }}
                >
                    <FiLogOut />
                    Logout
                </button>

            </div>

        </aside>
    );
}

export default Sidebar;
