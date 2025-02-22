import React, { useState, useEffect } from "react";
import axios from "axios";
import { Sidebar } from './Sidebar';

const BulkAddFormcnc = () => {
  const [date, setDate] = useState("");
  const [shift, setShift] = useState("");
  const [verifiedBy, setVerifiedBy] = useState("");
  const [rows, setRows] = useState([
    {
      batch_number: "",
      component: "",
      heat_no: "",
      machine_no: "",
      mc_type: "",
      operator: "",
      inspector: "",
      setup: "",
      target1:"",
      
      total_produced:"",
      target: "",
      production: "",
      remark: "",
      cnc_height: "",
      cnc_od: "",
      cnc_bore: "",
      cnc_groove: "",
      cnc_dent: "",
      forging_height: "",
      forging_od: "",
      forging_bore: "",
      forging_crack: "",
      forging_dent: "",
      pre_mc_height: "",
      pre_mc_od: "",
      pre_mc_bore: "",
      rework_height: "",
      rework_od: "",
      rework_bore: "",
      rework_groove: "",
      rework_dent: "",
    
      
    },
  ]);
  const [rowSuggestions, setRowSuggestions] = useState([]); // To store suggestions for each row
  const [componentSuggestions, setComponentSuggestions] = useState([]); // For component suggestions
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const shiftOptions = ["DAY", "NIGHT"]; // Dropdown options for shift
  const lineOptions = ["CNC", "VMC", "CF", "BROCH"]; // Dropdown options for line
  const formanOptions = ["Jitendra", "Ram", "Shambhu","Rajkumar"]; // Dropdown options for forman
  const lineInchargeOptions = ["I", "II", "Drill","Rough","Broch","Rework"];


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

  const [componentSuggestionss, setComponentSuggestionss] = useState([]); // Component suggestions state
  const [isQuerying, setIsQuerying] = useState(false); // Track if a query is ongoing

  const fetchComponentSuggestionss = async (query, index) => {
    if (!query || isQuerying) {
        // Clear suggestions for this row if query is empty
        setComponentSuggestions((prev) => {
            const newSuggestions = [...prev];
            newSuggestions[index] = [];
            return newSuggestions;
        });
        return;
    }
    setIsQuerying(true);
    setLoadingSuggestions(true);
    try {
        const response = await axios.get(
            "http://192.168.1.199:8001/raw_material/components/",
            { params: { component: query } }
        );
        setComponentSuggestionss((prev) => {
            const newSuggestions = [...prev];
            newSuggestions[index] = response.data;
            return newSuggestions;
        });
    } catch (error) {
        console.error("Error fetching component suggestions:", error);
    } finally {
        setIsQuerying(false);
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
        "http://192.168.1.199:8001/cnc/get-target-details7/",
        { params: { batch_no: batch_number } }
      );
      const targetData = targetDetailsResponse.data;
  
      // Update the rows state with the fetched data
      setRows((prevRows) => {
        const updatedRows = [...prevRows];
        updatedRows[index] = {
          ...updatedRows[index],
          component: partData.component || "",
          heat_no: partData.heatno || "",
          target1: partData.pices || "",
         
        
          total_produced: targetData.total_production || "", // Fill the total production field
        };
        return updatedRows;
      });
  
      // Clear suggestions after successful data retrieval
      setRowSuggestions((prevSuggestions) => {
        const newSuggestions = [...prevSuggestions];
        newSuggestions[index] = [];
        return newSuggestions;
      });
    } catch (error) {
      console.error("Error fetching part details or target details:", error);
      alert("Please enter a correct batch number.");
      setRows((prevRows) => {
        const updatedRows = [...prevRows];
        updatedRows[index] = {
          ...updatedRows[index],
          batch_number: "",
          component: "",
          heat_no: "",
          target1:"",
          total_produced: "", // Clear total production on error
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
    const readOnlyFields = ["heat_no","total_produced","target1"];
  
    // Prevent updating read-only fields
    if (readOnlyFields.includes(field)) {
      return;
    }

     
    // Validate the 'production' field
    if (field === "production") {
      const currentRow = rows[index];
      const totalProduction = parseFloat(currentRow.total_produced) || 0;
      const target = parseFloat(currentRow.target1) || 0;
      const production = parseFloat(value) || 0;
      const productionLimit = target - totalProduction + 1000;

      // Check if production exceeds the sum of target + total_production
      if (production > productionLimit) {
        alert("Production cannot exceed the sum of Total Production + Target.");
        return;
      }
    }

    // Fetch component suggestions when the 'component' field changes
    if (field === "component" && value) {
      fetchComponentSuggestionss(value, index);
    }
    
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  
    // Only fetch suggestions when 'batch_number' field changes
    if (field === "batch_number" && value) {
      fetchComponentSuggestions(value, index);
    }
  };
  
  const handleSelectSuggestion = (index, suggestion) => {
    // Set the batch number from the selected suggestion
    handleRowChange(index, "batch_number", suggestion);
    // Fetch part details for the selected suggestion
    fetchPartDetails(suggestion, index);
  };


  const handleSelectComponent = (index, suggestion) => {
    setRows((prevRows) => {
      const updatedRows = [...prevRows];
      updatedRows[index].component = suggestion; // Update the component value for the specific row
      return updatedRows;
    });
    setComponentSuggestionss([]); // Clear suggestions globally
    setIsQuerying(false); // Mark querying as completed
  };
  

  

  // const handleSelectComponent = (index, suggestion) => {
  //   console.log("Selected suggestion:", suggestion); // Debug log
  //   handleRowChange(index, "component", suggestion);
  //   setComponentSuggestionss([]); // Clear suggestions
  // };
  

  const addRow = () => {
    setRows([
      ...rows,
      {
        batch_number: "",
        component: "",
        heat_no: "",
        machine_no: "",
        mc_type: "",
        operator: "",
        inspector: "",
        setup: "",
        target1: "",
        total_produced:"",
        target:"",
        production: "",
        remark: "",
        cnc_height: "",
        cnc_od: "",
        cnc_bore: "",
        cnc_groove: "",
        cnc_dent: "",
        forging_height: "",
        forging_od: "",
        forging_bore: "",
        forging_crack: "",
        forging_dent: "",
        pre_mc_height: "",
        pre_mc_od: "",
        pre_mc_bore: "",
        rework_height: "",
        rework_od: "",
        rework_bore: "",
        rework_groove: "",
        rework_dent: "",
      },
    ]);
    setRowSuggestions([...rowSuggestions, []]); // Initialize an empty suggestions array for the new row
    setComponentSuggestionss([...componentSuggestionss, []]);
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
      if (!row.mc_type || !row.setup|| !row.target || !row.machine_no || !row.operator || !row.production  ) {
        alert(`Please fill in all required fields for row ${i + 1}.`);
        return;
      }
    }

    // Automatically set missing values to 0
    const updatedRows = rows.map((row) => ({
      ...row,
      remark: row.remark || "Na",
      inspector: row.inspector || "Na",
      total_produced: row.total_produced || 0,
      cnc_height: row.cnc_height || 0,
      cnc_od: row.cnc_od || 0,
      cnc_bore: row.cnc_bore || 0,
      cnc_groove: row.cnc_groove || 0,
      cnc_dent: row.cnc_dent || 0,
      forging_height: row.forging_height || 0,
      forging_od: row.forging_od || 0,
      forging_bore: row.forging_bore || 0,
      forging_crack: row.forging_crack || 0,
      forging_dent: row.forging_dent || 0,
      pre_mc_height: row.pre_mc_height || 0,
      pre_mc_od: row.pre_mc_od || 0,
      pre_mc_bore: row.pre_mc_bore || 0,
      rework_height: row.rework_height || 0,
      rework_od: row.rework_od || 0,
      rework_bore: row.rework_bore || 0,
      rework_groove: row.rework_groove || 0,
      rework_dent: row.rework_dent || 0,
      
    }));

    if (!date || !shift) {
      alert("Please fill in the date and shift fields.");
      return;
    }

    const dataToSubmit = updatedRows.map(({ total_production, ...row }) => ({
      ...row,
      date,
      shift,
      verified_by: verifiedBy,
    }));

    try {
      await axios.post(
        "http://192.168.1.199:8001/cnc/api/cnc/bulk-add/",
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
        <h1 className="text-2xl font-semibold text-gray-700 mb-6">Add CNC Data</h1>
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
                  <th className="min-w-[90px] text-left text-sm text-gray-600">Heat-No.</th>
                  <th className="min-w-[125px] text-left text-sm text-gray-600">Machine No.</th>
                  <th className="min-w-[125px] text-left text-sm text-gray-600">M/C Type</th>
                  <th className="min-w-[125px] text-left text-sm text-gray-600">Operator</th>
                  <th className="min-w-[90px] text-left text-sm text-gray-600">Inspector</th>
                  <th className="min-w-[100px] text-left text-sm text-gray-600">Setup</th>
                  <th className="min-w-[75px] text-left text-sm text-gray-600">Batch Size</th>
                  <th className="min-w-[75px] text-left text-sm text-gray-600">Privious Production</th>
                  <th className="min-w-[75px] text-left text-sm text-gray-600">Target</th>
                  <th className="min-w-[75px] text-left text-sm text-gray-600"> Production</th>
                  <th className="min-w-[75px] text-left text-sm text-gray-600">Remark</th>
                  <th className="min-w-[75px] text-left text-sm text-gray-600">Cnc Height</th>
                  <th className="min-w-[50px] text-left text-sm text-gray-600">Cnc Od</th>
                  <th className="min-w-[50px] text-left text-sm text-gray-600">Cnc Bore</th>
                  <th className="min-w-[50px] text-left text-sm text-gray-600">Cnc Groove</th>
                  <th className="min-w-[75px] text-left text-sm text-gray-600"> Cnc Dent</th>
                  <th className="min-w-[75px] text-left text-sm text-gray-600">Forging Height</th>
                  <th className="min-w-[75px] text-left text-sm text-gray-600">Forging Od</th>
                  <th className="min-w-[50px] text-left text-sm text-gray-600">Forging Bore</th>
                  <th className="min-w-[50px] text-left text-sm text-gray-600">Forging Crack</th>
                  <th className="min-w-[50px] text-left text-sm text-gray-600">Forging Dent</th>
                  <th className="min-w-[75px] text-left text-sm text-gray-600"> Pre m/c Height</th>
                  <th className="min-w-[75px] text-left text-sm text-gray-600"> Pre m/c Od</th>
                  <th className="min-w-[75px] text-left text-sm text-gray-600"> Pre m/c Bore</th>
                  <th className="min-w-[75px] text-left text-sm text-gray-600">Rework Height</th>
                  <th className="min-w-[75px] text-left text-sm text-gray-600">Rework Od</th>
                  <th className="min-w-[75px] text-left text-sm text-gray-600">Rework Bore</th>
                  <th className="min-w-[75px] text-left text-sm text-gray-600">Rework Groove</th>
                  <th className="min-w-[75px] text-left text-sm text-gray-600">Rework Dent</th>                 
                  <th className="text-left text-sm text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    {Object.keys(row).map((field) => (
                      <td key={field} className="">
                        {field === "mc_type" || field === "setup"  ? (
                          <select
                            value={row[field]}
                            disabled={["component", "customer", "heat_number", "rm_grade", "total_production", "target"].includes(field)}
                            onChange={(e) => handleRowChange(index, field, e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="" disabled>Select {field}</option>
                            {(field === "mc_type" ? lineOptions : field === "setup" ? lineInchargeOptions : formanOptions).map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={row[field]}
                            onChange={(e) => handleRowChange(index, field, e.target.value)}
                            className="w-full px-1 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                        {field === "batch_number" && rowSuggestions[index] && rowSuggestions[index].length > 0 && (
                          <ul className="absolute bg-white border border-gray-300 mt-1 w-[170px] max-h-40 overflow-y-auto z-10">
                            {rowSuggestions[index].map((suggestion, i) => (
                              <li
                                key={i}
                                onClick={() => handleSelectSuggestion(index, suggestion)}
                                className=" py-2 cursor-pointer hover:bg-gray-100"
                              >
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        )}
                       
                       {field === "component" && componentSuggestionss[index] && componentSuggestionss[index].length > 0 && (
                            <ul className="absolute bg-white border border-gray-300 mt-1 w-[170px] max-h-40 overflow-y-auto z-10">
                                {componentSuggestionss[index].map((suggestion, i) => (
                                    <li
                                        key={i}
                                        onClick={() => handleSelectComponent(index, suggestion)}
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
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
  
  export default BulkAddFormcnc;