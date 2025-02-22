import React, { useState, useEffect } from "react";
import axios from "axios";
import { Sidebar } from './Sidebar';

const BulkAddForm = () => {
  const [date, setDate] = useState("");
  const [shift, setShift] = useState("");
  const [verifiedBy, setVerifiedBy] = useState("");
  const [rows, setRows] = useState([
    {
      batch_number: "",
      component: "",
      customer: "",
      slug_weight: "",
      rm_grade: "",
      heat_number: "",
      line: "",
      line_incharge: "",
      forman: "",
      target1: "",
      total_production:"",
      remaining :"",
      target: "",
      production: "",
      rework: "",
      up_setting: "",
      half_piercing: "",
      full_piercing: "",
      ring_rolling: "",
      sizing: "",
      overheat: "",
      bar_crack_pcs: "",
    },
  ]);
  const [rowSuggestions, setRowSuggestions] = useState([]); // To store suggestions for each row
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const shiftOptions = ["DAY", "NIGHT"]; // Dropdown options for shift
  const lineOptions = ["HAMMER1", "HAMMER2", "FFL", "NHF-1000", "1600 TON", "A-SET", "W-SET"]; // Dropdown options for line
  const formanOptions = ["Na","Jitendra", "Ram", "Shambhu","Rajkumar","Lal Chand","Rahul","Satveer","Abbash","Chandan"]; // Dropdown options for forman
  const lineInchargeOptions = ["Na","Santosh", "Devendra", "Rahul","Neeraj","Somveer","Lal Chand","Satveer","Yogesh"];
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState([]);
  


  const fetchComponentSuggestions = async (query, index) => {
    if (!query) {
      setRowSuggestions((prevSuggestions) => {
        const newSuggestions = [...prevSuggestions];
        newSuggestions[index] = [];
        return newSuggestions;
      });
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await axios.get(
        "http://192.168.1.199:8001/raw_material/autocompleteforging/",
        { params: { block_mt_id: query } }
      );
      setRowSuggestions((prevSuggestions) => {
        const newSuggestions = [...prevSuggestions];
        newSuggestions[index] = response.data;
        return newSuggestions;
      });
    } catch (error) {
      console.error("Error fetching component suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const fetchPartDetails = async (batch_number, index) => {
    try {
      // First API call to get part details
      const partDetailsResponse = await axios.get(
        "http://192.168.1.199:8001/raw_material/get_part_detailsforging/",
        { params: { block_mt_id: batch_number } }
      );
      const partData = partDetailsResponse.data;
  
      // Second API call to get target details (total production)
      const targetDetailsResponse = await axios.get(
        "http://192.168.1.199:8001/forging/get-target-details/",
        { params: { batch_no: batch_number } }
      );
      const targetData = targetDetailsResponse.data;
  
      // Third API call to get slug weight
      const slugWeightResponse = await axios.get(
        "http://192.168.1.199:8001/raw_material/get-part-details/",
        { params: { component: partData.component } }
      );
      const slugWeightData = slugWeightResponse.data;
  
      // Update the rows state with the fetched data
      setRows((prevRows) => {
        const updatedRows = [...prevRows];
        updatedRows[index] = {
          ...updatedRows[index],
          component: partData.component || "",
          heat_number: partData.heatno || "",
          target1: partData.pices || "",
          customer: partData.customer || "",
          rm_grade: partData.grade || "",
          total_production: targetData.total_production || "", // Fill the total production field
          slug_weight: slugWeightData.slug_weight || "", // Fill the slug weight field
        };
        updatedRows[index].remaining = (parseFloat(updatedRows[index].target1) || 0) - (parseFloat(updatedRows[index].total_production) || 0); // Add calculation
        return updatedRows;
      });
  
      // Clear suggestions after successful data retrieval
      setRowSuggestions((prevSuggestions) => {
        const newSuggestions = [...prevSuggestions];
        newSuggestions[index] = [];
        return newSuggestions;
      });
    } catch (error) {
      console.error("Error fetching part details, target details, or slug weight:", error);
      alert("Please enter a correct batch number.");
      setRows((prevRows) => {
        const updatedRows = [...prevRows];
        updatedRows[index] = {
          ...updatedRows[index],
          batch_number: "",
          component: "",
          heat_number: "",
          target1: "",
          customer: "",
          rm_grade: "",
          total_production: "", // Clear total production on error
          slug_weight: "", // Clear slug weight on error
        };
        return updatedRows;
      });
      // Clear suggestions after failed fetch
      setRowSuggestions((prevSuggestions) => {
        const newSuggestions = [...prevSuggestions];
        newSuggestions[index] = [];
        return newSuggestions;
      });
    }
  };
  
  

  const handleRowChange = (index, field, value) => {
    // Define fields that should be read-only
    const readOnlyFields = ["component", "customer", "heat_number", "rm_grade", "total_production", "target1", "remaining"];
    
    // Prevent updating read-only fields
    if (readOnlyFields.includes(field)) {
      return;
    }
  
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
  
    // Automatically calculate the remaining field
    if (field === "target1" || field === "total_production") {
      const target1 = parseFloat(updatedRows[index].target1) || 0;
      const totalProduction = parseFloat(updatedRows[index].total_production) || 0;
      updatedRows[index].remaining = target1 - totalProduction;
    }
  
    // Validate the 'production' field
    if (field === "production") {
      const currentRow = updatedRows[index];
      const totalProduction = parseFloat(currentRow.total_production) || 0;
      const target = parseFloat(currentRow.target1) || 0;
      const production = parseFloat(value) || 0;
      const productionLimit = target - totalProduction + 3000;
  
      // Check if production exceeds the sum of target + total_production
      if (production > productionLimit) {
        alert("Production cannot exceed the sum of Total Production + Target.");
        return;
      }
    }
  
    setRows(updatedRows);
  
    if (field === "batch_number" && value) {
      fetchComponentSuggestions(value, index);
      setActiveSuggestionIndex((prev) => {
        const newIndexes = [...prev];
        newIndexes[index] = -1; // Reset active suggestion for the row
        return newIndexes;
      });
    }
  };
  
  
  
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // Index for keyboard navigation

const handleKeyDown = (event, index) => {
  if (rowSuggestions[index] && rowSuggestions[index].length > 0) {
    if (event.key === "ArrowDown") {
      // Move down in suggestions
      setHighlightedIndex((prevIndex) =>
        prevIndex < rowSuggestions[index].length - 1 ? prevIndex + 1 : 0
      );
      event.preventDefault();
    } else if (event.key === "ArrowUp") {
      // Move up in suggestions
      setHighlightedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : rowSuggestions[index].length - 1
      );
      event.preventDefault();
    } else if (event.key === "Enter") {
      // Select the current suggestion
      if (highlightedIndex >= 0) {
        handleSelectSuggestion(index, rowSuggestions[index][highlightedIndex]);
        setHighlightedIndex(-1); // Reset the highlighted index
        event.preventDefault();
      }
    }
  }
};
  
const handleSelectSuggestion = (index, suggestion) => {
  // Set the batch number from the selected suggestion
  handleRowChange(index, "batch_number", suggestion);
  // Fetch part details for the selected suggestion
  fetchPartDetails(suggestion, index);
  // Clear suggestions
  setRowSuggestions((prevSuggestions) => {
    const newSuggestions = [...prevSuggestions];
    newSuggestions[index] = [];
    return newSuggestions;
  });
  setHighlightedIndex(-1); // Reset the highlighted index
};

  const addRow = () => {
    setRows([
      ...rows,
      {
        batch_number: "",
        component: "",
        customer: "",
        slug_weight: "",
        rm_grade: "",
        heat_number: "",
        line: "",
        line_incharge: "",
        forman: "",
        target1: "",
        total_production:"",
        remaining:"",
        target: "",
        production: "",
        rework: "",
        up_setting: "",
        half_piercing: "",
        full_piercing: "",
        ring_rolling: "",
        sizing: "",
        overheat: "",
        bar_crack_pcs: "",
      },
    ]);
    setRowSuggestions([...rowSuggestions, []]); // Initialize an empty suggestions array for the new row
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
    setRowSuggestions(rowSuggestions.filter((_, i) => i !== index)); // Remove the suggestions for the deleted row
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for required fields (line, line_incharge, and forman)
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.line || !row.line_incharge || !row.forman || !row.slug_weight || !row.production  ) {
        alert(`Please fill in all required fields for row ${i + 1}.`);
        return;
      }
    }

    // Automatically set missing values to 0
    const updatedRows = rows.map((row) => ({
      ...row,
      rework: row.rework || 0,
      up_setting: row.up_setting || 0,
      half_piercing: row.half_piercing || 0,
      full_piercing: row.full_piercing || 0,
      ring_rolling: row.ring_rolling || 0,
      sizing: row.sizing || 0,
      overheat: row.overheat || 0,
      bar_crack_pcs: row.bar_crack_pcs || 0,
    }));

    if (!date || !shift) {
      alert("Please fill in the date and shift fields.");
      return;
    }

    const dataToSubmit = updatedRows.map(({ total_production,target1,remaining, ...row }) => ({
      ...row,
      date,
      shift,
      verified_by: verifiedBy,
    }));

    try {
      await axios.post(
        "http://192.168.1.199:8001/forging/api/forging/bulk-add/",
        dataToSubmit
      );
      alert("Data submitted successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 2);  // 1000 milliseconds = 1 second
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Failed to submit data.");
    }
  };
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "http://192.168.1.199:8001/api/user-details/",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        const { name, lastname } = response.data;
        setVerifiedBy(`${name} ${lastname}`);
      } catch (error) {
        console.error("Error fetching user details:", error);
        alert("Failed to fetch user details.");
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="w-full p-6 bg-white shadow-md rounded-lg mt-20">
      <Sidebar /> 
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">Add Forging Data</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-6 flex space-x-4"> {/* Flex container for Date, Shift, Verified By */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-1 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
  
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">Shift:</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              required
              className="w-full px-1 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Select Shift</option>
              {shiftOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
  
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">Verified By:</label>
            <input
              type="text"
              value={verifiedBy}
              readOnly
              className="w-full px-1 py-1 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div> {/* End of flex container */}
  
        <div className="overflow-x-auto mb-6"> {/* Make the table horizontally scrollable */}
          <table className="table-auto border-collapse min-w-full table-layout-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="min-w-[150px] text-left text-sm text-gray-600">Batch Number</th>
                <th className="min-w-[125px] text-left text-sm text-gray-600">Component</th>
                <th className="min-w-[90px] text-left text-sm text-gray-600">Customer</th>
                <th className="min-w-[75px] text-left text-sm text-gray-600">Slug Weight</th>
                <th className="min-w-[125px] text-left text-sm text-gray-600">RM Grade</th>
                <th className="min-w-[90px] text-left text-sm text-gray-600">Heat Number</th>
                <th className="min-w-[125px] text-left text-sm text-gray-600">Line</th>
                <th className="min-w-[125px] text-left text-sm text-gray-600">Line Incharge</th>
                <th className="min-w-[125px] text-left text-sm text-gray-600">Forman</th>
                <th className="min-w-[75px] text-left text-sm text-gray-600">Batch Size</th>
                <th className="min-w-[75px] text-left text-sm text-gray-600">Previous Production</th>
                <th className="min-w-[75px] text-left text-sm text-gray-600">Remaining</th>
                <th className="min-w-[75px] text-left text-sm text-gray-600">Target</th>
                <th className="min-w-[75px] text-left text-sm text-gray-600">Production</th>
                <th className="min-w-[50px] text-left text-sm text-gray-600">Rework</th>
                <th className="min-w-[50px] text-left text-sm text-gray-600">Up Setting</th>
                <th className="min-w-[50px] text-left text-sm text-gray-600">Half Piercing</th>
                <th className="min-w-[50px] text-left text-sm text-gray-600">Full Piercing</th>
                <th className="min-w-[50px] text-left text-sm text-gray-600">Ring Rolling</th>
                <th className="min-w-[50px] text-left text-sm text-gray-600">Sizing</th>
                <th className="min-w-[50px] text-left text-sm text-gray-600">Over Heat</th>
                <th className="min-w-[50px] text-left text-sm text-gray-600">Bar Crack Pcs</th>
                <th className="text-left text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  {Object.keys(row).map((field) => (
                    <td key={field} className="">
                      {field === "line" || field === "line_incharge" || field === "forman" ? (
                        <select
                          value={row[field]}
                          disabled={["component", "customer", "heat_number", "rm_grade", "total_production", "target"].includes(field)}
                          onChange={(e) => handleRowChange(index, field, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="" disabled>Select {field}</option>
                          {(field === "line" ? lineOptions : field === "line_incharge" ? lineInchargeOptions : formanOptions).map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={row[field]}
                          onChange={(e) => handleRowChange(index, field, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className="w-full px-1 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />


                      )}
                      {field === "batch_number" &&
                        rowSuggestions[index] &&
                        rowSuggestions[index].length > 0 && (
                          <ul
                            className="absolute bg-white border border-gray-300 mt-1 w-[170px] max-h-40 overflow-y-auto z-10"
                            onKeyDown={(e) => handleKeyDown(e, index)}
                          >
                            {rowSuggestions[index].map((suggestion, i) => (
                              <li
                                key={i}
                                onClick={() => handleSelectSuggestion(index, suggestion)}
                                onMouseEnter={() => setHighlightedIndex(i)}
                                className={` py-1 cursor-pointer ${
                                  i === highlightedIndex ? "bg-gray-200" : "hover:bg-gray-100"
                                }`}
                              >
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        )}

                    </td>
                  ))}
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> {/* End of overflow-x-auto */}
  
        <div className="flex justify-between">
          <button
            type="button"
            onClick={addRow}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Add Row
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
  
};

export default BulkAddForm;