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

function Sidebar() {
  return (

    <aside className= "sidebar">

            <div className="sidebar-logo">

                <h2>SCMS</h2>

                <span>Complaint System</span>

            </div>

            <nav>

                <NavLink to="/dashboard" onClick={() => setSidebarOpen(false)}>
                    <MdDashboard />
                    Dashboard
                </NavLink>

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

            <button className="logout-btn">

                <FiLogOut />

                Logout

            </button>

        </aside>

  )
}

export default Sidebar