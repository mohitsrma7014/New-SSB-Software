import React, { useState, useEffect } from "react";
import axios from "axios";
import ForgingForm from "./Master_list_edit_form";
import { Sidebar } from '../../components/AdminComponents/Sidebar';

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
      (component ? forging.component.toLowerCase().includes(component.toLowerCase()) : true) &&
      (part_name ? forging.part_name.toLowerCase().includes(part_name.toLowerCase()) : true) &&
      (customer ? forging.customer.toLowerCase().includes(customer.toLowerCase()) : true) &&
      (material_grade ? forging.material_grade.toLowerCase().includes(material_grade.toLowerCase()) : true) &&
      (bar_dia ? forging.bar_dia.toLowerCase().includes(bar_dia.toLowerCase()) : true)
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

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      component: "",
      part_name: "",
      customer: "",
      material_grade: "",
      bar_dia: "",
    });
  };

  return (
    <div className="w-full p-6 mt-20">
      <Sidebar />
      <h1 className="text-3xl font-bold mb-6">Master List Records</h1>

      {/* Filter Section */}
      <div className="mb-6">
  <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
    <input
      type="text"
      name="component"
      placeholder="Filter by Component"
      value={filters.component}
      onChange={handleFilterChange}
      className="p-2 border border-gray-300 rounded-md"
    />
    <input
      type="text"
      name="part_name"
      placeholder="Filter by Part Name"
      value={filters.part_name}
      onChange={handleFilterChange}
      className="p-2 border border-gray-300 rounded-md"
    />
    <input
      type="text"
      name="customer"
      placeholder="Filter by Customer"
      value={filters.customer}
      onChange={handleFilterChange}
      className="p-2 border border-gray-300 rounded-md"
    />
    <input
      type="text"
      name="material_grade"
      placeholder="Filter by Material Grade"
      value={filters.material_grade}
      onChange={handleFilterChange}
      className="p-2 border border-gray-300 rounded-md"
    />
    <input
      type="text"
      name="bar_dia"
      placeholder="Filter by Bar Dia"
      value={filters.bar_dia}
      onChange={handleFilterChange}
      className="p-2 border border-gray-300 rounded-md"
    />
    <button
      onClick={clearFilters}
      className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
    >
      Clear Filters
    </button>
  </div>
</div>


      {/* Loading Indicator */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        // Table Section
        <div className="overflow-x-auto max-h-[600px]">
  <table className="min-w-full table-auto border-collapse border border-gray-300">
    <thead className="bg-gray-100 sticky top-0 z-10">
      <tr>
        <th className="p-3 text-left font-bold text-gray-700">ID</th>
        <th className="p-3 text-left font-bold text-blue-700">Component</th>
        <th className="p-3 text-left font-bold text-gray-700">Customer</th>
        <th className="p-3 text-left font-bold text-gray-700">Grade</th>
        <th className="p-3 text-left font-bold text-gray-700">Slug Weight</th>
        <th className="p-3 text-left font-bold text-gray-700">Dia</th>
        <th className="p-3 text-left font-bold text-gray-700 ">Ring Weight</th>
        <th className="p-3 text-left font-bold text-gray-700 bg-green-100">OP-10 Cyc. Time</th>
        <th className="p-3 text-left font-bold text-gray-700 bg-green-100">OP-10 Target</th>
        <th className="p-3 text-left font-bold text-gray-700 bg-yellow-100">OP-20 Cyc. Time</th>
        <th className="p-3 text-left font-bold text-gray-700 bg-yellow-100">OP-20 Target</th>
        <th className="p-3 text-left font-bold text-gray-700">Action</th>
      </tr>
    </thead>
    <tbody>
      {sortedForgings.map((forging) => (
        <tr key={forging.id} className="border-t border-gray-200 hover:bg-gray-50">
          <td className="p-3">{forging.id}</td>
          <td className="p-3 text-blue-700">{forging.component}</td>
          <td className="p-3">{forging.customer}</td>
          <td className="p-3">{forging.material_grade}</td>
          <td className="p-3">{forging.slug_weight}</td>
          <td className="p-3">{forging.bar_dia}</td>
          <td className="p-3">{forging.ring_weight}</td>
          <td className="p-3 bg-green-100">{forging.op_10_time}</td>
          <td className="p-3 bg-green-100">{forging.op_10_target}</td>
          <td className="p-3 bg-yellow-100">{forging.op_20_time}</td>
          <td className="p-3 bg-yellow-100">{forging.op_20_target}</td>
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