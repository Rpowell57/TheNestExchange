import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ksuLogo from "./assets/ksulogo.png";
import "./Navbar.css";

export default function NavBar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const userID = localStorage.getItem("userID");
            const adminFlag = localStorage.getItem("userIsAdmin");

            console.log("userID:", userID);
            console.log("userIsAdmin:", adminFlag);

            setIsAuthenticated(!!userID);
            setIsAdmin(adminFlag === "1");
        };

        checkAuth();
        window.addEventListener("storage", checkAuth);
        return () => window.removeEventListener("storage", checkAuth);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("userID");
        localStorage.removeItem("userIsAdmin");
        window.dispatchEvent(new Event("storage"));
        setIsAuthenticated(false);
        setIsAdmin(false);
    };

    return (
        <nav className="navbar">
            <div className="container">
                <img className="logo" src={ksuLogo} alt="KSU Logo" />

                <div className="navbar-container" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link className="nav-link" to="/HomePage">Home Page</Link>
                        </li>

                        {isAuthenticated && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/ListerPage">Lister</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/ClaimerPage">Claimer</Link>
                                </li>

                                {isAdmin && (
                                    <li className="nav-item dropdown">
                                        <span
                                            className="nav-link dropdown-toggle"
                                            role="button"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                            style={{ cursor: "pointer" }}
                                        >
                                            Admin
                                        </span>
                                        <ul className="dropdown-menu">
                                            <li>
                                                <Link className="dropdown-item" to="/Admin">Admin Dashboard</Link>
                                                <Link className="dropdown-item" to="/ManageListing">Manage Listings</Link>
                                                <Link className="dropdown-item" to="/ViewAllUsers">View All Users</Link>
                                            </li>
                                        </ul>
                                    </li>
                                )}
                            </>
                        )}
                    </ul>

                    <div className="navbar-right">
                        {isAuthenticated ? (
                            <button
                                className="nav-btn"
                                onClick={handleLogout}
                                style={{ backgroundColor: "#E2C116", borderColor: "#000000" }}
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="nav-btn"
                                style={{ backgroundColor: "#E2C116", borderColor: "#000000" }}
                            >
                                Login/Register
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
