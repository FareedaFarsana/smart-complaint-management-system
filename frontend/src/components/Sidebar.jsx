import { useEffect, useState } from "react";
import api from "../services/api";

import {
    MdDashboard
} from "react-icons/md"; 

import {
    FaClipboardList,
    FaPlusCircle,
    FaUserCircle
} from "react-icons/fa";

import {
    IoNotifications
} from "react-icons/io5";

import {
    FiLogOut
} from "react-icons/fi";

import { NavLink } from "react-router-dom";

import "../styles/sidebar.css";

function Sidebar({isOpen}) {

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

  return (

    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>

            <div className="sidebar-logo">

                <h2>SCMS</h2>

                <span>Complaint System</span>

            </div>

            <nav>

                <NavLink to="/dashboard" onClick={onclose}>
                    <MdDashboard />
                    Dashboard
                </NavLink>

                {/* Show this link only for ADMIN users */}
                {profile?.role === "ADMIN" && (
                    <NavLink to="/admin/users">
                        <FaUserCircle />
                        Admin Users
                    </NavLink>
                )}

                <NavLink to="/complaints">
                    <FaClipboardList />
                    Complaints
                </NavLink>

                <NavLink to="/create">
                    <FaPlusCircle />
                    New Complaint
                </NavLink>

                <NavLink to="/notifications">
                    <IoNotifications />
                    Notifications
                </NavLink>

                <NavLink to="/profile">
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

  )
}

export default Sidebar