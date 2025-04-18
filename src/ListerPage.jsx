import { useState } from "react";
import axios from "axios";
import "./ListerPage.css";

function ListerPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    condition: "",
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [uploadError, setUploadError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const setCondition = (condition) => {
    setFormData((prevData) => ({
      ...prevData,
      condition,
    }));
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files).slice(0, 2);
    setImageFiles(files);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setUploadError("");

    const userID = localStorage.getItem("userID");
    if (!userID) {
      setUploadError("User not logged in. Please log in first.");
      return;
    }

    if (!formData.title || !formData.description || !formData.condition) {
      setUploadError("Please fill out all required fields.");
      return;
    }

    if (imageFiles.length < 2) {
      setUploadError("Please upload two images.");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("listUserID", userID);
      formDataToSend.append("listDate", new Date().toISOString().split("T")[0]);
      formDataToSend.append("listCategory", "1"); // You can replace with dynamic later
      formDataToSend.append("listDescription", formData.description);
      formDataToSend.append("listClaimDescription", formData.title);
      formDataToSend.append("isClaimed", "0");
      formDataToSend.append("listPicture", imageFiles[0]);
      formDataToSend.append("listPicture2", imageFiles[1]);

      const response = await axios.post(
        "http://127.0.0.1:8000/listings/create",
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("Listing submitted:", response.data);
      alert("Listing submitted for admin approval!");
      // Optional: reset form
      setFormData({ title: "", description: "", condition: "" });
      setImageFiles([]);
    } catch (error) {
      console.error("Full error:", error.response?.data);
      const errorDetail = error.response?.data?.detail;

      if (Array.isArray(errorDetail)) {
        setUploadError(errorDetail.map((e) => e.msg).join(", "));
      } else {
        setUploadError(typeof errorDetail === "string" ? errorDetail : "Failed to submit listing.");
      }
    }
  };

  return (
      <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="background-image">
          <div className="background-container">
      <div className="lister-container">
        <div className="hero-section">
          <h1>Create Listing</h1>
          <p>Create a listing to be claimed by users.</p>
            <div className="input-wrapper">
                          <div className="input-field">
            <input
              type="text"
              placeholder="Listing Title..."
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              required
            />

            <input 
              type="text"
              placeholder="Description..."
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input"
              required
            />

                          </div>
            <div className="radio-inputs" style={{ justifyContent: "center" }}>
                <p>Describe Item Condition:</p>

              {["Used", "Good", "New"].map((option) => (
                <label key={option} className="radio">
                  <input
                    type="radio"
                    name="condition"
                    checked={formData.condition === option}
                    onChange={() => setCondition(option)}
                  />
                  <span className="name">{option}</span>
                </label>
              ))}
            </div>

            <label htmlFor="image_input">Upload 2 images:</label>
            <input
              type="file"
              id="image_input"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="input-field"
              required
            />

            {/* Optional Image Previews */}
            <div className="preview" style={{ display: "flex", gap: "10px" }}>
              {imageFiles.map((file, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(file)}
                  alt={`preview-${index}`}
                  width="100"
                  height="100"
                  style={{ objectFit: "cover", borderRadius: "8px" }}
                />
              ))}
            </div>

            {uploadError && <p className="error-message">{uploadError}</p>}

            <div style={{ justifySelf: "center" }}>
              <button className="done-button" type="submit">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    </form>
  );
}

export default ListerPage;
