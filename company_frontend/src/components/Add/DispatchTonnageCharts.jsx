import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axios from 'axios';

const DispatchTonnageCharts = () => {
  const [data, setData] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState('Hi-Tech');
  const [customers, setCustomers] = useState([]);

  // Fetch dispatch tonnage data
  useEffect(() => {
    axios.get('http://192.168.1.199:8001/raw_material/calculate-dispatch-tonnage')
      .then((response) => {
        setData(response.data);

        // Extract all customer names from the data
        const customerList = new Set();
        Object.values(response.data).forEach(monthData => {
          Object.keys(monthData).forEach(customer => {
            if (customer !== '0') {
              customerList.add(customer);
            }
          });
        });
        setCustomers([...customerList]);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  // Prepare data for Month-wise Dispatch Tonnage Chart
  const getMonthWiseTonnageData = () => {
    if (!data) return {};

    const months = Object.keys(data);
    const tonnage = months.map(month => {
      const monthData = data[month];
      const totalTonnage = Object.values(monthData).reduce((acc, curr) => acc + parseFloat(curr.tonnage), 0);
      return totalTonnage;
    });

    return {
      chart: {
        type: 'line',
        height: '350px', // Reduced height of the chart
        backgroundColor: 'transparent', // Transparent background
      },
      title: {
        text: 'Month wise Dispatch (In Tonnage)',
        style: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333',
            textTransform: 'uppercase', // Modern uppercase style
          },
      },
      xAxis: {
        categories: months,
        title: {
            text: 'Last-7-Months',
            style: {
              fontSize: '14px',
              color: '#333',
            },
          },
      },
      yAxis: {
        title: {
          text: 'Tonnage (in tons)',
          style: {
            fontSize: '14px',
            color: '#333',
          },
        },
      },
      series: [{
        name: 'Dispatch Tonnage',
        data: tonnage,
        color: '#4caf50', // Custom line color
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
      }],
      credits: {
        enabled: false, // Disable the Highcharts credits
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.y:.2f}</b> tons',
      },
    };
  };

   // Prepare data for Month-wise Dispatch Tonnage Chart
   const getMonthWisesell = () => {
    if (!data) return {};

    const months = Object.keys(data);
    const tonnage = months.map(month => {
      const monthData = data[month];
      const totalTonnage = Object.values(monthData).reduce((acc, curr) => acc + parseFloat(curr.cost), 0);
      return totalTonnage;
    });

    return {
      chart: {
        type: 'line',
        height: '350px', // Reduced height of the chart
        backgroundColor: 'transparent', // Transparent background
      },
      title: {
        text: 'Month wise Sell ',
        style: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333',
            textTransform: 'uppercase', // Modern uppercase style
          },
      },
      xAxis: {
        categories: months,
        title: {
            text: 'Last-7-Months',
            style: {
              fontSize: '14px',
              color: '#333',
            },
          },
      },
      yAxis: {
        title: {
          text: 'Cost',
          style: {
            fontSize: '14px',
            color: '#333',
          },
        },
      },
      series: [{
        name: 'Sell Rs',
        data: tonnage,
        color: '#4caf50', // Custom line color
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
      }],
      credits: {
        enabled: false, // Disable the Highcharts credits
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.y:.2f}</b> Rs',
      },
    };
  };

  // Prepare data for Month-wise Customer Tonnage Chart
  const getCustomerTonnageData = () => {
    if (!data || !selectedCustomer) return {};

    const months = Object.keys(data);
    const tonnage = months.map(month => {
      const monthData = data[month];
      return parseFloat(monthData[selectedCustomer]?.tonnage) || 0;
    });

    return {
      chart: {
        type: 'line',
        height: '350px', // Reduced height of the chart
        backgroundColor: 'transparent', // Transparent background
      },
      title: {
        text: `${selectedCustomer} Month Wise Dispatch (In Tonnage)`,
        style: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333',
            textTransform: 'uppercase',
          },
      },
      xAxis: {
        categories: months,
        title: {
            text: 'Last-7-Months',
            style: {
              fontSize: '14px',
              color: '#333',
            },
          },
      },
      yAxis: {
        title: {
          text: 'Tonnage (in tons)',
          style: {
            fontSize: '14px',
            color: '#333',
          },
        },
      },
      series: [{
        name: `${selectedCustomer} Tonnage`,
        data: tonnage,
        color: '#f44336',
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
      }],
      credits: {
        enabled: false, // Disable the Highcharts credits
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.y:.2f}</b> tons',
      },
    };
  };

  // Prepare data for Month-wise Customer Cost Chart
  const getCustomerCostData = () => {
    if (!data || !selectedCustomer) return {};

    const months = Object.keys(data);
    const cost = months.map(month => {
      const monthData = data[month];
      return parseFloat(monthData[selectedCustomer]?.cost) || 0;
    });

    return {
      chart: {
        type: 'line',
        height: '350px', // Reduced height of the chart
        backgroundColor: 'transparent', // Transparent background
      },
      title: {
        text: `${selectedCustomer} Month Wise Sell`,
        style: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333',
            textTransform: 'uppercase',
          },
      },
      xAxis: {
        categories: months,
        title: {
            text: 'Last-7-Months',
            style: {
              fontSize: '14px',
              color: '#333',
            },
          },
      },
      yAxis: {
        title: {
          text: 'Cost',
          style: {
            fontSize: '14px',
            color: '#333',
          },
        },
      },
      series: [{
        name: `${selectedCustomer} Cost`,
        data: cost,
        color: '#00bcd4',
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
      }],
      credits: {
        enabled: false, // Disable the Highcharts credits
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.y:.2f}</b>',
      },
    };
  };

  return (
    <div className="mx-auto mr-2 bg-white rounded-xl shadow-lg hover:shadow-2xl duration-300 ">
      {data ? (
        <>
          {/* Row for all three graphs */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {/* Graph 1: Month-wise Dispatch Tonnage */}
            <div style={{ flex: 1, marginRight: '10px' }} className="overflow-hidden rounded-lg shadow-md bg-white">
              <HighchartsReact
                highcharts={Highcharts}
                options={getMonthWiseTonnageData()}
              />
            </div>

            <div style={{ flex: 1, marginRight: '10px' }} className="overflow-hidden rounded-lg shadow-md bg-white">
              <HighchartsReact
                highcharts={Highcharts}
                options={getMonthWisesell()}
              />
            </div>

            {/* Graph 2: Month-wise Customer Tonnage */}
            <div style={{ flex: 1, marginLeft: '10px' }} className="overflow-hidden rounded-lg shadow-md bg-white">
              <select
                onChange={(e) => setSelectedCustomer(e.target.value)}
                value={selectedCustomer}
              >
                {customers.map((customer) => (
                  <option key={customer} value={customer}>
                    {customer}
                  </option>
                ))}
              </select>
              <HighchartsReact
                highcharts={Highcharts}
                options={getCustomerTonnageData()}
              />
            </div>

            {/* Graph 3: Month-wise Customer Cost */}
            <div style={{ flex: 1, marginLeft: '10px' }} className="overflow-hidden rounded-lg shadow-md bg-white">
              <HighchartsReact
                highcharts={Highcharts}
                options={getCustomerCostData()}
              />
            </div>
          </div>
        </>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default DispatchTonnageCharts;
