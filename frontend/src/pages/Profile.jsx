
import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";
import "../styles/profile.css";

import {
    FiUser,
    FiMail,
    FiPhone,
    FiBriefcase,
    FiShield,
    FiHome,
    FiEdit2,
    FiSave,
    FiX,
    FiLock,
    FiEye,
    FiEyeOff,
    FiKey,
} from "react-icons/fi";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [saving, setSaving] = useState(false);

    const [visiblePasswords, setVisiblePasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [formData, setFormData] = useState({
        email: "",
        phone: "",
    });

    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get("users/me/");
            setProfile(response.data);

            setFormData({
                email: response.data.email || "",
                phone: response.data.phone || "",
            });
        } catch (err) {
            console.error("Failed to fetch profile:", err);
            setError("Unable to load profile details.");
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;

        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEdit = () => {
        setFormData({
            email: profile.email || "",
            phone: profile.phone || "",
        });
        setError("");
        setSuccess("");
        setIsChangingPassword(false);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setFormData({
            email: profile.email || "",
            phone: profile.phone || "",
        });
        setIsEditing(false);
        setError("");
        setSuccess("");
    };

    const handleChangePasswordClick = () => {
        setPasswordData({
            current_password: "",
            new_password: "",
            confirm_password: "",
        });
        setVisiblePasswords({
            current: false,
            new: false,
            confirm: false,
        });
        setError("");
        setSuccess("");
        setIsEditing(false);
        setIsChangingPassword(true);
    };

    const handleCancelPassword = () => {
        setPasswordData({
            current_password: "",
            new_password: "",
            confirm_password: "",
        });
        setIsChangingPassword(false);
        setError("");
        setSuccess("");
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.email.trim() || !formData.phone.trim()) {
            setError("Email and phone number are required.");
            return;
        }

        try {
            setSaving(true);

            const response = await api.patch("users/me/update/", {
                email: formData.email.trim(),
                phone: formData.phone.trim(),
            });

            setProfile(response.data);
            setFormData({
                email: response.data.email || "",
                phone: response.data.phone || "",
            });

            setIsEditing(false);
            setSuccess("Profile updated successfully.");
        } catch (err) {
            console.error("Profile update failed:", err);
            const message =
                err.response?.data?.error ||
                err.response?.data?.detail ||
                "Failed to update profile. Please try again.";

            setError(
                Array.isArray(message)
                    ? message.join(" ")
                    : message
            );
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const {
            current_password,
            new_password,
            confirm_password,
        } = passwordData;

        if (!current_password || !new_password || !confirm_password) {
            setError("Please fill in all password fields.");
            return;
        }

        if (new_password !== confirm_password) {
            setError("New password and confirmation do not match.");
            return;
        }

        if (new_password === current_password) {
            setError("Your new password must differ from your current password.");
            return;
        }

        try {
            setSaving(true);

            const response = await api.post(
                "users/change-password/",
                passwordData
            );

            setPasswordData({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });

            setIsChangingPassword(false);
            setSuccess(
                response.data?.message || "Password changed successfully."
            );
        } catch (err) {
            console.error("Password change failed:", err);

            const responseData = err.response?.data;
            const message =
                responseData?.error ||
                responseData?.detail ||
                "Unable to change password. Please check your details.";

            setError(
                Array.isArray(message)
                    ? message.join(" ")
                    : message
            );
        } finally {
            setSaving(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setVisiblePasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="profile-message">Loading profile...</div>
            </MainLayout>
        );
    }

    if (!profile) {
        return (
            <MainLayout>
                <div className="profile-message profile-error">
                    {error || "Profile information is unavailable."}
                </div>
            </MainLayout>
        );
    }

    const roleLabels = {
        ADMIN: "Administrator",
        STAFF: "Staff",
        USER: "User",
    };

    const details = [
        {
            label: "Username",
            value: profile.username || "Not provided",
            icon: <FiUser />,
        },
        {
            label: "Email Address",
            value: profile.email || "Not provided",
            icon: <FiMail />,
        },
        {
            label: "Role",
            value: roleLabels[profile.role] || profile.role || "Not provided",
            icon: <FiShield />,
        },
        {
            label: "Designation",
            value: profile.designation || "Not provided",
            icon: <FiBriefcase />,
        },
        {
            label: "Phone Number",
            value: profile.phone || "Not provided",
            icon: <FiPhone />,
        },
        {
            label: "Institution",
            value: profile.institution_name || "Not provided",
            icon: <FiHome />,
        },
        {
            label: "Institution Type",
            value: profile.institution_type || "Not provided",
            icon: <FiHome />,
        },
    ];

    return (
        <MainLayout>
            <div className="profile-page">
                <div className="profile-heading">
                    <div>
                        <h1>My Profile</h1>
                        <p>Manage your account information and security.</p>
                    </div>

                    {!isEditing && !isChangingPassword && (
                        <div className="profile-heading-actions">
                            <button
                                type="button"
                                className="profile-edit-btn"
                                onClick={handleEdit}
                            >
                                <FiEdit2 />
                                Edit Profile
                            </button>

                            <button
                                type="button"
                                className="profile-password-btn"
                                onClick={handleChangePasswordClick}
                            >
                                <FiLock />
                                Change Password
                            </button>
                        </div>
                    )}
                </div>

                {success && (
                    <div className="profile-alert profile-success" role="status">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="profile-alert profile-error" role="alert">
                        {error}
                    </div>
                )}

                <section className="profile-banner">
                    <div className="profile-avatar">
                        <FiUser />
                    </div>

                    <div className="profile-banner-info">
                        <h2>{profile.username}</h2>
                        <p>{roleLabels[profile.role] || profile.role}</p>
                    </div>
                </section>

                {isEditing ? (
                    <section className="profile-details-card">
                        <h3>Edit Personal Information</h3>
                        <p className="profile-form-description">
                            Update your email address and phone number.
                        </p>

                        <form onSubmit={handleProfileSubmit}>
                            <div className="profile-form-grid">
                                <div className="profile-form-group">
                                    <label htmlFor="profile-email">
                                        Email Address
                                    </label>
                                    <input
                                        id="profile-email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleProfileChange}
                                        required
                                    />
                                </div>

                                <div className="profile-form-group">
                                    <label htmlFor="profile-phone">
                                        Phone Number
                                    </label>
                                    <input
                                        id="profile-phone"
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleProfileChange}
                                        maxLength={15}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="profile-form-actions">
                                <button
                                    type="button"
                                    className="profile-cancel-btn"
                                    onClick={handleCancelEdit}
                                    disabled={saving}
                                >
                                    <FiX /> Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="profile-save-btn"
                                    disabled={saving}
                                >
                                    <FiSave />
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </section>
                ) : isChangingPassword ? (
                    <section className="profile-details-card">
                        <div className="password-form-heading">
                            <div className="password-heading-icon">
                                <FiKey />
                            </div>
                            <div>
                                <h3>Change Password</h3>
                                <p className="profile-form-description">
                                    Choose a strong password to protect your account.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordSubmit}>
                            <div className="profile-password-fields">
                                {[
                                    {
                                        name: "current_password",
                                        label: "Current Password",
                                        key: "current",
                                    },
                                    {
                                        name: "new_password",
                                        label: "New Password",
                                        key: "new",
                                    },
                                    {
                                        name: "confirm_password",
                                        label: "Confirm New Password",
                                        key: "confirm",
                                    },
                                ].map((field) => (
                                    <div
                                        className="profile-form-group"
                                        key={field.name}
                                    >
                                        <label htmlFor={field.name}>
                                            {field.label}
                                        </label>

                                        <div className="password-input-wrapper">
                                            <input
                                                id={field.name}
                                                type={
                                                    visiblePasswords[field.key]
                                                        ? "text"
                                                        : "password"
                                                }
                                                name={field.name}
                                                value={passwordData[field.name]}
                                                onChange={handlePasswordChange}
                                                autoComplete={
                                                    field.key === "current"
                                                        ? "current-password"
                                                        : "new-password"
                                                }
                                                required
                                            />

                                            <button
                                                type="button"
                                                className="password-visibility-btn"
                                                onClick={() =>
                                                    togglePasswordVisibility(field.key)
                                                }
                                                aria-label={
                                                    visiblePasswords[field.key]
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                            >
                                                {visiblePasswords[field.key]
                                                    ? <FiEyeOff />
                                                    : <FiEye />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="profile-form-actions">
                                <button
                                    type="button"
                                    className="profile-cancel-btn"
                                    onClick={handleCancelPassword}
                                    disabled={saving}
                                >
                                    <FiX /> Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="profile-save-btn"
                                    disabled={saving}
                                >
                                    <FiLock />
                                    {saving ? "Updating..." : "Update Password"}
                                </button>
                            </div>
                        </form>
                    </section>
                ) : (
                    <section className="profile-details-card">
                        <h3>Account Information</h3>

                        <div className="profile-details-grid">
                            {details.map((item) => (
                                <div
                                    className="profile-detail"
                                    key={item.label}
                                >
                                    <div className="profile-detail-icon">
                                        {item.icon}
                                    </div>
                                    <div className="profile-detail-info">
                                        <span>{item.label}</span>
                                        <strong>{item.value}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </MainLayout>
    );
}

export default Profile;
