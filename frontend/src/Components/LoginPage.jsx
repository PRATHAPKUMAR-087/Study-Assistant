import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Styles/LoginPage.css"; // Ensure the CSS file is linked

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const API_BASE_URL = "http://localhost:5000/api";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
    
        try {
            const response = await axios.post(
                `${API_BASE_URL}/login`, 
                { email, password },
                { withCredentials: true }  // ✅ Allow session cookies
            );
    
            if (response.data.success) {
                sessionStorage.setItem("authToken", response.data.token);
                sessionStorage.setItem("userEmail", email);
                sessionStorage.setItem("userUUID", response.data.uuid);
                sessionStorage.setItem("username", response.data.username);
                navigate("/dashboard");
            } else {
                setError(response.data.message || "Invalid credentials.");
            }
        } catch (error) {
            setError(error.response?.data?.message || "Server error. Please try again.");
            console.error("Login Error:", error.response?.data || error.message);
        }
    };
    

    return (
        <div className="login-page">
            <div className="login-container">
                <h2>Login</h2>
                <p className="subtitle">Access your personalized study plan</p>

                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={!email || !password}>
                        Login
                    </button>
                </form>

                <p className="register-link">
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
