import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Box, Typography, IconButton, Grid, Paper, TextField, Button, InputAdornment, Checkbox, FormControlLabel } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
// Import your images
import doctor from '../assets/doctor.jpg';
import doctor1 from '../assets/image1.jpeg'; 
import doctor2 from '../assets/image0 (1).jpeg';
import doctor3 from '../assets/image2.jpeg';
import doctor4 from '../assets/WhatsApp Image 2025-01-02 at 11.34.27 AM.jpeg';
import logo from '../assets/logo.png'; 
import backgroundImage from '../assets/background.jpg'; 

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [csrfToken, setCsrfToken] = useState(''); // Store CSRF token here
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0); 
  const [hovered, setHovered] = useState(false); 
  const [rememberMe, setRememberMe] = useState(false); // Add rememberMe state
  const navigate = useNavigate();

  // Array of doctor data
  const doctors = [
    { name: 'Mr. Ram Bhatia', specialty: 'Director', image: doctor },
    { name: 'Mr. Yashveer Malik', specialty: 'Director', image: doctor1 },
    { name: 'Mr. Deven Bhatia', specialty: 'Director', image: doctor2 },
    { name: 'Mr. Aditya Malik', specialty: 'Director', image: doctor3 },
    { name: 'Mr. Vinod Kuntal', specialty: 'Plant Manager', image: doctor4 }
    // Add more doctors here if necessary
  ];

  // Change doctor every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
        setCurrentDoctorIndex((prevIndex) => (prevIndex + 1) % doctors.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Handle next and previous doctor changes manually
  const goToNextDoctor = () => setCurrentDoctorIndex((prevIndex) => (prevIndex + 1) % doctors.length);
  const goToPreviousDoctor = () => setCurrentDoctorIndex((prevIndex) => (prevIndex - 1 + doctors.length) % doctors.length);

  // Fetch CSRF token on component mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        // Fetch the CSRF token from the backend
        const response = await api.get('http://192.168.1.199:8001/api/csrf/', { withCredentials: true });
        console.log('CSRF Token fetched:', response.data.csrfToken); // Log CSRF token
        setCsrfToken(response.data.csrfToken); // Store the token in state
      } catch (err) {
        console.error('Failed to fetch CSRF token:', err);
      }
    };

    fetchCsrfToken();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      if (!csrfToken) {
        throw new Error('CSRF token is missing.');
      }
    
      // Log CSRF token to confirm it's correctly fetched
      console.log('CSRF Token:', csrfToken);
    
      // Attempt to login with CSRF token in headers
      const response = await api.post(
        'http://192.168.1.199:8001/api/login/',
        { username, password }, // Send JSON body with username and password
        {
          headers: {
            'Content-Type': 'application/json', // Ensure JSON content type
            'X-CSRFToken': csrfToken, // Pass the CSRF token fetched earlier
          },
          withCredentials: true, // Include cookies for CSRF validation
        }
      );
      
      // Log the response data for debugging
      console.log('Login Response:', response.data);
  
      // Store the tokens in localStorage for later use
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
  
      // Redirect after successful login (e.g., to user department page)
      const userResponse = await api.get('http://192.168.1.199:8001/api/user-details/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Correctly retrieve the token
        },
        withCredentials: true,
      });
  
      // Log the user details to confirm successful fetch
      console.log('User Details:', userResponse.data);
  
      const { department } = userResponse.data;
      navigate(`/department/${department}`);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
      console.error('Login error:', err);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        {/* Left side (60% with background image and team details) */}
        <div
            style={{
                flex: 4,
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                padding: '20px',
                height: '100vh',
                position: 'relative',
                overflow: 'hidden',
            }}
            className="left-section"
        >
            <Box sx={{ position: 'absolute', top: '20px', left: '20px' }}>
                <img src={logo} alt="Company Logo" style={{ width: '150px', height: '50px' }} />
            </Box>

            <Grid container spacing={6} sx={{ justifyContent: 'center', marginTop: '30px' }}>
                <Grid item xs={12} sm={4}>
                    <Paper sx={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: '10px' }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden',
                                position: 'relative',
                                marginBottom: '20px',
                            }}
                            onMouseEnter={() => setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                        >
                            <div style={{ textAlign: 'center', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <img
                                    src={doctors[currentDoctorIndex].image}
                                    alt={doctors[currentDoctorIndex].name}
                                    style={{
                                        width: '150px',
                                        height: '150px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginLeft: '25%',
                                        transition: 'transform 1s ease-in-out',
                                    }}
                                />
                                <Typography variant="h6" sx={{ color: 'black', marginTop: '10px' }}>
                                    {doctors[currentDoctorIndex].name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'black' }}>
                                    {doctors[currentDoctorIndex].specialty}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: 'black',
                                        marginTop: '10px',
                                        fontStyle: 'italic',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                    }}
                                >
                                    "Forgers of Auto Components & Bearing Races – Precision, Expertise, Excellence"
                                </Typography>
                            </div>

                            {hovered && (
                                <IconButton
                                    onClick={goToPreviousDoctor}
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '10px',
                                        transform: 'translateY(-50%)',
                                        backgroundColor: 'rgba(169, 169, 169, 0.5)',
                                        borderRadius: '50%',
                                        color: 'white',
                                    }}
                                >
                                    &lt;
                                </IconButton>
                            )}

                            {hovered && (
                                <IconButton
                                    onClick={goToNextDoctor}
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        right: '10px',
                                        transform: 'translateY(-50%)',
                                        backgroundColor: 'rgba(169, 169, 169, 0.5)',
                                        borderRadius: '50%',
                                        color: 'white',
                                    }}
                                >
                                    &gt;
                                </IconButton>
                            )}
                        </div>
                    </Paper>
                </Grid>
            </Grid>
        </div>

        {/* Right side (40% with login form) */}
        <div
            style={{
                flex: 1.3,
                backgroundColor: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px',
                height: '100vh',
                overflow: 'hidden',
            }}
            className="right-section"
        >
            <div style={{ width: '80%', maxWidth: '400px' }}>
                <Typography variant="h4" align="center" gutterBottom sx={{ color: 'black' }}>
                    Login
                </Typography>
                <Typography variant="body1" align="center" sx={{ marginBottom: '20px', color: 'black' }}>
                    Please enter your credentials to access your account.
                </Typography>
                <form onSubmit={handleLogin}>
                    {error && (
                        <Typography
                            variant="body2"
                            align="center"
                            sx={{ color: 'red', marginBottom: '10px' }}
                        >
                            {error}
                        </Typography>
                    )}

                    <TextField
                        fullWidth
                        label="Username"
                        variant="outlined"
                        sx={{ marginBottom: '20px' }}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        variant="outlined"
                        sx={{ marginBottom: '20px' }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    

                    <Button fullWidth type="submit" variant="contained" color="primary" sx={{ marginBottom: '20px' }}>
                        Login
                    </Button>
                    <div
                        className="footer"
                        style={{
                            marginTop: "30px",
                            textAlign: "center",
                            fontSize: "0.9rem",
                            color: "#bbb",
                            position: "relative",
                        }}
                        >
                        © 2024{" "}
                        <a
                            href="https://ssbforge.com/"
                            style={{
                            color: "#6a75f1",
                            textDecoration: "none",
                            }}
                        >
                            SSB Engineers
                        </a>{" "}
                        | All Rights Reserved
                        </div>


                </form>
            </div>
        </div>

        {/* Add media query to hide left section and make right section take full width on small screens */}
        <style>
            {`
            @media (max-width: 600px) {
                .left-section {
                    display: none !important;
                }
                .right-section {
                    flex: 1 !important;
                    width: 100% !important;
                }
            }
            `}
        </style>
    </div>
);

};

export default LoginPage;
