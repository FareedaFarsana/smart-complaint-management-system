import { useState, useEffect } from "react"

import api from "../../services/api"
import "../../styles/complaintGrid.css"

import Swal from "sweetalert2";

import Badge from "../common/Badge"
import ActionButtons from "../common/ActionButtons"

function ComplaintGrid({ 
    complaints =[], 
    userRole,
    onComplaintUpdated, 
    onComplaintDeleted 
}) {

    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [editingComplaint, setEditingComplaint] = useState(null);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [feedbackData, setFeedbackData] = useState({
        rating: 0,
        service_experience: 0,
        comments: ""
    });
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [categories, setCategories] = useState([]);
    // Store the list of Staff users and assignment loading state
    const [staffUsers, setStaffUsers] = useState([]);
    const [assigningComplaintId, setAssigningComplaintId] = useState(null);

    // Load Staff users when the complaint table opens
    useEffect(() => {
        if(userRole == "ADMIN"){
        fetchStaffUsers();
        }
    }, [userRole]);

    // Fetch categories from backend
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get("categories/");
                setCategories(response.data);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };

        fetchCategories();
    }, []);

    const handleView = (complaint) => {
        setSelectedComplaint(complaint);
        setShowFeedbackForm(false);
        setFeedbackSubmitted(false);

        if (userRole === "USER" && complaint.status === "Resolved") {
            checkExistingFeedback(complaint.id);
        }
    };

    const handleEdit = (complaint) => {
        console.log("Editing:", complaint);
        setEditingComplaint(complaint);
    };

    const handleSubmitFeedback = async () => {

        if (!feedbackData.rating || !feedbackData.service_experience) {
            alert("Please select both ratings.");
            return;
        }

        try {
            const response = await api.post("feedback/", {
                complaint: selectedComplaint.id,
                rating: feedbackData.rating,
                service_experience: feedbackData.service_experience,
                comments: feedbackData.comments
            });

            alert(response.data.message);

            setFeedbackData({
                rating: 0,
                service_experience: 0,
                comments: ""
            });

            setShowFeedbackForm(false);
            setSelectedComplaint(null);

        } catch (error) {
            console.error("Feedback submission failed:", error);

            alert(
                error.response?.data?.error ||
                error.response?.data?.detail ||
                JSON.stringify(error.response?.data) ||
                "Failed to submit feedback."
            );
        }
    };

    
    // Fetch available Staff users from the backend
    const fetchStaffUsers = async () => {
        try {
            const response = await api.get("users/admin-users/?role=STAFF");

            console.log("Staff API response:", response.data);

            setStaffUsers(response.data);
        } catch (error) {
            console.error(
                "Failed to fetch Staff users:",
                error.response?.data || error
            );
        }
    };


    
    // Assign a Staff member to a complaint
    const handleAssignStaff = async (complaint, staffId) => {
        try {
            setAssigningComplaintId(complaint.id);

            const response = await api.patch(
                `complaints/${complaint.id}/`,
                {
                    assigned_staff: staffId === "" ? null : Number(staffId)
                }
            );

            // Update the complaint in the table
            onComplaintUpdated(response.data);

            Swal.fire({
                icon: "success",
                title: "Staff Assigned!",
                text: staffId
                    ? "The complaint has been assigned successfully."
                    : "The staff assignment has been removed.",
                timer: 2000,
                showConfirmButton: false
            });

        } catch (error) {
            console.error("Assignment error:", error.response?.data || error);

            Swal.fire({
                icon: "error",
                title: "Assignment Failed",
                text: error.response?.data?.detail ||
                    "Unable to assign staff to this complaint."
            });
        } finally {
            setAssigningComplaintId(null);
        }
    };

    const handleDelete = async (complaint) => {

        const result = await Swal.fire({
            title: "Delete Complaint?",
            text: `Are you sure you want to delete "${complaint.title}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b"
        });

        if (result.isConfirmed) {

            try {

                await api.delete(`complaints/${complaint.id}/`);

                console.log("Complaint deleted:", complaint.id);

                onComplaintDeleted(complaint.id);

                Swal.fire({
                    title: "Deleted!",
                    text: "Complaint has been deleted successfully.",
                    icon: "success",
                    confirmButtonColor: "#4f46e5"
                });

            } catch (error) {

                console.log("Delete error:", error);

                Swal.fire({
                    title: "Error!",
                    text: "Failed to delete complaint.",
                    icon: "error",
                    confirmButtonColor: "#ef4444"
                });
            }
        }
    };

    
    const handleSaveEdit = async () => {
        try {
            const updateData =
                userRole === "STAFF"
                    ? {
                        status: editingComplaint.status
                    }
                    : {
                        title: editingComplaint.title,
                        category: editingComplaint.category,
                        priority: editingComplaint.priority,
                        description: editingComplaint.description,
                        status: editingComplaint.status
                    };

            const response = await api.patch(
                `complaints/${editingComplaint.id}/`,
                updateData
            );

            console.log("Updated complaint:", response.data);
            onComplaintUpdated(response.data);
            setEditingComplaint(null);

            Swal.fire({
                icon: "success",
                title: "Complaint Updated!",
                timer: 1500,
                showConfirmButton: false
            });

        } catch (error) {
            console.error(
                "Update error:",
                error.response?.data || error
            );

            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text: JSON.stringify(
                    error.response?.data || "Unable to update complaint."
                )
            });
        }
    };

    const checkExistingFeedback = async (complaintId) => {
        try {
            const response = await api.get(
                `feedback/check/${complaintId}/`
            );

            setFeedbackSubmitted(response.data.submitted);

        } catch (error) {
            console.error("Failed to check feedback:", error);
        }
    };


  return (
    <div className="complaint-grid">

            <table>

                <thead>

                    <tr>

                        <th>ID</th>

                        <th>Title</th>

                        <th>Category</th>

                        <th>Priority</th>

                        <th>Status</th>

                        <th>Assigned Staff</th>

                        <th>Date</th>

                        <th>Actions</th>

                    </tr>

                </thead>

                <tbody>

                    {complaints.length > 0 ? (

                        complaints.map((complaint) => (

                            <tr key={complaint.id}>

                              <td>{complaint.id}</td>

                              <td>{complaint.title}</td>

                              <td>{complaint.category_name}</td>

                              <td>

                                  <Badge

                                      text={complaint.priority}

                                      type={complaint.priority.toLowerCase()}

                                  />

                              </td>

                              <td>

                                  <Badge

                                      text={complaint.status}

                                      type={
                                          complaint.status
                                              .toLowerCase()
                                              .replace(" ", "-")
                                      }

                                  />

                              </td>

                              <td>
                                {userRole === "ADMIN" ? (
                                    <select
                                        value={complaint.assigned_staff ?? ""}
                                        disabled={assigningComplaintId === complaint.id}
                                        onChange={(e) =>
                                            handleAssignStaff(complaint, e.target.value)
                                        }
                                    >
                                        <option value="">Unassigned</option>

                                        {staffUsers.map((staff) => (
                                            <option key={staff.id} value={staff.id}>
                                                {staff.username}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <span>
                                        {complaint.assigned_staff_name || "Unassigned"}
                                    </span>
                                )}
                            </td>

                              <td>
                                {new Date(complaint.created_at).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                })}
                              </td>

                              <td>

                                  <ActionButtons

                                        onView={() => handleView(complaint)}

                                        onEdit={() => handleEdit(complaint)}

                                        onDelete={() => handleDelete(complaint)}

                                        userRole={userRole}
                                  />

                              </td>

                            </tr>

                        ))

                    ) : (

                        <tr>

                            <td
                                colSpan="8"
                                className="empty-state"
                            >
                                No complaints found.
                            </td>

                        </tr>

                    )}

                </tbody>

            </table>

            {/*view  modal popup */}
            {selectedComplaint && !showFeedbackForm &&(
                <div className="complaint-modal">

                    <div className="complaint-modal-content">

                        <div className="modal-header">
                            <h2>Complaint Details</h2>

                            <button
                                className="modal-close"
                                onClick={() => setSelectedComplaint(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="complaint-details">

                            <p>
                                <strong>Complaint ID:</strong>
                                {selectedComplaint.id}
                            </p>

                            <p>
                                <strong>Title:</strong>
                                {selectedComplaint.title}
                            </p>

                            <p>
                                <strong>Category:</strong>
                                {selectedComplaint.category_name}
                            </p>

                            <div className="detail-row">
                                <strong>Priority:</strong>

                                <Badge
                                    text={selectedComplaint.priority}
                                    type={selectedComplaint.priority.toLowerCase()}
                                />
                            </div>

                            <div className="detail-row">
                                <strong>Status:</strong>

                                <Badge
                                    text={selectedComplaint.status}
                                    type={
                                        selectedComplaint.status
                                            .toLowerCase()
                                            .replace(" ", "-")
                                    }
                                />
                            </div>

                            <p>
                                <strong>Created:</strong>
                                {new Date(
                                    selectedComplaint.created_at
                                ).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                })}
                            </p>

                            <p>
                                <strong>Description:</strong>
                                {selectedComplaint.description}
                            </p>

                            {selectedComplaint.image && (
                                <div className="detail-image">
                                    <strong>Complaint Image:</strong>

                                    <img
                                        src={
                                            selectedComplaint.image.startsWith("http")
                                                ? selectedComplaint.image
                                                : `http://127.0.0.1:8000${selectedComplaint.image}`
                                        }
                                        alt="Complaint"
                                    />
                                </div>
                            )}

                        </div>

                        {userRole === "USER" &&
                            selectedComplaint.status === "Resolved" && (
                                <div className="feedback-action">
                                    {feedbackSubmitted ? (
                                        <button className="feedback-submitted-btn" disabled>
                                            ✓ Feedback Submitted
                                        </button>
                                    ) : (
                                        <button
                                            className="feedback-btn"
                                            onClick={() => setShowFeedbackForm(true)}
                                        >
                                            ★ Give Feedback
                                        </button>
                                    )}
                                </div>
                        )}

                    </div>

                </div>
            )}
            {/* Separate Feedback Modal */}
            {showFeedbackForm && selectedComplaint && (
                <div className="complaint-modal">

                    <div className="complaint-modal-content feedback-modal-content">

                        <div className="modal-header">
                            <h2>Share Your Feedback</h2>

                            <button
                                className="modal-close"
                                onClick={() => setShowFeedbackForm(false)}
                            >
                                ×
                            </button>
                        </div>

                        <p>
                            Complaint #{selectedComplaint.id} – {selectedComplaint.title}
                        </p>

                        {/* Overall Rating */}
                        <div className="feedback-field">
                            <label>Overall Rating</label>

                            <div className="star-rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        onClick={() =>
                                            setFeedbackData({
                                                ...feedbackData,
                                                rating: star
                                            })
                                        }
                                        style={{
                                            color: star <= feedbackData.rating
                                                ? "#f5b51b"
                                                : "#ccc",
                                            cursor: "pointer",
                                            fontSize: "28px"
                                        }}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Service Experience */}
                        <div className="feedback-field">
                            <label>Service Experience</label>

                            <div className="experience-rating">
                                {[
                                    { value: 1, emoji: "☹️", label: "Very Poor" },
                                    { value: 2, emoji: "🙁", label: "Poor" },
                                    { value: 3, emoji: "😐", label: "Average" },
                                    { value: 4, emoji: "🙂", label: "Good" },
                                    { value: 5, emoji: "😊", label: "Excellent" }
                                ].map((item) => (
                                    <button
                                        type="button"
                                        key={item.value}
                                        className={
                                            feedbackData.service_experience === item.value
                                                ? "experience-selected"
                                                : ""
                                        }
                                        onClick={() =>
                                            setFeedbackData({
                                                ...feedbackData,
                                                service_experience: item.value
                                            })
                                        }
                                    >
                                        <span>{item.emoji}</span>
                                        <small>{item.label}</small>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="feedback-field">
                            <label>Comments</label>

                            <textarea
                                placeholder="Share your experience..."
                                value={feedbackData.comments}
                                onChange={(e) =>
                                    setFeedbackData({
                                        ...feedbackData,
                                        comments: e.target.value
                                    })
                                }
                            />
                        </div>

                        {/* Submit */}
                        <button
                            className="feedback-submit-btn"
                            onClick={handleSubmitFeedback}
                        >
                            Submit Feedback
                        </button>

                    </div>
                </div>
            )}

            {/* edit modal */}
            {editingComplaint && (
                <div className="complaint-modal">

                    <div className="complaint-modal-content">

                        <div className="modal-header">

                            <h2>Edit Complaint</h2>

                            <button
                                className="modal-close"
                                onClick={() => setEditingComplaint(null)}
                            >
                                ×
                            </button>

                        </div>

                        <div className="complaint-details">

                            {/* Title */}
                            <div className="edit-field">
                                <label>Title</label>

                                <input
                                    type="text"
                                    value={editingComplaint.title}
                                    disabled={userRole === "STAFF"}
                                    onChange={(e) =>
                                        setEditingComplaint({
                                            ...editingComplaint,
                                            title: e.target.value
                                        })
                                    }
                                />
                            </div>

                            {/* category */}
                            <div className="edit-field">
                                <label>Category</label>

                                <select
                                    value={editingComplaint.category}
                                    disabled={userRole === "STAFF"}
                                    onChange={(e) =>
                                        setEditingComplaint({
                                            ...editingComplaint,
                                            category: Number(e.target.value)
                                        })
                                    }
                                >
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.category_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* priority */}
                            <div className="edit-field">
                                <label>Priority</label>

                                <select
                                    value={editingComplaint.priority}
                                    disabled={userRole === "STAFF"}
                                    onChange={(e) =>
                                    setEditingComplaint({
                                        ...editingComplaint,
                                        priority: e.target.value
                                    })
                                    }
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                            {/* description */}
                            <div className="edit-field">
                                <label>Description</label>

                                <textarea
                                    value={editingComplaint.description}
                                    disabled={userRole === "STAFF"}
                                    onChange={(e) =>
                                    setEditingComplaint({
                                        ...editingComplaint,
                                        description: e.target.value
                                    })
                                    }
                                    rows="5"
                                />
                            </div>

                            {/* {status} */}
                            <div className="edit-field">
                                <label>Status</label>

                                <select
                                    value={editingComplaint.status}
                                    onChange={(e) =>
                                        setEditingComplaint({
                                            ...editingComplaint,
                                            status: e.target.value
                                        })
                                    }
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                </select>
                            </div>

                            {/* edit btn */}
                            <div className="edit-actions">
                                <button
                                    className="save-btn"
                                    onClick={handleSaveEdit}
                                >
                                    Save Changes
                                </button>

                                <button
                                    className="cancel-btn"
                                    onClick={() => setEditingComplaint(null)}
                                >
                                    Cancel
                                </button>
                            </div>

                        </div>

                    </div>

                </div>
            )}

        </div>
  )
}

export default ComplaintGrid