import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx"; // Add xlsx library
import { Sidebar } from '../../components/AdminComponents/Sidebar';

export default function InventoryStatus() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const API_BASE_URL = "http://192.168.1.199:8001/forging/api/inventory_status";
  const [customerFilter, setCustomerFilter] = useState(""); // State for customer filter


  const fetchData = async () => {
    setLoading(true); // Start loading
    try {
      const url = search ? `${API_BASE_URL}/${search}/` : API_BASE_URL;
      const response = await axios.get(url);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    if (search === "") {
      fetchData(); // Fetch all data when search is empty
    }
  }, [search]);
  // Extract unique customers for dropdown
  // Extract unique customers (case insensitive)
const uniqueCustomers = [
  ...new Set(data.map((item) => item.customer.toLowerCase())),
];

// Filter data based on selected customer (case insensitive)
const filteredData = customerFilter
  ? data.filter((item) => item.customer.toLowerCase() === customerFilter.toLowerCase())
  : data;


  // Handle Excel Download with Custom Headers
  const handleDownload = () => {
    // Custom headers for Excel
    const headers = [
      "Component",
      "Forging",
      "Available After Forging",
      "Heat Treatment",
      "Available After Heat Treatment",
      "Machining",
      "Available After Machining",
      "Visual",
      "Packed",
      "Dispatched",
    ];

    // Mapping data to include only the necessary fields for the Excel file
    const dataForExcel = data.map(item => ({
      Component: item.component,
      Forging: item.forging_production,
      "Available After Forging": item.available_after_forging,
      "Heat Treatment": item.heat_treatment_production,
      "Available After Heat Treatment": item.available_after_heat_treatment,
      Machining: item.machining_production,
      "Available After Machining": item.available_after_machining,
      Visual: item.visual_production,
      Packed: item.available_after_visual,
      Dispatched: item.dispatched_pieces,
    }));

    // Creating the worksheet from the data
    const ws = XLSX.utils.json_to_sheet(dataForExcel, { header: headers });

    // Creating a workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory Data");

    // Writing the file
    XLSX.writeFile(wb, "inventory_status.xlsx");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen mt-24">
         <Sidebar />
      <h1 className="text-2xl font-bold mb-4">Inventory Status</h1>

      <div className="mb-4 flex items-center">
        <label className="mr-2 ml-auto font-semibold">Select Customer:</label>
        <select
  className="p-2 border rounded"
  value={customerFilter}
  onChange={(e) => setCustomerFilter(e.target.value)}
>
  <option value="">All Customers</option>
  {uniqueCustomers.map((lowercaseCustomer) => {
    // Find the original case version from the data
    const originalCaseCustomer = data.find(
      (item) => item.customer.toLowerCase() === lowercaseCustomer
    )?.customer;

    return (
      <option key={lowercaseCustomer} value={originalCaseCustomer}>
        {originalCaseCustomer}
      </option>
    );
  })}
</select>

        <input
          type="text"
          placeholder="Search Component..."
          className="p-2 border rounded w-2/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="ml-4 p-2 bg-blue-500 text-white rounded"
          onClick={fetchData} // Fetch data when button is clicked
        >
          Fetch
        </button>
        <button
          className="ml-auto p-2 bg-green-500 text-white rounded"
          onClick={handleDownload} // Trigger Excel download
        >
          Download Excel
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center mb-4">
          <div className="loader"></div>
        </div>
      )}

      <div className="overflow-x-auto" style={{ maxHeight: "700px", overflowY: "auto" }}>
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="sticky top-0 bg-gray-200">
            <tr>
              <th className="p-2 text-center border">Component</th>
              <th className="p-2 text-center border">Customer</th>
              <th className="p-2 text-center border">Cost</th>
              <th className="p-2 text-center border">Available After Forging</th>
              <th className="p-2 text-center border">Available After Heat Treatment </th>
              <th className="p-2 text-center border">Available After Pre mc </th>

              <th className="p-2 text-center border">Available After Machining </th>
              <th className="p-2 text-center border">Packed</th>
  
            </tr>
          </thead>
          <tbody>
          {filteredData.map((item, index) => (
              <tr key={index} className="text-center border-t">
                <td className="p-2 text-center border">{item.component}</td>
                <td className="p-2 text-center border">{item.customer}</td>
                <td className="p-2 text-center border">{item.cost}</td>
                <td className="p-2 text-center border">{item.available_after_forging} Pcs.</td>
                <td className="p-2 text-center border">{item.available_after_heat_treatment} Pcs.</td>
                <td className="p-2 text-center border">{item.available_after_pre_mc} Pcs.</td>
                <td className="p-2 text-center border">{item.available_after_machining} Pcs.</td>
                <td className="p-2 text-center border">{item.available_after_visual} Pcs.</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
