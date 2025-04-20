import { useEffect, useState } from "react";
import axios from "axios";
import "./MyListing.css";

export default function MyListings() {
  const [listedItems, setListedItems] = useState([]);
  const [claimedItems, setClaimedItems] = useState([]);
  const [activeTab, setActiveTab] = useState("listed");
  const userID = localStorage.getItem("userID");

  useEffect(() => {
    fetchListedItems();
    fetchClaimedItems();
  }, []);

  const fetchListedItems = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/listings");
      const userListings = response.data.filter(item => item.listUserID === userID);
      setListedItems(userListings);
    } catch (error) {
      console.error("Error fetching listed items:", error);
    }
  };

  const fetchClaimedItems = async () => {
    try {
        const [claimedResponse, soldResponse] = await Promise.all([
            axios.get(`http://127.0.0.1:8000/api/claimed/${userID}`),
            axios.get(`http://127.0.0.1:8000/api/sold/${userID}`)
          ]);
        const combinedItems = [...claimedResponse.data, ...soldResponse.data];
      setClaimedItems(combinedItems);
    } catch (error) {
      console.error("Error fetching claimed items:", error);
    }
  };

  return (
    <div className="background-image">
    <div className="background-container">
    <div className="lister-container">
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">{userID?.charAt(0).toUpperCase()}</div>
        <div className="profile-details">
          <h2>{userID}</h2>
          <p>Welcome back to your dashboard.</p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat">
          <strong>{listedItems.length}</strong>
          <span>Listed</span>
        </div>
        <div className="stat">
          <strong>{claimedItems.length}</strong>
          <span>Claimed</span>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={activeTab === "listed" ? "active" : ""}
          onClick={() => setActiveTab("listed")}
        >
          Listed Items
        </button>
        <button
          className={activeTab === "claimed" ? "active" : ""}
          onClick={() => setActiveTab("claimed")}
        >
          Claimed Items
        </button>
      </div>

      <div className="item-list">
        {(activeTab === "listed" ? listedItems : claimedItems).map(item => (
          <div key={item.listID} className="item-card">
            <h3>{item.listDescription}</h3>
            <p><strong>Category:</strong> {item.listCategory}</p>
            <p><strong>Status:</strong> {item.isClaimed ? "Claimed" : "Unclaimed"}</p>
          </div>
        ))}
        {(activeTab === "listed" ? listedItems : claimedItems).length === 0 && (
          <p>No items to display.</p>
        )}
      </div>
    </div>
    </div>
    </div>
    </div>
  );
}
