import React, { useState, useEffect } from "react";
import axios from "axios";

const UserGreetingBox = () => {
  const [userData, setUserData] = useState({ name: "", profilePhoto: "" });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "http://192.168.1.199:8001/api/user-details/",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        console.log(response.data);
        const profilePhoto = `http://192.168.1.199:8001${response.data.profile_photo}`;

        const { name, lastname, department } = response.data;
        
        // Map department codes to full names
        const departmentMapping = {
          qa: "Quality",
          rm: "Raw Material",
          ht: "Heat Treatment",
        };

        const departmentName = departmentMapping[department] || department;
        
        setUserData({ name, profilePhoto, lastname, department: departmentName });
      } catch (error) {
        console.error("Error fetching user details:", error);
        setError("Failed to fetch user details.");
      }
    };

    fetchUserData();
  }, []);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="user-greeting-box bg-white rounded-xl shadow-lg hover:shadow-2xl duration-300" style={styles.greetingBox}>
      <img
        src={userData.profilePhoto}
        alt="User Profile"
        style={styles.profileImage}
      />
      <div>
        <h2 style={styles.greetingMessage}>Hello, {userData.name} {userData.lastname}!</h2>
        <p style={styles.welcomeText}>Welcome back!</p>
        <p style={styles.welcomeText}>This is {userData.department} Panel.</p>
      </div>
    </div>
  );
};

const styles = {
  greetingBox: {
    display: "flex",
    alignItems: "center",
    padding: "16px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
  },
  profileImage: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    marginRight: "16px",
  },
  greetingMessage: {
    margin: "0",
    fontSize: "1.8rem",
    color: "#333",
    fontWeight: "bold",
  },
  welcomeText: {
    fontSize: "1rem",
    color: "#666",
  },
};

export default UserGreetingBox;
