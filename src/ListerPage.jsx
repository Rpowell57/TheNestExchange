import { useState } from 'react'
import "./ListerPage.css"; // Import the CSS file for styling

function ListerPage() {
    const [formData, setFormData] = useState({ title: "", description: "" });

    const handleSubmit = () => {
    console.log("Form submitted with:", formData);
    }
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value, // Dynamically updates the correct field
        }));
    };
    return (
        <form>
            <div className="lister-container">
                <div className="hero-section">
                    <h1>Create Listing</h1>
                    <p>
                        Create a listing to be claimed by users.
                    </p>
                
                    <div className="input-wrapper" style={{ display: 'grid', gap: '15px' }}>
                        <input type="text" id="title_input" placeholder="Listing Title..." name="title" value={formData.title} onChange={handleChange} class="input"/>

                        <input type="text" id="title_input" placeholder="Description..." name="description" value={formData.description} onChange={handleChange} class="input" />

                        <div style={{ justifySelf: 'center' }}>
                            <button className="done-button" type='submit' onClick={handleSubmit}>
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