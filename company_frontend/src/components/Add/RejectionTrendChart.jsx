import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// API Endpoint
const apiEndpoint = 'http://192.168.1.199:8001/cnc/api/fy-trends/2025/';

const RejectionTrendChart = () => {
  const [chartData, setChartData] = useState({ months: [], forging: [], cnc: [], pre_mc: [], overall: [] });

  // Function to format the month in "MMM YYYY" format (e.g., "Aug 2024")
  const formatMonth = (monthString) => {
    const [month, year] = monthString.split('-');
    const date = new Date(`${year}-${month}-01`);
    const options = { year: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
  };

  // Fetch data from API on component mount
  // Fetch data from API on component mount
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch(apiEndpoint);
      const data = await response.json();

      // Sort data by month in ascending order (oldest month first)
      data.sort((a, b) => new Date(a.month_year) - new Date(b.month_year));

      // Format the month and rejection data
      const months = data.map(item => formatMonth(item.month_year));  // Format month
      const forging = data.map(item => parseFloat(item.forging.rejection_percentage.toFixed(2))); // Round to 2 decimal places
      const cnc = data.map(item => parseFloat(item.cnc.rejection_percentage.toFixed(2))); // Round to 2 decimal places
      const pre_mc = data.map(item => parseFloat(item.pre_mc.rejection_percentage.toFixed(2))); // Round to 2 decimal places
      const overall = data.map(item => parseFloat(item.overall.rejection_percentage.toFixed(2))); // Round to 2 decimal places

      setChartData({
        months,
        forging,
        cnc,
        pre_mc,
        overall,
      });
    } catch (error) {
      console.error('Error fetching Rejection trend data:', error);
    }
  };

  fetchData();
}, []);

  // Only render the chart once data is available
  if (chartData.months.length === 0) {
    return <p className="text-center text-gray-600">Loading data...</p>;
  }

  const options = {
    chart: {
      type: 'line',
      height: '350px', // Reduced height of the chart
      backgroundColor: 'transparent', // Transparent background
    },
    title: {
      text: 'Over All Plant Rejection Trend Monthly(IN %)',
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
        text: 'Rejection (%)',
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
        name: 'Forging',
        data: chartData.forging,
        color: '#3498db', // Custom line color
        lineWidth: 3,
        visible: false, // Hides by default
        marker: {
          enabled: true,
          symbol: 'circle',
          radius: 4,
          fillColor: '#3498db',
          lineWidth: 2,
          lineColor: '#ffffff',
        },
        dataLabels: {
          enabled: true, // Enable data labels
          format: '{y:.2f}%', // Round to 2 decimal places and add % symbol
          style: {
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#3498db', // Match the line color
          },
          verticalAlign: 'bottom', // Position labels below the points
          y: 10, // Adjust vertical position
        },
      },
      {
        name: 'CNC',
        data: chartData.cnc,
        color: '#e74c3c', // Custom line color
        lineWidth: 3,
        visible: false, // Hides by default
        marker: {
          enabled: true,
          symbol: 'circle',
          radius: 4,
          fillColor: '#e74c3c',
          lineWidth: 2,
          lineColor: '#ffffff',
        },
        dataLabels: {
          enabled: true, // Enable data labels
          format: '{y:.2f}%', // Round to 2 decimal places and add % symbol
          style: {
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#e74c3c', // Match the line color
          },
          verticalAlign: 'bottom', // Position labels below the points
          y: 10, // Adjust vertical position
        },
      },
      {
        name: 'Pre-Machining',
        data: chartData.pre_mc,
        color: '#2ecc71', // Custom line color
        lineWidth: 3,
        visible: false, // Hides by default
        marker: {
          enabled: true,
          symbol: 'circle',
          radius: 4,
          fillColor: '#2ecc71',
          lineWidth: 2,
          lineColor: '#ffffff',
        },
        dataLabels: {
          enabled: true, // Enable data labels
          format: '{y:.2f}%', // Round to 2 decimal places and add % symbol
          style: {
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#2ecc71', // Match the line color
          },
          verticalAlign: 'bottom', // Position labels below the points
          y: 10, // Adjust vertical position
        },
      },
      {
        name: 'Overall',
        data: chartData.overall,
        color: '#9b59b6', // Custom line color
        lineWidth: 3,
        marker: {
          enabled: true,
          symbol: 'circle',
          radius: 4,
          fillColor: '#9b59b6',
          lineWidth: 2,
          lineColor: '#ffffff',
        },
        dataLabels: {
          enabled: true, // Enable data labels
          format: '{y:.2f}%', // Round to 2 decimal places and add % symbol
          style: {
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#9b59b6', // Match the line color
          },
          verticalAlign: 'bottom', // Position labels below the points
          y: 10, // Adjust vertical position
        },
      },
    ],
    credits: {
      enabled: false, // Disable the Highcharts credits
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.y:.2f}%</b>', // Round to 2 decimal places and add % symbol
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
    <div className="mx-auto ml-2 bg-white rounded-xl shadow-lg hover:shadow-2xl duration-300">
      <div className="overflow-hidden rounded-lg shadow-md bg-white p-2">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </div>
  );
};

export default RejectionTrendChart;