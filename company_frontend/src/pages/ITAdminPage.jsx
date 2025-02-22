// ITAdminPage.js
import React, { useState, useEffect } from 'react';
import api from '../api'; // Your Axios instance

const ITAdminPage = () => {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await api.get('users/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        setUsers(response.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setEditUser(user);
  };

  const handleUpdate = async (updatedUser) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await api.put(`user/${updatedUser.id}/update/`, updatedUser, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === updatedUser.id ? { ...user, ...updatedUser } : user
        )
      );
      setEditUser(null);
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  return (
    <div>
      <h1>IT Department - User Management</h1>
      <div>
        <h2>Users List</h2>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              <p>Name: {user.first_name} {user.last_name}</p>
              <p>Email: {user.email}</p>
              <button onClick={() => handleEdit(user)}>Edit</button>
            </li>
          ))}
        </ul>
      </div>

      {editUser && (
        <div>
          <h3>Edit User</h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <label>
              First Name:
              <input
                type="text"
                value={editUser.first_name}
                onChange={(e) =>
                  setEditUser({ ...editUser, first_name: e.target.value })
                }
              />
            </label>
            <label>
              Last Name:
              <input
                type="text"
                value={editUser.last_name}
                onChange={(e) =>
                  setEditUser({ ...editUser, last_name: e.target.value })
                }
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                value={editUser.email}
                onChange={(e) =>
                  setEditUser({ ...editUser, email: e.target.value })
                }
              />
            </label>
            <label>
              Mobile Number:
              <input
                type="text"
                value={editUser.mobile_no}
                onChange={(e) =>
                  setEditUser({ ...editUser, mobile_no: e.target.value })
                }
              />
            </label>
            <button type="button" onClick={() => handleUpdate(editUser)}>
              Update User
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ITAdminPage;
