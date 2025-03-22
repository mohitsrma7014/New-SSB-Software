import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "http://192.168.1.199:8001/raw_material/api/monthly-graph/";

const getCurrentMonth = () => new Date().getMonth() + 1;
const getCurrentYear = () => new Date().getFullYear();
const getMonthName = (month) => new Date(0, month - 1).toLocaleString("default", { month: "long" });

const MonthlyGraph = () => {
  const [month, setMonth] = useState(getCurrentMonth());
  const [year, setYear] = useState(getCurrentYear());
  const [supplierData, setSupplierData] = useState([]);
  const [gradeDiaData, setGradeDiaData] = useState([]);
  const [totalReceiving, setTotalReceiving] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGraphData();
  }, [month, year]);

  const fetchGraphData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}?month=${month}&year=${year}`);

      // Sort data in decreasing order
      const sortedSupplierData = [...response.data.supplier_graph].sort((a, b) => b.total_tonnage - a.total_tonnage);
      const sortedGradeDiaData = [...response.data.grade_dia_graph].sort((a, b) => b.total_tonnage - a.total_tonnage);

      // Calculate total receiving (sum of supplier-wise tonnage)
      const totalTonnage = sortedSupplierData.reduce((sum, item) => sum + item.total_tonnage, 0);

      setSupplierData(sortedSupplierData);
      setGradeDiaData(sortedGradeDiaData);
      setTotalReceiving(totalTonnage);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const commonChartOptions = {
    chart: { backgroundColor: "#ffffff", borderRadius: 10, style: { fontFamily: "Arial, sans-serif" } },
    credits: { enabled: false }, // Hide Highcharts credits
    tooltip: { backgroundColor: "#333", style: { color: "#fff" } },
  };

  const supplierChartOptions = {
    ...commonChartOptions,
    chart: { ...commonChartOptions.chart, type: "column" },
    title: { 
      text: `Supplier-wise Raw Material Reciving (Ton) (${getMonthName(month)} ${year})`, 
      style: { fontSize: "18px", fontWeight: "bold" } 
    },
    xAxis: {
      categories: supplierData.map((item) => item.supplier),
      title: { text: "Suppliers" },
      labels: { style: { fontSize: "12px" } },
    },
    yAxis: { min: 0, title: { text: "Tonnage (tons)" } },
    series: [
      {
        name: "Tonnage",
        data: supplierData.map((item) => item.total_tonnage),
        colorByPoint: true,
        dataLabels: {
            enabled: true,
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              color: "#333",
            },
          },
      },
    ],
  };

  const gradeDiaChartOptions = {
    ...commonChartOptions,
    chart: { ...commonChartOptions.chart, type: "bar" },
    title: { 
      text: `Grade-Dia Wise Raw Material Reciving (Ton) (${getMonthName(month)} ${year})`, 
      style: { fontSize: "18px", fontWeight: "bold" } 
    },
    xAxis: {
      categories: gradeDiaData.map((item) => item.grade_dia),
      title: { text: "Grade - Dia" },
      labels: { style: { fontSize: "12px" } },
    },
    yAxis: { min: 0, title: { text: "Tonnage (tons)" } },
    series: [
      {
        name: "Tonnage",
        data: gradeDiaData.map((item) => item.total_tonnage),
        colorByPoint: true,
        dataLabels: {
            enabled: true,
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              color: "#333",
            },
          },
      },
    ],
  };

  return (
    <div className="p-2">
      {/* Filters & KPI Box */}
      <div className="flex items-center shadow-lg rounded-xl justify-between mb-2 bg-white p-2 rounded-lg shadow-md">
        {/* Month & Year Selector */}
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Month</label>
            <select
              className="p-2 border border-gray-300 rounded-md w-32 focus:ring focus:ring-blue-300"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <select
              className="p-2 border border-gray-300 rounded-md w-32 focus:ring focus:ring-blue-300"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <option key={i} value={getCurrentYear() - i}>
                  {getCurrentYear() - i}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI Box */}
        <div className="bg-blue-500 text-white p-2 rounded-lg shadow-lg text-center">
          <p className="text-lg font-semibold">Total Receiving {totalReceiving.toFixed(2)} Tons ({getMonthName(month)} {year})</p>
        </div>
      </div>

      {/* Graphs */}
      {loading ? (
        <div className="text-center text-gray-700 text-lg">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="shadow-lg rounded-xl p-6 bg-white transition transform hover:scale-10 duration-300">
            <HighchartsReact highcharts={Highcharts} options={supplierChartOptions} />
          </div>

          <div className="shadow-lg rounded-xl p-6 bg-white transition transform hover:scale-10 duration-300">
            <HighchartsReact highcharts={Highcharts} options={gradeDiaChartOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyGraph;
