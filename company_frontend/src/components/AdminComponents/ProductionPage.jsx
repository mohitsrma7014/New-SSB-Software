import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official"; // Import Highcharts React wrapper
import './ProductionPage.css';
import { Sidebar } from './Sidebar';

const ProductionPage = () => {
  // Set default date to two days ago
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() - 2);

  // Set default month and year to the current month and year
  const currentMonth = new Date().getMonth() + 1; // months are 0-indexed, so add 1
  const currentYear = new Date().getFullYear();

  const [data, setData] = useState({});
  const [date, setDate] = useState(''); // Default date to two days ago
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [component, setComponent] = useState('');
  const [kpiData, setKpiData] = useState({});

  const apis = [
    "forging", "heat_treatment", "shot_blast", "pre_mc", "cnc", "marking", "fi", "visual"
  ];

  const fetchData = async () => {
    let params = { month, year, component };

    if (date) {
      const localDate = new Date(date);
      localDate.setHours(0, 0, 0, 0);
      const formattedDate = `${localDate.getFullYear()}-${(localDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${localDate.getDate().toString().padStart(2, "0")}`;
      params = { ...params, date: formattedDate };
      console.log("Formatted Date:", formattedDate);
    } else {
      params = { ...params, date: "" };
    }

    console.log("API Params:", params);

    try {
      const requests = apis.map((api) =>
        axios
          .get(`http://192.168.1.199:8001/${api}/api/production-report`, { params })
          .then((response) => {
            console.log(`Success: ${api}`, response.data);
            return { api, data: response.data };
          })
          .catch((error) => {
            console.error(`Error: ${api}`, error.message);
            return { api, data: null, error: error.message };
          })
      );

      const results = await Promise.all(requests);
      const apiData = {};
      const kpiData = {};

      results.forEach(({ api, data, error }) => {
        if (error) {
          console.error(`Error fetching ${api}: ${error}`);
          apiData[api] = [];
          kpiData[api] = 0;
        } else {
          console.log(`Data for ${api}:`, data);
          apiData[api] = (data?.component_data || []).sort(
            (a, b) => b.production_weight_ton - a.production_weight_ton
          );

          if (["forging", "heat_treatment", "shot_blast"].includes(api)) {
            kpiData[api] = (parseFloat(
              data?.component_data?.reduce((sum, item) => sum + (item.production_weight_ton || 0), 0).toFixed(2)
            ) || 0) + ' Ton';
            
            
          } else {
            kpiData[api] = (data?.total_production || 0) + ' Pcs.';

          }
        }
      });

      console.log("Final API Data:", apiData);
      console.log("Final KPI Data:", kpiData);

      setData(apiData);
      setKpiData(kpiData);
    } catch (error) {
      console.error("Global error in fetchData:", error);
      setData({});
      setKpiData({});
    }
  };

  // Effect hook to fetch data whenever the date, month, or year changes
  useEffect(() => {
    fetchData();
  }, [date, month, year, component]);

  // Highcharts options customization based on the component
  const chartOptions = (api) => {
    const chartTitles = {
      cnc: 'CNC Production (Pcs.)',
      marking: 'Marking Production (Pcs.)',
      fi: 'FI Production (Pcs.)',
      visual: 'Visual Production (Pcs.)',

      forging: 'Forging Production (Ton.)',
      heat_treatment: 'Heat Treatment Production (Ton.)',
      shot_blast: 'Shot Blast Production (Ton.)',
      pre_mc: 'Pre Machining Production (Pcs.)',
    };

    const yAxisTitles = {
      cnc: 'CNC Production (Pcs.)',
      marking: 'Marking Production (Pcs.)',
      fi: 'FI Production (Pcs.)',
      visual: 'Visual Production (Pcs.)',

      forging: 'Forging Production (Ton.)',
      heat_treatment: 'Heat Treatment Production (Ton.)',
      shot_blast: 'Shot Blast Production (Ton.)',
      pre_mc: 'Pre Machining Production (Pcs.)',
    };

    const seriesNames = {
      cnc: 'CNC Production (Pcs.)',
      marking: 'Marking Production (Pcs.)',
      fi: 'FI Production (Pcs.)',
      visual: 'Visual Production (Pcs.)',

      forging: 'Forging Production (Ton.)',
      heat_treatment: 'Heat Treatment Production (Ton.)',
      shot_blast: 'Shot Blast Production (Ton.)',
      pre_mc: 'Pre Machining Production (Pcs.)',
    };

    return {
      chart: {
        type: 'column',
      },
      title: {
        text: chartTitles[api] || `${api} Production Weight (%)`,
      },
      xAxis: {
        categories: [], // To be set dynamically
      },
      yAxis: {
        min: 0,
        title: {
          text: yAxisTitles[api] || 'Production Weight (%)',
        },
      },
      series: [{
        name: seriesNames[api] || `${api} Production Weight (%)`,
        data: [], // To be set dynamically
      }],
      plotOptions: {
        column: {
          colorByPoint: true, // Color each column differently
        },
      },
    };
  };

  // Highcharts data formatting for each API response
  const chartData = (api, data) => {
    if (!Array.isArray(data)) {
      return {}; // If data is not an array, return an empty object
    }

    return {
      ...chartOptions(api),
      xAxis: {
        categories: data.map(item => item.component),
      },
      series: [{
        ...chartOptions(api).series[0],
        data: data.map(item => item.production_weight_ton),
      }],
    };
  };


  return (
    <div className="production-page">
      <Sidebar />
      <div className="filters">
        <div>
          <label>Select Date:</label>
          <DatePicker
            selected={date}
            onChange={(selectedDate) => {
              setDate(selectedDate);
              setMonth('');
              setYear('');
            }}
            dateFormat="yyyy-MM-dd"
            className="datepicker"
          />
        </div>
        <div>
          <label>Select Month:</label>
          <select
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setDate(null);
            }}
          >
            <option value="">Select Month</option>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((monthName, i) => (
              <option key={i + 1} value={i + 1}>
                {monthName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Select Year:</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Select Year</option>
            {[...Array(20).keys()].map((i) => (
              <option key={i} value={2020 + i}>
                {2020 + i}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Select Component:</label>
          <input
            type="text"
            value={component}
            onChange={(e) => setComponent(e.target.value)}
            placeholder="Enter component"
          />
        </div>
      </div>
      <div className="charts">
        {apis.map((api, index) => {
          // Only display pairs of charts in each row
          if (index % 2 === 0) {
            return (
              <div className="chart-row" key={api}>
                {/* First Chart */}
                <div className="chart-box">
                  <div className="kpi-box">
                    <p>Total Production: {kpiData[api] || 0}</p>
                  </div>

                  
                  {data[api] && data[api].length > 0 ? (
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={chartData(api, data[api])} // Pass API and data
                    />
                  ) : (
                    <p>No data available for {api}</p>
                  )}
                </div>

                {/* Second Chart - Next API */}
                {apis[index + 1] && (
                  <div className="chart-box">
                    <div className="kpi-box">
                      <p>Total Production: {kpiData[apis[index + 1]] || 0}</p>
                    </div>

                    {data[apis[index + 1]] && data[apis[index + 1]].length > 0 ? (
                      <HighchartsReact
                        highcharts={Highcharts}
                        options={chartData(apis[index + 1], data[apis[index + 1]])} // Pass API and data
                      />
                    ) : (
                      <p>No data available for {apis[index + 1]}</p>
                    )}
                  </div>
                )}
              </div>
            );
          }
          return null; // Return nothing for odd index as we handle it in pairs
        })}
      </div>
    </div>
  );
};

export default ProductionPage;
