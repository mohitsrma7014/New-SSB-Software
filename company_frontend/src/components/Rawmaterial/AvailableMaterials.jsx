import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://192.168.1.199:8001/raw_material/available-material";

const AvailableMaterials = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(API_URL)
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch data");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-4 border-b">Available Raw Materials</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Grade</th>
                <th className="p-2 border">Diameter</th>
                <th className="p-2 border">Customer</th>
                <th className="p-2 border">Component</th>
                <th className="p-2 border">Available Weight</th>
                <th className="p-2 border">Scheduled Weight</th>
                <th className="p-2 border">Required Weight</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2 border">{item.grade}</td>
                  <td className="p-2 border">{item.dia}</td>
                  <td className="p-2 border">{item.customer}</td>
                  <td className="p-2 border">{item.component}</td>
                  <td className={`p-2 border ${item.available_weight < 0 ? 'text-red-500' : ''}`}>{item.available_weight}</td>
                  <td className="p-2 border">{item.scheduled_weight}</td>
                  <td className="p-2 border">{item.required_weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AvailableMaterials;