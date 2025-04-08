import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Update this import
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
        const response = await axios.get("http://127.0.0.1:8000/listings");
        console.log("Fetched Listings:", response.data);
        if (Array.isArray(response.data)) {
          if (response.data.length === 0) {
            console.log("No listings available.");
          }
          setListings(response.data);
        } else {
          console.error("Unexpected response format:", response.data);
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

  // Handle claiming the listing after the user clicks on it
  const handleClaim = async () => {
    if (!selectedListing) return;

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
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.message === "Item has been successfully claimed!") {
        // Optionally, you can update the listing state here to reflect that it's claimed
        setClaimError(""); // Clear any previous error
        setSelectedListing(null); // Close the details view
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
                      onError={(e) => e.target.src = '/path/to/fallback-image.jpg'} // Use a fallback image
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
      </div>

      {/* Display the selected listing's details */}
      {selectedListing && (
        <div className="listing-details">
          <h2>Listing Details</h2>
          <p><strong>Description:</strong> {selectedListing.listDescription}</p>
          <p><strong>Claim Description:</strong> {selectedListing.listClaimDescription}</p>
          <div>
            <strong>Images:</strong>
            <div>
              {selectedListing.listPicture && (
                <img
                  src={selectedListing.listPicture}
                  alt="Listing Image 1"
                  className="listing-image-large"
                  onError={(e) => e.target.src = '/path/to/fallback-image.jpg'}
                />
              )}
              {selectedListing.listPicture2 && (
                <img
                  src={selectedListing.listPicture2}
                  alt="Listing Image 2"
                  className="listing-image-large"
                  onError={(e) => e.target.src = '/path/to/fallback-image.jpg'}
                />
              )}
            </div>
          </div>

          {/* Claim the listing */}
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
