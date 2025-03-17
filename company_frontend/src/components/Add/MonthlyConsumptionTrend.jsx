import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import axios from "axios";

const MonthlyConsumptionTrend = () => {
  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: "line",
      backgroundColor: "#f9f9f9",
      height: 525, // Fixed height
    },
    title: {
      text: "Monthly RM Consumption Trend",
    },
    xAxis: {
      categories: [],
      title: {
        text: "Month",
      },
    },
    yAxis: {
      title: {
        text: "Tonnage (T)",
      },
    },
    series: [
      {
        name: "Tonnage",
        data: [],
        color: "#0071A7",
        dataLabels: {
          enabled: true,
          style: {
            fontSize: "12px",
            fontWeight: "bold",
            color: "#333",
          },
        },
      },
    ],
    credits: {
      enabled: false,
    },
  });

  useEffect(() => {
    axios
      .get("http://192.168.1.199:8001/raw_material/api/monthly_consumption_trend/")
      .then((response) => {
        const formattedData = response.data.map((item) => ({
          month: new Date(item.month + "-01").toLocaleString("en-US", {
            month: "short",
            year: "numeric",
          }),
          tonnage: parseFloat(item.tonnage.toFixed(2)), // Round to 2 decimal places
        }));

        setChartOptions((prevOptions) => ({
          ...prevOptions,
          xAxis: { categories: formattedData.map((d) => d.month) },
          series: [{ name: "Tonnage", data: formattedData.map((d) => d.tonnage) }],
        }));
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="m-2 bg-white rounded-xl shadow-lg">
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </div>
  );
};

export default MonthlyConsumptionTrend;
