import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Sidebar } from '../../components/AdminComponents/Sidebar';

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
  TableFooter,
} from "@mui/material";

const API_URL = "http://192.168.1.199:8001/raw_material/api/forging-quality-report/";

const Dashboard = () => {
  const [filters, setFilters] = useState({ start_date: "", end_date: "" });
  const [data, setData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, { params: filters });
      setData(response.data || null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

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

    const sectionColors = {
      cnc: "#e6f7ff",
      forging: "#fff3e6",
      pre_mc: "#e6ffe6",
    };

    const groupedReasons = type === "machining" ? {
      cnc: ["cnc_height", "cnc_od", "cnc_bore", "cnc_groove", "cnc_dent", "cnc_rust"],
      forging: ["forging_height", "forging_od", "forging_bore", "forging_crack", "forging_dent"],
      pre_mc: ["pre_mc_bore", "pre_mc_od", "pre_mc_height"],
    } : null;

    const allRejectionReasons = type === "machining" && groupedReasons
      ? [...(groupedReasons.cnc || []), ...(groupedReasons.forging || []), ...(groupedReasons.pre_mc || [])]
      : Object.keys(tableData.components?.[Object.keys(tableData.components)?.[0]]?.rejection_reasons || {});

    const safeSearchQuery = searchQuery ? searchQuery.toLowerCase() : "";

    const sortedData = Object.entries(tableData.components)
      .filter(([key, value]) =>
        key.toLowerCase().includes(safeSearchQuery) || value.customer.toLowerCase().includes(safeSearchQuery)
      )
      .sort((a, b) => (b[1].production || 0) - (a[1].production || 0));

      const footerSums = sortedData.reduce((acc, [_, value]) => {
        acc.target = (acc.target || 0) + (value.target || 0);
        acc.production = (acc.production || 0) + (value.production || 0);
        acc.totalRejection = (acc.totalRejection || 0) + (value.forging_rejection || value.machining_rejection || 0);
        acc.rejectionCost = +( (acc.rejectionCost || 0) + (value.rejection_cost || 0) ).toFixed(2);

        acc.target_day = (acc.target_day || 0) + (value.target_day || 0);
        acc.production_day = (acc.production_day || 0) + (value.production_day || 0);
        acc.target_night = (acc.target_night || 0) + (value.target_night || 0);
        acc.production_night = (acc.production_night || 0) + (value.production_night || 0);

    
        // Calculate rejection percentage correctly
        acc.rejectionPercent = acc.production === 0 
            ? 0 
            : (acc.totalRejection / acc.production) * 100;
    
        if (type === "machining" && groupedReasons) {
            Object.entries(groupedReasons).forEach(([category, reasons]) => {
                reasons.forEach((reason) => {
                    acc[reason] = (acc[reason] || 0) + (value.rejection_reasons[reason] || 0);
                });
            });
        } else {
            allRejectionReasons.forEach((reason) => {
                acc[reason] = (acc[reason] || 0) + (value.rejection_reasons?.[reason] || 0);
            });
        }
    
        return acc;
    }, {});
    

    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h5>{title}</h5>
        </div>
        <TableContainer sx={{ overflowY: "auto" }}>
          <Table stickyHeader>
            <TableHead>
              {type === "machining" ? (
                <>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell rowSpan={2} sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
                      Cnc Machine
                    </TableCell>
                    <TableCell rowSpan={2} sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
                      Process
                    </TableCell>
                    <TableCell rowSpan={2} sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
                      Component
                    </TableCell>
                    <TableCell rowSpan={2} sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
                      Customer
                    </TableCell>
                    <TableCell rowSpan={2} sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
                      Cost/pic.
                    </TableCell>
                    <TableCell rowSpan={2} sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
                      Rejection Cost
                    </TableCell>
                    <TableCell rowSpan={2} sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
                      Target Day
                    </TableCell>
                    <TableCell rowSpan={2} sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
                      Production Day
                    </TableCell>
                    <TableCell rowSpan={2} sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
                      Target Night
                    </TableCell>
                    <TableCell rowSpan={2} sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
                      Production Night
                    </TableCell>
                    <TableCell rowSpan={2} sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
                      Total Target
                    </TableCell>
                    <TableCell rowSpan={2} sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
                      Total Production
                    </TableCell>
                    <TableCell rowSpan={2} sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
                      Total Rejection
                    </TableCell>
                    <TableCell rowSpan={2} sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
                      Rejection %
                    </TableCell>
                    {Object.entries(groupedReasons).map(([category, reasons]) => (
                      <TableCell
                        key={category}
                        colSpan={reasons.length + 2}
                        sx={{
                          position: "sticky",
                          top: 0,
                          zIndex: 1200,
                          padding: "1px",
                          fontWeight: "bold",
                          fontSize: ".9rem",
                          textAlign: "center",
                          backgroundColor: sectionColors[category],
                        }}
                      >
                        {category.toUpperCase()}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    {[...Array(8)].map((_, index) => (
                      <TableCell key={index} sx={{ display: "none" }} />
                    ))}
                    {Object.entries(groupedReasons).map(([category, reasons]) => (
                      <>
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
                              backgroundColor: sectionColors[category],
                            }}
                          >
                            {reason.replace(`${category}_`, "").toUpperCase()}
                          </TableCell>
                        ))}
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
                            backgroundColor: sectionColors[category],
                          }}
                        >
                          Total
                        </TableCell>
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
                            backgroundColor: sectionColors[category],
                          }}
                        >
                          Rejection %
                        </TableCell>
                      </>
                    ))}
                  </TableRow>
                </>
              ) : (
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
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
                    Target Day
                  </TableCell>
                  <TableCell sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
                    Production Day
                  </TableCell>
                  <TableCell sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
                    Target Night
                  </TableCell>
                  <TableCell sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
                    Production Night 
                  </TableCell>
                  <TableCell sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
                    Total Target
                  </TableCell>
                  <TableCell sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
                    total Production
                  </TableCell>
                  <TableCell sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
                    Total Rejection
                  </TableCell>
                  <TableCell sx={{ position: "sticky", top: 0, zIndex: 1200, padding: "1px", fontWeight: "bold", fontSize: ".9rem", textAlign: "center" }}>
                    Rejection %
                  </TableCell>
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
                        backgroundColor: type === "forging" ? sectionColors.forging : "#f5f5f5",
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
                sortedData.map(([key, value], index) => {
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
                          ? "#b3d9ff"
                          : index % 2 === 0
                          ? "#ffffff"
                          : "#f9f9f9",
                        transition: "background-color 0.3s ease",
                        "&:hover": { backgroundColor: "#b3d9ff !important" },
                      }}
                    >
                      {type === "forging" ? (
                        <TableCell sx={{ padding: "1px", textAlign: "center", backgroundColor: hoveredRow === key ? "#b3d9ff" : (value.rejection_percent || 0) > 100 ? "#ffcccc" : "inherit" }}>
                          {value.unique_lines?.join(", ") || "N/A"}
                        </TableCell>
                      ) : (
                        <TableCell sx={{ padding: "1px", textAlign: "center", backgroundColor: hoveredRow === key ? "#b3d9ff" : (value.rejection_percent || 0) > 100 ? "#ffcccc" : "inherit" }}>
                          {value.unique_machine_nos?.join(", ") || "N/A"}
                        </TableCell>
                      )}
                      {type === "machining" && (
                      <TableCell sx={{ padding: "1px", textAlign: "center" }}>
                        {value.process || "N/A"}
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
                          {value.unique_formans?.join(", ") || "N/A"}
                        </TableCell>
                      )}
                      <TableCell sx={{ padding: "1px", textAlign: "center", backgroundColor: hoveredRow === key ? "#b3d9ff" : (value.rejection_percent || 0) > 100 ? "#ffcccc" : "inherit" }}>
                        {value.rejection_cost}
                      </TableCell>
                      <TableCell sx={{ padding: "1px", textAlign: "center", backgroundColor: hoveredRow === key ? "#b3d9ff" : (value.rejection_percent || 0) > 100 ? "#ffcccc" : "inherit" }}>
                        {value.target_day}
                      </TableCell>
                      <TableCell sx={{ padding: "1px", textAlign: "center", backgroundColor: hoveredRow === key ? "#b3d9ff" : (value.rejection_percent || 0) > 100 ? "#ffcccc" : "inherit" }}>
                        {value.production_day}
                      </TableCell>
                      <TableCell sx={{ padding: "1px", textAlign: "center", backgroundColor: hoveredRow === key ? "#b3d9ff" : (value.rejection_percent || 0) > 100 ? "#ffcccc" : "inherit" }}>
                        {value.target_night}
                      </TableCell>
                      <TableCell sx={{ padding: "1px", textAlign: "center", backgroundColor: hoveredRow === key ? "#b3d9ff" : (value.rejection_percent || 0) > 100 ? "#ffcccc" : "inherit" }}>
                        {value.production_night}
                      </TableCell>
                      {(type === "machining" || type === "machining1" || type === "machining2" || type === "forging") && (
                        <TableCell
                          sx={{
                            padding: "1px",
                            textAlign: "center",
                            backgroundColor:
                              hoveredRow === key
                                ? "#b3d9ff"
                                : (value.rejection_percent || 0) > 100
                                ? "#ffcccc"
                                : "inherit",
                          }}
                        >
                          {typeof value.target === "number" ? value.target : "0"}
                        </TableCell>
                      )}
                      <TableCell sx={{ padding: "1px", textAlign: "center", backgroundColor: hoveredRow === key ? "#b3d9ff" : (value.rejection_percent || 0) > 100 ? "#ffcccc" : "inherit" }}>
                        {value.production}
                      </TableCell>
                      <TableCell sx={{ padding: "1px", textAlign: "center", backgroundColor: hoveredRow === key ? "#b3d9ff" : (value.rejection_percent || 0) > 100 ? "#ffcccc" : "inherit" }}>
                        {value.forging_rejection || value.machining_rejection}
                      </TableCell>
                      <TableCell sx={{ padding: "1px", textAlign: "center", backgroundColor: hoveredRow === key ? "#b3d9ff" : (value.rejection_percent || 0) > 2 ? "#ffcccc" : "inherit" }}>
                        {value.rejection_percent || 0}%
                      </TableCell>
                      {(type === "machining" || type === "machining1" || type === "machining2" || type === "machining3") &&
                        Object.entries(groupedReasons).map(([category, reasons]) => (
                          <>
                            {reasons.map((reason) => (
                              <TableCell
                                key={reason}
                                sx={{
                                  padding: "1px",
                                  textAlign: "center",
                                  backgroundColor: hoveredRow === key ? "#b3d9ff" : sectionColors[category],
                                }}
                              >
                                {value.rejection_reasons[reason] || 0}
                              </TableCell>
                            ))}
                            <TableCell
                              key={`total-${category}`}
                              sx={{
                                padding: "1px",
                                textAlign: "center",
                                backgroundColor: hoveredRow === key ? "#b3d9ff" : sectionColors[category],
                              }}
                            >
                              {categoryTotals[category] || 0}
                            </TableCell>
                            <TableCell
                              key={`rejection-percent-${category}`}
                              sx={{
                                padding: "1px",
                                textAlign: "center",
                                backgroundColor: hoveredRow === key ? "#b3d9ff" : sectionColors[category],
                              }}
                            >
                              {categoryRejectionPercentages[category] || 0}%
                            </TableCell>
                          </>
                        ))}
                      {(type !== "machining" && type !== "machining1" && type !== "machining2" && type !== "machining3") &&
                        allRejectionReasons.map((reason) => (
                          <TableCell
                            key={reason}
                            sx={{
                              padding: "1px",
                              textAlign: "center",
                              backgroundColor: hoveredRow === key ? "#b3d9ff" : sectionColors.forging,
                            }}
                          >
                            {value.rejection_reasons?.[reason] || 0}
                          </TableCell>
                        ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
            <TableFooter>
  <TableRow>
    <TableCell colSpan={type === "forging" ? 5 : 5} sx={{ fontWeight: "bold", textAlign: "center" }}>
      Total
    </TableCell>
    <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
      {footerSums.rejectionCost || 0}
    </TableCell>
    <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
      {footerSums.target_day || 0}
    </TableCell>
    <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
      {footerSums.production_day || 0}
    </TableCell>
    <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
      {footerSums.target_night || 0}
    </TableCell>
    <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
      {footerSums.production_night || 0}
    </TableCell>
    <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
      {footerSums.target || 0}
    </TableCell>
    <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
      {footerSums.production || 0}
    </TableCell>
    <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
      {footerSums.totalRejection || 0}
    </TableCell>
    <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
      {footerSums.rejectionPercent ? footerSums.rejectionPercent.toFixed(2) + "%" : "0.00%"}
    </TableCell>
    {type === "machining" && groupedReasons
      ? Object.entries(groupedReasons).map(([category, reasons]) => (
          <React.Fragment key={category}>
            {reasons.map((reason) => (
              <TableCell
                key={reason}
                sx={{ fontWeight: "bold", textAlign: "center" }}
              >
                {footerSums[reason] || 0}
              </TableCell>
            ))}
            <TableCell
              key={`total-${category}`}
              sx={{ fontWeight: "bold", textAlign: "center" }}
            >
              {reasons.reduce((sum, reason) => sum + (footerSums[reason] || 0), 0)}
            </TableCell>
            <TableCell
              key={`rejection-percent-${category}`}
              sx={{ fontWeight: "bold", textAlign: "center" }}
            >
              {footerSums.production === 0
                ? "0.00%"
                : ((reasons.reduce((sum, reason) => sum + (footerSums[reason] || 0), 0) /
                    footerSums.production) * 100).toFixed(2) + "%"}
            </TableCell>
          </React.Fragment>
        ))
      : allRejectionReasons.map((reason) => (
          <TableCell
            key={reason}
            sx={{ fontWeight: "bold", textAlign: "center" }}
          >
            {footerSums[reason] || 0}
          </TableCell>
        ))}
  </TableRow>
</TableFooter>

            
          </Table>
        </TableContainer>
      </>
    );
  };

  const renderCombinedMachiningTable = () => {
    // Collect data from all machining tables separately without merging
    const combinedData = {
        components: {}
    };

    const addComponents = (sourceData, source, process) => {
        Object.entries(sourceData || {}).forEach(([key, value]) => {
            if (value) {
                // Ensure unique keys by appending the source name if needed
                const uniqueKey = `${key} ${source}`;
                combinedData.components[uniqueKey] = { ...value, source, process };
            }
        });
    };

    addComponents(data?.machining?.components, ".", "CNC");
    addComponents(data?.machining1?.components, "..", "Broch");
    addComponents(data?.machining2?.components, "-", "VMC");
    addComponents(data?.machining3?.components, "_", "CF");

    return renderTable("Combined Machining Data", combinedData, "machining");
};



  return (
    <div className="p-2 grid gap-2 mt-24">
      <Sidebar />
      <div className="flex gap-2">
        <TextField type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} />
        <TextField type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} />
        <Button variant="contained" onClick={fetchData}>Apply Filters</Button>
      </div>

  

      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        onChange={handleSearchChange}
      />

      {renderTable("Forging Data", data?.forging, "forging")}
      {renderCombinedMachiningTable()}
    </div>
  );
};

export default Dashboard;