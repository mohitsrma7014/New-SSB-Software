import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { FaChartLine, FaCalendarAlt } from "react-icons/fa";
import { Sidebar } from '../../components/AdminComponents/Sidebar';

const categories = ["total_production", "total_rejection", "rejection_cost", "rejection_percentage"];
const targetValues = {
    2024: {
        forging: 1.2,
        pre_mc: 0.4,
        cnc: 1.5,
        overall: 1.8
    },
    2025: {
        forging: 1.5,
        pre_mc: 0.3,
        cnc: 1.7,
        overall: 2.0
    }
};

const monthMap = {
    "04": "Apr", "05": "May", "06": "Jun", "07": "Jul", "08": "Aug", 
    "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec", 
    "01": "Jan", "02": "Feb", "03": "Mar"
};


const Dashboard = () => {
    const currentYear = new Date().getFullYear();
    const [selectedCategory, setSelectedCategory] = useState("rejection_percentage");
    const [year, setYear] = useState(currentYear);
    const [data, setData] = useState([]);
    const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://192.168.1.199:8001/cnc/api/fy-trends/${year}/`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error("Error fetching data:", error);
                setData([]);
            }
        };
        fetchData();
    }, [year]);

    const orderedMonths = ["04", "05", "06", "07", "08", "09", "10", "11", "12", "01", "02", "03"];

const allMonths = orderedMonths.map(num => {
  const isPreviousYear = parseInt(num) >= 4; // April to Dec belong to the previous year
  const actualYear = isPreviousYear ? year - 1 : year; // Adjust year accordingly
  return `${monthMap[num]}/${actualYear}`;
});
      
      console.log("Expected Months:", allMonths);
      


    const dataMap = data.reduce((acc, d) => {
        const [month, yr] = d.month_year.split("-");
        const formattedMonth = `${monthMap[month]}/${yr}`;
        acc[formattedMonth] = d;
        return acc;
    }, {});

    const formattedData = allMonths.map(month => (
        dataMap[month] || {
            month_year: month,
            forging: { total_production: 0, total_rejection: 0, rejection_cost: 0, rejection_percentage: 0 },
            cnc: { total_production: 0, total_rejection: 0, rejection_cost: 0, rejection_percentage: 0 },
            pre_mc: { total_production: 0, total_rejection: 0, rejection_cost: 0, rejection_percentage: 0 },
            overall: { total_production: 0, total_rejection: 0, rejection_cost: 0, rejection_percentage: 0 }
        }
    ));

    const generateOptions = (category, title) => {
      const categoryTitles = {
        total_production: "PRODUCTION (In Pcs.)",
        total_rejection: "REJECTION (In Pcs.)",
        rejection_cost: "COST (In Lac.)",
        rejection_percentage: "REJECTION %"
    };
    const targetValue = targetValues[year] ? targetValues[year][title] : null;

    const formattedTitle = `${title.toUpperCase()} ${categoryTitles[category]}`;
  
      const now = new Date();
      const currentMonthYear = `${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
  
      return {
          chart: {
              type: "column",
              backgroundColor: "#ffffff",
              borderRadius: 12,
              shadow: { color: "rgba(0,0,0,0.1)", offsetX: 2, offsetY: 2, opacity: 0.5 },
              style: { fontFamily: "Inter, sans-serif" },
              animation: true,
              events: {
                  load: function () {
                      let chart = this;
                      let blinkState = false;
                      setInterval(() => {
                          chart.series[0].points.forEach(point => {
                              if (point.month === currentMonthYear && point.graphic) {
                                  blinkState = !blinkState;
                                  point.graphic.attr({
                                      fill: blinkState ? "green" : "white"
                                  });
                              }
                          });
                      }, 800); // Blinking every 0.8s
                  }
              }
          },
          title: { 
              text: formattedTitle, 
              style: { fontSize: "18px", fontWeight: "bold", color: "#333" } 
          },
          xAxis: { 
              categories: allMonths, 
              labels: { style: { fontSize: "12px", color: "#666" } },
              lineColor: "#ddd",
              tickColor: "#ddd"
          },
          yAxis: { 
              title: { text: category.toUpperCase(), style: { fontSize: "14px", color: "#555" } },
              gridLineColor: "#eee",
              
              
          },
          yAxis: { 
            title: { 
                text: category.toUpperCase(), 
                style: { fontSize: "14px", color: "#555" } 
            },
            gridLineColor: "#eee",
            plotLines: category === "rejection_percentage" && targetValue ? [{
                value: targetValue,
                color: 'red',
                dashStyle: 'solid',
                width: 2,
                zIndex: 15, // Ensure it's above other elements
                label: {
                    text: `<b>Target: ${targetValue}%</b>`, // Bold text
                    useHTML: true, // Allow HTML formatting
                    align: 'right',
                    y: 15, // Move slightly up
                    style: {
                        color: 'red',
                        fontWeight: 'bold',
                        fontSize: '12px'
                    }
                }
            }] : []
        },

        
        
        
          tooltip: {
            enabled: false,
              shared: true,
              useHTML: true,
              backgroundColor: "rgba(255,255,255,0.95)",
              borderColor: "#ddd",
              borderRadius: 8,
              outside: true,
              zIndex: 9999, // Ensure it's above other elements
              style: { fontSize: "13px", color: "#333" },
              formatter: function () {
                  const point = this.points[0].point;
                  return `
                      <div style="padding:10px; font-weight: 500;">
                          <b style="font-size:14px; color:#444;">${category.replace(/_/g, " ").toUpperCase()}</b><br/>
                          <span style="color:#777;">Month-Year: <b>${point.month}</b></span><br/>  
                          <span style="color:#0b84a5;">Production: <b>${point.production} pcs</b></span><br/>
                          <span style="color:#f95d6a;">Rejection: <b>${point.rejection} pcs</b></span><br/>
                          <span style="color:#ff7c43;">Cost: <b>₹${point.cost} Lac</b></span><br/>
                          <span style="color:#ffa600;">Percentage: <b>${point.percentage}%</b></span>
                      </div>`;
              }
          },
          series: [
              {
                  name: formattedTitle,
                  data: formattedData.map(d => {
                      const monthYear = d.month_year; 
                      const isCurrentMonth = monthYear === currentMonthYear;
                      const categoryValue = d[title.toLowerCase()][category];
                      
                      return {
                          y: category === "rejection_cost"
                              ? parseFloat((categoryValue / 100000).toFixed(2)) || 0
                              : category === "rejection_percentage"
                              ? parseFloat(categoryValue.toFixed(2)) || 0
                              : categoryValue,
                          month: monthYear,
                          production: d[title.toLowerCase()].total_production || 0,
                          rejection: d[title.toLowerCase()].total_rejection || 0,
                          cost: parseFloat((d[title.toLowerCase()].rejection_cost / 100000).toFixed(2)) || 0,
                          percentage: parseFloat(d[title.toLowerCase()].rejection_percentage.toFixed(2)) || 0,
                          marker: isCurrentMonth 
                              ? { 
                                  radius: 6,
                                  symbol: "circle",
                                  fillColor: "#28a745",
                                  lineWidth: 3,
                                  lineColor: "#28a745"
                              } 
                              : { radius: 4, symbol: "circle" }
                      };
                  }),
                  marker: {
                    enabled: true,
                    symbol: 'circle',
                    radius: 3, // Larger markers for visibility
                    fillColor: '#3498db',
                    lineWidth: 2,
                    lineColor: '#ffffff', // White border around the markers
                  },
                  color: '#3498db', // Custom line color
                  lineWidth: 5, // Thicker line for better visibility
                  marker: { symbol: "circle", lineWidth: 2, lineColor: "#0b84a5" }
              }
          ],
          plotOptions: {
              series: {
                  dataLabels: {
                      enabled: true,
                      formatter: function () {
                          return this.y;
                      },
                      style: { fontSize: "10px", fontWeight: "bold", color: "#444" }
                  },
                  animation: {
                      duration: 5
                  }
              }
          },
          credits: { enabled: false }
      };
  };
  
  

    return (
        <div className="p-2 bg-gray-100 min-h-screen">
                 <Sidebar />
           
           <div className="flex justify-between items-center mt-24 mb-2 p-3 bg-white shadow-lg rounded-2xl border border-gray-200">
            <div className="flex items-center space-x-3">
                <FaCalendarAlt className="text-blue-600 text-2xl" />
                <select
                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                >
                    {yearOptions.map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-800">YEARLY TRENDS DASHBOARD</h1>
            <div className="flex items-center space-x-3">
                <FaChartLine className="text-blue-600 text-2xl" />
                <div className="flex space-x-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-2 py-2 rounded-lg transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white text-xs' : 'bg-gray-200 text-xs text-gray-800 hover:bg-gray-300'}`}
                        >
                            {cat.replace(/_/g, " ").toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>
        </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                <HighchartsReact highcharts={Highcharts} options={generateOptions(selectedCategory, "forging")} />
                <HighchartsReact highcharts={Highcharts} options={generateOptions(selectedCategory, "pre_mc")} />
                <HighchartsReact highcharts={Highcharts} options={generateOptions(selectedCategory, "cnc")} />
                <HighchartsReact highcharts={Highcharts} options={generateOptions(selectedCategory, "overall")} />
            </div>
        </div>
    );
};

export default Dashboard;
