import React, { useEffect, useState } from "react";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "tailwindcss/tailwind.css";
import { Search, Calendar, Loader } from "lucide-react";
import { Sidebar } from '../../components/AdminComponents/Sidebar';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [filters, setFilters] = useState({
    component: "",
    line: "",
    forman: "",
    customer: "",
    start_date: "",
    end_date: "",
  });
  
  // New state variables for suggestions
  const [componentSuggestions, setComponentSuggestions] = useState([]);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [lineSuggestions, setLineSuggestions] = useState([]);
  const [foremanSuggestions, setForemanSuggestions] = useState([]);
  const [suggestions, setSuggestions] = useState({
    component: [],
    customer: [],
    line: [],
    forman: [],
  });

  const [analytics, setAnalytics] = useState({
    totalProduction: 0,
    totalRejection: 0,
    rejectionRate: 0,
    highestRejectionByCustomer: "",
    highestRejectionLine: "",
    highestRejectionForman: "",
  });
  const [totalRejectionByCategory, setTotalRejectionByCategory] = useState({});

  const [rejectionReasons, setRejectionReasons] = useState({
    forman: {},
    line: {},
    customer: {},
    component: {},
    forman1: {},
  line1: {},
  customer1: {},
  component1: {},
  });
  // Fetch suggestions from API
  const fetchSuggestions = async (type, value) => {
    try {
      const response = await axios.get('http://192.168.1.199:8001/forging/api/suggestions', {
        params: { type, value },
      });
      setSuggestions((prev) => ({
        ...prev,
        [type]: response.data,
      }));
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

    setFilters((prev) => ({
      ...prev,
      start_date: firstDay,
      end_date: lastDay,
    }));
  }, []);

  const fetchData = async () => {
    setLoading(true); // Set loading to true before the API call
    try {
      const response = await axios.get(
        "http://192.168.1.199:8001/forging/api/rejection-data/",
        { params: filters }
      );
      const responseData = response.data;

      if (!responseData.data || responseData.data.length === 0) {
        setData([]); // Set data as an empty array if no data is returned
        return; // Early exit if no data available
      } else {
        setData(responseData.data);
      }

      const totalProduction = responseData.data.reduce((acc, item) => acc + item.production, 0);
      const totalRejection = responseData.total_rejection;
      const rejectionRate = totalProduction
        ? ((totalRejection / (totalProduction + totalRejection)) * 100).toFixed(2)
        : 0;

      const groupByKey = (key, reasons) =>
        responseData.data.reduce((acc, item) => {
          if (item.production < 100) return acc; // Exclude low-production items

          if (!acc[item[key]]) {
            acc[item[key]] = {
              production: 0,
              rejection: 0,
              rejectionPercentage: 0,
            };
          }

          reasons.forEach((reason) => {
            acc[item[key]].rejection += item[reason];
          });

          acc[item[key]].production += item.production;
          const total = acc[item[key]].production + acc[item[key]].rejection;
          acc[item[key]].rejectionPercentage =
            total > 0 ? ((acc[item[key]].rejection / total) * 100).toFixed(2) : 0;

          return acc;
        }, {});
        

      const groupByKeyresion = (key, reasons) =>
        responseData.data.reduce((acc, item) => {
          if (item.production < 100) return acc; // Exclude low-production items

          if (!acc[item[key]]) {
            acc[item[key]] = {
              up_setting: 0,
              half_piercing: 0,
              full_piercing: 0,
              ring_rolling: 0,
              sizing: 0,
              overheat: 0,
              bar_crack_pcs: 0,
              total: 0,
            };
          }
          reasons.forEach((reason) => {
            acc[item[key]][reason] += item[reason];
          });
          acc[item[key]].total += item.rejection;
          return acc;
        }, {});

      const reasons = [
        "up_setting",
        "half_piercing",
        "full_piercing",
        "ring_rolling",
        "sizing",
        "overheat",
        "bar_crack_pcs",
      ];

      const rejectionByForman = groupByKey("forman", reasons);
      const rejectionByLine = groupByKey("line", reasons);
      const rejectionByCustomer = groupByKey("customer", reasons);
      const rejectionByComponent = groupByKey("component", reasons);

      const rejectionByForman1 = groupByKeyresion("forman", reasons);
      const rejectionByLine1 = groupByKeyresion("line", reasons);
      const rejectionByCustomer1 = groupByKeyresion("customer", reasons);
      const rejectionByComponent1 = groupByKeyresion("component", reasons);

      const totalRejectionReasons = reasons.reduce((acc, reason) => {
        acc[reason] = responseData.data.reduce((sum, item) => sum + item[reason], 0);
        return acc;
      }, {});

      const getHighestRejectionKey = (rejectionData) => {
        return Object.keys(rejectionData).reduce((a, b) =>
          parseFloat(rejectionData[a].rejectionPercentage) >
          parseFloat(rejectionData[b].rejectionPercentage)
            ? a
            : b
        );
      };

      const getHighestRejectionWithPercentage = (rejectionData) => {
        const key = getHighestRejectionKey(rejectionData);
        return {
          key,
          rejectionPercentage: rejectionData[key]?.rejectionPercentage || 0,
        };
      };

      const highestRejectionComponent = getHighestRejectionWithPercentage(rejectionByComponent);
      const highestRejectionLine = getHighestRejectionWithPercentage(rejectionByLine);
      const highestRejectionForman = getHighestRejectionWithPercentage(rejectionByForman);
      const highestRejectionCUSTOMER = getHighestRejectionWithPercentage(rejectionByCustomer);

      setAnalytics({
        totalProduction,
        totalRejection,
        rejectionRate,
        highestRejectionByCustomer: Object.keys(rejectionByCustomer1).reduce((a, b) =>
          rejectionByCustomer1[a].total > rejectionByCustomer1[b].total ? a : b
        ),
        highestRejectionLine: Object.keys(rejectionByLine1).reduce((a, b) =>
          rejectionByLine1[a].total > rejectionByLine1[b].total ? a : b
        ),
        highestRejectionForman: Object.keys(rejectionByForman1).reduce((a, b) =>
          rejectionByForman1[a].total > rejectionByForman1[b].total ? a : b
        ),
        highestRejectionComponent1: Object.keys(rejectionByComponent1).reduce((a, b) =>
          rejectionByComponent1[a].total > rejectionByComponent1[b].total ? a : b
        ),
        highestRejectionByComponent: `${highestRejectionComponent.key} (${highestRejectionComponent.rejectionPercentage}%)`,
        highestRejectionByLine: `${highestRejectionLine.key} (${highestRejectionLine.rejectionPercentage}%)`,
        highestRejectionByForman: `${highestRejectionForman.key} (${highestRejectionForman.rejectionPercentage}%)`,
        highestRejectionBycustomer: `${highestRejectionCUSTOMER.key} (${highestRejectionCUSTOMER.rejectionPercentage}%)`,
      });

      setRejectionReasons({
        forman: rejectionByForman,
        line: rejectionByLine,
        customer: rejectionByCustomer,
        component: rejectionByComponent,

        forman1: rejectionByForman1,
        line1: rejectionByLine1,
        customer1: rejectionByCustomer1,
        component1: rejectionByComponent1,
      });
      setTotalRejectionByCategory(totalRejectionReasons);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false); // Set loading to false once the API call completes
    }
  };


  useEffect(() => {
    if (filters.start_date && filters.end_date) {
      fetchData();
    }
  }, [filters]);
  const generateTable = () => {
    return (
      <div className="overflow-y-auto max-h-[400px]">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-200">
            <th className="sticky top-0 bg-gray-200 p-2">Batch Id</th>
            <th className="sticky top-0 bg-gray-200 p-2">Date</th>
            <th className="sticky top-0 bg-gray-200 p-2">Shift</th>
              <th className="sticky top-0 bg-gray-200 p-2">Component</th>
              <th className="sticky top-0 bg-gray-200 p-2">Slug Weight</th>
              <th className="sticky top-0 bg-gray-200 p-2">Heat no.</th>
              <th className="sticky top-0 bg-gray-200 p-2">Line</th>
              <th className="sticky top-0 bg-gray-200 p-2">Line-Incharge</th>
              <th className="sticky top-0 bg-gray-200 p-2">Forman</th>
              <th className="sticky top-0 bg-gray-200 p-2">Customer</th>
              <th className="sticky top-0 bg-gray-200 p-2">Production</th>
              <th className="sticky top-0 bg-gray-200 p-2">Rejections</th>
              <th className="sticky top-0 bg-gray-200 p-2">Rejection %</th>
              <th className="sticky top-0 bg-gray-200 p-2">Verify BY </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className={`text-sm text-gray-700 ${
                  index % 2 === 0 ? "bg-gray-100" : "bg-white"
                }`}
              >
                <td className="p-2">{row.date}</td>
                <td className="p-2">{row.batch_number}</td>
                <td className="p-2">{row.shift}</td>
                <td className="p-2">{row.component}</td>
                <td className="p-2">{row.slug_weight}</td>
                <td className="p-2">{row.heat_number}</td>
                <td className="p-2">{row.line}</td>
                <td className="p-2">{row.line_incharge}</td>
                <td className="p-2">{row.forman}</td>
                <td className="p-2">{row.customer}</td>
                <td className="p-2">{row.production}</td>
                <td className="p-2">{(row.up_setting + row.half_piercing +row.full_piercing + row.ring_rolling + row.sizing+ row.overheat+ row.bar_crack_pcs )}</td>
                <td className="p-2">
                  {((row.up_setting + row.half_piercing +row.full_piercing + row.ring_rolling + row.sizing+ row.overheat+ row.bar_crack_pcs / (row.production + row.up_setting + row.half_piercing +row.full_piercing + row.ring_rolling + row.sizing+ row.overheat+ row.bar_crack_pcs)) * 100).toFixed(2)}%
                </td>
                <td className="p-2">{row.verified_by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (value.trim() !== "") {
      fetchSuggestions(name, value);
    }
  };
  // Handle selection of a suggestion
  const handleSuggestionSelect = (type, selectedValue) => {
    setFilters((prev) => ({
      ...prev,
      [type]: selectedValue,
    }));

    setSuggestions((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item !== selectedValue), // Remove selected suggestion
    }));
  };

  const generateChartOptions = (title, dataKey, reasonsData) => {
    // Create a sorted array of categories based on rejection percentage
    const sortedData = Object.entries(reasonsData)
      .map(([key, value]) => ({
        category: key,
        rejectionPercentage: parseFloat(value.rejectionPercentage),
        production: value.production,
        rejection: value.rejection,
      }))
      .sort((a, b) => b.rejectionPercentage - a.rejectionPercentage); // Sort descending by rejection percentage
  
    const categories = sortedData.map((item) => item.category);
    const seriesData = sortedData.map((item) => ({
      y: item.rejectionPercentage,
      color:
        item.rejectionPercentage > 2 && item.production > 200
          ? "#e74c3c" // Red color for bars meeting the condition
          : "#3498db", // Default blue color for other bars
      production: item.production,
      rejection: item.rejection,
    }));
  
    return {
      chart: {
        type: "column",
        height: "350px", // Reduced height of the chart
        backgroundColor: "transparent",
      },
      title: {
        text: `Rejection Percentage by ${dataKey}`,
        style: {
          fontSize: "20px",
          fontWeight: "bold",
          color: "#333",
          textTransform: "uppercase", // Modern uppercase style
        },
      },
      xAxis: {
        categories,
      },
      yAxis: {
        title: { text: "Rejection Percentage (%)" },
        min: 0,
        max: Math.max(...seriesData.map((d) => d.y)) * 1.1, // Dynamically set max with a buffer
        labels: {
          style: {
            fontSize: "14px",
            color: "#333",
          },
        },
      },
      series: [
        {
          name: "Rejection %",
          data: seriesData,
          showInLegend: false, // Hides the series name in the legend
          dataLabels: {
            enabled: true, // Enable data labels
            style: {
              fontSize: "10px",
              fontWeight: "bold",
              color: "#333", // Color for the data label text
            },
            formatter: function () {
              return this.y.toFixed(2); // Show the y-value with two decimal points
            },
          },
        },
      ],
      credits: {
        enabled: false, // Disable the Highcharts credits
      },
      tooltip: {
        formatter: function () {
          const item = sortedData[this.point.index];
          return `
            <strong>${item.category}</strong><br/>
            Production: ${item.production}<br/>
            Rejection: ${item.rejection}<br/>
            Rejection Percentage: ${item.rejectionPercentage.toFixed(2)}%
          `;
        },
      },
    };
  };
  
  // Generate chart options dynamically
  const generateChartOptions1 = (title, dataKey, reasonsData) => {
    const categories = Object.keys(reasonsData);
    const series = [
      {
        name: "Up Setting",
        data: categories.map((key) => reasonsData[key].up_setting),
        color: "#6c5ce7",
      },
      {
        name: "Half Piercing",
        data: categories.map((key) => reasonsData[key].half_piercing),
        color: "#00cec9",
      },
      {
        name: "Full Piercing",
        data: categories.map((key) => reasonsData[key].full_piercing),
        color: "#fdcb6e",
      },
      {
        name: "Ring Rolling",
        data: categories.map((key) => reasonsData[key].ring_rolling),
        color: "#e17055",
      },
      {
        name: "Sizing",
        data: categories.map((key) => reasonsData[key].sizing),
        color: "#0984e3",
      },
      {
        name: "Overheat",
        data: categories.map((key) => reasonsData[key].overheat),
        color: "#d63031",
      },
      {
        name: "Bar Crack Pcs",
        data: categories.map((key) => reasonsData[key].bar_crack_pcs),
        color: "#636e72",
      },
    ];
  
    return {
      chart: {
        type: "column",
        height: 500, // Increased height for better visualization
        backgroundColor: "#f8f9fa", // Light background for modern look
        
      },
      title: {
        text: `Rejection Reasons by ${dataKey}`,
        style: {
          fontSize: "22px",
          fontWeight: "bold",
          color: "#2d3436",
          textTransform: "uppercase",
        },
      },
      xAxis: {
        categories,
        labels: {
          style: { fontSize: "14px", color: "#2d3436" },
          rotation: -45, // Rotate for better readability
        },
      },
      yAxis: {
        title: { text: "Rejection Count", style: { fontSize: "14px" } },
        labels: {
          style: { fontSize: "12px", color: "#2d3436" },
        },
        gridLineColor: "#dfe6e9", // Subtle grid lines
      },
      tooltip: {
        shared: true,
        useHTML: true,
        headerFormat: "<b>{point.key}</b><br>",
        pointFormat:
          '<span style="color:{series.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br>',
        style: {
          fontSize: "13px",
          color: "#2d3436",
        },
      },
      credits: { enabled: false }, // Disable credits
      plotOptions: {
        column: {
          borderRadius: 5, // Rounded edges for bars
          dataLabels: {
            enabled: true,
            style: {
              fontSize: "12px",
              color: "#2d3436",
            },
          },
        },
      },
      legend: {
        align: "center",
        verticalAlign: "bottom",
        itemStyle: { fontSize: "12px", color: "#2d3436" },
        itemHoverStyle: { color: "#0984e3" },
        itemHiddenStyle: { color: "#b2bec3" },
      },
      series,
    };
  };
  

const generateTotalRejectionChartOptions = () => {
  const categories = Object.keys(totalRejectionByCategory);
  const seriesData = Object.values(totalRejectionByCategory);

  return {
    chart: {
      type: "bar",
      backgroundColor: "transparent",
    },
    title: { text: "Total Rejection Reasons by Category" },
    xAxis: { categories },
    yAxis: {
      title: { text: "Rejection Count" },
      min: 0,
      labels: {
        style: { fontSize: '12px', color: '#333' },
      },
    },
    credits: { enabled: false }, // Disable credits
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true, // Enable data labels on bars
          style: {
            fontSize: '12px',
            color: '#333',
          },
        },
      },
    },
    series: [
      {
        name: "Rejections",
        data: seriesData,
        tooltip: { valueSuffix: " pcs" },
      },
    ],
  };
};

  
 

return (
  <div className="min-h-screen bg-gray-50 p-4">
    <Sidebar />
    <h1 className="text-3xl font-bold text-center mb-2 text-gray-800 mt-24">Rejection Dashboard</h1>

    {/* Filters Section */}
    <div className="flex flex-wrap gap-4 mb-2 items-center">
      {["component", "customer", "line", "forman"].map((filterType) => (
        <div key={filterType} className="relative w-full sm:w-auto flex-1">
          <div className="relative">
            <input
              type="text"
              name={filterType}
              placeholder={filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              value={filters[filterType]}
              onChange={handleFilterChange}
              className="p-3 border rounded-lg w-full focus:ring focus:ring-indigo-300 focus:outline-none shadow-sm"
              autoComplete="off"
            />
            <Search className="absolute top-3 right-3 text-gray-400" />
          </div>
          {suggestions[filterType]?.length > 0 && (
            <ul className="absolute z-10 bg-white border rounded-lg w-full mt-1 max-h-48 overflow-auto shadow-lg">
              {suggestions[filterType].map((item, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSuggestionSelect(filterType, item)}
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      <div className="relative w-full sm:w-auto flex-1">
        <input
          type="date"
          name="start_date"
          value={filters.start_date}
          onChange={handleFilterChange}
          className="p-3 border rounded-lg w-full focus:ring focus:ring-indigo-300 focus:outline-none shadow-sm"
        />
        
      </div>

      <div className="relative w-full sm:w-auto flex-1">
        <input
          type="date"
          name="end_date"
          value={filters.end_date}
          onChange={handleFilterChange}
          className="p-3 border rounded-lg w-full focus:ring focus:ring-indigo-300 focus:outline-none shadow-sm"
        />
        
      </div>
    </div>

    {/* Analytics Section */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-2">
  {loading
    ? Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="p-4 bg-gray-200 animate-pulse rounded-lg shadow-lg"
        ></div>
      ))
    : data.length === 0 || analytics.totalRejection === null ? (
        <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition duration-200">
          <p className="text-sm font-semibold text-gray-600">No data available</p>
        </div>
      ) : (
        [
          { label: "Total Production", value: analytics.totalProduction },
          { label: "Total Rejection", value: analytics.totalRejection },
          { label: "Rejection Rate", value: `${analytics.rejectionRate}%` },
          { label: "Component", value: analytics.highestRejectionByComponent },
          { label: "Customer", value: `${analytics.highestRejectionBycustomer}` },
          { label: "Line", value: `${analytics.highestRejectionByLine}` },
          { label: "Foreman", value: `${analytics.highestRejectionByForman}` },
        ].map((item, index) => (
          <div
            key={index}
            className="p-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition duration-200"
          >
            <h3 className="text-sm font-semibold text-gray-600">{item.label}</h3>
            <p className="text-sm font-bold text-gray-800">{item.value}</p>
          </div>
        ))
      )}
</div>



    {/* Charts Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 masonry">
      {loading
        ? Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-64 bg-gray-200 animate-pulse rounded-lg shadow-lg"
            ></div>
          ))
        : data.length === 0 || analytics.totalRejection === null ? (
            <div className="text-center  bg-white rounded-lg shadow-lg">
              <p>No data available</p>
            </div>
          ) : (
            ["Component", "Line", "Forman", "Customer"].map((chart, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg  hover:shadow-xl transition duration-200"
              >
                <HighchartsReact
                  highcharts={Highcharts}
                  options={generateChartOptions(
                    chart,
                    chart,
                    rejectionReasons[chart.toLowerCase()]
                  )}
                />
              </div>
            ))
          )}
    </div>

    <div className="mt-2">
      {loading ? (
        <div className="h-96 bg-gray-200 animate-pulse rounded-lg shadow-lg"></div>
      ) : data.length === 0 || analytics.totalRejection === null ? (
        <div className="text-center bg-white rounded-lg shadow-lg">
          <p>No data available</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition duration-200">
          <HighchartsReact
            highcharts={Highcharts}
            options={generateTotalRejectionChartOptions()}
          />
        </div>
      )}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2 masonry">
      {loading
        ? Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-64 bg-gray-200 animate-pulse rounded-lg shadow-lg"
            ></div>
          ))
        : data.length === 0 || analytics.totalRejection === null ? (
            <div className="text-center  bg-white rounded-lg shadow-lg">
              <p>No data available</p>
            </div>
          ) : (
            ["Forman", "Line", "Customer", "Component"].map((chart, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg  hover:shadow-xl transition duration-200"
              >
                <HighchartsReact
                  highcharts={Highcharts}
                  options={generateChartOptions1(
                    chart,
                    chart,
                    rejectionReasons[`${chart.toLowerCase()}1`]
                  )}
                />
              </div>
            ))
          )}
    </div>
    
     
      <div className="flex-grow p-6">
      
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Table */}
            {data.length > 0 ? (
              generateTable()
            ) : (
              <p className="text-gray-600 text-center mt-4">No data available.</p>
            )}
          </>
        )}
      </div>
   

  </div>
);

};

export default Dashboard;
