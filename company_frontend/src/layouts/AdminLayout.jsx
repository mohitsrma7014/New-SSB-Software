// src/layouts/AdminLayout.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const AdminNavbar = () => (
  <nav style={styles.navbar}>
    <ul style={styles.navList}>
      <li style={styles.navItem}><Link to="/" style={styles.navLink}>Dashboard</Link></li>
      <li style={styles.navItem}><Link to="/admin/users" style={styles.navLink}>Users</Link></li>
      <li style={styles.navItem}><Link to="/admin/settings" style={styles.navLink}>Settings</Link></li>
    </ul>
  </nav>
);

const AdminLayout = ({ children }) => (
  <div>
    <AdminNavbar />
    <div style={styles.content}>{children}</div>
  </div>
);

const styles = {
  navbar: {
    backgroundColor: '#333',
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
  },
  content: {
    padding: '20px',
  }
};

export default AdminLayout;
