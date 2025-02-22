import { useState, useEffect } from "react";
import axios from "axios";
import { Sidebar } from "../Quality/Sidebar";

const API_BASE_URL = "http://192.168.1.199:8001/calibration"; // Update if needed

const UIDGenerator = () => {
  const [category, setCategory] = useState(""); // Stores backend value
  const [generatedUID, setGeneratedUID] = useState("");
  const [uidList, setUidList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Category Mapping (Frontend → Backend)
  const categories = [
    { label: "V -BLOCK", value: "VB" },
    { label: "BENCH CENTRE", value: "BC" },
    { label: "SLIP GAUGE BLOCK SET", value: "SGB" },
    { label: "HEIGHT GAUGE", value: "DHG" },
    { label: "DIGITAL MICROMETER", value: "DMM" },
    { label: "MICROMETER", value: "MM" },
    { label: "ROUGHNESS TESTER", value: "RT" },
    { label: "BORE GAUGE", value: "BG" },
    { label: "INSIDE DIAL CALIPER", value: "IDC" },
    { label: "AIR GAUGE UNIT", value: "AGU" },
    { label: "LEVER DIAL", value: "LD" },
    { label: "GRANITE SURFACE PLATE", value: "SP" },
    { label: "CONTRACER", value: "CC" },
    { label: "DIGITAL VERNIER CALIPER", value: "DVC" },
    { label: "VERNIER CALIPER", value: "VC" },
    { label: "WEIGHING SCALE", value: "WS" },
    { label: "DEPTH GAUGE", value: "DG" },
    { label: "ANGLE PROTRACTOR", value: "AP" },
    { label: "PLUNGER DIAL GAUGE", value: "DI" },
    { label: "CMM", value: "CMM" },
    { label: "HARD RING MASTER", value: "HRM" },
    { label: "AIR PLUG GAUGE", value: "APG" },
    { label: "AIR RING GAUGE", value: "ARG" },
    { label: "MULTIGAUGE", value: "MG" },
    { label: "PYROMETER", value: "IRPM" },
    { label: "NORMALIZING FURNACE", value: "NF" },
    { label: "HARDENING FURNACE", value: "HF" },
    { label: "TEMPERING FURNACE", value: "TF" },
    { label: "DIGITAL UV/LUX METER", value: "DLC" },
    { label: "DIGITAL TEMPERATURE CONTROLLER", value: "DTC" },
    { label: "UTM", value: "UTM" },
    { label: "DOUBLE SCREW ROCKWELL HARDNESS TESTING MACHINE", value: "DSRH" },
    { label: "BRINNEL HARDNESS", value: "BH" },
    { label: "ROCKWELL HARDNESS", value: "RH" },
    { label: "MICROSCOPE", value: "MS" },
    { label: "PENDULUM IMPACT TESTING MACHINE", value: "ITM" },
    { label: "XRF GUN", value: "XRF" },
    { label: "MPI MACHINE", value: "MPI" },
    { label: "GO - NOT GO GAUGE", value: "GNG" },
    { label: "DIAL COMPARATOR GAUGE", value: "DC" },
    
];


  useEffect(() => {
    fetchUIDs();
  }, []);

  const fetchUIDs = () => {
    axios.get(`${API_BASE_URL}/id-list/`)
      .then((response) => {
        const sortedList = response.data.sort((a, b) => b.id - a.id); // Latest to oldest
        setUidList(sortedList);
      })
      .catch((error) => {
        console.error("Error fetching UID list:", error);
      });
  };

  const handleGenerateUID = () => {
    if (!category) {
      alert("Please select a category.");
      return;
    }
    if (!window.confirm("Are you sure you want to generate a new UID?")) return;

    axios.post(`${API_BASE_URL}/generate-uid/`, { category }) // Sends backend value
      .then((response) => {
        setGeneratedUID(response.data.uid);
        fetchUIDs();
      })
      .catch((error) => {
        console.error("Error generating UID:", error);
      });
  };

  const updateStatus = (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this UID as ${newStatus}?`)) return;

    axios.patch(`${API_BASE_URL}/update-status/${id}/`, { receiving_status: newStatus })
      .then(() => {
        setUidList((prevList) =>
          prevList.map((item) =>
            item.id === id ? { ...item, receiving_status: newStatus } : item
          )
        );
      })
      .catch((error) => {
        console.error("Error updating status:", error);
      });
  };

  const filteredUIDs = uidList.filter((uid) =>
    uid.uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
    uid.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    uid.receiving_status.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="p-2 bg-white rounded-lg shadow-md mt-24 flex flex-col md:flex-row gap-6">
      {/* Form Section */}<Sidebar />
      <div className="md:w-1/2 p-4 border rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-4">UID Generator</h2>
        
        {/* Category Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Select Category:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Show Selected Category Label */}
        {category && (
          <p className="text-blue-600 font-semibold">
            Selected Category: {categories.find(cat => cat.value === category)?.label || ""}
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
          <p className="mt-4 text-lg font-semibold text-green-600">Generated UID: {generatedUID}</p>
        )}
      </div>
      
      {/* Table Section */}
      <div className="md:w-1/2 p-1 border rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-4">UID List</h2>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search UID, Category, Status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* UID List Table */}
        <div className="border rounded-lg shadow-sm max-h-180 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="p-3 border-b">UID</th>
                <th className="p-3 border-b">Category</th>
                <th className="p-3 border-b">Status</th>
                <th className="p-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUIDs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">No UIDs found.</td>
                </tr>
              ) : (
                filteredUIDs.map((uid) => (
                  <tr key={uid.id} className="hover:bg-gray-50 transition">
                    <td className="p-3 border-b">{uid.uid}</td>
                    <td className="p-3 border-b">
                      {categories.find(cat => cat.value === uid.category)?.label || uid.category}
                    </td>
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
      </div>
    </div>
  );
};

export default UIDGenerator;