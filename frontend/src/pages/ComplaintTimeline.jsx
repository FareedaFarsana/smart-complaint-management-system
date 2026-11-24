
import { useState, useEffect } from "react";
import api from "../services/api";
import "../styles/complaintTimeline.css";

function ComplaintTimeline() {

    const [complaints, setComplaints] = useState([]);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const statusSteps = ["Pending", "In Progress", "Resolved"];

    const currentStep = statusSteps.indexOf(
        selectedComplaint?.status
    );

    // Fetch student's complaints
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

    // Fetch selected complaint's status history
    const fetchStatusHistory = async (complaintId) => {
        try {
            const response = await api.get(
                `complaints/${complaintId}/status-history/`
            );

            setHistory(response.data);
        } catch (error) {
            console.error("Failed to fetch status history:", error);
            setHistory([]);
        }
    };

    const handleComplaintChange = (e) => {
        const complaintId = Number(e.target.value);

        const complaint = complaints.find(
            (item) => item.id === complaintId
        );

        setSelectedComplaint(complaint);
        setHistory([]);

        if (complaint) {
            fetchStatusHistory(complaint.id);
        }
    };

    if (loading) {
        return <p>Loading complaints...</p>;
    }

    return (
        <div className="complaint-timeline-page">

            <div className="timeline-page-header">
                <h2>Complaint Timeline</h2>
                <p>Track the progress of your complaint.</p>
            </div>

            <div className="timeline-select-section">
                <label>Select Complaint</label>

                <select
                    value={selectedComplaint?.id || ""}
                    onChange={handleComplaintChange}
                >
                    <option value="">Choose a complaint</option>

                    {complaints.map((complaint) => (
                        <option key={complaint.id} value={complaint.id}>
                            Complaint ID: {complaint.id} - {complaint.title}
                        </option>
                    ))}
                </select>
            </div>

            {!selectedComplaint && (
                <p className="timeline-empty">
                    Select a complaint to view its timeline.
                </p>
            )}

            
            {selectedComplaint && (
                <div className="timeline-content">

                    {/* Complaint Information Card */}
                    <div className="timeline-complaint-card">

                        <div className="timeline-complaint-icon">
                            <span>⚡</span>
                        </div>

                        <div className="timeline-complaint-details">
                            <h3>Complaint ID: {selectedComplaint.id}</h3>
                            <p>{selectedComplaint.title}</p>
                        </div>

                        <div className="timeline-complaint-meta">
                            <span className="timeline-category">
                                {selectedComplaint.category_name ||
                                    selectedComplaint.category?.category_name ||
                                    "Category"}
                            </span>

                            <span className="timeline-priority">
                                Priority: {selectedComplaint.priority}
                            </span>

                            <span className={`timeline-current-status ${selectedComplaint.status?.toLowerCase().replace(" ", "-")}`}>
                                Current Status: {selectedComplaint.status}
                            </span>
                        </div>

                    </div>

                    {/* Horizontal Progress Tracker */}
                    <div className="timeline-progress-card">

                        <div className="timeline-progress-line">
                            <div
                                className="timeline-progress-fill"
                                style={{
                                    width: currentStep === 0
                                        ? "0%"
                                        : currentStep === 1
                                        ? "50%"
                                        : "100%"
                                }}
                            ></div>
                        </div>

                        <div className="timeline-steps">

                            {statusSteps.map((step, index) => (
                                <div className="timeline-step" key={step}>

                                    <div className={`timeline-step-icon ${
                                        index <= currentStep ? "completed" : ""
                                    }`}>
                                        {index === 0 ? "▤" : index === 1 ? "⚙" : "✓"}
                                    </div>

                                    <h4>{step}</h4>

                                </div>
                            ))}

                        </div>

                    </div>

                    {/* Status History */}
                    <div className="timeline-history-card">

                        <h3 className="timeline-history-heading">
                            <span>◷</span> Status History
                        </h3>

                        {history.length === 0 ? (
                            <p className="timeline-no-history">
                                No status history available yet.
                            </p>
                        ) : (
                            <div className="timeline-history-list">

                                {history.map((item, index) => (
                                    <div className="timeline-history-item" key={item.id}>

                                        <div className={`history-icon history-${item.new_status.toLowerCase().replace(" ", "-")}`}>
                                            {item.new_status === "Pending"
                                                ? "▤"
                                                : item.new_status === "In Progress"
                                                ? "⚙"
                                                : "✓"}
                                        </div>

                                        <div className="history-description">
                                            <h4>
                                                {item.new_status === "Pending"
                                                    ? "Complaint Submitted"
                                                    : item.new_status === "In Progress"
                                                    ? "Work Started"
                                                    : "Complaint Resolved"}
                                            </h4>

                                            <p>
                                                {item.new_status === "Pending"
                                                    ? "Your complaint has been submitted and is under review."
                                                    : item.new_status === "In Progress"
                                                    ? "The assigned staff has started working on your complaint."
                                                    : "The issue has been resolved."}
                                            </p>

                                            {item.changed_by_name && (
                                                <small>Updated by: {item.changed_by_name}</small>
                                            )}
                                        </div>

                                        <div className="history-date">
                                            {new Date(item.changed_at).toLocaleString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </div>

                                        <span className={`history-status history-badge-${item.new_status.toLowerCase().replace(" ", "-")}`}>
                                            {item.new_status}
                                        </span>

                                    </div>
                                ))}

                            </div>
                        )}

                    </div>


                </div>
            )}


        </div>
    );
}

export default ComplaintTimeline;
