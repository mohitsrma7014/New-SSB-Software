import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import api from '../../api'; // Adjust the path to your API utilities file
import './Admin.css';
import UserGreetingBox from '../../components/Add/UserGreetingBox';

const Cnc_home = () => {
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
    <div className="min-h-screen bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <Sidebar />
      <div className="container mx-auto p-4">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mt-8 mb-12"
        >
          Diamond Area
        </motion.h1>

        {/* Top Row: Production, Quality, Cost */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <DashboardCard title="Production" link="/production" analytics="75%" />
          <DashboardCard title="Quality" link="/quality" analytics="90%" />
          <DashboardCard title="Cost" link="/cost" analytics="60%" />
        </div>

        {/* Bottom Row: Dispatch, Safety */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Dispatch" link="/dispatch" analytics="85%" />
          <DashboardCard title="Safety" link="/safety" analytics="95%" />
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, link, analytics }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <p className="text-gray-400">Analytics: {analytics}</p>
      <a
        href={link}
        className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300"
      >
        View Details
      </a>
    </motion.div>
  );
};

export default Cnc_home;