import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPage.css"; //Reuse

export default function ViewAllUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };
  const handleMakeAdmin = async (userID) => {
    try {
      const formData = new FormData();
      formData.append("userID", userID);

      const response = await axios.post("http://127.0.0.1:8000/api/users/make-admin", formData);
      alert(response.data.message);
      fetchUsers();
    } catch (error) {
      console.error("Failed to promote user:", error);
      alert("Error promoting user to admin.");
    }
  };
  return (
    <div className="claimer-container">
      <div className="hero-section">
        <h1>All Registered Users</h1>
        <p>This table displays every registered user in the system.</p>
      </div>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Email</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Is Student</th>
              <th>Is Admin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.userID}>
                <td>{user.userID}</td>
                <td>{user.userEmail}</td>
                <td>{user.userFirstName}</td>
                <td>{user.userLastName}</td>
                <td>{user.userIsStudent ? "Yes" : "No"}</td>
                <td>{user.userIsAdmin ? "Yes" : "No"}</td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleMakeAdmin(user.userID)}
                  >
                  Make Admin
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
