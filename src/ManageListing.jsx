import { useEffect, useState } from "react";
import axios from "axios";
import "./ManageListing.css";

export default function ManageListing() {
  const [listings, setListings] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [rejectedListings, setRejectedListings] = useState([]);
  const [deletedListings, setDeletedListings] = useState([]);
  const userID = localStorage.getItem("userID");

  useEffect(() => {
    fetchListings();
    fetchRejectedListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/listings");
      setListings(response.data);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    }
  };

  const fetchRejectedListings = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/rejected-items");
      setRejectedListings(response.data.rejected_items || []);
    } catch (error) {
      console.error("Failed to fetch rejected listings:", error);
    }
  };

  const handleDelete = async (listID) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/listings/${listID}`);
      const deleted = listings.find((l) => l.listID === listID);
      setDeletedListings([...deletedListings, deleted]);
      setListings(listings.filter((listing) => listing.listID !== listID));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const getFilteredListings = () => {
    switch (activeTab) {
      case "Unclaimed":
        return listings.filter((l) => l.isClaimed === 0);
      case "Claimed":
        return listings.filter((l) => l.isClaimed === 1);
      case "Rejected":
        return rejectedListings;
      case "Deleted":
        return deletedListings;
      default:
        return listings;
    }
  };

  return (
    <div className="claimer-container">
      <h1 className="hero-section">Manage Listings</h1>

      <div className="tab-buttons" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {["All", "Unclaimed", "Claimed", "Rejected", "Deleted"].map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active-tab" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="listings-section">
        {getFilteredListings().length === 0 ? (
          <p>No listings to display.</p>
        ) : (
          getFilteredListings().map((listing) => (
            <div key={listing.listID || listing.id} className="listing-card">
              {activeTab === "Rejected" ? (
                <>
                  <h3>Listing ID: {listing.rejectedListID}</h3>
                  <p><strong>Rejection Reason:</strong> {listing.rejectedReason}</p>
                  <p><strong>Date:</strong> {listing.rejectedDate}</p>
                  <p><strong>Submitted By:</strong> {listing.rejectedUserID}</p>
                </>
              ) : (
                <>
                  <h3>{listing.listDescription}</h3>
                  <p>Posted by: {listing.listUserID}</p>
                  <p>Status: {listing.isClaimed === 1 ? "Claimed" : "Unclaimed"}</p>
                  {(listing.listPicture || listing.listPicture2) && (
                    <ListingImageSlider
                      images={[listing.listPicture, listing.listPicture2].filter(Boolean)}
                    />
                  )}
                  {activeTab !== "Deleted" && (
                    <button className="delete-button" onClick={() => handleDelete(listing.listID)}>
                      Delete
                    </button>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ListingImageSlider({ images }) {
  const [currentImage, setCurrentImage] = useState(0);
  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

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
