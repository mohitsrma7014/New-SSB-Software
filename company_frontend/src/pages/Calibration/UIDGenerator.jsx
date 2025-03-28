import { useState, useEffect } from "react";
import axios from "axios";
import { Sidebar } from "../Quality/Sidebar";

const API_BASE_URL = "http://192.168.1.199:8001/calibration"; // Update if needed

const UIDGenerator = () => {
  // State for form fields
  const [category, setCategory] = useState("");
  const [supplier, setSupplier] = useState("");
  const [nameOfInstrument, setNameOfInstrument] = useState("");
  const [department, setDepartment] = useState("");

  // State for new entries
  const [newCategory, setNewCategory] = useState("");
  const [newSupplier, setNewSupplier] = useState("");
  const [newNameOfInstrument, setNewNameOfInstrument] = useState("");
  const [newDepartment, setNewDepartment] = useState("");

  // State for UID generation
  const [generatedUID, setGeneratedUID] = useState("");
  const [nextUID, setNextUID] = useState("");

  // State for UID list
  const [uidList, setUidList] = useState([]);
  const [showList, setShowList] = useState(false); // Toggle list visibility
  const [selectedStatus, setSelectedStatus] = useState(""); // Selected status for filtering
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [totalPages, setTotalPages] = useState(0); // Total number of pages
  const [totalEntries, setTotalEntries] = useState(0); // Total number of entries
  const [pageSize, setPageSize] = useState(10); // Items per page

  // State for dropdown options
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Fetch initial data from backend
  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
    fetchInstruments();
    fetchDepartments();
  }, []);

  // Fetch categories
  const fetchCategories = () => {
    axios
      .get(`${API_BASE_URL}/categories/`)
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error fetching categories:", error));
  };

  // Fetch suppliers
  const fetchSuppliers = () => {
    axios
      .get(`${API_BASE_URL}/suppliers/`)
      .then((response) => setSuppliers(response.data))
      .catch((error) => console.error("Error fetching suppliers:", error));
  };

  // Fetch instruments
  const fetchInstruments = () => {
    axios
      .get(`${API_BASE_URL}/instruments/`)
      .then((response) => setInstruments(response.data))
      .catch((error) => console.error("Error fetching instruments:", error));
  };

  // Fetch departments
  const fetchDepartments = () => {
    axios
      .get(`${API_BASE_URL}/departments/`)
      .then((response) => setDepartments(response.data))
      .catch((error) => console.error("Error fetching departments:", error));
  };

  // Handle UID generation
  const handleGenerateUID = () => {
    if (!category || !supplier || !nameOfInstrument || !department) {
      alert("Please fill all fields.");
      return;
    }
    if (!window.confirm("Are you sure you want to generate a new UID?")) return;

    axios
      .post(`${API_BASE_URL}/generate-uid/`, {
        category,
        supplier,
        name_of_instrument: nameOfInstrument,
        department,
      })
      .then((response) => {
        setGeneratedUID(response.data.uid);
        // Clear all input fields
        setCategory("");
        setSupplier("");
        setNameOfInstrument("");
        setDepartment("");
        setNewCategory("");
        setNewSupplier("");
        setNewNameOfInstrument("");
        setNewDepartment("");
      })
      .catch((error) => {
        console.error("Error generating UID:", error);
      });
  };
   // Handle adding new category
   const handleAddNewCategory = () => {
    if (!newCategory) {
      alert("Please enter a new category.");
      return;
    }
    axios
      .post(`${API_BASE_URL}/categories/`, { name: newCategory })
      .then(() => {
        setCategories([...categories, newCategory]);
        setNewCategory("");
      })
      .catch((error) => console.error("Error adding category:", error));
  };

  // Handle adding new supplier
  const handleAddNewSupplier = () => {
    if (!newSupplier) {
      alert("Please enter a new supplier.");
      return;
    }
    axios
      .post(`${API_BASE_URL}/suppliers/`, { name: newSupplier })
      .then(() => {
        setSuppliers([...suppliers, newSupplier]);
        setNewSupplier("");
      })
      .catch((error) => console.error("Error adding supplier:", error));
  };

  // Handle adding new instrument
  const handleAddNewInstrument = () => {
    if (!newNameOfInstrument) {
      alert("Please enter a new instrument name.");
      return;
    }
    axios
      .post(`${API_BASE_URL}/instruments/`, { name: newNameOfInstrument })
      .then(() => {
        setInstruments([...instruments, newNameOfInstrument]);
        setNewNameOfInstrument("");
      })
      .catch((error) => console.error("Error adding instrument:", error));
  };

  // Handle adding new department
  const handleAddNewDepartment = () => {
    if (!newDepartment) {
      alert("Please enter a new department.");
      return;
    }
    axios
      .post(`${API_BASE_URL}/departments/`, { name: newDepartment })
      .then(() => {
        setDepartments([...departments, newDepartment]);
        setNewDepartment("");
      })
      .catch((error) => console.error("Error adding department:", error));
  };


  // Handle fetching UIDs by status with pagination
  const fetchUIDsByStatus = (status, page = 1, size = pageSize) => {
    axios
      .get(`${API_BASE_URL}/id-list/?status=${status}&page=${page}&page_size=${size}`)
      .then((response) => {
        setUidList(response.data.results);
        setTotalPages(response.data.total_pages);
        setTotalEntries(response.data.total_entries);
      })
      .catch((error) => {
        console.error("Error fetching UIDs:", error);
      });
  };

  // Handle status selection
  const handleStatusSelection = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset to the first page
    fetchUIDsByStatus(status);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchUIDsByStatus(selectedStatus, page);
  };

  // Handle page size change
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to the first page
    fetchUIDsByStatus(selectedStatus, 1, size);
  };

  // Handle updating status
  const updateStatus = (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this UID as ${newStatus}?`)) return;

    axios
      .patch(`${API_BASE_URL}/update-status/${id}/`, { receiving_status: newStatus })
      .then(() => {
        fetchUIDsByStatus(selectedStatus, currentPage); // Refresh the UID list
      })
      .catch((error) => {
        console.error("Error updating status:", error);
      });
  };

  return (
    <div className="p-2 bg-white rounded-lg shadow-md mt-24 flex flex-col gap-6">
      <Sidebar />
      <div className="p-4 border rounded-lg shadow-sm relative">
        {/* Show List Button (Top Right) */}
        <button
          onClick={() => setShowList(!showList)}
          className="absolute top-4 right-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition"
        >
          {showList ? "Hide List" : "Show List"}
        </button>

        {/* Form Section (Hidden when list is visible) */}
        {!showList && (
          <>
            <h2 className="text-2xl font-bold mb-4">UID Generator</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Category</label>
                <div className="flex gap-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border rounded p-2 w-full"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((cat, index) => (
                      <option key={index} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Add new"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="border p-2 rounded w-1/3"
                  />
                  <button
                    onClick={handleAddNewCategory}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Supplier Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Supplier</label>
                <div className="flex gap-2">
                  <select
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="border rounded p-2 w-full"
                  >
                    <option value="">-- Select Supplier --</option>
                    {suppliers.map((sup, index) => (
                      <option key={index} value={sup}>
                        {sup}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Add new"
                    value={newSupplier}
                    onChange={(e) => setNewSupplier(e.target.value)}
                    className="border p-2 rounded w-1/3"
                  />
                  <button
                    onClick={handleAddNewSupplier}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Name of Instrument Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Instrument</label>
                <div className="flex gap-2">
                  <select
                    value={nameOfInstrument}
                    onChange={(e) => setNameOfInstrument(e.target.value)}
                    className="border rounded p-2 w-full"
                  >
                    <option value="">-- Select Instrument --</option>
                    {instruments.map((inst, index) => (
                      <option key={index} value={inst}>
                        {inst}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Add new"
                    value={newNameOfInstrument}
                    onChange={(e) => setNewNameOfInstrument(e.target.value)}
                    className="border p-2 rounded w-1/3"
                  />
                  <button
                    onClick={handleAddNewInstrument}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Department Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Department</label>
                <div className="flex gap-2">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="border rounded p-2 w-full"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((dept, index) => (
                      <option key={index} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Add new"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="border p-2 rounded w-1/3"
                  />
                  <button
                    onClick={handleAddNewDepartment}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Next UID Display */}
            {nextUID && (
              <p className="mt-4 text-lg font-semibold text-green-600">
                Next UID: {nextUID}
              </p>
            )}

            {/* Generate UID Button */}
            <button
              onClick={handleGenerateUID}
              className="bg-blue-500 text-white p-2 rounded w-full mt-3 hover:bg-blue-600 transition"
            >
              Generate UID
            </button>

            {/* Display Generated UID */}
            {generatedUID && (
              <p className="mt-4 text-lg font-semibold text-green-600">
                Generated UID: {generatedUID}
              </p>
            )}
          </>
        )}

        {/* UID List Section */}
        {showList && (
          <div className="mt-4">
            <h2 className="text-2xl font-bold mb-4">UID List</h2>

            {/* Status Selection Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium">Select Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusSelection(e.target.value)}
                className="border rounded p-2 w-full"
              >
                <option value="">-- Select Status --</option>
                <option value="received">Received</option>
                <option value="pending">Pending</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>

            {/* Total Entries Display */}
            <p className="text-sm text-gray-600 mb-4">
              Total Entries: {totalEntries}
            </p>

            {/* UID List Table */}
            <div className="border rounded-lg shadow-sm max-h-96 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-200 sticky top-0">
                  <tr>
                    <th className="p-3 border-b">UID</th>
                    <th className="p-3 border-b">Category</th>
                    <th className="p-3 border-b">Supplier</th>
                    <th className="p-3 border-b">Instrument</th>
                    <th className="p-3 border-b">Department</th>
                    <th className="p-3 border-b">Status</th>
                    <th className="p-3 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {uidList.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-4 text-center text-gray-500">
                        No UIDs found.
                      </td>
                    </tr>
                  ) : (
                    uidList.map((uid) => (
                      <tr key={uid.id} className="hover:bg-gray-50 transition">
                        <td className="p-3 border-b">{uid.uid}</td>
                        <td className="p-3 border-b">{uid.category}</td>
                        <td className="p-3 border-b">{uid.supplier}</td>
                        <td className="p-3 border-b">{uid.name_of_instrument}</td>
                        <td className="p-3 border-b">{uid.department}</td>
                        <td className="p-3 border-b font-semibold">
                          {uid.receiving_status === "pending" && (
                            <span className="text-yellow-500">Pending</span>
                          )}
                          {uid.receiving_status === "received" && (
                            <span className="text-green-500">Received</span>
                          )}
                          {uid.receiving_status === "canceled" && (
                            <span className="text-red-500">Canceled</span>
                          )}
                        </td>
                        <td className="p-3 border-b">
                          {uid.receiving_status === "pending" && (
                            <>
                              <button
                                className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600 transition"
                                onClick={() => updateStatus(uid.id, "received")}
                              >
                                Mark as Received
                              </button>
                              <button
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                onClick={() => updateStatus(uid.id, "canceled")}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition disabled:bg-gray-300"
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition disabled:bg-gray-300"
                >
                  Previous
                </button>
              </div>
              <div className="flex gap-2">
                {currentPage > 2 && (
                  <span className="text-gray-600">...</span>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === 2 ||
                      page === currentPage - 1 ||
                      page === currentPage ||
                      page === currentPage + 1 ||
                      page === totalPages - 1 ||
                      page === totalPages
                  )
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`p-2 rounded ${
                        page === currentPage
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                {currentPage < totalPages - 2 && (
                  <span className="text-gray-600">...</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition disabled:bg-gray-300"
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition disabled:bg-gray-300"
                >
                  Last
                </button>
              </div>
            </div>

            {/* Page Size Dropdown */}
            <div className="mt-4">
              <label className="block text-sm font-medium">Items per page:</label>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border rounded p-2"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            {/* Direct Page Number Input */}
            <div className="mt-4">
              <label className="block text-sm font-medium">Go to page:</label>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => handlePageChange(Number(e.target.value))}
                className="border rounded p-2"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UIDGenerator;