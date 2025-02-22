import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import api from '../../api'; // Adjust the path to your API utilities file
import './Admin.css';
import  UserGreetingBox  from '../../components/Add/UserGreetingBox';

const Visual_home = () => {
  const { departmentName } = useParams(); // Get department name from the URL
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('http://192.168.1.199:8001/api/user-details/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          withCredentials: true,
        });

        setUserData(response.data);
        
        // Redirect if department in URL does not match user department
        if (response.data.department.toLowerCase() !== departmentName) {
          navigate(`/department/${response.data.department.toLowerCase()}`, { replace: true });
        }
      } catch (err) {
        console.error('Failed to fetch user details:', err);
        setError('Failed to load department page. Please try again.');
      }
    };

    fetchUserData();
  }, [departmentName, navigate]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!userData) {
    return <div>Loading...</div>; // Show loading while fetching data
  }
  return (
    <div className="admin-container">
      <Sidebar />
      <div className="content">
      <div className="App">
      <UserGreetingBox />
    </div>      </div>
    </div>
  );
};

export default Visual_home;
