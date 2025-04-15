import { useEffect, useState } from "react";
import axios from "axios";
import "./ManageListing.css";

export default function ManageListing() {
  const [listings, setListings] = useState([]);

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

  const handleDelete = (listID) => {
    console.log("Deleting listing with ID:", listID); 
    if (listID) {
      axios.delete(`http://127.0.0.1:8000/api/listings/${listID}`)
        .then(response => {
          console.log("Delete successful:", response);
          // Optionally, remove the deleted listing from the UI
          setListings(listings.filter(listing => listing.listID !== listID));
        })
        .catch(error => {
          console.error("Delete failed:", error);
        });
    } else {
      console.error("Listing ID is undefined or invalid.");
    }
  };

  return (
    <div className="claimer-container">
      <h1 className="hero-section">Manage All Listings</h1>
      <div className="listings-section">
        {listings.map((listing) => (
          <div key={listing.listID} className="listing-card"> 
            <h3>{listing.listDescription}</h3>
            <p>Posted by: {listing.listUserID}</p>
            <p>Approved: {listing.isClaimed ? "Yes" : "No"}</p>

            {(listing.listPicture || listing.listPicture2) && (
              <ListingImageSlider
                images={[listing.listPicture, listing.listPicture2].filter(Boolean)}
              />
            )}

            <button
              className="delete-button"
              onClick={() => handleDelete(listing.listID)}  
            >
              Delete 
            </button>
          </div>
        ))}
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
