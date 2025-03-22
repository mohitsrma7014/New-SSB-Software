import React, { useEffect, useState } from "react";
import axios from "axios";
import { Sidebar } from './Sidebar';
import DashboardHeader from './DashboardHeader';
const IssuList = () => {
  const [batchData, setBatchData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios
      .get("http://192.168.1.199:8001/raw_material/api/batch-tracking/")
      .then((response) => {
        const sortedData = response.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setBatchData(sortedData);
        setFilteredData(sortedData);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = batchData.filter((batch) =>
      Object.values(batch).some(
        (field) =>
          field &&
          field.toString().toLowerCase().includes(value)
      )
    );
    setFilteredData(filtered);
  };

  return (
    <div className="App bg-gray-50 min-h-screen flex">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <DashboardHeader />
      {/* Main content area */}
      <div className="flex-1 p-6 mt-12 ml-60 max-w-[calc(100vw-240px)] overflow-x-auto">
      <h1 className="text-3xl font-bold text-center text-blue-500 mb-1">
         Material Issue Data
      </h1>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={handleSearch}
        className="w-full p-3 mb-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* Table */}
      <div className="overflow-auto h-screen border border-gray-300 rounded-lg shadow">
    <table className="bg-white w-full">
      <thead className="bg-gray-50 sticky top-0 z-20 shadow-md">
            <tr>
              <th className="p-2 text-left border">Batch Id</th>
              <th className="p-2 text-left border">Issue Id</th>
              <th className="p-2 text-left border">Customer</th>
              <th className="p-2 text-left border">Standard</th>
              <th className="p-2 text-left border">Component No</th>
              <th className="p-2 text-left border">Material Grade</th>
              <th className="p-2 text-left border">Heat No</th>
              <th className="p-2 text-left border">Rack No</th>
              <th className="p-2 text-left border">Bar Qty</th>
              <th className="p-2 text-left border">KG Qty</th>
              <th className="p-2 text-left border">Line</th>
              <th className="p-2 text-left border">Supplier</th>
              <th className="p-2 text-left border">Verify By</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((batch) => (
              <tr
                key={batch.id}
                className="hover:bg-gray-100 transition duration-300"
              >
                <td className="p-2 border">{batch.block_mt_id}</td>
                <td className="p-2 border">{batch.batch_number}</td>
                <td className="p-2 border">{batch.customer}</td>
                <td className="p-2 border">{batch.standerd}</td>
                <td className="p-2 border">{batch.component_no}</td>
                <td className="p-2 border">{batch.material_grade}</td>
                <td className="p-2 border">{batch.heat_no}</td>
                <td className="p-2 border">{batch.rack_no}</td>
                <td className="p-2 border">{batch.bar_qty}</td>
                <td className="p-2 border">{batch.kg_qty}</td>
                <td className="p-2 border">{batch.line}</td>
                <td className="p-2 border">{batch.supplier}</td>
                <td className="p-2 border">{batch.verified_by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
    </div>
  );
};

export default IssuList;
