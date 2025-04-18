import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./RejectedListing.css"; 

export default function RejectedListing() {
    const [listings, setListings] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchListings();
    }, []);
    const fetchListings = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/listings");
            // Filter for rejected listings only
            const rejectedListings = response.data.filter(listing => !listing.isApproved);
            setListings(rejectedListings);
        } catch (error) {
            console.error("Failed to fetch listings:", error);
        }
    };

    const handleReject = async (listID) => {
        try {
            const formData = new FormData();
            formData.append("listID", listID);

            await axios.post("http://127.0.0.1:8000/api/listings/reject", formData);
            // Refresh the listings after rejection
            fetchListings();
        } catch (error) {
            console.error("Reject failed:", error);
        }
    };

    return (
        <div className="claimer-container">
            <h1 className="hero-section">Rejected Listings</h1>
            <button
                onClick={() => navigate("/ManageListing")}
                className="back-button"
                style={{
                    marginBottom: "20px",
                    padding: "10px 16px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                }}
            >
                View Approved Listings
            </button>
            <div className="listings-section">
                {listings.map((listing) => (
                    <div key={listing.listID} className="listing-card">
                        <h3>{listing.listDescription}</h3>
                        <p>Posted by: {listing.listUserID}</p>
                        <p>Status: Rejected</p>

                        {(listing.listPicture || listing.listPicture2) && (
                            <ListingImageSlider
                                images={[listing.listPicture, listing.listPicture2].filter(Boolean)}
                            />
                        )}
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