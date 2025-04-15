import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ClaimerPage.css";

// 🔁 Place this ABOVE the ClaimerPage component
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
      <img
        key={images[currentImage]} // Helps React know image changed
        src={images[currentImage]}
        alt="listing"
        className="listing-image"
        onError={(e) => e.target.src = '/fallback.jpg'}
      />
      <div className="slider-controls">
        <button onClick={prevImage} className="slider-btn">‹</button>
        <button onClick={nextImage} className="slider-btn">›</button>
      </div>
    </div>
  );
}

export default function ClaimerPage() {
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [claimError, setClaimError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/listings");
        if (Array.isArray(response.data)) {
          setListings(response.data);
        } else {
          throw new Error("Unexpected response format.");
        }
      } catch (error) {
        setClaimError(error.response?.data?.detail || error.message || "Failed to fetch listings.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleClaim = async () => {
    try {
      const userId = localStorage.getItem("userID");
      if (!userId) {
        setClaimError("User ID not found. Please log in.");
        return;
      }

      console.log("Selected Listing:", selectedListing); // Add a log to inspect the selected listing
  
      if (!selectedListing || !selectedListing.id) {
        setClaimError("No listing selected.");
        return;
      }

      const response = await axios.post(
        `http://127.0.0.1:8000/api/claim/${selectedListing.id}`,
        { user_id: parseInt(userId) }
      );

      if (response.status === 200) {
        setClaimError("");
        setSelectedListing(null);
        alert("Item successfully claimed!");

        const updatedListings = await axios.get("http://127.0.0.1:8000/api/listings");
if (Array.isArray(updatedListings.data)) {
  setListings(updatedListings.data);
}
      } else {
        setClaimError("Failed to claim listing.");
      }
    } catch (error) {
      console.error("Error during claim:", error);
      setClaimError("An error occurred while claiming the listing.");
    }
  };

  return (
    <div className="container claimer-container">
      <div className="claimer-box">
        <h1>Claim a Listing</h1>

        {claimError && (
          <div className="alert alert-danger">
            <strong>{claimError}</strong>
          </div>
        )}

        {loading && <div className="loading-message">Fetching listings...</div>}

        {!loading && listings.length > 0 ? (
          <div className="listings-section">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="listing-card"
                onClick={() => {
                  setSelectedListing(listing);
                  console.log("Listing selected:", listing); // Log to confirm selection
                }}
              >
                <h3>Listing #{listing.id}</h3>
                {(listing.listPicture || listing.listPicture2) ? (
                  <ListingImageSlider
                    images={[listing.listPicture, listing.listPicture2].filter(Boolean)}
                  />
                ) : (
                  <div>No Images</div>
                )}
                <p>{listing.listDescription}</p>
              </div>
            ))}
          </div>
        ) : (
          !loading && <div className="error-message">No listings available.</div>
        )}
      </div>

      {selectedListing && (
        <div className="listing-details">
          <h2>Listing Details</h2>
          <p><strong>Description:</strong> {selectedListing.listDescription}</p>
          <p><strong>Claim Description:</strong> {selectedListing.listClaimDescription}</p>
          {(selectedListing.listPicture || selectedListing.listPicture2) && (
            <ListingImageSlider
              images={[selectedListing.listPicture, selectedListing.listPicture2].filter(Boolean)}
            />
          )}

          <button onClick={handleClaim} className="btn btn-primary claimer-button">
            Claim Listing
          </button>
          <button onClick={() => setSelectedListing(null)} className="btn btn-secondary">
            Close
          </button>
        </div>
      )}
    </div>
  );
}
