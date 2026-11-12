import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout"

import ComplaintToolbar from "../components/complaints/ComplaintToolbar"
import ComplaintGrid from "../components/complaints/ComplaintGrid"

import api from "../services/api";

function Complaints() {
    
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("");
    const [complaints, setComplaints] = useState([]);
    const [userRole, setUserRole] = useState("");
    // Read the search term from the URL
    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get("search") || "");

    useEffect(() => {
        setSearch(searchParams.get("search") || "");
    }, [searchParams]);

    // Fetch the logged-in user's role
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("users/me/");
                setUserRole(response.data.role);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        };

        fetchProfile();
    }, []);

    const handleComplaintUpdated = (updatedComplaint) => {
        setComplaints((prevComplaints) =>
            prevComplaints.map((complaint) =>
                complaint.id === updatedComplaint.id
                    ? updatedComplaint
                    : complaint
            )
        );
    };

    const handleComplaintDeleted = (deletedId) => {
        setComplaints((prevComplaints) =>
            prevComplaints.filter(
                (complaint) => complaint.id !== deletedId
            )
        );
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const response = await api.get("complaints/");

            console.log(response.data);

            setComplaints(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const filteredComplaints = complaints.filter((complaint) =>{
        const matchesSearch =
            complaint.title
                .toLowerCase()
                .includes(search.toLowerCase());

        const matchesCategory =
            category === "" ||
            complaint.category_name === category;

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

            <ComplaintGrid 
                complaints={filteredComplaints}
                userRole={userRole}
                onComplaintUpdated={handleComplaintUpdated} 
                onComplaintDeleted={handleComplaintDeleted}
            />

        </div>

        </MainLayout>
    )
}

export default Complaints