import { useState } from "react";
import axios from "axios";
import "./ListerPage.css"; // Import the CSS file for styling

function ListerPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null); // Store the uploaded image file
  const [uploadError, setUploadError] = useState(""); // Handle errors

  // Handle input field changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value, // Dynamically updates the correct field
    }));
  };

  // Handle image file selection
  const handleFileChange = (event) => {
    setImageFile(event.target.files[0]); // Store the selected file
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setUploadError(""); // Reset error message

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    if (imageFile) {
      formDataToSend.append("image", imageFile); // Attach the image file
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/listings",
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("Form submitted successfully:", response.data);
      alert("Listing created successfully!");
    } catch (error) {
      setUploadError(error.response?.data?.detail || "Failed to submit listing.");
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="lister-container">
        <div className="hero-section">
          <h1>Create Listing</h1>
          <p>Create a listing to be claimed by users.</p>

          <div className="input-wrapper" style={{ display: "grid", gap: "15px" }}>
            <input
              type="text"
              id="title_input"
              placeholder="Listing Title..."
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
            />

            <input
              type="text"
              id="description_input"
              placeholder="Description..."
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input"
            />

            {/* Image Upload Input */}
            <input
              type="file"
              id="image_input"
              accept="image/*"
              onChange={handleFileChange}
              className="input"
            />

            {/* Error Message Display */}
            {uploadError && <p className="error-message">{uploadError}</p>}

            <div style={{ justifySelf: "center" }}>
              <button className="done-button" type="submit">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default ListerPage;
