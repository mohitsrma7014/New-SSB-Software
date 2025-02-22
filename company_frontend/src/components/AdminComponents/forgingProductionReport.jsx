import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './ProductionReport.css'; // Make sure to import the CSS file

const ProductionReport = () => {
  const [productionData, setProductionData] = useState(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [selectedDate, setSelectedDate] = useState(getDefaultDate()); // Initialize with default (today - 2 days)

  // Fetch production data based on the selected date
  const fetchData = (date) => {
    const formattedDate = formatDate(date); // Convert the date to the format the API expects

    axios
      .get(`http://192.168.1.199:8001/forging/api/production-report/?date=${formattedDate}`)
      .then((response) => {
        const data = response.data;
        setProductionData(data);
        setChartData({
          labels: ['Total Production', 'Total Rejection'],
          datasets: [
            {
              label: 'Production vs Rejection',
              data: [data.total_production, data.total_rejection],
              fill: false,
              borderColor: 'rgba(75,192,192,1)',
              tension: 0.1,
            },
          ],
        });
      })
      .catch((error) => {
        console.error('Error fetching production data:', error);
      });
  };

  // Calculate the default date (today - 2 days)
  function getDefaultDate() {
    const date = new Date();
    date.setDate(date.getDate() - 2); // Subtract 2 days from the current date
    return date;
  }

  // Format the date in YYYY-MM-DD format
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure 2-digit month
    const day = String(date.getDate()).padStart(2, '0'); // Ensure 2-digit day
    return `${year}-${month}-${day}`;
  }

  // Fetch data when the selected date changes
  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  // Check if production data is available
  if (!productionData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="production-report">
      <h2>Production Report</h2>

      {/* Date Picker on the right side */}
      <div className="date-picker-container">
        <label htmlFor="date-picker">Select Date: </label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          maxDate={new Date()}
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
        />
      </div>

      {/* KPI Cards */}
      <div className="kpi-container">
        <div className="kpi-card">
          <h3>Total Production</h3>
          <p>{productionData.total_production}</p>
        </div>

        <div className="kpi-card">
          <h3>Total Rejection</h3>
          <p>{productionData.total_rejection}</p>
        </div>

        <div className="kpi-card">
          <h3>Rejection Percentage</h3>
          <p>{productionData.rejection_percentage}%</p>
        </div>

        <div className="kpi-card">
          <h3>Production Weight (kg)</h3>
          <p>{productionData.production_weight_kg}</p>
        </div>

        <div className="kpi-card">
          <h3>Production Weight (tons)</h3>
          <p>{productionData.production_weight_ton}</p>
        </div>
      </div>

      {/* Line Chart */}
      <Line data={chartData} />
    </div>
  );
};

export default ProductionReport;
