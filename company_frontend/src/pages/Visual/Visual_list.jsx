import React, { useState, useEffect } from "react";
import axios from "axios";
import ForgingForm from "./Visual_edit_form";
import { Sidebar } from './Sidebar';
// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 border-solid border-blue-600 border-t-transparent rounded-full" role="status">
      <span className="sr-only">Loading...</span>
    </div>
  </div>
);

const Visual_list = () => {
  const [forgings, setForgings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [filters, setFilters] = useState({
    date: "",
    batch_number: "",
    shift: "",
    component: "",
    verified_by: "",
  });

  // Fetch records
  const fetchForgings = async () => {
    try {
      setLoading(true); // Set loading state true during fetch
      const response = await axios.get("http://192.168.1.199:8001/visual/VisualViewSet/");
      setForgings(response.data);
    } catch (error) {
      console.error("Error fetching forgings:", error);
    } finally {
      setLoading(false); // Set loading state false after fetching
    }
  };

  useEffect(() => {
    fetchForgings();
  }, []);

  // Delete a record
  const deleteForging = async (id) => {
    try {
      await axios.delete(`http://192.168.1.199:8001/visual/VisualViewSet/${id}/`);
      fetchForgings(); // Re-fetch after deletion
    } catch (error) {
      console.error("Error deleting the record:", error);
    }
  };

  // Set a record for editing
  const startEditing = (forging) => {
    setEditing(forging);
  };

  // Reset editing form
  const resetEditing = () => {
    setEditing(null);
    fetchForgings(); // Ensure fresh data is fetched when you close the form
  };

  // Filter function
  const applyFilters = (forging) => {
    const { date, batch_number, shift, component, verified_by } = filters;
    return (
      (date ? forging.date.includes(date) : true) &&
      (batch_number ? forging.batch_number.includes(batch_number) : true) &&
      (shift ? forging.shift.includes(shift) : true) &&
      (component ? forging.component.includes(component) : true) &&
      (verified_by ? forging.verified_by.includes(verified_by) : true)
    );
  };

  // Sort forgings by date in descending order
  const sortedForgings = forgings
    .filter(applyFilters)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <div className="w-full p-6 mt-20" >
      <Sidebar />
      <h1 className="text-3xl font-bold mb-6">Visual Records</h1>

      {/* Filter Section */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <input
            type="text"
            name="date"
            placeholder="Filter by Date"
            value={filters.date}
            onChange={handleFilterChange}
            className="w-1/5 p-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            name="batch_number"
            placeholder="Filter by Batch Number"
            value={filters.batch_number}
            onChange={handleFilterChange}
            className="w-1/5 p-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            name="shift"
            placeholder="Filter by shift"
            value={filters.shift}
            onChange={handleFilterChange}
            className="w-1/5 p-2 border border-gray-300 rounded-md"
          />
          
          <input
            type="text"
            name="component"
            placeholder="Filter by Component"
            value={filters.component}
            onChange={handleFilterChange}
            className="w-1/5 p-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            name="verified_by"
            placeholder="Filter by Verified By"
            value={filters.verified_by}
            onChange={handleFilterChange}
            className="w-1/5 p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        // Table Section
        <div>
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left font-medium text-gray-700">ID</th>
                <th className="p-3 text-left font-medium text-gray-700">Date</th>
                <th className="p-3 text-left font-medium text-gray-700">Shift</th>
                <th className="p-3 text-left font-medium text-gray-700">Batch Number</th>
                <th className="p-3 text-left font-medium text-gray-700">Component</th>
                <th className="p-3 text-left font-medium text-gray-700">Verified By</th>
                <th className="p-3 text-left font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedForgings.map((forging) => (
                <tr key={forging.id} className="border-t border-gray-200">
                  <td className="p-3">{forging.id}</td>
                  <td className="p-3">{forging.date}</td>
                  <td className="p-3">{forging.shift}</td>
                  <td className="p-3">{forging.batch_number}</td>
                  <td className="p-3">{forging.component}</td>
                  <td className="p-3">{forging.verified_by}</td>
                  <td className="p-3">
                    <button
                      onClick={() => startEditing(forging)}
                      className="bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteForging(forging.id)}
                      className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Conditional rendering of ForgingForm */}
      {editing !== null && (
        <ForgingForm forging={editing} onClose={resetEditing} />
      )}
    </div>
  );
};

export default Visual_list;
