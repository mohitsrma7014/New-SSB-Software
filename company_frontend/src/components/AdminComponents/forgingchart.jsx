import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Highcharts from 'highcharts';
import HighchartsReact from 'react-highcharts';
import { Sidebar } from './Sidebar';
import ProductionReport from './forgingProductionReport'; // Remove curly braces

export const AnalyticsPage = () => {
  const [data, setData] = useState({
    component_data: [],
    customer_data: [],
    line_data: [],
  });

  const [selectedDate, setSelectedDate] = useState(getDefaultDate()); // Default to today - 2 days

  const fetchData = (date) => {
    axios
      .get(`http://192.168.1.199:8001/api/production-report/?date=${date}`)
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching production data:', error);
      });
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  function getDefaultDate() {
    const date = new Date();
    date.setDate(date.getDate() - 2); // Subtract 2 days from today
    return formatDate(date);
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const renderChart = (title, categories, data) => {
    return (
        
      <HighchartsReact
        highcharts={Highcharts}
        options={{
          chart: {
            type: 'column',
          },
          title: {
            text: title,
          },
          xAxis: {
            categories: categories,
          },
          yAxis: {
            title: {
              text: 'Production (Tons)',
            },
          },
          tooltip: {
            pointFormat:
              '<b>{point.y:.2f} Tons</b><br/>',
          },
          series: [
            {
              name: 'Production',
              data: data,
            },
          ],
        }}
      />
    );
  };

  return (
    <div>
      <h1>Analytics Page</h1>
      <Sidebar />
      <ProductionReport />

      {/* Add Date Picker here if needed */}
      <div>
        <h3>Select Date</h3>
        {/* Date picker component here */}
      </div>

      {/* Render the charts */}
      <div>
        <h3>Production by Component</h3>
        {renderChart(
          'Production by Component',
          data.component_data.map((item) => item.component),
          data.component_data.map((item) => item.production_weight_ton)
        )}
      </div>

      <div>
        <h3>Production by Customer</h3>
        {renderChart(
          'Production by Customer',
          data.customer_data.map((item) => item.customer),
          data.customer_data.map((item) => item.production_weight_ton)
        )}
      </div>

      <div>
        <h3>Production by Line</h3>
        {renderChart(
          'Production by Line',
          data.line_data.map((item) => item.line),
          data.line_data.map((item) => item.production_weight_ton)
        )}
      </div>
    </div>
  );
};
