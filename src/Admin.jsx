import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import "./AdminPage.css";

export default function AdminDashboard() {
  const [pendingListings, setPendingListings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingListings();
  }, []);

  const fetchPendingListings = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/listings/pending");
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
          ? "http://127.0.0.1:8000/api/listings/approve"
          : "http://127.0.0.1:8000/api/listings/reject";

      const form = new FormData();
      form.append("listID", id);

      await axios.post(url, form);
      fetchPendingListings(); // Refresh the pending listings
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
              <ListingImageSlider images={[listing.listPicture, listing.listPicture2]} />

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

function ListingImageSlider({ images }) {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="image-slider">
      <img src={images[currentImage]} alt="listing" className="listing-image" />
      <div className="slider-controls">
        <button onClick={prevImage} className="slider-btn">‹</button>
        <button onClick={nextImage} className="slider-btn">›</button>
      </div>
    </div>
  );
}
