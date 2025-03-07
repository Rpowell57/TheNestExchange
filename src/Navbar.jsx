import { Link } from "react-router-dom";

export default function NavBar() {
    return (
        <div>
            <ul className="r">
                <li>
                    <Link to="/ListerPage">Lister Page</Link>
                </li>
                <li>
                    <Link to="/ClaimerPage">Claimer Page</Link>
                </li>
                <li>
                    <Link to="/Home">Home Page</Link>
                </li>
            </ul>
        </div>
    );
}
