import { useState } from "react"
import MainLayout from "../layouts/MainLayout"

import ComplaintToolbar from "../components/complaints/ComplaintToolbar"
import ComplaintGrid from "../components/complaints/ComplaintGrid"

function Complaints() {
    
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("");

    const [complaints] = useState([
        {
            id: 1,
            title: "Water Leakage",
            category: "Plumbing",
            priority: "High",
            status: "Pending",
            created_at: "2026-07-20"
        },
        {
            id: 2,
            title: "Power Failure",
            category: "Electrical",
            priority: "Medium",
            status: "Resolved",
            created_at: "2026-07-19"
        },
        {
            id: 3,
            title: "Broken Window",
            category: "Maintenance",
            priority: "Low",
            status: "In Progress",
            created_at: "2026-07-18"
        }
    ]);

    const filteredComplaints = complaints.filter((complaint) =>{
        const matchesSearch =
            complaint.title
                .toLowerCase()
                .includes(search.toLowerCase());

        const matchesCategory =
            category === "" ||
            complaint.category === category;

        const matchesStatus =
            status === "" ||
            complaint.status === status;

        return (
            matchesSearch &&
            matchesCategory &&
            matchesStatus
        );
        
    });

  return (
        <MainLayout>
            <div>

            <ComplaintToolbar
                search={search}
                setSearch={setSearch}

                category={category}
                setCategory={setCategory}

                status={status}
                setStatus={setStatus}
            />

            <ComplaintGrid complaints={filteredComplaints} />

        </div>

        </MainLayout>
    )
}

export default Complaints