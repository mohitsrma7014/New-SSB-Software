import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Rawmaterial/Sidebar';
import DashboardHeader from '../components/Rawmaterial/DashboardHeader';
import api from '../api'; // Adjust the path to your API utilities file
import './Admin.css';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import UserGreetingBox from '../components/Add/UserGreetingBox';
import MonthlyGraph from '../components/Add/MonthlyGraph';
import MonthlyReceivingTrend from '../components/Add/MonthlyReceivingTrend';
import MonthlyConsumptionGraph from '../components/Add/MonthlyConsumptionGraph';
import MonthlyConsumptionTrend from '../components/Add/MonthlyConsumptionTrend';

const Rm = () => {
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
    <div className="App bg-gray-50 min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        {/* Main content area */}
        <div className="flex-1 p-6 mt-12 ml-60"> {/* Adjust margin-top (mt) and margin-left (ml) based on your header and sidebar width */}
          <div className="content" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', marginBottom: '0' }}>
              {/* Left Side: Greeting Box and Production Comparison */}
              <div style={{ display: 'flex', flexDirection: 'column', width: '500px' }}>
                <div className="App" style={{ marginBottom: '0' }}>
                  <UserGreetingBox />
                </div>
                <div className="App">
                  <MonthlyReceivingTrend />
                </div>
              </div>

              {/* Right Side: Both Graphs taking 50% each */}
              <div style={{ display: 'flex', flexDirection: 'row', flex: 1, gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div className="App">
                    <MonthlyGraph />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', marginBottom: '0' }}>
              {/* Left Side: Greeting Box and Production Comparison */}
              <div style={{ display: 'flex', flexDirection: 'column', width: '500px' }}>
                <div className="App">
                  <MonthlyConsumptionTrend />
                </div>
              </div>

              {/* Right Side: Both Graphs taking 50% each */}
              <div style={{ display: 'flex', flexDirection: 'row', flex: 1, gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div className="App">
                    <MonthlyConsumptionGraph />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rm;