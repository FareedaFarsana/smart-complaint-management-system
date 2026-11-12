
import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import DashboardCard from "../components/dashboard/DashboardCard";
import RecentComplaintsTable from "../components/dashboard/RecentComplaintsTable";
import { getDashboardStats } from "../services/dashboardService";
import "../styles/dashboard.css";
import api from "../services/api";

import {
    FiFileText,
    FiClock,
    FiCheckCircle,
    FiRefreshCw,
    FiFolder
} from "react-icons/fi";

function Dashboard() {
    const [stats, setStats] = useState({
        total_complaints: 0,
        pending: 0,
        resolved: 0,
        in_progress: 0,
        categories: 0
    });

    const [recentComplaints, setRecentComplaints] = useState([]);
    const [categoryCounts, setCategoryCounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                setLoading(true);
                setError("");

                const profileResponse = await api.get("users/me/");
                setProfile(profileResponse.data);

                const data = await getDashboardStats();

                setStats(data.statistics);
                setRecentComplaints(data.recent_complaints ?? []);
                setCategoryCounts(data.category_counts ?? []);
            } catch (err) {
                console.error("Dashboard error:", err);
                setError("Unable to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    // Category breakdown for the recent complaints returned by the API
    const categoryEntries = categoryCounts
    .map((item) => [item.category_name, item.count])
    .sort((a, b) => b[1] - a[1]);

    const maxCategoryCount = Math.max(
        1,
        ...categoryEntries.map(([, count]) => count)
    );

    if (loading) {
        return (
            <MainLayout>
                <div className="loading-state">Loading dashboard...</div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <div className="error-state">{error}</div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="dashboard">
                <div className="dashboard-heading">
                    <div>
                        <h1>Dashboard</h1>
                        <p>Monitor and manage complaints in one place.</p>
                    </div>
                </div>

                <section className="dashboard-welcome">
                    <img
                        src="/images/admin-dashboard-banner.png"
                        alt="College campus"
                        className="dashboard-welcome-image"
                    />

                    <div className="dashboard-welcome-text">
                        <h2>
                            {profile?.role === "ADMIN"
                                ? "Welcome back, Admin! 👋"
                                : profile?.role === "STAFF"
                                ? `Welcome back, ${profile?.username || "Staff"}! 👋`
                                : `Welcome back, ${profile?.username || "User"}! 👋`}
                        </h2>

                        <p>
                            {profile?.role === "ADMIN"
                                ? "Manage complaints and keep your campus running smoothly."
                                : profile?.role === "STAFF"
                                ? "Review your assigned complaints and help resolve campus issues."
                                : "Track your complaints and stay updated on their progress."}
                        </p>
                    </div>
                </section>

                <section className="dashboard-cards">
                    <DashboardCard
                        title={profile?.role === "ADMIN"
                            ? "Total Complaints"
                            : profile?.role === "STAFF"
                            ? "Assigned Complaints"
                            : "My Complaints"}
                        value={stats.total_complaints}
                        icon={<FiFileText />}
                        color="#2563eb"
                    />

                    <DashboardCard
                        title="Pending"
                        value={stats.pending}
                        icon={<FiClock />}
                        color="#f59e0b"
                    />

                    <DashboardCard
                        title="In Progress"
                        value={stats.in_progress}
                        icon={<FiRefreshCw />}
                        color="#7c3aed"
                    />

                    <DashboardCard
                        title="Resolved"
                        value={stats.resolved}
                        icon={<FiCheckCircle />}
                        color="#16a34a"
                    />
                </section>

                {profile?.role === "STAFF" && (
                    <section className="needs-attention">
                        <div className="needs-attention-heading">
                            <div>
                                <h2>Needs Attention</h2>
                                <p>Assigned complaints waiting for action</p>
                            </div>

                            <span className="needs-attention-count">
                                {recentComplaints.filter(
                                    (complaint) => complaint.status === "Pending"
                                ).length}
                            </span>
                        </div>

                        {recentComplaints.filter(
                            (complaint) => complaint.status === "Pending"
                        ).length === 0 ? (
                            <p className="needs-attention-empty">
                                Great job! No pending complaints in the recent list.
                            </p>
                        ) : (
                            <div className="needs-attention-list">
                                {recentComplaints
                                    .filter((complaint) => complaint.status === "Pending")
                                    .map((complaint) => (
                                        <div
                                            className="needs-attention-item"
                                            key={complaint.id}
                                        >
                                            <div>
                                                <strong>{complaint.title}</strong>
                                                <p>Priority: {complaint.priority}</p>
                                            </div>

                                            <span className="needs-attention-status">
                                                Pending
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </section>
                )}

                <section className="dashboard-bottom">
                    <div className="dashboard-recent">
                        <RecentComplaintsTable
                            complaints={recentComplaints}
                            profile={profile}
                        />
                    </div>
                    
                    {profile?.role === "ADMIN" && (
                        <div className="category-card">
                            <div className="category-heading">
                                <div>
                                    <h2>Category Breakdown</h2>
                                    <p>All complaints by category</p>
                                </div>
                                <FiFolder />
                            </div>

                            {categoryEntries.length === 0 ? (
                                <p className="category-empty">
                                    No category data available.
                                </p>
                            ) : (
                                <div className="category-list">
                                    {categoryEntries.map(([name, count], index) => (
                                        <div className="category-item" key={name}>
                                            <div className="category-item-label">
                                                <span
                                                    className={`category-dot category-color-${index % 5}`}
                                                />
                                                <span>{name}</span>
                                                <strong>{count}</strong>
                                            </div>

                                            <div className="category-track">
                                                <div
                                                    className={`category-fill category-color-${index % 5}`}
                                                    style={{
                                                        width: `${(count / maxCategoryCount) * 100}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="category-note">
                                Counts include all complaints recorded in the system.
                            </p>

                        </div>
                    )}
                </section>
            </div>
        </MainLayout>
    );
}

export default Dashboard;
