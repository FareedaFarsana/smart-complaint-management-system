
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../styles/layout.css";

function MainLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="layout">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={closeSidebar}
            />

            {sidebarOpen && (
                <button
                    type="button"
                    className="sidebar-overlay"
                    aria-label="Close navigation menu"
                    onClick={closeSidebar}
                />
            )}

            <div className="main-content">
                <button
                    type="button"
                    className="mobile-menu-toggle"
                    aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                    aria-expanded={sidebarOpen}
                    onClick={() => setSidebarOpen((open) => !open)}
                >
                    {sidebarOpen ? <FiX /> : <FiMenu />}
                </button>

                <Navbar />

                <div className="page-content">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default MainLayout;
