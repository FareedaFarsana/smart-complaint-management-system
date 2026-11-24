
import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/deadlineManagement.css";
import Swal from "sweetalert2";

function DeadlineManagement() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const response = await api.get("complaints/");
            setComplaints(response.data);
        } catch (error) {
            console.error("Failed to fetch complaints:", error);
        } finally {
            setLoading(false);
        }
    };

    
    const handleEditDeadline = async (complaint) => {

        let existingDeadline = "";

        if (complaint.deadline) {
            const date = new Date(complaint.deadline);
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

            existingDeadline = date.toISOString().slice(0, 16);
        }

        const result = await Swal.fire({
            title: complaint.deadline
                ? "Edit Complaint Deadline"
                : "Set Complaint Deadline",

            text: `Complaint #${complaint.id} - ${complaint.title}`,

            input: "datetime-local",
            inputValue: existingDeadline,

            inputAttributes: {
                min: new Date(
                    Date.now() - new Date().getTimezoneOffset() * 60000
                ).toISOString().slice(0, 16)
            },

            showCancelButton: true,
            confirmButtonText: "Save Deadline",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#2563eb",
            cancelButtonColor: "#64748b",

            inputValidator: (value) => {
                if (!value) {
                    return "Please select a deadline.";
                }

                if (new Date(value).getTime() <= Date.now()) {
                    return "Please select a future date and time.";
                }
            }
        });

        if (!result.isConfirmed) return;

        try {
            await api.patch(`complaints/${complaint.id}/`, {
                deadline: new Date(result.value).toISOString()
            });

            await fetchComplaints();

            Swal.fire({
                icon: "success",
                title: "Deadline Saved!",
                text: "The complaint deadline has been updated successfully.",
                confirmButtonColor: "#2563eb"
            });

        } catch (error) {
            console.error("Failed to save deadline:", error);

            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text: "Unable to save the complaint deadline.",
                confirmButtonColor: "#2563eb"
            });
        }
    };


    const dueSoon = complaints.filter(complaint =>
        complaint.deadline &&
        new Date(complaint.deadline) > new Date() &&
        new Date(complaint.deadline) <=
            new Date(Date.now() + 24 * 60 * 60 * 1000) &&
        complaint.status !== "Resolved"
    );

    const overdue = complaints.filter(complaint =>
        complaint.deadline &&
        new Date(complaint.deadline) < new Date() &&
        complaint.status !== "Resolved"
    );

    const escalated = complaints.filter(
        complaint => complaint.is_escalated
    );

    return (
        <div className="deadline-page">

            <div className="deadline-header">
                <div>
                    <h2>Deadline Management</h2>
                    <p>Monitor complaint deadlines and escalations.</p>
                </div>
            </div>

            <div className="deadline-summary">

                <div className="deadline-card">
                    <h4>Total Complaints</h4>
                    <h2>{complaints.length}</h2>
                </div>

                <div className="deadline-card">
                    <h4>Due Soon</h4>
                    <h2>{dueSoon.length}</h2>
                </div>

                <div className="deadline-card">
                    <h4>Overdue</h4>
                    <h2>{overdue.length}</h2>
                </div>

                <div className="deadline-card">
                    <h4>Escalated</h4>
                    <h2>{escalated.length}</h2>
                </div>

            </div>

            {overdue.length > 0 && (
                <div className="deadline-alert">
                    <strong>Overdue Complaints!</strong>
                    <p>
                        {overdue.length} unresolved complaint(s)
                        have passed their deadline.
                    </p>
                </div>
            )}

            
            <div className="deadline-table-section">
                <h3>Complaint Deadlines</h3>

                {loading ? (
                    <p>Loading complaints...</p>
                ) : complaints.length === 0 ? (
                    <p>No complaints found.</p>
                ) : (
                    <div className="deadline-table-wrapper">
                        <table className="deadline-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Complaint</th>
                                    <th>Assigned Staff</th>
                                    <th>Priority</th>
                                    <th>Deadline</th>
                                    <th>Status</th>
                                    <th>Escalation</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {complaints.map(complaint => (
                                    <tr key={complaint.id}>
                                        <td>{complaint.id}</td>

                                        <td>{complaint.title}</td>

                                        <td>
                                            {complaint.assigned_staff_name || "Not Assigned"}
                                        </td>

                                        <td>
                                            <span className={`deadline-priority ${complaint.priority?.toLowerCase()}`}>
                                                {complaint.priority}
                                            </span>
                                        </td>

                                        <td>
                                            {complaint.deadline
                                                ? new Date(complaint.deadline).toLocaleString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })
                                                : "Not Set"}
                                        </td>

                                        <td>
                                            <span className={`deadline-status ${complaint.status?.toLowerCase().replace(" ", "-")}`}>
                                                {complaint.status}
                                            </span>
                                        </td>

                                        <td>
                                            {complaint.is_escalated ? (
                                                <span className="deadline-escalated-badge">
                                                    Escalated
                                                </span>
                                            ) : (
                                                <span className="deadline-not-escalated">
                                                    Not Escalated
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            <button
                                                className="deadline-edit-btn"
                                                onClick={() => handleEditDeadline(complaint)}
                                            >
                                                {complaint.deadline ? "Edit Deadline" : "Set Deadline"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
     

        </div>
    );
}

export default DeadlineManagement;
