import { useEffect, useState } from "react";
import axios from "axios";
import "./ClaimerPage.css";

export default function AdminDashboard() {
  const [pendingListings, setPendingListings] = useState([]);

  useEffect(() => {
    fetchPendingListings();
  }, []);

  const fetchPendingListings = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/listings/pending");
      console.log("Pending Listings from API:", response.data);
      setPendingListings(response.data);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const url =
        action === "approve"
          ? "http://127.0.0.1:8000/listings/approve"
          : "http://127.0.0.1:8000/listings/reject";

      const form = new FormData();
      form.append("listID", id);

      await axios.post(url, form);
      fetchPendingListings();
    } catch (error) {
      console.error(`Failed to ${action} listing:`, error);
    }
  };

  return (
    <div className="claimer-container">
      <div className="hero-section">
        <h1>Admin Dashboard</h1>
        <p>Review and approve or reject listings submitted by users.</p>
      </div>

      <div className="listings-section">
        {pendingListings.length === 0 ? (
          <p>No pending listings.</p>
        ) : (
          pendingListings.map(listing => (
            <div key={listing.id} className="listing-card">
              <h3>{listing.listDescription}</h3>
              <p><strong>By:</strong> {listing.listUserID}</p>
              <p><strong>Category:</strong> {listing.listCategory}</p>
              
              <img src={listing.listPicture} alt="Listing 1" className="listing-image" />
              <img src={listing.listPicture2} alt="Listing 2" className="listing-image" />

              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "15px" }}>
                <button className="claim-button" onClick={() => handleAction(listing.id, "approve")}>Approve</button>
                <button className="claim-button" onClick={() => handleAction(listing.id, "reject")}>Reject</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
