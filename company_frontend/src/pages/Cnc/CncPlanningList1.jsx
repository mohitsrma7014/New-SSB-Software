import { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // Icons for Yes and No status

function CncPlanningList() {
  const [cncData, setCncData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("http://192.168.1.199:8001/cnc/cncplanning/")
      .then((response) => response.json())
      .then((data) => {
        setCncData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching CNC data:", error);
        setLoading(false);
      });
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredData = cncData
    .filter(
      (item) =>
        item.Cnc_uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customer.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by done status: "No" first, then "Yes"
      if (a.done === "No" && b.done === "Yes") return -1;
      if (a.done === "Yes" && b.done === "No") return 1;

      // If done status is the same, sort by Target_start_date (latest to oldest)
      const dateA = new Date(a.Target_start_date);
      const dateB = new Date(b.Target_start_date);
      return dateB - dateA;
    });

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Loading...</div>;
  }

  return (
    <div className="w-full h-full bg-white shadow-lg border rounded-lg p-4 flex flex-col" style={{ maxHeight: '550px' }}>
      {/* Header and Search */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Planning List</h1>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by CNC UID, Component, or Customer"
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-auto flex-grow">
        <table className="min-w-full table-auto border-collapse">
          <thead className="sticky top-0 bg-gray-200 text-sm font-medium text-gray-700">
            <tr>
              <th className="px-4 py-2 border-b">Component</th>
              <th className="px-4 py-2 border-b">Customer</th>
              <th className="px-4 py-2 border-b">Target Start Date</th>
              <th className="px-4 py-2 border-b">Target End Date</th>
              <th className="px-4 py-2 border-b">Cycle Time</th>
              <th className="px-4 py-2 border-b">Target</th>
              <th className="px-4 py-2 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr
                key={item.Cnc_uid}
                className="hover:bg-gray-50 transition-all duration-200 ease-in-out"
              >
                <td className="px-4 py-2 border-b">{item.component}</td>
                <td className="px-4 py-2 border-b">{item.customer}</td>
                <td className="px-4 py-2 border-b">{item.Target_start_date}</td>
                <td className="px-4 py-2 border-b">{item.Target_End_date}</td>
                <td className="px-4 py-2 border-b">{item.component_cycle_time}</td>
                <td className="px-4 py-2 border-b">{item.target}</td>
                <td className="px-4 py-2 border-b text-center">
                  {item.done === "Yes" ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaTimesCircle className="text-red-500" />
                  )}
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