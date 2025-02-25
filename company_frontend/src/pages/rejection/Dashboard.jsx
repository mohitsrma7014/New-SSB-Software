import React, { useState, useEffect } from "react";
import axios from "axios";
import { Sidebar } from '../../components/AdminComponents/Sidebar';
import * as XLSX from 'xlsx';

import {
  Card,
  CardContent,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Skeleton,
  Button,
} from "@mui/material";

const API_URL = "http://192.168.1.199:8001/raw_material/api/forging-quality-report/";

const Dashboard = () => {
  const [filters, setFilters] = useState({ start_date: "", end_date: "" });
  const [data, setData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);

  const exportToExcel = (tableData, fileName) => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
  
    // Convert table data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(tableData);
  
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
    // Write the workbook to a file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, { params: filters });
  
      if (!response.data || Object.keys(response.data).length === 0) {
        setData(null); // Ensure data is set to null for proper handling
      } else {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData(null); // Handle case where request fails
    }
    setLoading(false);
  };
  

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const formatRejectionReasons = (allReasons) => {
    const groupedReasons = { cnc: [], forging: [], pre_mc: [] };
    allReasons.forEach((reason) => {
      const [category, subReason] = reason.split("_");
      if (groupedReasons[category]) {
        groupedReasons[category].push(subReason);
      }
    });
    return groupedReasons;
  };

  const renderTable = (title, tableData, type) => {
    if (!tableData || !tableData.components) {
      return <div className="text-gray-500 font-semibold text-center">No Data Available</div>;
    }
  
    // Define colors for each section
    const sectionColors = {
      cnc: "#e6f7ff", // Light blue for CNC
      forging: "#fff3e6", // Light orange for Forging
      pre_mc: "#e6ffe6", // Light green for Pre-MC
    };
  
    // Group rejection reasons into categories (only for Machining table)
    const groupedReasons =
    type === "machining" || type === "machining1"
      ? {
          cnc: ["cnc_height", "cnc_od", "cnc_bore", "cnc_groove", "cnc_dent", "cnc_rust"],
          forging: ["forging_height", "forging_od", "forging_bore", "forging_crack", "forging_dent"],
          pre_mc: ["pre_mc_bore", "pre_mc_od", "pre_mc_height"],
        }
      : null;
  
  // Extract all rejection reasons safely
  const allRejectionReasons =
    (type === "machining" || type === "machining1") && groupedReasons
      ? [...(groupedReasons.cnc || []), ...(groupedReasons.forging || []), ...(groupedReasons.pre_mc || [])]
      : Object.keys(tableData.components?.[Object.keys(tableData.components)?.[0]]?.rejection_reasons || {});
  
    // Ensure searchQuery is always a string to prevent errors
    const safeSearchQuery = searchQuery ? searchQuery.toLowerCase() : "";
  
    // Sort and filter data safely
    const sortedData = Object.entries(tableData.components)
      .filter(([key, value]) =>
        key.toLowerCase().includes(safeSearchQuery) || value.customer.toLowerCase().includes(safeSearchQuery)
      )
      .sort((a, b) => (b[1].production || 0) - (a[1].production || 0));

      // Function to handle export to Excel
  const handleExport = () => {
    const exportData = sortedData.map(([key, value]) => ({
      Component: key,
      Customer: value.customer,
      'Cost/pic.': value.cost_per_piece,
      'Rejection Cost': value.rejection_cost,
      Production: value.production,
      'Total Rejection': value.forging_rejection || value.machining_rejection,
      'Rejection %': value.rejection_percent || 0,
      ...value.rejection_reasons,
    }));

    exportToExcel(exportData, `${title}_${new Date().toISOString().split('T')[0]}`);
  };
  
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4>{title}</h4>
        <Button variant="contained" onClick={handleExport}>Export to Excel</Button>
      </div>
        <TableContainer sx={{ maxHeight: 400, overflowY: "auto" }}>
          <Table stickyHeader>
          <TableHead>
  {/* Conditional Header Logic */}
  {(type === "machining" || type === "machining1")  ? (
    // Two-row header for Machining table
    <>
      {/* First Row: Section Headers (CNC, Forging, Pre-MC) */}
      <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
        {/* Static Columns */}
        <TableCell
          rowSpan={2} // Span across both header rows
          sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}
        >
          Cnc Machine
        </TableCell>
        <TableCell
          rowSpan={2} // Span across both header rows
          sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}
        >
          Component
        </TableCell>
        <TableCell
          rowSpan={2} // Span across both header rows
          sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}
        >
          Customer
        </TableCell>
        <TableCell
          rowSpan={2} // Span across both header rows
          sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}
        >
          Cost/pic.
        </TableCell>
        <TableCell
          rowSpan={2} // Span across both header rows
          sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}
        >
          Rejection Cost
        </TableCell>
        <TableCell
          rowSpan={2} // Span across both header rows
          sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}
        >
          Production
        </TableCell>
        <TableCell
          rowSpan={2} // Span across both header rows
          sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}
        >
          Total Rejection
        </TableCell>
        <TableCell
          rowSpan={2} // Span across both header rows
          sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}
        >
          Rejection %
        </TableCell>

        {/* Section Headers for CNC, Forging, Pre-MC */}
        {Object.entries(groupedReasons).map(([category, reasons]) => (
          <TableCell
            key={category}
            colSpan={reasons.length + 2} // Span across all columns for this category
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1200,
              padding: "1px",
              fontWeight: "bold",
              fontSize: ".9rem",
              textAlign: "center",
              backgroundColor: sectionColors[category], // Apply section color
            }}
          >
            {category.toUpperCase()}
          </TableCell>
        ))}
      </TableRow>

      {/* Second Row: Column Headers (Height, OD, Bore, Total, Rejection %, etc.) */}
      <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
        {/* Empty cells for static columns (already spanned in the first row) */}
        {[...Array(8)].map((_, index) => (
          <TableCell key={index} sx={{ display: "none" }} />
        ))}

        {/* Column Headers for CNC, Forging, Pre-MC */}
        {Object.entries(groupedReasons).map(([category, reasons]) => (
          <>
            {/* Rejection Reason Columns */}
            {reasons.map((reason) => (
              <TableCell
                key={reason}
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: 1200,
                  padding: "1px",
                  fontWeight: "bold",
                  fontSize: ".9rem",
                  textAlign: "center",
                  backgroundColor: sectionColors[category], // Apply section color
                }}
              >
                {reason.replace(`${category}_`, "").toUpperCase()}
              </TableCell>
            ))}

            {/* Total Column */}
            <TableCell
              key={`total-${category}`}
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 1200,
                padding: "1px",
                fontWeight: "bold",
                fontSize: ".9rem",
                textAlign: "center",
                backgroundColor: sectionColors[category], // Apply section color
              }}
            >
              Total
            </TableCell>

            {/* Rejection % Column */}
            <TableCell
              key={`rejection-percent-${category}`}
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 1200,
                padding: "1px",
                fontWeight: "bold",
                fontSize: ".9rem",
                textAlign: "center",
                backgroundColor: sectionColors[category], // Apply section color
              }}
            >
              Rejection %
            </TableCell>
          </>
        ))}
      </TableRow>
    </>
  ) : (
    // Single-row header for Forging and Machining1 tables
    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
      {/* Static Columns */}
      {type === "forging" ? (
        <TableCell sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
          Lines
        </TableCell>
      ) : (
        <TableCell sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
          Cnc Machine
        </TableCell>
      )}
      <TableCell sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
        Component
      </TableCell>
      <TableCell sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
        Customer
      </TableCell>
      <TableCell sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
        Cost/pic.
      </TableCell>
      {type === "forging" && (
        <TableCell sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
          Forman
        </TableCell>
      )}
      <TableCell sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
        Rejection Cost
      </TableCell>
      <TableCell sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
        Production
      </TableCell>
      <TableCell sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
        Total Rejection
      </TableCell>
      <TableCell sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
        Rejection %
      </TableCell>

      {/* Flat Rejection Reasons (for Forging and Machining1 tables) */}
      {allRejectionReasons.map((reason) => (
        <TableCell
          key={reason}
          sx={{
            padding: "1px",
            top: 0,
            zIndex: 1200,
            position: "sticky",
            fontWeight: "bold",
            fontSize: ".9rem",
            textAlign: "center",
            backgroundColor: type === "forging" ? sectionColors.forging : "#f5f5f5", // Apply forging color or default
          }}
        >
          {reason}
        </TableCell>
      ))}
    </TableRow>
  )}
</TableHead>
  
            <TableBody>
              {loading ? (
                // Skeleton Loader for Table Rows
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {[...Array(type === "forging" ? 9 + allRejectionReasons.length : 8 + allRejectionReasons.length)].map((_, i) => (
                      <TableCell key={i} sx={{ padding: "1px", textAlign: "center" }}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                // Actual Table Data
                sortedData.map(([key, value], index) => {
                  // Calculate totals and rejection percentages for each category
                  const categoryTotals = type === "machining" && groupedReasons
                    ? Object.entries(groupedReasons).reduce((acc, [category, reasons]) => {
                        acc[category] = reasons.reduce((sum, reason) => sum + (value.rejection_reasons[reason] || 0), 0);
                        return acc;
                      }, {})
                    : {};
  
                  const categoryRejectionPercentages = type === "machining" && groupedReasons
                    ? Object.entries(categoryTotals).reduce((acc, [category, totalRejections]) => {
                        acc[category] = value.production === 0
                          ? "0.00"
                          : ((totalRejections / value.production) * 100).toFixed(2);
                        return acc;
                      }, {})
                    : {};
  
                  return (
                    <TableRow
  key={key}
  onMouseEnter={() => setHoveredRow(key)}
  onMouseLeave={() => setHoveredRow(null)}
  sx={{
    backgroundColor: hoveredRow === key
      ? "#b3d9ff" // Highlight color when hovered (light blue)
      : index % 2 === 0
      ? "#ffffff" // White for even rows
      : "#f9f9f9", // Light gray for odd rows
    transition: "background-color 0.3s ease", // Smooth transition
    "&:hover": { backgroundColor: "#b3d9ff !important" }, // Ensure hover effect takes precedence
  }}
>
  {/* Static Columns */}
  {type === "forging" ? (
    <TableCell sx={{ padding: "1px", textAlign: "center", backgroundColor: hoveredRow === key ? "#b3d9ff" : (value.rejection_percent || 0) > 100 ? "#ffcccc" : "inherit" }}>
      {value.unique_lines?.join(", ") || "N/A"}
    </TableCell>
  ) : (
    <TableCell sx={{ padding: "1px", textAlign: "center", backgroundColor: hoveredRow === key ? "#b3d9ff" : (value.rejection_percent || 0) > 100 ? "#ffcccc" : "inherit" }}>
      {value.unique_machine_numbers?.join(", ") || "N/A"}
    </TableCell>
  )}
  <TableCell sx={{ padding: "1px", textAlign: "center", backgroundColor: hoveredRow === key ? "#b3d9ff" : (value.rejection_percent || 0) > 100 ? "#ffcccc" : "inherit" }}>
    {key}
  </TableCell>
  <TableCell sx={{ padding: "1px", textAlign: "center", backgroundColor: hoveredRow === key ? "#b3d9ff" : (value.rejection_percent || 0) > 100 ? "#ffcccc" : "inherit" }}>
    {value.customer}
  </TableCell>
  <TableCell sx={{ padding: "1px", textAlign: "center", backgroundColor: hoveredRow === key ? "#b3d9ff" : (value.rejection_percent || 0) > 100 ? "#ffcccc" : "inherit" }}>
    {value.cost_per_piece}
  </TableCell>
  {type === "forging" && (
    <TableCell sx={{ padding: "1px", textAlign: "center", backgroundColor: hoveredRow === key ? "#b3d9ff" : (value.rejection_percent || 0) > 100 ? "#ffcccc" : "inherit" }}>
      {value.unique_forman?.join(", ") || "N/A"}
    </TableCell>
  )}
  <TableCell sx={{ padding: "1px", textAlign: "center", backgroundColor: hoveredRow === key ? "#b3d9ff" : (value.rejection_percent || 0) > 100 ? "#ffcccc" : "inherit" }}>
    {value.rejection_cost}
  </TableCell>
  <TableCell sx={{ padding: "1px", textAlign: "center", backgroundColor: hoveredRow === key ? "#b3d9ff" : (value.rejection_percent || 0) > 100 ? "#ffcccc" : "inherit" }}>
    {value.production}
  </TableCell>
  <TableCell sx={{ padding: "1px", textAlign: "center", backgroundColor: hoveredRow === key ? "#b3d9ff" : (value.rejection_percent || 0) > 100 ? "#ffcccc" : "inherit" }}>
    {value.forging_rejection || value.machining_rejection}
  </TableCell>
  <TableCell sx={{ padding: "1px", textAlign: "center", backgroundColor: hoveredRow === key ? "#b3d9ff" : (value.rejection_percent || 0) > 2 ? "#ffcccc" : "inherit" }}>
    {value.rejection_percent || 0}%
  </TableCell>

  {/* Rejection Reasons Data */}
  {(type === "machining" || type === "machining1")  &&
    Object.entries(groupedReasons).map(([category, reasons]) => (
      <>
        {/* Rejection Reason Data */}
        {reasons.map((reason) => (
          <TableCell
            key={reason}
            sx={{
              padding: "1px",
              textAlign: "center",
              backgroundColor: hoveredRow === key ? "#b3d9ff" : sectionColors[category], // Apply section color or hover color
            }}
          >
            {value.rejection_reasons[reason] || 0}
          </TableCell>
        ))}

        {/* Total Column Data */}
        <TableCell
          key={`total-${category}`}
          sx={{
            padding: "1px",
            textAlign: "center",
            backgroundColor: hoveredRow === key ? "#b3d9ff" : sectionColors[category], // Apply section color or hover color
          }}
        >
          {categoryTotals[category] || 0}
        </TableCell>

        {/* Rejection % Column Data */}
        <TableCell
          key={`rejection-percent-${category}`}
          sx={{
            padding: "1px",
            textAlign: "center",
            backgroundColor: hoveredRow === key ? "#b3d9ff" : sectionColors[category], // Apply section color or hover color
          }}
        >
          {categoryRejectionPercentages[category] || 0}%
        </TableCell>
      </>
    ))}
   {/* {(type === "machining" || type === "machining1")  */}
  {/* Flat Rejection Reasons (for Forging table) */}
  {(type !== "machining" && type !== "machining1") &&
  allRejectionReasons.map((reason) => (
    <TableCell
      key={reason}
      sx={{
        padding: "1px",
        textAlign: "center",
        backgroundColor: hoveredRow === key ? "#b3d9ff" : sectionColors.forging, // Apply forging color or hover color
      }}
    >
      {value.rejection_reasons?.[reason] || 0} {/* Added optional chaining to avoid errors */}
    </TableCell>
  ))}

</TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };

  return (
    <div className="p-2 grid gap-2 mt-24">
      <Sidebar />
      <div className="flex gap-2">
        <TextField type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} />
        <TextField type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} />
        <Button variant="contained" onClick={fetchData}>Apply Filters</Button>
      </div>

      <div className="grid grid-cols-8 gap-1">
  {loading ? (
    // Skeleton Loader for Cards
    Array.from({ length: 8 }).map((_, index) => (
      <Card key={index}>
        <CardContent>
          <Skeleton variant="text" width="100%" height={30} />
        </CardContent>
      </Card>
    ))
  ) : data ? (
    // Actual Card Data when data is available
    <>
      <Card><CardContent>Total Forging Production: {data.forging?.total_production || 0} Pcs.</CardContent></Card>
      <Card><CardContent>Total Forging Rejection: {data.forging?.total_rejection || 0} Pcs.</CardContent></Card>
      <Card><CardContent>Forging Rejection Percent: {data.forging?.rejection_percent || 0}%</CardContent></Card>
      <Card><CardContent>Forging Rejection Cost (rs): {data.forging?.total_rejection_cost || 0} Rs</CardContent></Card>
      <Card><CardContent>Total Machining Production: {data.machining?.total_production || 0} Pcs.</CardContent></Card>
      <Card><CardContent>Total Machining Rejection: {data.machining?.total_rejection || 0} Pcs.</CardContent></Card>
      <Card><CardContent>Machining Rejection %: {data.machining?.rejection_percent || 0}%</CardContent></Card>
      <Card><CardContent>Machining Rejection Cost (rs): {data.machining?.total_rejection_cost || 0} Rs</CardContent></Card>
    </>
  ) : (
    // Show a message when no data is available
    <Card className="col-span-8">
      <CardContent className="text-center text-gray-500 font-semibold">
        No Data Available
      </CardContent>
    </Card>
  )}
</div>


      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        onChange={handleSearchChange}
      />

      {renderTable("Forging Data", data?.forging, "forging")}
      {renderTable("Machining Data", data?.machining, "machining")}
      {renderTable("Broching Data", data?.machining1, "machining1")}
    </div>
  );
};

export default Dashboard;