import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // useNavigate instead of useHistory
import axios from "axios";

export default function ListingDetailsPage() {
  const { id } = useParams(); // Get the listing ID from the URL
  const [listing, setListing] = useState(null); // Store the listing details
  const [loading, setLoading] = useState(true);
  const [claimError, setClaimError] = useState("");
  const navigate = useNavigate(); // Use navigate instead of history

  useEffect(() => {
    const fetchListingDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://127.0.0.1:8000/listings/${id}`);
        setListing(response.data);
      } catch (error) {
        setClaimError("Failed to fetch listing details.");
      } finally {
        setLoading(false);
      }
    };

    fetchListingDetails();
  }, [id]);

  const handleClaim = async () => {
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
        `http://127.0.0.1:8000/claim/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.message === "Item has been successfully claimed!") {
        setClaimError(""); // Clear any previous error
      } else {
        setClaimError("Failed to claim listing.");
      }
    } catch (error) {
      setClaimError(error.response?.data?.detail || "Failed to claim listing.");
    }
  };

  return (
    <div className="listing-details-container">
      {loading ? (
        <div>Loading...</div>
      ) : claimError ? (
        <div>{claimError}</div>
      ) : (
        listing && (
          <div>
            <h1>Listing #{listing.id}</h1>
            <p><strong>Description:</strong> {listing.listDescription}</p>
            <p><strong>Claim Description:</strong> {listing.listClaimDescription}</p>
            <div>
              <strong>Images:</strong>
              <div>
                {listing.listPicture && (
                  <img
                    src={listing.listPicture}
                    alt="Listing Image 1"
                    className="listing-image-large"
                    onError={(e) => e.target.src = '/path/to/fallback-image.jpg'}
                  />
                )}
                {listing.listPicture2 && (
                  <img
                    src={listing.listPicture2}
                    alt="Listing Image 2"
                    className="listing-image-large"
                    onError={(e) => e.target.src = '/path/to/fallback-image.jpg'}
                  />
                )}
              </div>
            </div>
            <button onClick={handleClaim} className="btn btn-primary claim-button">
              Claim Listing
            </button>
            <button onClick={() => navigate("/")} className="btn btn-secondary">
              Back to Listings
            </button>
          </div>
        )
      )}
    </div>
  );
}
