import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from './Navbar';
import ListerPage from './ListerPage';
import ClaimerPage from './ClaimerPage';
import Login from './login';
import HomePage from './HomePage';
import Register from './register';
import ListingDetailsPage from "./ListingDetailsPage";

import Admin from './Admin';
import ManageListing from './ManageListing';
function App() {
  return (
      <div className="App">
          <BrowserRouter>
              <NavBar />
              <Routes>
                {/* Add a default route for the homepage */}
                <Route path="/" element={<HomePage />} />
                <Route path="/HomePage" element={<HomePage />} />
                <Route path="/ListerPage" element={<ListerPage />} />
                <Route path="/ClaimerPage" element={<ClaimerPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/listing/:id" element={<ListingDetailsPage />} /> {/* Updated route for listing details */}
                <Route path="/Admin" element={<Admin />} />
                <Route path="/ManageListing" element={<ManageListing />} />
              </Routes>
          </BrowserRouter>
      </div>
  );
}

export default App;
