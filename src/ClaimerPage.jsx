import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ClaimerPage.css";

export default function ClaimerPage() {
  const [listings, setListings] = useState([]); // Store fetched listings
  const [selectedListing, setSelectedListing] = useState(null); // Store selected listing details
  const [claimError, setClaimError] = useState(""); // Store errors
  const [loading, setLoading] = useState(true); // Track loading state
  const navigate = useNavigate(); // Use navigate instead of history

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/listings");
        console.log("Fetched Listings:", response.data); // Check if the data is correct
  
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
  }, []); // Empty dependency array to run once on mount
  
  
  const handleClaim = async () => {
    if (!selectedListing) {
      setClaimError("No listing selected.");
      return;
    }
  
    try {
      const userId = localStorage.getItem("userID");
      if (!userId) {
        setClaimError("User ID not found. Please log in.");
        return;
      }
  
      const formData = new FormData();
      formData.append("claimedUserID", userId);
      formData.append("claimedReview", "Great item!");
      formData.append("claimedRating", 5);
  
      const response = await axios.post(
        `http://127.0.0.1:8000/claim/${selectedListing.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      if (response.data.message === "Item has been successfully claimed!") {
        setClaimError("");
        setSelectedListing(null);
        fetchListings();
      } else {
        setClaimError("Failed to claim listing.");
      }
    } catch (error) {
      console.error(error);
      setClaimError(
        error.response?.data?.detail || "Failed to claim listing. Please try again."
      );
    }
  };
  
  

  return (
    <div className="container claimer-container">
      <div className="claimer-box">
        <h1>Claim a Listing</h1>

        {/* Display error message if any */}
        {claimError && (
          <div className="alert alert-danger">
            <strong>{claimError}</strong>
          </div>
        )}

        {/* Show loading message while fetching data */}
        {loading && <div className="loading-message">Fetching listings...</div>}

        {/* Display listings if available */}
        {!loading && listings.length > 0 ? (
  <div className="listings-section">
    {listings.map((listing) => (
      <div
        key={listing.id}
        className="listing-card"
        onClick={() => setSelectedListing(listing)} // Set selected listing when clicked
      >
        <h3>Listing #{listing.id}</h3>

        {/* Display Listing Images */}
        {listing.listPicture ? (
          <img
            src={listing.listPicture}
            alt="Listing Image 1"
            className="listing-image"
            onError={(e) => (e.target.src = '/path/to/fallback-image.jpg')} // Fallback image
          />
        ) : (
          <div>No Image</div>
        )}

        {listing.listPicture2 && (
          <img
            src={listing.listPicture2}
            alt="Listing Image 2"
            className="listing-image"
            onError={(e) => (e.target.src = '/path/to/fallback-image.jpg')} // Fallback image
          />
        )}

        <p>{listing.listDescription}</p>
      </div>
    ))}
  </div>
) : (
  !loading && <div className="error-message">No listings available.</div>
)}

      </div>

      {/* Display the selected listing's details */}
      {selectedListing && (
        <div className="listing-details">
          <h2>Listing Details</h2>
          <p><strong>Description:</strong> {selectedListing.listDescription}</p>
          <p><strong>Claim Description:</strong> {selectedListing.listClaimDescription}</p>

          {/* Display images for selected listing with fallback handling */}
          <div>
            <strong>Images:</strong>
            <div className="listing-details-images">
              {selectedListing.listPicture && (
                <img
                  src={selectedListing.listPicture}
                  alt="Listing Image 1"
                  className="listing-image-large"
                  onError={handleImageError} // Fallback image on error
                />
              )}
              {selectedListing.listPicture2 && (
                <img
                  src={selectedListing.listPicture2}
                  alt="Listing Image 2"
                  className="listing-image-large"
                  onError={handleImageError} // Fallback image on error
                />
              )}
            </div>
          </div>

          {/* Claim button */}
          <button onClick={handleClaim} className="btn btn-primary claim-button">
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
