import MainLayout from "../layouts/MainLayout";
import DashboardCard from "../components/dashboard/DashboardCard";
import RecentComplaintsTable from "../components/dashboard/RecentComplaintsTable";

import { useEffect, useState } from "react";

import { getDashboardStats } from "../services/dashboardService";

import "../styles/dashboard.css"

import {
    FiFileText,
    FiClock,
    FiCheckCircle,
    FiRefreshCw,
    FiFolder
} from "react-icons/fi";

import "../styles/dashboard.css";

function Dashboard() {
    
    const [stats, setStats] = useState({

        total_complaints: 0,

        pending: 0,

        resolved: 0,

        in_progress: 0,

        categories: 0

    });

    const [recentComplaints, setRecentComplaints] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const fetchDashboardStats = async () => {

        try {
            setLoading(true);

            setError("");

            const data = await getDashboardStats();

            console.log(data); // Check the complete response

            setStats(data.statistics);

            setRecentComplaints(data.recent_complaints)

        } catch (error) {

            console.log(error);

            setError("Unable to load dashboard data.");

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        fetchDashboardStats();

    }, []);

if(loading){
    return (

        <MainLayout>

            <div className="loading-state">

                Loading dashboard...

            </div>

        </MainLayout>

    );
}

if (error) {

    return (

        <MainLayout>

            <div className="error-state">

                {error}

            </div>

        </MainLayout>

    );

}

  return (
    <MainLayout>
        <div className="dashboard">

            <h1>Dashboard</h1>

            <div className="dashboard-cards">

                <DashboardCard
                    title="Total Complaints"
                    value={stats.total_complaints}
                    icon={<FiFileText />}
                    color="#2563eb"
                    change="+18%"
                />

                <DashboardCard
                    title="Pending"
                    value={stats.pending}
                    icon={<FiClock />}
                    color="#f59e0b"
                    change="-2%"
                />

                <DashboardCard
                    title="Resolved"
                    value={stats.resolved}
                    icon={<FiCheckCircle />}
                    color="#16a34a"
                    change="+30%"
                />

                <DashboardCard
                    title="In Progress"
                    value={stats.in_progress}
                    icon={<FiRefreshCw />}
                    color="#7c3aed"
                    change="+8%"
                />

                <DashboardCard
                    title="Categories"
                    value={stats.categories}
                    icon={<FiFolder />}
                    color="#ec4899"
                    change="+1"
                />

            </div>

            <RecentComplaintsTable
                complaints = {recentComplaints}
            />

        </div>
    </MainLayout>
  )
}

export default Dashboard