import React, { useEffect, useState } from "react";
import axios from "axios";
import { Sidebar } from './Sidebar';
import  DashboardHeader  from './DashboardHeader';
import { FaEye, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const RawMaterialList = ({ onSelectMaterial }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get(
          "http://192.168.1.199:8001/raw_material/api/rawmaterials/"
        );
        setMaterials(response.data);
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter materials based on search term
  const filteredMaterials = materials.filter((material) =>
    material.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.heatno.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedMaterials = filteredMaterials.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });

  if (loading) {
    return <p>Loading raw materials...</p>;
  }

  return (
    <div className="App bg-gray-50 min-h-screen flex">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <DashboardHeader />
      {/* Main content area */}
      <div className="flex-1 p-6 mt-12 ml-60 max-w-[calc(100vw-240px)] overflow-x-auto">
  <div className="flex items-center gap-2 mb-4">
    <input
      type="text"
      placeholder="Search materials..."
      value={searchTerm}
      onChange={handleSearchChange}
      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
      onClick={() => setSearchTerm("")}
      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
    >
      Clear Search
    </button>
  </div>

  {/* Scrollable table container */}
  <div className="overflow-auto h-screen border border-gray-300 rounded-lg shadow">
    <table className="bg-white w-full">
      <thead className="bg-gray-50 sticky top-0 z-20 shadow-md">
        <tr>
          <th className="px-4 py-2 text-left">Date</th>
          <th className="px-4 py-2 text-left">Supplier</th>
          <th className="px-4 py-2 text-left">Grade</th>
          <th className="px-4 py-2 text-left">Dia</th>
          <th className="px-4 py-2 text-left">Invoice No</th>
          <th className="px-4 py-2 text-left">Heat No</th>
          <th className="px-4 py-2 text-left">Material Type</th>
          <th className="px-4 py-2 text-left">Status</th>
          <th className="px-4 py-2 text-left">Mill-TC</th>
          <th className="px-4 py-2 text-left">Spectro</th>
          <th className="px-4 py-2 text-left">SSB Inspection</th>
          <th className="px-4 py-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {sortedMaterials.length === 0 ? (
          <tr>
            <td colSpan="12" className="px-4 py-2 text-center">
              No materials found.
            </td>
          </tr>
        ) : (
          sortedMaterials.map((material) => {
            const allFilesAttached = material.milltc && material.spectro && material.ssb_inspection_report;

            return (
              <tr key={material.id} className={`hover:bg-gray-100 ${allFilesAttached ? "bg-green-100" : ""}`}>
                <td className="px-4 py-2">{new Date(material.date).toLocaleDateString()}</td>
                <td className="px-4 py-2">{material.supplier}</td>
                <td className="px-4 py-2">{material.grade}</td>
                <td className="px-4 py-2">{material.dia}</td>
                <td className="px-4 py-2">{material.invoice_no}</td>
                <td className="px-4 py-2">{material.heatno}</td>
                <td className="px-4 py-2">{material.type_of_material}</td>
                <td className="px-4 py-2">{material.approval_status}</td>
                <td className="px-4 py-2 text-center">
                  {material.milltc ? (
                    <button onClick={() => window.open(material.milltc, "_blank")} className="text-blue-500 hover:text-blue-700 transition duration-200">
                      <FaEye className="inline-block" />
                    </button>
                  ) : (
                    <FaTimesCircle className="text-red-500 inline-block" />
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {material.spectro ? (
                    <button onClick={() => window.open(material.spectro, "_blank")} className="text-blue-500 hover:text-blue-700 transition duration-200">
                      <FaEye className="inline-block" />
                    </button>
                  ) : (
                    <FaTimesCircle className="text-red-500 inline-block" />
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {material.ssb_inspection_report ? (
                    <button onClick={() => window.open(material.ssb_inspection_report, "_blank")} className="text-blue-500 hover:text-blue-700 transition duration-200">
                      <FaEye className="inline-block" />
                    </button>
                  ) : (
                    <FaTimesCircle className="text-red-500 inline-block" />
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  <button onClick={() => onSelectMaterial(material.id)} className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200">
                    Details
                  </button>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>
</div>
</div>
    </div>
  );
};

export default RawMaterialList;
