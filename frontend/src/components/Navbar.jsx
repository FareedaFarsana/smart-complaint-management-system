import { FiSearch } from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";

import "../styles/navbar.css";

function Navbar() {
  return (
    <header className="navbar">

            <div className="navbar-left">

                <h2>Dashboard</h2>

            </div>

            <div className="navbar-right">

                <div className="search-box">

                    <FiSearch />

                    <input
                        type="text"
                        placeholder="Search complaints..."
                    />

                </div>

                <button className="notification-btn">

                    <IoNotificationsOutline />

                    <span className="notification-count">
                        3
                    </span>

                </button>

                <div className="profile">

                    <FaUserCircle className="profile-icon"/>

                    <div>

                        <h4>User</h4>

                        <p>Citizen</p>

                    </div>

                </div>

            </div>

        </header>
  )
}

export default Navbar