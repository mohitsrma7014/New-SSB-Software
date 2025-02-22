import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Sidebar } from '../../components/AdminComponents/Sidebar';

const App = () => {
  const [data, setData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customerData, setCustomerData] = useState([]);
  const [deliveryData, setDeliveryData] = useState([]);

  // States for selected month and year
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // New state for grade dia filter for all customers
  const [gradeDiaFilter, setGradeDiaFilter] = useState("");
  const [gradeDiaFilterAllCustomers, setGradeDiaFilterAllCustomers] = useState("");  // Filter for all customers graph

  // Fetch data based on selected month and year
  useEffect(() => {
    const fetchData = async () => {
      let url = 'http://192.168.1.199:8001/raw_material/api/schedule/';
      if (selectedMonth && selectedYear) {
        const formattedMonth = selectedMonth.toString().padStart(2, '0');
        const formattedDate = `${selectedYear}-${formattedMonth}`;
        url += `?month=${formattedDate}`;
      }

      try {
        const response = await axios.get(url);
        console.log('Response Data:', response.data);

        // Ensure the response data is an array
        if (Array.isArray(response.data)) {
          setData(response.data);
          setCustomers([...new Set(response.data.map(item => item.customer))]); // Unique customers
        } else {
          console.error('Error: Response data is not an array');
          setData([]);  // Set data to empty array if the response is not an array
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setData([]);  // Set data to empty array in case of error
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (selectedCustomer) {
      // Filter data by selected customer
      const filteredData = data.filter(item => item.customer === selectedCustomer);
      setCustomerData(filteredData);
      setDeliveryData(filteredData);
    }
  }, [selectedCustomer, data]);

  // Function to convert weight in Kg to Ton
  const convertToTon = (weight) => {
    return (parseFloat(weight) / 1000).toFixed(2); // Convert Kg to Ton
  };

  // Function to clean the grade (uppercase and remove spaces)
  const cleanGrade = (grade) => {
    return grade.toUpperCase().replace(/\s+/g, '');  // Convert to uppercase and remove spaces
  };
  const calculateTotalWeight = (data) => {
    return data.reduce((sum, item) => sum + parseFloat(item.weight), 0);
  };

  const calculateOverallRatio = (data) => {
    const totalSchedulePices = data.reduce((sum, item) => sum + item.total_schedule_pices, 0);
    const totalDispatched = data.reduce((sum, item) => sum + item.dispatched, 0);
    return totalSchedulePices > 0 ? (totalDispatched / totalSchedulePices * 100).toFixed(2) : 0; // Calculate ratio as percentage
  };

  const totalWeight = selectedCustomer ? calculateTotalWeight(customerData) : calculateTotalWeight(data);
  const overallRatio = selectedCustomer ? calculateOverallRatio(customerData) : calculateOverallRatio(data);


  // Function to aggregate the data by cleaned Grade-Dia combination
  const aggregateByGradeDia = (data) => {
    const groupedData = {};

    data.forEach(item => {
      const cleanedGrade = cleanGrade(item.grade);  // Clean the grade
      const key = `${cleanedGrade} - ${item.dia}`;
      if (!groupedData[key]) {
        groupedData[key] = { totalWeight: 0, totalSchedulePices: 0 };
      }

      groupedData[key].totalWeight += parseFloat(item.weight); // Sum weight
      groupedData[key].totalSchedulePices += item.total_schedule_pices; // Sum scheduled pices
    });

    return groupedData;
  };
  

  const customerChartOptions = {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Customer Aggregate: Weight and Total Scheduled Pices'
    },
    credits: {
        enabled: false, // Hide credits
      },
    xAxis: {
      categories: customers, // Set customer names here
      title: {
        text: 'Customers'
      }
    },
    yAxis: {
      title: {
        text: 'Weight (Ton)'
      }
    },
    tooltip: {
      formatter: function () {
        return `Customer: ${this.name}<br/>Weight: ${convertToTon(this.y)} Ton<br/>Total Scheduled Pieces: ${this.point.total_schedule_pices}`;
      }
    },
    series: [{
      name: 'Weight (Ton)',
      borderRadius: 25,
      pointWidth: 50,
      color: '#000080',
      data: customers.map(customer => {
        const customerData = data.filter(item => item.customer === customer);
        const totalWeight = customerData.reduce((sum, item) => sum + parseFloat(item.weight), 0);
        const totalPices = customerData.reduce((sum, item) => sum + item.total_schedule_pices, 0);
        return {
          y: totalWeight, // Weight in Kg
          total_schedule_pices: totalPices,
          name: customer // Include the customer name explicitly
        };
      }).sort((a, b) => b.y - a.y) // Sort by weight in descending order
    }]
  };
  
  const customerSpecificChartOptions = {
    chart: {
      type: 'column'
    },
    title: {
      text: `${selectedCustomer} - Component Data`
    },
    credits: {
        enabled: false, // Hide credits
      },
    xAxis: {
      categories: customerData.map(item => item.component), // Component names as categories
      title: {
        text: 'Components'
      }
    },
    yAxis: {
      title: {
        text: 'Weight (Ton)'
      }
    },
    tooltip: {
      formatter: function () {
        return `Component: ${this.name}<br/>Weight: ${convertToTon(this.y)} Ton<br/>Total Scheduled Pieces: ${this.point.total_schedule_pices}`;
      }
    },
    series: [{
      name: 'Weight (Ton)',
      borderRadius: 15,
     
      color: '#add8e6',
      data: customerData.map(item => ({
        y: parseFloat(item.weight),
        total_schedule_pices: item.total_schedule_pices,
        name: item.component // Include the component name explicitly
      })).sort((a, b) => b.y - a.y) // Sort by weight in descending order
    }]
  };
  

  // Filtered data for Grade-Dia
  const filteredCustomerData = customerData.filter(item => {
    const cleanedGrade = cleanGrade(item.grade);  // Clean the grade
    return cleanedGrade.includes(gradeDiaFilter.toUpperCase().replace(/\s+/g, ''));
  });

  const aggregatedFilteredData = aggregateByGradeDia(filteredCustomerData);

  // Aggregated data for all customers by grade-dia
  const aggregatedDataAllCustomers = aggregateByGradeDia(data);

  // Graph 3: Grade, Dia, and Customer-based Material Requirement
  const gradeDiaChartOptions = {
    chart: {
      type: 'column'
    },
    title: {
      text: `${selectedCustomer} - Material Requirement by Grade and Dia`
    },
    credits: {
        enabled: false, // Hide credits
      },
    xAxis: {
      categories: Object.keys(aggregatedFilteredData), // Use the grade-dia as categories
      title: {
        text: 'Grade - Diameter'
      }
    },
    yAxis: {
      title: {
        text: 'Weight (Ton)'
      }
    },
    tooltip: {
      enabled: true, // Ensure tooltip is enabled
      formatter: function () {
        const [grade, dia] = this.key.split(' - '); // Use `this.key` for accessing the category (x value)
        return `Grade: ${grade}<br/>Diameter: ${dia}<br/>Weight: ${convertToTon(this.y)} Ton`;
      }
    },
    series: [{
      name: 'Weight (Ton)',
      borderRadius: 15,
      color: '#b0c4de ',
      data: Object.keys(aggregatedFilteredData).map(key => ({
        y: aggregatedFilteredData[key].totalWeight, // Convert to Ton
        key // Link the grade-dia string explicitly
      })).sort((a, b) => b.y - a.y) // Sort by weight in descending order
    }]
  };
  

  // Graph 5: Aggregated Grade-Dia data across all customers (with new filter)
  const filteredAggregatedDataAllCustomers = Object.keys(aggregatedDataAllCustomers)
    .filter(key => key.toUpperCase().includes(gradeDiaFilterAllCustomers.toUpperCase().replace(/\s+/g, '')))
    .reduce((result, key) => {
      result[key] = aggregatedDataAllCustomers[key];
      return result;
    }, {});

    const allCustomerGradeDiaChartOptions = {
        chart: {
          type: 'column'
        },
        title: {
          text: 'Material Requirement by Grade and Diameter (All Customers)'
        },
        credits: {
            enabled: false, // Hide credits
          },
        xAxis: {
          categories: Object.keys(filteredAggregatedDataAllCustomers), // Use the grade-dia as categories
          title: {
            text: 'Grade - Diameter'
          }
        },
        yAxis: {
          title: {
            text: 'Weight (Ton)'
          }
        },
        tooltip: {
          enabled: true, // Ensure tooltip is enabled
          formatter: function () {
            const [grade, dia] = this.key.split(' - '); // Use `this.key` to access the category (x value)
            return `Grade: ${grade}<br/>Diameter: ${dia}<br/>Weight: ${convertToTon(this.y)} Ton`;
          }
        },
        series: [{
          name: 'Weight (Ton)',
          borderRadius: 15,
          color: '#4169e1',
          data: Object.keys(filteredAggregatedDataAllCustomers).map(key => ({
            y: filteredAggregatedDataAllCustomers[key].totalWeight, // Convert to Ton
            key // Link the grade-dia string explicitly
          })).sort((a, b) => b.y - a.y) // Sort by weight in descending order
        }]
      };
      
      const deliveryChartOptions = {
        chart: {
          type: 'column'
        },
        title: {
          text: 'Delivery Rating: Scheduled vs Dispatched'
        },
        credits: {
            enabled: false, // Hide credits
          },
        xAxis: {
          categories: customers, // Assign customer names directly as X-axis categories
          title: {
            text: 'Customers'
          }
        },
        yAxis: {
          title: {
            text: 'Percentage'
          }
        },
        tooltip: {
          formatter: function () {
            // Debugging tooltip data
            console.log("Tooltip Context:", this);
            return `
              <strong>Customer:</strong> ${this.category}<br/>
              <strong>${this.series.name}:</strong> ${this.y.toFixed(2)}%
            `;
          }
        },
        series: [
          {
            name: 'Scheduled Pieces (%)',
            borderRadius: 15,
            pointWidth: 30,
      
            data: customers.map(customer => {
              const customerData = data.filter(item => item.customer === customer);
              const totalSchedulePices = customerData.reduce((sum, item) => sum + item.total_schedule_pices, 0);
              return totalSchedulePices > 0 ? 100 : 0; // Scheduled is always 100%
            })
          },
          {
            name: 'Dispatched Pieces (%)',
            borderRadius: 15,
            pointWidth: 30,
      
            data: customers.map(customer => {
              const customerData = data.filter(item => item.customer === customer);
              const totalSchedulePices = customerData.reduce((sum, item) => sum + item.total_schedule_pices, 0);
              const totalDispatched = customerData.reduce((sum, item) => sum + item.dispatched, 0);
              return totalSchedulePices > 0 ? (totalDispatched / totalSchedulePices) * 100 : 0; // Dispatch percentage
            })
          }
        ]
      };
      
      // Debugging the options
      console.log("Chart Options:", deliveryChartOptions);
      
      

  // Check if data is available for the selected month and year
  const isDataAvailable = data.length > 0;

  return (
    <div className="App font-sans bg-gray-50 text-gray-900 min-h-screen mt-20 p-2">
        <Sidebar />
      {/* Header */}
      
  
      {/* First row: Filters and Metrics */}
      <div className="flex justify-between items-center mb-2 p-3 bg-white border border-gray-300 rounded-lg shadow-lg">
        {/* Date and Year Filter */}
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 10 }, (_, index) => new Date().getFullYear() - index).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((monthName, index) => (
                <option key={index + 1} value={index + 1}>
                  {monthName}
                </option>
              ))}
            </select>
          </div>
        </div>
  
        {/* Total Weight and Overall Ratio */}
        <div className="flex space-x-6">
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-medium">Total Schedule</h2>
            <p className="text-lg font-semibold">{convertToTon(totalWeight)} Ton</p>
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-medium">Overall Rating</h2>
            <p className="text-lg font-semibold">{overallRatio}%</p>
          </div>
        </div>
      </div>
  
      {/* Second row: Customer Chart and Delivery Chart */}
      <div className="flex space-x-2 mb-2">
        <div className="w-full sm:w-1/2 bg-white border border-gray-300 rounded-lg shadow-lg ">
          <HighchartsReact highcharts={Highcharts} options={customerChartOptions} />
        </div>
        <div className="w-full sm:w-1/2 bg-white border border-gray-300 rounded-lg shadow-lg ">
          <HighchartsReact highcharts={Highcharts} options={deliveryChartOptions} />
        </div>
      </div>
      {/* Fourth row: All Customer Grade-Dia Chart and Filter */}
      <div className="flex flex-col sm:flex-row mb-2 space-x-2">
        <div className="w-full  p-6 bg-white border border-gray-300 rounded-lg shadow-lg">
        {/* Grade-Dia Filter for All Customers */}
        <input
            type="text"
            value={gradeDiaFilterAllCustomers}
            onChange={(e) => setGradeDiaFilterAllCustomers(e.target.value)}
            placeholder="Filter by Grade and Diameter (All customers)"
            className="w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* All Customer Grade-Dia Chart */}
          <HighchartsReact highcharts={Highcharts} options={allCustomerGradeDiaChartOptions} />
        </div>
        
      </div>
  
      {/* Third row: Customer Selector and Customer-Specific Charts */}
      <div className="flex flex-col sm:flex-row mb-8 space-x-8 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
        <div className="w-full sm:w-1/2  rounded-lg ">
          {/* Customer Selector */}
          <div className="mb-6">
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Customer</option>
              {customers.map((customer) => (
                <option key={customer} value={customer}>
                  {customer}
                </option>
              ))}
            </select>
          </div>
  
          {/* Customer Specific Chart */}
          <HighchartsReact highcharts={Highcharts} options={customerSpecificChartOptions} />
        </div>
        <div className="w-full sm:w-1/2  rounded-lg">
          {/* Grade-Dia Filter */}
          <div className="mb-6">
            <input
              type="text"
              value={gradeDiaFilter}
              onChange={(e) => setGradeDiaFilter(e.target.value)}
              placeholder="Filter by Grade and Diameter (Customer-specific)"
              className="w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
  
          {/* Grade-Dia Chart */}
          <HighchartsReact highcharts={Highcharts} options={gradeDiaChartOptions} />
        </div>
      </div>
  
      
    </div>
  );
  
  
};

export default App;
