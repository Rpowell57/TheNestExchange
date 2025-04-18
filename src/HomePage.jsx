import { Link } from "react-router-dom";
import "./HomePage.css"; // Import the CSS file for styling

export default function HomePage() {
    return (
        <div className="background-image">
        <div className="background-container">
        <div className="lister-container">
        <div className="home-container">
            <div className="hero-section">
                <h1>Welcome to The Nest Exchange</h1>
                <p>
                    The Nest Exchange is an innovative e-commerce inspired giveaway platform 
                    designed exclusively for the Kennesaw State University (KSU) community. 
                    List, search, and claim items easily while promoting sustainability.
                </p>
                <Link to="/login" className="btn btn-primary">Get Started</Link>
            </div>

            <div className="features-section">
                <h2>Why Use The Nest Exchange?</h2>
                <div className="features">
                    <div className="feature-card">
                        <h3>Secure & Exclusive</h3>
                        <p>Only current KSU students and recent graduates (within one semester) can access the platform.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Simplified Exchange</h3>
                        <p>Easily list and claim items in a controlled, user-friendly environment.</p>
                    </div>
                    <div className="feature-card">
                        <h3>High Performance</h3>
                        <p>Enjoy instant search results, smooth navigation, and quick item updates for a frustration free experience</p>
                    </div>
                </div>
            </div>

            <div className="cta-section">
                <h2>Join the KSU Community Today</h2>
                <p>Start listing and claiming items while contributing to a more sustainable campus.</p>
                <Link to="/register" className="btn btn-secondary">Sign Up Now</Link>
            </div>
        </div>
        </div>
        </div>
        </div>
    );
}
