import { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { Sidebar } from './Sidebar';
function CncPlanningList() {
  const [cncData, setCncData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDateFilter, setStartDateFilter] = useState(""); // Start date filter
  const [endDateFilter, setEndDateFilter] = useState(""); // End date filter

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("http://192.168.1.199:8001/cnc/cncplanning/");
      const data = await response.json();
      setCncData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching CNC data:", error);
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDateFilter(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDateFilter(e.target.value);
  };

  const handleCheckboxChange = async (id, done) => {
    const confirmed = window.confirm(
      `Are you sure you want to mark this target as ${
        done ? "incomplete" : "complete"
      }?`
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`http://192.168.1.199:8001/cnc/cncplanning/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ done: done ? "No" : "Yes" }),
      });

      if (response.ok) {
        setCncData((prevData) =>
          prevData.map((item) =>
            item.Cnc_uid === id ? { ...item, done: done ? "No" : "Yes" } : item
          )
        );
      } else {
        console.error("Failed to update done status:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating done status:", error);
    }
  };

  const filteredData = cncData
    .filter((item) => {
      // Filter by search query
      const matchesQuery =
        item.Cnc_uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customer.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by start and end dates
      const itemStartDate = new Date(item.Target_start_date);
      const itemEndDate = new Date(item.Target_End_date);
      const matchesStartDate =
        !startDateFilter || new Date(startDateFilter) <= itemStartDate;
      const matchesEndDate =
        !endDateFilter || new Date(endDateFilter) >= itemEndDate;

      return matchesQuery && matchesStartDate && matchesEndDate;
    })
    .sort((a, b) => {
      if (a.done === "No" && b.done === "Yes") return -1;
      if (a.done === "Yes" && b.done === "No") return 1;

      const dateA = new Date(a.Target_start_date);
      const dateB = new Date(b.Target_start_date);
      return dateB - dateA;
    });

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Loading...</div>;
  }

  return (
    <div className="w-full h-full mt-24 bg-white shadow-lg border rounded-lg p-4 flex flex-col" style={{ maxHeight: '700px' }}>
      <Sidebar />
      {/* Filters and Search */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Planning List</h1>
        <div className="flex space-x-2 items-center">
          {/* Search Box */}
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by CNC UID, Component, or Customer"
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* Start Date Filter */}
          <input
            type="date"
            value={startDateFilter}
            onChange={handleStartDateChange}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* End Date Filter */}
          <input
            type="date"
            value={endDateFilter}
            onChange={handleEndDateChange}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-grow">
        <table className="min-w-full table-auto border-collapse">
          <thead className="sticky top-0 bg-gray-200 text-sm font-medium text-gray-700">
            <tr>
              <th className="px-4 py-2 border-b">CNC UID</th>
              <th className="px-4 py-2 border-b">Component</th>
              <th className="px-4 py-2 border-b">Customer</th>
              <th className="px-4 py-2 border-b">Target Start Date</th>
              <th className="px-4 py-2 border-b">Target End Date</th>
              <th className="px-4 py-2 border-b">Cycle Time</th>
              <th className="px-4 py-2 border-b">Target</th>
              <th className="px-4 py-2 border-b">Line</th>
              <th className="px-4 py-2 border-b">Approved By</th>
              <th className="px-4 py-2 border-b">Done</th>
              <th className="px-4 py-2 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr
                key={item.Cnc_uid}
                className="hover:bg-gray-50 transition-all duration-200 ease-in-out"
              >
                <td className="px-4 py-2 border-b">{item.Cnc_uid}</td>
                <td className="px-4 py-2 border-b">{item.component}</td>
                <td className="px-4 py-2 border-b">{item.customer}</td>
                <td className="px-4 py-2 border-b">{item.Target_start_date}</td>
                <td className="px-4 py-2 border-b">{item.Target_End_date}</td>
                <td className="px-4 py-2 border-b">{item.component_cycle_time}</td>
                <td className="px-4 py-2 border-b">{item.target}</td>
                <td className="px-4 py-2 border-b">{item.cnc_line}</td>
                <td className="px-4 py-2 border-b">{item.verified_by}</td>
                <td className="px-4 py-2 border-b text-center">
                  {item.done === "Yes" ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaTimesCircle className="text-red-500" />
                  )}
                </td>
                <td className="px-4 py-2 border-b text-center">
                  <input
                    type="checkbox"
                    onChange={() => handleCheckboxChange(item.id, item.done === "Yes")}
                    className="form-checkbox h-5 w-5 text-blue-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CncPlanningList;
