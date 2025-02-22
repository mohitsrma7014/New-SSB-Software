import { useState, useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const GraphicalAnalysis = ({ data = [] }) => {
  const safeData = Array.isArray(data) ? data : [];

  // First Graph: Customer & Location-wise Tonnage
  const customerTonnageOptions = useMemo(() => {
    const customerMap = {};

    safeData.forEach(({ customer, weight, pices }) => {
      if (!customerMap[customer]) {
        customerMap[customer] = { tonnage: 0, pices: 0 };
      }

      customerMap[customer].tonnage += (parseFloat(weight) || 0) / 1000;
      customerMap[customer].pices += parseInt(pices) || 0;
    });

    // Convert customerMap to array & sort in descending order by tonnage
    const sortedData = Object.entries(customerMap)
      .map(([customer, { tonnage, pices }]) => ({
        name: customer,
        y: parseFloat(tonnage.toFixed(2)),
        pices: pices
      }))
      .sort((a, b) => b.y - a.y); // Sorting in descending order

    return {
      chart: { 
        type: "bar", 
        backgroundColor: "transparent", 
        style: { fontFamily: "Arial, sans-serif" }
      },
      title: { 
        text: "Customer-wise Tonnage & Pieces", 
        style: { color: "#333", fontSize: "18px", fontWeight: "bold" } 
      },
      xAxis: { 
        type: "category",
        labels: { style: { color: "#555", fontSize: "12px" } }
      },
      yAxis: { 
        title: { text: "Tons", style: { color: "#555", fontSize: "14px" } },
        labels: { style: { color: "#777", fontSize: "12px" } }
      },
      series: [{ 
        name: "Tons", 
        data: sortedData,
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 1, y2: 0 }, // Horizontal gradient
          stops: [
            [0, "#A6C1EE"],  // Light blue
            [1, "#D4E4FC"]   // Softer blue
          ]
        }
      }],
      
      
      tooltip: { 
        formatter: function () {
          return `<b>${this.point.name}</b><br/>
                  Tonnage: <b>${this.point.y.toFixed(2)} Tons</b><br/>
                  Pieces: <b>${this.point.pices}</b>`;
        },
        backgroundColor: "#fff",
        borderColor: "#ddd",
        style: { color: "#333", fontSize: "12px" }
      },
      plotOptions: {
        bar: {
          borderRadius: 5,
          dataLabels: { enabled: true, style: { fontSize: "12px", color: "#444" } }
        }
      },
      credits: { enabled: false } // Hide Highcharts credits
    };
}, [safeData]);



  // Second Graph: Delivery Rating (Grouped by Customer & Location)
  const deliveryRatingOptions = useMemo(() => {
    const deliveryMap = {};
  
    safeData.forEach(({ customer, location, total_schedule_pices, dispatched, weight, slug_weight }) => {
      const key = `${customer} - ${location}`;
      if (!deliveryMap[key]) {
        deliveryMap[key] = { total: 0, dispatched: 0, totalWeight: 0, dispatchedWeight: 0 };
      }
      
      // Sum total scheduled pieces & dispatched pieces
      deliveryMap[key].total += total_schedule_pices || 0;
      deliveryMap[key].dispatched += dispatched || 0;
      
      // Sum total scheduled weight (in tons)
      deliveryMap[key].totalWeight += parseFloat(weight) || 0;
      
      // Calculate dispatched weight using dispatched pieces * slug weight, then convert to tons
      if (dispatched > 0 && slug_weight) {
        deliveryMap[key].dispatchedWeight += (dispatched * parseFloat(slug_weight)) / 1000;
      }
    });
  
    let categories = Object.keys(deliveryMap);
    let data = categories.map((key) => ({
      categoryLabel: key, // Store label for sorting reference
      y: deliveryMap[key].total ? (deliveryMap[key].dispatched / deliveryMap[key].total) * 100 : 0, 
      totalPices: deliveryMap[key].total,
      dispatchedPices: deliveryMap[key].dispatched,
      scheduledTonnage: (deliveryMap[key].totalWeight / 1000).toFixed(2), // Convert kg to tons
      dispatchedTonnage: deliveryMap[key].dispatchedWeight.toFixed(2),  // Now correctly calculated
    }));
  
    // Sort data in descending order based on delivery rating percentage
    data.sort((a, b) => b.y - a.y);
    
    // Extract sorted categories
    categories = data.map(item => item.categoryLabel);
  
    return {
      chart: { 
        type: "column", 
        backgroundColor: "transparent", 
        style: { fontFamily: "Arial, sans-serif" } 
      },
      title: { 
        text: "Delivery Rating (by Customer & Location)",
        style: { fontSize: "16px", fontWeight: "bold", color: "#333" }
      },
      xAxis: { 
        categories,
        labels: { style: { fontSize: "12px", color: "#555" } }
      },
      yAxis: { 
        title: { text: "Delivery Rating (%)", style: { fontSize: "14px", color: "#333" } },
        gridLineColor: "#e0e0e0"
      },
      tooltip: {
        backgroundColor: "#fff",
        borderColor: "#bbb",
        borderRadius: 8,
        shadow: true,
        useHTML: true,
        style: { fontSize: "12px", color: "#333" },
        formatter: function () {
          return `<b style="font-size:14px">${this.point.categoryLabel}</b><br/>
                  <span style="color:#0088cc">Delivery Rating:</span> <b>${this.y.toFixed(2)}%</b><br/>
                  <span style="color:#28a745">Total Scheduled Pieces:</span> <b>${this.point.totalPices}</b><br/>
                  <span style="color:#dc3545">Dispatched Pieces:</span> <b>${this.point.dispatchedPices}</b><br/>
                  <span style="color:#17a2b8">Scheduled Tonnage:</span> <b>${this.point.scheduledTonnage} Tons</b><br/>
                  <span style="color:#ffc107">Dispatched Tonnage:</span> <b>${this.point.dispatchedTonnage} Tons</b>`;
        }
      },
      plotOptions: {
        column: {
          borderRadius: 6,
          dataLabels: {
            enabled: true,
            format: "{y:.2f}%",
            style: { fontSize: "12px", fontWeight: "bold", color: "#333" }
          }
        }
      },
      series: [{
        name: "Customer",
        data,
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, // Vertical gradient
          stops: [
            [0, "#7AB8F5"],  // Light blue at the top
            [1, "#D3E7FF"]   // Softer blue at the bottom
          ]
        }
      }],
      
      credits: { enabled: false } // Remove Highcharts watermark
    };
  }, [safeData]);
  
  const [gradeFilter, setGradeFilter] = useState("");

  // Extract unique grades
  const allGrades = useMemo(
    () => [...new Set(safeData.map(({ grade }) => grade))],
    [safeData]
  );

  // Filter grades based on user input
  const filteredGrades = useMemo(() => {
    return allGrades.filter((grade) =>
      grade.toLowerCase().includes(gradeFilter.toLowerCase())
    );
  }, [allGrades, gradeFilter]);

 // Grade-wise Tonnage Chart
const gradeTonnageOptions = useMemo(() => {
  const gradeMap = {};

  safeData.forEach(({ grade, weight }) => {
    gradeMap[grade] = parseFloat(
      ((gradeMap[grade] || 0) + (parseFloat(weight) || 0) / 1000).toFixed(2)
    );
  });

  let sortedEntries = Object.entries(gradeMap).sort((a, b) => b[1] - a[1]);

  if (gradeFilter) {
    sortedEntries = sortedEntries.filter(([grade]) =>
      grade.toLowerCase().includes(gradeFilter.toLowerCase())
    );
  }

  return {
    chart: { type: "column", backgroundColor: "transparent", animation: true },
    title: {
      text: "Grade-wise Tonnage Distribution",
      style: { fontSize: "16px", fontWeight: "bold" },
    },
    xAxis: {
      categories: sortedEntries.map(([grade]) => grade),
      labels: { style: { fontSize: "12px", color: "#666" } },
      gridLineColor: "rgba(200, 200, 200, 0.2)",
    },
    yAxis: {
      title: { text: "Tonnes", style: { fontSize: "14px", color: "#666" } },
      gridLineColor: "rgba(200, 200, 200, 0.2)",
    },
    series: [
      {
        name: "Grade",
        data: sortedEntries.map(([, tonnage]) => tonnage),
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, // Vertical gradient
          stops: [
            [0, "#4A90E2"],  // Rich blue at the top
            [1, "#B3D4FF"]   // Light blue at the bottom
          ]
        }
      }
    ],
    
    plotOptions: {
      column: {
        borderRadius: 6,
        dataLabels: {
          enabled: true,
          format: "{y:.2f}Ton",
          style: { fontSize: "12px", fontWeight: "bold", color: "#333" }
        }
      }
    },
    credits: { enabled: false },
  };
}, [safeData, gradeFilter]);

// Grade & Diameter-wise Tonnage Chart
const gradeDiaTonnageOptions = useMemo(() => {
  const gradeDiaMap = {};

  safeData.forEach(({ grade, dia, weight }) => {
    const key = `${grade} - Dia ${dia}`;
    gradeDiaMap[key] =
      (gradeDiaMap[key] || 0) + parseFloat(weight) / 1000; // Convert to tonnes
  });

  Object.keys(gradeDiaMap).forEach((key) => {
    gradeDiaMap[key] = parseFloat(gradeDiaMap[key].toFixed(2));
  });

  let sortedEntries = Object.entries(gradeDiaMap).sort((a, b) => b[1] - a[1]);

  if (gradeFilter) {
    sortedEntries = sortedEntries.filter(([key]) =>
      key.toLowerCase().includes(gradeFilter.toLowerCase())
    );
  }

  return {
    chart: { type: "bar", backgroundColor: "transparent", animation: true },
    title: {
      text: "Grade & Diameter-wise Tonnage Distribution",
      style: { fontSize: "16px", fontWeight: "bold" },
    },
    xAxis: {
      categories: sortedEntries.map(([key]) => key),
      labels: { style: { fontSize: "12px", color: "#666" } },
      gridLineColor: "rgba(200, 200, 200, 0.2)",
    },
    yAxis: {
      title: { text: "Tonnage ", style: { fontSize: "14px", color: "#666" } },
      gridLineColor: "rgba(200, 200, 200, 0.2)",
    },
    legend: { enabled: false },

    series: [
      {
        name: "Tonnage",
        data: sortedEntries.map(([, tonnage]) => tonnage),
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 1, y2: 0 }, // Horizontal gradient
          stops: [
            [0, "#28a745"],  // Green at the start
            [1, "#A0E8AF"]   // Light green at the end
          ]
        }
      }
    ],
    
    plotOptions: {
      column: {
        borderRadius: 6,
        dataLabels: {
          enabled: true,
          format: "{y:.2f}Ton",
          style: { fontSize: "12px", fontWeight: "bold", color: "#333" }
        }
      }
    },
    credits: { enabled: false },
  };
}, [safeData, gradeFilter]);



  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 text-black">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <HighchartsReact highcharts={Highcharts} options={customerTonnageOptions} />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <HighchartsReact highcharts={Highcharts} options={deliveryRatingOptions} />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <strong className="block mb-2">Filter by Grade:</strong>
        <input
          type="text"
          placeholder="Search grade..."
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full"
        />
      
        <HighchartsReact highcharts={Highcharts} options={gradeTonnageOptions} />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <HighchartsReact highcharts={Highcharts} options={gradeDiaTonnageOptions} />
      </div>
    </div>
  );
};

export default GraphicalAnalysis;
