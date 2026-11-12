import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

import "../styles/auth.css"
import logo from "../assets/images/logo.png"
import Swal from "sweetalert2";
import { FiEye, FiEyeOff } from "react-icons/fi";

function Register() {
    const [designation, setDesignation] = useState("");
    const [phone, setPhone] = useState("");

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const designationOptions = [
        { value: "STUDENT", label: "Student" },
        { value: "FACULTY", label: "Faculty" },
        { value: "ADMIN_STAFF", label: "Administrative Staff" },
        { value: "TECHNICAL_STAFF", label: "Technical Staff" },
        { value: "MAINTENANCE_STAFF", label: "Maintenance Staff" },
        { value: "OTHER", label: "Other" }
    ];

    const navigate = useNavigate();

    const handleRegister = async (e) => {

        e.preventDefault();

        if (
            !designation ||
            !phone ||
            !username ||
            !email ||
            !password
        ) {
            Swal.fire({
                icon: "warning",
                title: "Warning",
                text: "Please fill all required fields."
            });
            return;
        }

        setLoading(true);

        try {

            await api.post("users/register/", {

                designation,

                phone,

                username,

                email,

                password

            });

            Swal.fire({
                icon: "success",
                title: "Registration Successful",
                text: "Your account has been created successfully.",
                timer: 2000,
                showConfirmButton: false
            });

            navigate("/");

        } catch (error) {

            console.log(error.response?.data);

            Swal.fire({
                icon: "error",
                title: "Registration Failed",
                text: "Unable to create your account."
            });

        } finally {

            setLoading(false);
        }
    };

  return (
    <div className="auth-container">

        <div className="auth-card">

            <div className="logo-circle logo-register">
                <img src={logo} alt="SICP Logo"/>
            </div>

            <h1>Smart Institution Complaint Portal</h1>
            <p>
                Create your account to access the complaint management portal.
            </p>    

            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    className="full-width"
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <div className="password-wrapper full-width">

                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <span
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                    </span>

                </div>

                <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                >
                    <option value="">Select designation</option>

                    {designationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account"}
                </button>

            </form>

           <div className="auth-links">

                <p>
                    Already have an account?{" "}
                    <span
                        onClick={() => navigate("/")}
                    >
                        Sign In
                    </span>
                </p>

            </div> 

        </div>
    </div>
  )
}

export default Register