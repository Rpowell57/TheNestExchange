import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./register.css";

export default function Register() {
    const [userID, setUserID] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isStudent, setIsStudent] = useState(0);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    
    const navigate = useNavigate();

    const onFormSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!userID || !email || !password || !firstName || !lastName) {
            setError("All fields are required.");
            return;
        }
        const calculatedIsAdmin = isStudent ? 0 : 1;
        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/users/create",
                {
                    userID,
                    userEmail: email,
                    userPassword: password,
                    userFirstName: firstName,
                    userLastName: lastName,
                    userIsStudent: isStudent,
                    userIsAdmin: isStudent ? 0 : 1
                },
                { headers: { "Content-Type": "application/json" } }
            );
            
            if (response.data.message === "User created successfully") {
                setSuccess("Registration successful! Redirecting to login...");
                setTimeout(() => navigate("/login"), 2000);
            }
        } catch (error) {
            setError(error.response?.data?.detail || "Registration failed.");
        }
    };
    
    return (
        <div className="background-image">
        <div className="background-container">
        <div className="lister-container"></div>
        <div className="container register-container">
            <div className="register-box">
                <h1>Register</h1>
                <form onSubmit={onFormSubmit}>
                    <div className="form-group">
                        <label htmlFor="userID">User ID</label>
                        <input type="text" className="form-control" id="userID" value={userID} onChange={(e) => setUserID(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input type="text" className="form-control" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input type="text" className="form-control" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>
                            <input type="checkbox" checked={isStudent} onChange={() => setIsStudent(isStudent ? 0 : 1)} /> I am a student
                        </label>
                    </div> 
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    <div className="button-group">
                        <button type="submit" className="btn btn-primary">Register</button>
                        <Link to="/login" className="btn btn-secondary">Back to Login</Link>
                    </div>
                </form>
            </div>
        </div>
        </div>
        </div>
    );
}
