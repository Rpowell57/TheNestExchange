import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";

export default function Login() {
    const [userID, setUserID] = useState(""); 
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const navigate = useNavigate();

    const onFormSubmit = async (event) => {
        event.preventDefault();
        setLoginError(""); 
    
        if (!userID || !password) {
            setLoginError("User ID and password are required.");
            return;
        }
    
        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/users/login",
                { userID, userPassword: password }, // Send as JSON body
                { headers: { "Content-Type": "application/json" } } 
            );
            console.log("Response from server:", response.data); 

            const data = response.data;
            if (data.message === "Login successful") {
                
                localStorage.setItem("userID", data.userID);
                localStorage.setItem("userFirstName", response.data.firstName);

                try {
                    const adminResponse = await axios.get(`http://127.0.0.1:8000/users/check-admin?userID=${data.userID}`);
                    const isAdmin = adminResponse.data.isAdmin;
                    localStorage.setItem("userIsAdmin", isAdmin ? "1" : "0");
                } catch (error) {
                    console.error("Failed to fetch admin status", error);
                    localStorage.setItem("userIsAdmin", "0");
                }
            
                window.dispatchEvent(new Event("storage"));
                navigate("/ClaimerPage");
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
                        <Link to="/register" className="btn btn-primary">Register</Link>
                    </div>

                    <div className="forgot-password">
                        <Link to="/">Forgot Password?</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
