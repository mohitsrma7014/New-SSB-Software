// ITAdminLayout.js
import React from 'react';

const ITAdminLayout = ({ children }) => {
  return (
    <div>
      <nav>
        {/* IT Admin Navbar */}
        <ul>
          <li><a href="/department/it/admin">Manage Users</a></li>
          <li><a href="/department/it">IT Department Dashboard</a></li>
        </ul>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default ITAdminLayout;
