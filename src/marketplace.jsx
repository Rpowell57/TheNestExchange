import { useEffect, useState } from "react";
import axios from "axios";
import "./MarketPlace.css"; 
import { useNavigate } from "react-router-dom";



function Marketplace() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [claimingId, setClaimingId] = useState(null);
  const [claimedListings, setClaimedListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [claimError, setClaimError] = useState("");
  const navigate = useNavigate();
  const userID = localStorage.getItem("userID");

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/listings/unclaimed");
      setListings(response.data);
      setFilteredListings(response.data);
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  const handleClaim = async (listID) => {
    if (!userID) {
      alert("Please log in to claim an item.");
      return;
    }

    setClaimingId(listID);
    try {
      const formData = new FormData();
      formData.append("claimedUserID", userID);
      formData.append("claimedReview", "Pending");
      formData.append("claimedRating", 5);

      const response = await axios.post(`http://127.0.0.1:8000/api/claim/${listID}`, formData);

      if (response.data.message?.toLowerCase().includes("successfully claimed")) {
        alert("Item claimed successfully!");
        window.dispatchEvent(new CustomEvent("notify", { detail: `You claimed listing #${listID}` }));
        setClaimedListings((prev) => [...prev, listID]);
        setSelectedListing(null);
      } else {
        alert("Failed to claim item.");
      }
      
    } catch (error) {
      console.error("Error during claim:", error);
      alert("Something went wrong while claiming the item.");
    } finally {
      setClaimingId(null);
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    filterListings(query, categoryFilter);
  };

  const handleCategoryChange = (event) => {
    const selected = event.target.value;
    setCategoryFilter(selected);
    filterListings(searchQuery, selected);
  };

  const filterListings = (query, category) => {
    const filtered = listings.filter((listing) => {
      const matchesSearch = listing.listDescription.toLowerCase().includes(query);
      const matchesCategory = category ? String(listing.listCategory) === category : true;
      return matchesSearch && matchesCategory;
    });
    setFilteredListings(filtered);
  };
  const getCategoryName = (categoryId) => {
    const categoryMap = {
      1: "Electronics",
      2: "Clothing",
      3: "Books",
      4: "Home",
      5: "Other",
    };
    return categoryMap[categoryId] || "Unknown";
  };
  
  return (
    <div className="marketplace-container">
      <div className="marketplace-header">
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={handleSearch}
          className="marketplace-search"
        />
        <select value={categoryFilter} onChange={handleCategoryChange} className="marketplace-filter">
          <option value="">All Categories</option>
          <option value="1">Electronics</option>
          <option value="2">Clothing</option>
          <option value="3">Books</option>
          <option value="4">Home</option>
          <option value="5">Other</option>
        </select>
        <button className="marketplace-new" onClick={() => navigate("/ListerPage")}>
           + Create New Listing
        </button>
      </div>

      <div className="marketplace-grid">
        {filteredListings.length === 0 ? (
          <p>No items found.</p>
        ) : (
          filteredListings.map((listing) => (
            <div key={listing.listID} className="marketplace-card" onClick={() => setSelectedListing(listing)}>
              <img
                src={listing.listPicture || "/fallback.jpg"}
                alt="listing"
                className="marketplace-image"
                onError={(e) => (e.target.src = "/fallback.jpg")}
              />
              <div className="marketplace-info">
                <h3>{listing.listClaimDescription}</h3>
                <p>{listing.listDescription}</p>
                <p><strong>Category:</strong> {getCategoryName(listing.listCategory)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedListing && (
        <div className="listing-holder">
          <div className="listing-details">
            <h2>Listing #{selectedListing.listID}</h2>
            <p><strong>Description:</strong> {selectedListing.listDescription}</p>
            <p><strong>Claim Location:</strong> {selectedListing.listClaimDescription}</p>

            <ListingImageSlider
              images={[selectedListing.listPicture, selectedListing.listPicture2].filter(Boolean)}
            />

            {claimError && <p style={{ color: "red" }}>{claimError}</p>}
            <button
              className="claimer-button"
              onClick={() => handleClaim(selectedListing.listID)}
              disabled={claimingId === selectedListing.listID || claimedListings.includes(selectedListing.listID)}
            >
              {claimedListings.includes(selectedListing.listID)
                ? "Claimed"
                : claimingId === selectedListing.listID
                ? "Claiming..."
                : "Claim Listing"}
            </button>
            
            <button className="btn btn-secondary" onClick={() => setSelectedListing(null)}>
              Close
            </button>
          </div>
        </div>
      )}
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

export default Marketplace;
