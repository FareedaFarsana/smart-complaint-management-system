import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

import "../styles/auth.css"
import logo from "../assets/images/logo.png"

import Swal from "sweetalert2";
import { FiEye, FiEyeOff } from "react-icons/fi";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {

        e.preventDefault();

        if (!username || !password) {
            Swal.fire({
                icon: "warning",
                title: "Warning",
                text: "Please fill all required fields."
            });
            return;
        }

        setLoading(true);

        try {

            const response = await api.post(
                "users/login/",
                {
                    username,
                    password
                }
            );

            localStorage.setItem(
                "access",
                response.data.access
            );

            localStorage.setItem(
                "refresh",
                response.data.refresh
            );

            Swal.fire({
                icon: "success",
                title: "Login Successful",
                text: "Welcome back! Redirecting to your dashboard.",
                timer: 2000,
                showConfirmButton: false
            });

            navigate("/dashboard");

        } catch (error) {

            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: "The username or password you entered is incorrect."
            });
            console.log(error);
        } finally{
            setLoading(false)
        }
    };

  return (
    <div className="auth-container">

        <div className="auth-card">

            <div className="logo-circle logo-login">
                <img src={logo} alt="SICP Logo"/>
            </div>

            <h1>Smart Institution Complaint Portal</h1>

            <p>Sign in to manage, track, and resolve institutional complaints securely.</p>

            <form onSubmit={handleLogin}>

                <input className="full-width"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <div className="password-wrapper full-width">

                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
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

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Signing you In..." : "Sign In"}
                </button>

            </form>

            <div className="auth-links">

                <p>
                    Don't have an institution account?
                    <span onClick={() => navigate("/register")}>
                        Register Now
                    </span>
                </p>

                <p className="forgot-password">
                    Forgot Password?
                </p>

            </div>  

        </div>

    </div>
  )
}

export default Login