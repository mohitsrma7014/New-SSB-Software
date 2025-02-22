import React, { useState, useEffect } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import "tailwindcss/tailwind.css";
import ComplaintForm from "./CalibrationForm";
import Notification from "./Notification";
import EditComplaintForm from "./EditcalibrationForm";
import ComplaintHistory from "./CalibrationHistory";
import { Sidebar } from "../Quality/Sidebar";

const API_URL = "http://192.168.1.199:8001/calibration/api/Rejected/";

const Calibration = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [suggestionsVisible, setSuggestionsVisible] = useState(null);

  const [filters, setFilters] = useState({
    uid: "",
    name_of_instrument: "",
    catagory: "",
    department: "",
    supplier: "",
    calibration_agency: "",
    location: "",
  });
  const [suggestions, setSuggestions] = useState({
    uid: [],
    name_of_instrument: [],
    catagory: [],
    department: [],
    supplier: [],
    calibration_agency: [],
    location: [],
  });

  useEffect(() => {
    fetchComplaints();
  }, []);
  const handleEditClick = (complaint) => {
    setSelectedComplaint(complaint);
    setIsEditFormOpen(true);
  };

  const handleHistoryClick = (complaint) => {
    setSelectedComplaint(complaint);
    setIsHistoryOpen(true);
  };

  const fetchComplaints = async () => {
    try {
      const response = await api.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      const sortedData = response.data.sort((a, b) => new Date(b.po_date) - new Date(a.po_date));
      const openComplaints = sortedData.filter((c) => c.completion_status !== "Rejected");
      const closedComplaints = sortedData.filter((c) => c.completion_status === "Rejected");

      const finalData = [...openComplaints, ...closedComplaints];

      setComplaints(finalData);
      setFilteredComplaints(finalData);
      updateSuggestions(finalData);
    } catch (error) {
      toast.error("Error fetching complaints");
    }
  };

  const updateSuggestions = (data) => {
    const normalize = (items) => [...new Set(items.map((item) => item?.toUpperCase().trim()))];

    setSuggestions({
      uid: normalize(data.map((item) => item.uid)),
      name_of_instrument: normalize(data.map((item) => item.name_of_instrument)),
      catagory: normalize(data.map((item) => item.catagory)),
      department: normalize(data.map((item) => item.department)),
      supplier: normalize(data.map((item) => item.supplier)),
      calibration_agency: normalize(data.map((item) => item.CALIBRATION_AGENCY)),
      location: normalize(data.map((item) => item.LOCATION)),
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };

    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (updatedFilters) => {
    let filtered = complaints.filter(
      (complaint) =>
        (!updatedFilters.uid || complaint.uid?.toUpperCase().includes(updatedFilters.uid.toUpperCase())) &&
        (!updatedFilters.name_of_instrument || complaint.name_of_instrument?.toUpperCase().includes(updatedFilters.name_of_instrument.toUpperCase())) &&
        (!updatedFilters.catagory || complaint.catagory?.toUpperCase().includes(updatedFilters.catagory.toUpperCase())) &&
        (!updatedFilters.department || complaint.department?.toUpperCase().includes(updatedFilters.department.toUpperCase())) &&
        (!updatedFilters.supplier || complaint.supplier?.toUpperCase().includes(updatedFilters.supplier.toUpperCase())) &&
        (!updatedFilters.calibration_agency || complaint.CALIBRATION_AGENCY?.toUpperCase().includes(updatedFilters.calibration_agency.toUpperCase())) &&
        (!updatedFilters.location || complaint.LOCATION?.toUpperCase().includes(updatedFilters.location.toUpperCase()))
    );

    setFilteredComplaints(filtered);
    updateSuggestions(filtered);
};


  return (
    <div className="w-full h-screen flex flex-col p-0 bg-white mt-24">
      <Sidebar />
      <h2 className="text-2xl font-bold text-center mb-6">Rejected Instruments </h2>
      
      
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl">
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

      <div className="flex flex-wrap justify-between items-center w-full space-x-2">
      <div className="flex flex-wrap justify-between items-center w-full p-2 gap-2">
  {Object.keys(filters).map((filterKey) => (
    <div key={filterKey} className="relative flex flex-col gap-2">
      <div className="relative w-48">
        <input
          name={filterKey}
          value={filters[filterKey]}
          onChange={(e) => handleFilterChange(e)}
          onFocus={() => setSuggestionsVisible(filterKey)}
          onBlur={() => setTimeout(() => setSuggestionsVisible(null), 200)}
          className="border p-2 rounded-md shadow-sm w-full text-sm pr-8"
          placeholder={`Filter by ${filterKey.replace("_", " ")}`}
          autoComplete="off"
        />
        {filters[filterKey] && (
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
            onClick={() => {
              setFilters({ ...filters, [filterKey]: "" });
              applyFilters({ ...filters, [filterKey]: "" });
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Suggestion count badge */}
      {suggestions[filterKey]?.length > 0 && (
        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
          {suggestions[filterKey].length}
        </span>
      )}

      {/* Dropdown for suggestions */}
      {suggestionsVisible === filterKey && suggestions[filterKey]?.length > 0 && (
        <ul className="absolute left-0 bg-white border border-gray-300 rounded-md shadow-lg w-48 mt-12 max-h-48 overflow-y-auto z-50 text-sm">
          {suggestions[filterKey]
            .filter((item) => item.toLowerCase().includes(filters[filterKey].toLowerCase()))
            .map((item, index) => (
              <li
                key={index}
                className="p-2 hover:bg-blue-100 cursor-pointer flex justify-between items-center"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setFilters({ ...filters, [filterKey]: item });
                  applyFilters({ ...filters, [filterKey]: item });
                }}
              >
                {item}
                <span className="text-gray-400 text-xs">✔</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  ))}
</div>

        

        <table className="w-full border-collapse border rounded-lg shadow-md">
          <thead className="bg-gray-200 text-black sticky top-0 z-10">
            <tr>
              <th className="px-2 py-1">UID</th>
              <th className="px-2 py-1">Po Date</th>
              <th className="px-2 py-1">Instrument</th>
              <th className="px-2 py-1">Category</th>
              <th className="px-2 py-1">Department</th>
              <th className="px-2 py-1">Supplier</th>
              <th className="px-2 py-1">Calibration Agency</th>
              <th className="px-2 py-1">Done Date</th>
              <th className="px-2 py-1">Due Date</th>
              <th className="px-2 py-1">Location</th>
              <th className="px-2 py-1">Certificate</th>
              <th className="px-2 py-1">Status</th>
              <th className="px-2 py-1">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map((complaint) => (
              <tr key={complaint.id} className="border-t">
                <td className="px-2 py-2 text-center">{complaint.uid}</td>
                <td className="px-2 py-2 text-center">{complaint.po_date}</td>
                <td className="px-2 py-2 text-center">{complaint.name_of_instrument}</td>
                <td className="px-2 py-2 text-center">{complaint.catagory}</td>
                <td className="px-2 py-2 text-center">{complaint.department}</td>
                <td className="px-2 py-2 text-center">{complaint.supplier}</td>
                <td className="px-2 py-2 text-center">{complaint.CALIBRATION_AGENCY}</td>
                <td className="px-2 py-2 text-center">{complaint.CALIBRATION_DONE_DATE}</td>
                <td className="px-2 py-2 text-center">{complaint.due_date}</td>
                <td className="px-2 py-2 text-center">{complaint.LOCATION}</td>
                <td>
                                {complaint.add_pdf ? (
                                    <a href={complaint.add_pdf} target="_blank" rel="noopener noreferrer">
                                        View PDF
                                    </a>
                                ) : (
                                    'No PDF'
                                )}
                            </td>
                <td className={`px-2 py-2 text-center font-bold ${complaint.status === "Rejected" ? "text-red-500" : "text-green-500"}`}>{complaint.status}</td>
                <td className="px-2 py-2 text-center flex justify-center gap-2">
                  <button 
                    className="bg-yellow-500 text-white px-3 py-1 rounded shadow hover:bg-yellow-600" 
                    onClick={() => handleEditClick(complaint)}
                  >
                    Details
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

export default Calibration;
