import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api'; // Your axios instance

const ITLayout = ({ children }) => {
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // Get the access token from localStorage
        const accessToken = localStorage.getItem('accessToken');

        // Make an authenticated request to fetch user details
        const response = await api.get('user-details/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`, // Send access token in the request header
          },
        });

        // Store the user details in state
        setUserDetails(response.data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, []);

  if (!userDetails) return <div>Loading...</div>;

  return (
    <div>
      <nav>
        <ul>
          <li><Link to="/department/it">Dashboard</Link></li>
          <li><Link to="/department/it/users">User Management</Link></li>
          <li><Link to="/department/it/projects">Projects</Link></li>
        </ul>
      </nav>

      <div className="content">
        <h1>Welcome to the IT Department</h1>
        <h2>User Details:</h2>
        <p>Name: {userDetails.name} {userDetails.lastname}</p>
        <p>Email: {userDetails.email}</p>
        <p>Mobile: {userDetails.mobile}</p>
        <p>Department: {userDetails.department}</p>
        {userDetails.profile_photo && <img src={userDetails.profile_photo} alt="Profile" />}
        {children}
      </div>
    </div>
  );
};

export default ITLayout;
