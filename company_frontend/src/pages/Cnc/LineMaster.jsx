import React, { useState, useEffect } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import "tailwindcss/tailwind.css";
import ComplaintForm from "./CncLineForm";
import EditComplaintForm from "./EditlineForm";
import ComplaintHistory from "./CncLineHistory";
import { Sidebar } from './Sidebar';

const API_URL = "http://192.168.1.199:8001/cnc/api/complaints/";

const LineMaster = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [searchQuery, complaints]);

  const fetchComplaints = async () => {
    try {
      const response = await api.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      // Sorting by machine_no in descending order
      const sortedComplaints = response.data.sort((a, b) => b.machine_no.localeCompare(a.machine_no));
      setComplaints(sortedComplaints);
    } catch (error) {
      toast.error("Error fetching complaints");
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filterComplaints = () => {
    if (searchQuery.trim() === "") {
      setFilteredComplaints(complaints);  // If no search query, show all complaints
    } else {
      const filtered = complaints.filter((complaint) =>
        complaint.machine_no.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredComplaints(filtered);
    }
  };

  const handleEditClick = (complaint) => {
    setSelectedComplaint(complaint);
    setIsEditFormOpen(true);
  };

  const handleHistoryClick = (complaint) => {
    setSelectedComplaint(complaint);
    setIsHistoryOpen(true);
  };

  return (
    <div className="w-full h-screen flex flex-col p-0 bg-white mt-24">
      <Sidebar />
      <h2 className="text-2xl font-bold text-center mb-6">Line Data Management</h2>
      
      <div className="flex justify-between w-full mb-4 px-4 items-center">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
          onClick={() => setIsFormOpen(true)}
        >
          + Add Machine
        </button>
        
        <div className="relative w-64">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by Machine No..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <span className="absolute top-3 left-3 text-gray-500">
            <i className="fas fa-search"></i>
          </span>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <ComplaintForm onClose={() => setIsFormOpen(false)} onSuccess={fetchComplaints} />
          </div>
        </div>
      )}
      {isEditFormOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <EditComplaintForm complaint={selectedComplaint} onClose={() => setIsEditFormOpen(false)} onSuccess={fetchComplaints} />
          </div>
        </div>
      )}
      {isHistoryOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <ComplaintHistory complaint={selectedComplaint} onClose={() => setIsHistoryOpen(false)} />
          </div>
        </div>
      )}

      <div className="w-full overflow-x-auto mt-6">
        <table className="w-full border-collapse border rounded-lg overflow-hidden shadow-md">
          <thead className="bg-gray-200 text-black sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Line</th>
              <th className="px-4 py-2">Cell</th>
              <th className="px-4 py-2">Machine no</th>
              <th className="px-4 py-2">Running Time</th>
              <th className="px-4 py-2">Running Status</th>
              <th className="px-4 py-2">Remark</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map((complaint) => (
              <tr key={complaint.id} className="border-t">
                <td className="px-4 py-2 text-center">{complaint.id}</td>
                <td className="px-4 py-2 text-center">{complaint.line}</td>
                <td className="px-4 py-2 text-center">{complaint.cell}</td>
                <td className="px-4 py-2 text-center">{complaint.machine_no}</td>
                <td className="px-4 py-2 text-center">{complaint.machine_cycle_time}</td>
                <td className="px-4 py-2 text-center">{complaint.runningstatus}</td>
                <td className="px-4 py-2 text-center">{complaint.remark}</td>
                <td className="px-4 py-2 text-center flex justify-center gap-2">
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded shadow hover:bg-yellow-600"
                    onClick={() => handleEditClick(complaint)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded shadow hover:bg-blue-600"
                    onClick={() => handleHistoryClick(complaint)}
                  >
                    History
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LineMaster;
