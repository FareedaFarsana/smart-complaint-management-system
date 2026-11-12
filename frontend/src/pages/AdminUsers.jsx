import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/adminUsers.css";

import Swal from "sweetalert2";

function AdminUsers() {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [openMenu, setOpenMenu] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editUser, setEditUser] = useState(null);

    const [editRole, setEditRole] = useState("");
    const [editDesignation, setEditDesignation] = useState("");
    const [saving, setSaving] = useState(false);

    const totalUsers = users.length;

    const adminCount = users.filter(
        (user) => user.role === "ADMIN"
    ).length;

    const staffCount = users.filter(
        (user) => user.role === "STAFF"
    ).length;

    const regularUserCount = users.filter(
        (user) => user.role === "USER"
    ).length;

    const filteredUsers = users.filter((user) => {
        const searchText = search.toLowerCase();

        const matchesSearch =
            (user.username ?? "").toLowerCase().includes(searchText) ||
            (user.email ?? "").toLowerCase().includes(searchText) ||
            (user.designation ?? "").toLowerCase().includes(searchText) ||
            (user.phone ?? "").includes(search);

        const matchesRole =
            roleFilter === "" || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get("users/admin-users/");
            console.log("Admin users:", response.data);
            setUsers(response.data);
        } catch (error) {
            console.log("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveChanges = async () => {
        try {
            setSaving(true);

            console.log("Selected role:", editRole);
            console.log("Selected designation:", editDesignation);

            await api.patch(
                `users/admin-users/${editUser.id}/`,
                {
                    role: editRole,
                    designation: editDesignation,
                }
            );

            await fetchUsers();
            setEditUser(null);

            Swal.fire({
            icon: "success",
            title: "User Updated!",
            text: "The user details have been updated successfully.",
            confirmButtonText: "OK",
            confirmButtonColor: "#4f46e5",
            timer: 2500,
            timerProgressBar: true,
        });
        } catch (error) {
            console.error("Update error:", error);
            console.error("Response data:", error.response?.data);

            alert(
                JSON.stringify(
                    error.response?.data || error.message,
                    null,
                    2
                )
            );
        } finally {
            setSaving(false);
        }
    };

  return (
    <div className="admin-users-page">

        <div className="admin-users-header">
            <div>
                <h1>Users</h1>
                <p>Manage users of ABC Engineering College.</p>
            </div>
    
        </div>

        <div className="user-summary">

            <div className="summary-card">
                <span>Total Users</span>
                <h2>{totalUsers}</h2>
            </div>

            <div className="summary-card">
                <span>Admins</span>
                <h2>{adminCount}</h2>
            </div>

            <div className="summary-card">
                <span>Staff</span>
                <h2>{staffCount}</h2>
            </div>

            <div className="summary-card">
                <span>Regular Users</span>
                <h2>{regularUserCount}</h2>
            </div>

        </div>

        <div className="user-tools">

            <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
            >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="STAFF">Staff</option>
                <option value="USER">Regular Users</option>
            </select>

        </div>


            {loading ? (
                <p>Loading users...</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Designation</th>
                            <th>Phone</th>
                            <th>Institution</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <div className="user-info">

                                        <div className="user-avatar">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>

                                        <span>{user.username}</span>

                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span
                                        className={`role-badge role-${(user.role ?? "unknown").toLowerCase()}`}
                                    >
                                        {user.role ?? "Not assigned"}
                                    </span>
                                </td>
                                {(user.designation ?? "Not assigned")
                                    .replaceAll("_", " ")
                                    .toLowerCase()
                                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                                <td>{user.phone}</td>
                                <td>{user.institution}</td>

                                <td className="action-cell">
                                    <button
                                        className="action-button"
                                        onClick={() =>
                                            setOpenMenu(openMenu === user.id ? null : user.id)
                                        }
                                    >
                                        ⋮
                                    </button>

                                    {openMenu === user.id && (
                                        <div className="action-menu">

                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setOpenMenu(null);
                                                }}
                                            >
                                                View
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setEditUser(user);
                                                    setEditRole(user.role);
                                                    setEditDesignation(user.designation);
                                                    setOpenMenu(null);
                                                }}
                                            >
                                                Edit
                                            </button>

                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {selectedUser && (
                <div className="modal-overlay">

                    <div className="user-details">

                        <div className="modal-user-header">

                            <div className="modal-user-avatar">
                                {selectedUser.username.charAt(0).toUpperCase()}
                            </div>

                            <div className="modal-user-info">
                                <h2>{selectedUser.username}</h2>

                                <span className={`role-badge role-${selectedUser.role.toLowerCase()}`}>
                                    {selectedUser.role}
                                </span>
                            </div>

                        </div>

                        <p>
                            <strong>Username:</strong> {selectedUser.username}
                        </p>

                        <p>
                            <strong>Email:</strong> {selectedUser.email}
                        </p>

                        <p>
                            <strong>Role:</strong> {selectedUser.role}
                        </p>

                        <p>
                            <strong>Designation:</strong> {selectedUser.designation}
                        </p>

                        <p>
                            <strong>Phone:</strong> {selectedUser.phone}
                        </p>

                        <p>
                            <strong>Institution:</strong> {selectedUser.institution}
                        </p>

                        <button onClick={() => setSelectedUser(null)}>
                            Close
                        </button>

                    </div>

                </div>
            )}

            {editUser && (
                <div className="modal-overlay">

                    <div className="user-details">

                        <h2>Edit User</h2>

                        <p>
                            <strong>Username:</strong> {editUser.username}
                        </p>

                        <p>
                            <strong>Email:</strong> {editUser.email}
                        </p>

                        <label>Role</label>

                        <select 
                            value={editRole}
                            onChange={(e)=> setEditRole(e.target.value)}
                        >    
                            <option value="USER">User</option>
                            <option value="STAFF">Staff</option>
                            <option value="ADMIN">Admin</option>
                        </select>

                        <label>Designation</label>

                        <select 
                            value={editDesignation}
                            onChange={(e)=> setEditDesignation(e.target.value)}
                        >
                            <option value="STUDENT">Student</option>
                            <option value="FACULTY">Faculty</option>
                            <option value="ADMIN_STAFF">Administrative Staff</option>
                            <option value="TECHNICAL_STAFF">Technical Staff</option>
                            <option value="MAINTENANCE_STAFF">Maintenance Staff</option>
                            <option value="OTHER">Other</option>
                        </select>

                        <div className="edit-actions">

                            <button
                                className="cancel-button"
                                onClick={() => {
                                    setEditUser(null);
                                }}
                            >
                                Cancel
                            </button>

                            <button 
                                className="save-button"
                                onClick={handleSaveChanges}
                                disabled={saving}
                            >
                                {saving ? "saving..." : "Save Changes"}
                            </button>

                        </div>

                    </div>

                </div>
            )}
    </div>
  )
}

export default AdminUsers