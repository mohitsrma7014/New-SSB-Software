import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, PieChart, Bell, Settings, LogOut ,Key} from 'lucide-react';
import './Sidebar.css';
import logo from '../../assets/logo.png';
import api from '../../api';

export const Sidebar = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu toggle
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('http://192.168.1.199:8001/api/user-details/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        setUserData(response.data);
      } catch (err) {
        console.error('Failed to fetch user details:', err);
        setError('Failed to load department page. Please try again.');
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  
    // Redirect to login page
    navigate('/');
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!userData) {
    return <div>Loading...</div>;
  }

  const profilePhotoUrl = userData.profile_photo
    ? userData.profile_photo.startsWith('http')
      ? userData.profile_photo
      : `http://192.168.1.199:8001${userData.profile_photo}`
    : null;

  const departmentName = userData.department.toLowerCase();

  const handleHomeClick = () => {
    if (location.pathname !== `/department/${departmentName}`) {
      navigate(`/department/${departmentName}`);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle the menu state
  };

  return (
    <div className="sidebar-container">
      <header>
        <nav className="navbar">
          <div className="logo-container">
            <img src={logo} alt="HRHub Logo" className="logo" />
          </div>

          {/* Hamburger Icon */}
          <div className="hamburger" onClick={toggleMenu}>
            &#9776; {/* Hamburger icon */}
          </div>

          {/* Nav Links (mobile toggle) */}
          <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <li className="nav-item">
              <Link to={`/department/${departmentName}`} onClick={handleHomeClick}>
                Home
              </Link>
            </li>

           
            
            
            <li className="nav-item">
              <a href="#">Analytics</a>
              <ul className="submenu">
                <li><a href="/Pre_mc_production1">Production</a></li>
                
              </ul>
            </li>
           
            <li className="nav-item">
              <a href="#">Data</a>
              <ul className="submenu">
              <li><a href="/Pre_mclist">Edit</a></li>
                <li><a href="/Pre_mc_form">Pre_mc form</a></li>
                <li><a href="/BatchTrackingTable2">See Batch</a></li>
                
              </ul>
            </li>
          </ul>

          {/* Settings Dropdown */}
                    <div className="settings-dropdown">
                      <Settings size={24} className="settings-icon" />
                      <div className="settings-menu">
                        <div className="user-profile">
                          {profilePhotoUrl && (
                            <img
                              src={profilePhotoUrl}
                              alt="Profile"
                              className="user-avatar"
                            />
                          )}
                          <span className="user-name">{userData.name} {userData.lastname}</span>
                        </div>
                        <button className="change-password-btn" onClick={() => navigate('/ChangePassword')}>
                          <Key size={20} className="key-icon" />
                          <span className="button-text">Change Password</span>
                        </button>
                        <button className="logout-btn" onClick={handleLogout}>
                          <LogOut size={24} />
                          Log out
                        </button>
                      </div>
                    </div>
                  </nav>
                </header>
                <style>{`
                  .change-password-btn {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border: none;
                    color: white;
                    padding: 8px 7px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                  }
                  .change-password-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
                  }
                  .key-icon {
                    color: white;
                  }
                  .button-text {
                    font-weight: bold;
                  }
                `}</style>
              </div>
            );
          };
          