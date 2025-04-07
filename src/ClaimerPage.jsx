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

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://127.0.0.1:8000/listings");
        console.log("Fetched Listings:", response.data); // Log API response
  
        // Ensure the data is an array
        if (Array.isArray(response.data)) {
          if (response.data.length === 0) {
            console.log("No listings available.");
          }
          setListings(response.data);
        } else {
          console.error("Unexpected response format:", response.data); // Log unexpected response
          throw new Error("Fetched data is not in the expected format.");
        }
      } catch (error) {
        const errorMessage = error.response?.data?.detail || error.message || "Failed to fetch listings.";
        setClaimError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
  
    fetchListings();
  }, []);
  
  console.log("Listings after fetch:", listings); // Check the listings after fetch
  
  

  

  const handleClaim = async (listingId) => {
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
  
      const response = await axios.post(`http://127.0.0.1:8000/claim/${listingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (response.data.message === "Item has been successfully claimed!") {
        setClaimedListing(listingId);
        // Refetch listings after claiming one
        fetchListings();
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
                  {listing.listPicture ? (
                   <img 
                    src={listing.listPicture} 
                    alt="Listing Image 1" 
                    className="listing-image"
                    onError={(e) => e.target.src = '/path/to/fallback-image.jpg'} // Use a fallback image
                    />
                    ) : (
                    <div>No Image</div>
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
