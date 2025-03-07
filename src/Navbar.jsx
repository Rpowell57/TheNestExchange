import { Link } from "react-router-dom";
import ksuLogo from "./assets/ksulogo.png";

export default function NavBar() {
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
                        <li className="nav-item">
                            <Link className="nav-link" to="/ListerPage">Lister</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/ClaimerPage">Claimer</Link>
                        </li>
                    </ul>

                    <div className="navbar-right">
                    <Link to="/login" className="nav-btn" style={{ backgroundColor: "#E2C116", borderColor: "#000000" }}>
                        Login/Register
                    </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
