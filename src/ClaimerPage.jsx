// Import necessary dependencies
import { useState, useEffect } from "react";
import axios from "axios";
import "./ClaimerPage.css";

// Define the ClaimerPage component
export default function ClaimerPage() {
  // Initialize state variables
  const [listings, setListings] = useState([]); // Store fetched listings
  const [claimedListing, setClaimedListing] = useState(""); // Store claimed listing ID
  const [claimError, setClaimError] = useState(""); // Store errors
  const [loading, setLoading] = useState(true); // Track loading state

  // Fetch listings when the page loads
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/listings");
        console.log("Fetched Listings:", response.data); // Debugging step
        setListings(response.data);
      } catch (error) {
        setClaimError(error.response?.data?.detail || "Failed to fetch listings.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Handle claiming a listing
  const handleClaim = async (listingId) => {
    try {
      const userId = localStorage.getItem("userID"); // Ensure userID exists
      if (!userId) {
        setClaimError("User ID not found. Please log in.");
        return;
      }

      const formData = new FormData();
      formData.append("claimedUserID", userId);
      formData.append("claimedReview", "Great item!");
      formData.append("claimedRating", 5);

      const response = await axios.post(`http://127.0.0.1:8000/claim/${listingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.message === "Item has been successfully claimed!") {
        setClaimedListing(listingId);
      } else {
        setClaimError("Failed to claim listing.");
      }
    } catch (error) {
      setClaimError(error.response?.data?.detail || "Failed to claim listing.");
    }
  };

  // Render the component
  return (
    <div className="container claimer-container">
      <div className="claimer-box">
        <h1>Claim a Listing</h1>
        <div className="claims-section">
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
                <div key={listing.id} className="listing-card">
                  <h3>Listing #{listing.id}</h3>
                  {/* Display Listing Images */}
                  {listing.listPicture && (
                    <img 
                      src={listing.listPicture} 
                      alt="Listing Image 1" 
                      className="listing-image"
                      onError={(e) => console.error("Image failed to load:", listing.listPicture, e)}
                    />
                  )}
                  {listing.listPicture2 && (
                    <img 
                      src={listing.listPicture2} 
                      alt="Listing Image 2" 
                      className="listing-image"
                      onError={(e) => console.error("Image failed to load:", listing.listPicture2, e)}
                    />
                  )}
                  <p>{listing.listDescription}</p>
                  <button
                    type="button"
                    className="btn btn-primary claim-button"
                    onClick={() => handleClaim(listing.id)}
                  >
                    Claim
                  </button>
                </div>
              ))}
            </div>
          ) : (
            !loading && <div className="error-message">No listings available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
