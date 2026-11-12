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
    // Store the list of Staff users and assignment loading state
    const [staffUsers, setStaffUsers] = useState([]);
    const [assigningComplaintId, setAssigningComplaintId] = useState(null);

    // Load Staff users when the complaint table opens
    useEffect(() => {
        if(userRole == "ADMIN"){
        fetchStaffUsers();
        }
    }, [userRole]);

    const handleView = (complaint) => {
        setSelectedComplaint(complaint);
    };

    const handleEdit = (complaint) => {
        console.log("Editing:", complaint);
        setEditingComplaint(complaint);
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
            {selectedComplaint && (
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
                                        category: e.target.value
                                    })
                                    }
                                >
                                    <option value="1">Electrical</option>
                                    <option value="2">Plumbing</option>
                                    <option value="3">Housekeeping</option>
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