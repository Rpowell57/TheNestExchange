import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css"; 

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const navigate = useNavigate();

    const onFormSubmit = (event) => {
        event.preventDefault();

        if (!email || !password) {
            setLoginError("Email and password are required.");
            return;
        }

        // Simulating authentication (replace with API call)
        if (email === "user@example.com" && password === "password") {
            navigate("/dashboard"); // Redirect on success
        } else {
            setLoginError("Invalid email or password");
        }
    };

    return (
        <div className="container login-container">
            <div className="login-box">
                <h1>Login</h1>

                <form onSubmit={onFormSubmit}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                        <Link to ="/ClaimerPage" type="submit" className="btn btn-secondary">Login</Link>
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
