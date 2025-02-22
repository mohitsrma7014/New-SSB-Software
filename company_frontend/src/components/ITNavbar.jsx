// src/components/ITNavbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const ITNavbar = () => (
  <nav style={styles.navbar}>
    <ul style={styles.navList}>
      <li style={styles.navItem}><Link to="/it/users" style={styles.navLink}>Users</Link></li>
      <li style={styles.navItem}><Link to="/it/projects" style={styles.navLink}>Projects</Link></li>
      <li style={styles.navItem}><Link to="/it/devices" style={styles.navLink}>Devices</Link></li>
    </ul>
  </nav>
);

const styles = {
  navbar: {
    backgroundColor: '#444',
    padding: '10px',
    color: 'white',
  },
  navList: {
    display: 'flex',
    listStyleType: 'none',
    margin: 0,
    padding: 0,
  },
  navItem: {
    marginRight: '20px',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '18px',
  }
};

export default ITNavbar;
