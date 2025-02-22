import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// API Endpoint
const apiEndpoint = 'http://192.168.1.199:8001/forging/api/production-trend/';

const ProductionTrendChart = () => {
  const [chartData, setChartData] = useState({ months: [], production: [] });

  // Function to format the month in "MMM YYYY" format (e.g., "Aug 2024")
  const formatMonth = (monthString) => {
    const [year, month] = monthString.split('-');
    const date = new Date(`${year}-${month}-01`);
    const options = { year: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
  };

  // Fetch data from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiEndpoint);
        const data = await response.json();

        // Sort data by month in ascending order (oldest month first)
        data.sort((a, b) => new Date(a.month) - new Date(b.month));

        // Format the month and production data
        const months = data.map(item => formatMonth(item.month));  // Format month
        const production = data.map(item => item.production_in_ton);  // Production data

        setChartData({
          months,
          production,
        });
      } catch (error) {
        console.error('Error fetching production trend data:', error);
      }
    };

    fetchData();
  }, []);

  // Only render the chart once data is available
  if (chartData.months.length === 0 || chartData.production.length === 0) {
    return <p className="text-center text-gray-600">Loading data...</p>;
  }

  const options = {
    chart: {
      type: 'line',
      height: '350px', // Reduced height of the chart
      backgroundColor: 'transparent', // Transparent background
    },
    title: {
      text: 'Over All Plant Production Trend Monthly(in tons)',
      style: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#333',
        textTransform: 'uppercase', // Modern uppercase style
      },
    },
    xAxis: {
      categories: chartData.months, // Use the formatted month names for the x-axis
      
      labels: {
        style: {
          color: '#555', // Lighter text color for the labels
        },
      },
    },
    yAxis: {
      title: {
        text: 'Production in Tons',
        style: {
          fontSize: '14px',
          color: '#333',
        },
      },
      labels: {
        style: {
          color: '#555', // Lighter text color for the labels
        },
      },
    },
    series: [
      {
        name: 'Production',
        data: chartData.production, // Use the production data
        color: '#3498db', // Custom line color
        lineWidth: 5, // Thicker line for better visibility
        marker: {
          enabled: true,
          symbol: 'circle',
          radius: 3, // Larger markers for visibility
          fillColor: '#3498db',
          lineWidth: 2,
          lineColor: '#ffffff', // White border around the markers
        },
        dataLabels: {
          enabled: true, // Enable data labels
          style: {
            fontSize: '10px',
            fontWeight: 'bold',
            color: '#333', // Color for the data label text
          },
          formatter: function () {
            return this.y.toFixed(2); // Show the y-value with two decimal points
          },
          verticalAlign: 'bottom', // Position data labels below the points
          y: 5, // Add some space between the point and the label
        },
      },
    ],
    credits: {
      enabled: false, // Disable the Highcharts credits
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.y:.2f}</b> tons',
      backgroundColor: 'rgba(0, 0, 0, 0.75)', // Tooltip with darker background for better readability
      style: {
        color: '#fff',
        fontSize: '12px',
      },
    },
    plotOptions: {
      line: {
        marker: {
          enabled: true,
        },
        lineWidth: 3,
        states: {
          hover: {
            lineWidthPlus: 0,
          },
        },
      },
    },
    legend: {
      itemStyle: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#333',
      },
    },
  };

  return (
    <div className=" mx-auto mt-24 mr-2 bg-white rounded-xl shadow-lg  hover:shadow-2xl duration-300">
      
      <div className="overflow-hidden rounded-lg shadow-md bg-white p-2">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </div>
  );
};

export default ProductionTrendChart;
