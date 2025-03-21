import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ksuLogo from "./assets/ksulogo.png";
import "./Navbar.css";
export default function NavBar() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("userID")); // ✅ Initial state check

    useEffect(() => {
        const checkAuth = () => {
            setIsAuthenticated(!!localStorage.getItem("userID")); 
        };
        window.addEventListener("storage", checkAuth); 
        return () => {
            window.removeEventListener("storage", checkAuth);
        };
    }, []);


    const handleLogout = () => {
        localStorage.removeItem("userID"); 
        setIsAuthenticated(false);
    };
    return (
        <nav className="navbar">
            <div className="container">
            <img
                    className="logo"
                    src={ksuLogo}
                    alt="KSU Logo"
                />
                

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
                            </>
                        )}
                    </ul>

                    <div className="navbar-right">
                        {isAuthenticated ? (
                            <button className="nav-btn" onClick={handleLogout} style={{ backgroundColor: "#E2C116", borderColor: "#000000" }}>
                                Logout
                            </button>
                        ) : (
                            <Link to="/login" className="nav-btn" style={{ backgroundColor: "#E2C116", borderColor: "#000000" }}>
                                Login/Register
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
