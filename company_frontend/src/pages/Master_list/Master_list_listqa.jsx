import React, { useState, useEffect } from "react";
import axios from "axios";
import ForgingForm from "./Master_list_edit_form";
import { Sidebar } from "../Quality/Sidebar";

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 border-solid border-blue-600 border-t-transparent rounded-full" role="status">
      <span className="sr-only">Loading...</span>
    </div>
  </div>
);

const Master_list_list = () => {
  const [forgings, setForgings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [filters, setFilters] = useState({
    component: "",
    part_name: "",
    customer: "",
    material_grade: "",
    bar_dia: "",
  });

  // Fetch records
  const fetchForgings = async () => {
    try {
      setLoading(true); // Set loading state true during fetch
      const response = await axios.get("http://192.168.1.199:8001/raw_material/MasterListViewSet/");
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
      await axios.delete(`http://192.168.1.199:8001/raw_material/MasterListViewSet/${id}/`);
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
    const { component, part_name, customer, material_grade, bar_dia } = filters;
    return (
      (component ? forging.component.includes(component) : true) &&
      (part_name ? forging.part_name.includes(part_name) : true) &&
      (customer ? forging.customer.includes(customer) : true) &&
      (material_grade ? forging.material_grade.includes(material_grade) : true) &&
      (bar_dia ? forging.bar_dia.includes(bar_dia) : true)
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
      <h1 className="text-3xl font-bold mb-6">Master List Records</h1>

      {/* Filter Section */}
      <div className="mb-6">
        <div className="flex space-x-4">
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
            name="part_name"
            placeholder="Filter by Part Name"
            value={filters.part_name}
            onChange={handleFilterChange}
            className="w-1/5 p-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            name="customer"
            placeholder="Filter by customer"
            value={filters.customer}
            onChange={handleFilterChange}
            className="w-1/5 p-2 border border-gray-300 rounded-md"
          />
          
          <input
            type="text"
            name="material_grade"
            placeholder="Filter by material grade"
            value={filters.material_grade}
            onChange={handleFilterChange}
            className="w-1/5 p-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            name="bar_dia"
            placeholder="Filter by bar_dia"
            value={filters.bar_dia}
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
                <th className="p-3 text-left font-medium text-gray-700">Component</th>
                <th className="p-3 text-left font-medium text-gray-700">Part Name</th>
                <th className="p-3 text-left font-medium text-gray-700">Custome</th>
                <th className="p-3 text-left font-medium text-gray-700">Drawing</th>
                <th className="p-3 text-left font-medium text-gray-700">Standerd</th>
                <th className="p-3 text-left font-medium text-gray-700">Grade</th>
                <th className="p-3 text-left font-medium text-gray-700">Slug Wight</th>
                <th className="p-3 text-left font-medium text-gray-700">Dia</th>
                <th className="p-3 text-left font-medium text-gray-700">Ring Wight</th>
                <th className="p-3 text-left font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedForgings.map((forging) => (
                <tr key={forging.id} className="border-t border-gray-200">
                  <td className="p-3">{forging.id}</td>
                  <td className="p-3">{forging.component}</td>
                  <td className="p-3">{forging.part_name}</td>
                  <td className="p-3">{forging.customer}</td>
                  <td className="p-3">{forging.drawing_number}</td>
                  <td className="p-3">{forging.standerd}</td>
                  <td className="p-3">{forging.material_grade}</td>
                  <td className="p-3">{forging.slug_weight}</td>
                  <td className="p-3">{forging.bar_dia}</td>
                  <td className="p-3">{forging.ring_weight}</td>
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

export default Master_list_list;
