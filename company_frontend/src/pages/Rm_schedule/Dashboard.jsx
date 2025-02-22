import React from "react";
import KPIHighlights from "./KPIHighlights";
import GraphicalAnalysis from "./GraphicalAnalysis";
import DataTable from "./DataTable";

const Dashboard = ({ data }) => {
  // Check if data is empty or contains a placeholder indicating no data
  if (!data || data.length === 0 || data[0]?.noData) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-300 p-4">
        No data available for this month.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <KPIHighlights data={data} />
      <GraphicalAnalysis data={data} />
      <DataTable data={data} />
    </div>
  );
};

export default Dashboard;
