import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";

export default function Login() {
    const [userID, setUserID] = useState(""); // Updated to match backend param
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const navigate = useNavigate();

    const onFormSubmit = async (event) => {
        event.preventDefault();
        setLoginError(""); // Clear previous errors

        if (!userID || !password) {
            setLoginError("User ID and password are required.");
            return;
        }

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/users/login", 
                null, // No body needed, just query params
                { params: { userID, userPassword: password } }
            );

            if (response.data.message === "Login successful") {
                navigate("/ClaimerPage"); // Redirect on success
            } else {
                setLoginError("Invalid credentials.");
            }
        } catch (error) {
            setLoginError(error.response?.data?.detail || "Login failed.");
        }
    };

    return (
        <div className="container login-container">
            <div className="login-box">
                <h1>Login</h1>

                <form onSubmit={onFormSubmit}>
                    <div className="form-group">
                        <label htmlFor="userID" className="form-label">User ID</label>
                        <input
                            type="text"
                            className="form-control"
                            id="userID"
                            name="userID"
                            value={userID}
                            onChange={(e) => setUserID(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {loginError && (
                        <div className="alert alert-danger">
                            <strong>{loginError}</strong>
                        </div>
                    )}

                    <div className="button-group">
                        <button type="submit" className="btn btn-secondary">Login</button>
                        <Link to="/" className="btn btn-primary">Register</Link>
                    </div>

                    <div className="forgot-password">
                        <Link to="/">Forgot Password?</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
