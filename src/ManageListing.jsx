import { useEffect, useState } from "react";
import axios from "axios";
import "./ManageListing.css";

export default function ManageListing() {
  const [listings, setListings] = useState([]);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/listings");
      setListings(response.data);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    }
  };

  const handleDelete = async (listID) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/listings/${listID}`);
      setListings(listings.filter(listing => listing.listID !== listID));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const filteredListings = listings.filter((listing) => {
    if (activeTab === "Unclaimed") return listing.isClaimed === 0;
    return true; // All
  });

  return (
    <div className="claimer-container">
      <h1 className="hero-section">Manage Listings</h1>

      <div className="tab-buttons" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {["All", "Unclaimed","Rejected Listing"].map((tab) => (
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
        {filteredListings.length === 0 ? (
          <p>No listings to display.</p>
        ) : (
          filteredListings.map((listing) => (
            <div key={listing.listID} className="listing-card">
              <h3>{listing.listDescription}</h3>
              <p>Posted by: {listing.listUserID}</p>
              <p>Status: {listing.isClaimed === 0 ? "Unclaimed" : "Claimed"}</p>

              {(listing.listPicture || listing.listPicture2) && (
                <ListingImageSlider images={[listing.listPicture, listing.listPicture2].filter(Boolean)} />
              )}

              <button className="delete-button" onClick={() => handleDelete(listing.listID)}>
                Delete
              </button>
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
