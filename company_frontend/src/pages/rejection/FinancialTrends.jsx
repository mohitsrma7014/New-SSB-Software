import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import axios from "axios";
import { motion } from "framer-motion";

const FinancialTrendsChart = () => {
  const [financialYear, setFinancialYear] = useState(new Date().getFullYear());
  const [chartData, setChartData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState("total_production");

  useEffect(() => {
    axios
      .get(`http://192.168.1.199:8001/raw_material/api/FinancialYearTrendsAPIView?fy_year=${financialYear}`)
      .then((response) => {
        setChartData(response.data);
      });
  }, [financialYear]);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const getChartOptions = (key, title) => ({
    chart: { type: "column", backgroundColor: "transparent" },
    title: { text: title, style: { color: "#ffffff", fontSize: "16px" } },
    xAxis: { categories: Object.keys(chartData?.[key] || {}), labels: { style: { color: "#ffffff" } } },
    yAxis: { title: { text: selectedMetric.replace("_", " "), style: { color: "#ffffff" } }, labels: { style: { color: "#ffffff" } } },
    legend: { enabled: false },
    credits: { enabled: false },
    series: [
      {
        name: key,
        data: Object.values(chartData?.[key] || {}).map((d) => d[selectedMetric] || 0),
        color: "#06b6d4",
      },
    ],
  });

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <label className="text-lg font-semibold">Financial Year:</label>
        <select
          onChange={(e) => setFinancialYear(e.target.value)}
          value={financialYear}
          className="p-2 bg-gray-800 text-white rounded-lg shadow-md outline-none focus:ring focus:ring-teal-400"
        >
          {years.map((year) => (
            <option key={year} value={year}>{year}-{year + 1}</option>
          ))}
        </select>
      </div>
      
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        {["total_production", "rejection_pieces", "rejection_percent", "rejection_cost"].map((metric) => (
          <motion.button
            key={metric}
            onClick={() => setSelectedMetric(metric)}
            className={`px-4 py-2 rounded-lg shadow-md transition-all ${
              selectedMetric === metric ? "bg-teal-500" : "bg-gray-700 hover:bg-gray-600"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {metric.replace("_", " ").toUpperCase()}
          </motion.button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {chartData && (
          ["forging", "pre_mc", "cnc", "overall"].map((key) => (
            <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <HighchartsReact highcharts={Highcharts} options={getChartOptions(key, key.replace("_", " ") + " Trends")} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default FinancialTrendsChart;
