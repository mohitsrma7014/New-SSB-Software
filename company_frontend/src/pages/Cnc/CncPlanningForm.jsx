import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCogs, FaUser, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa'; // Importing icons
import { Sidebar } from '../../components/AdminComponents/Sidebar';
import CncPlanningList from './CncPlanningList1';

const CncPlanningForm = () => {
  const [formData, setFormData] = useState({
    create_date: "",
    Target_start_date: "",
    Target_End_date: "",
    component: "",
    customer: "",
    target: "",
    component_cycle_time: "",
    required_cycle_time: "",
    cnc_line:"",
    cell: "na",
    cell_cycle_time: "",
    machine_no: "na",
    machine_cycle_time: 0,
    done: "No",  // Auto-filled "Done" with "No"
    how_much_compleate: 0,  // Auto-filled "How Much Complete" with 0
    verified_by: "", // Hidden autofilled field
  });

  const [responseMessage, setResponseMessage] = useState(null);
  const [weekOptions, setWeekOptions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // Default to current month
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(""); // State to manage error message
  const [availableCncLines, setAvailableCncLines] = useState([]);

  // Set today's date for create_date and fetch user details for 'verified_by'
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    setFormData((prevState) => ({
      ...prevState,
      create_date: today, // Set today's date
    }));

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
        setFormData((prevState) => ({
          ...prevState,
          verified_by: `${name} ${lastname}`, // Autofill 'verified_by'
        }));
      } catch (error) {
        console.error("Error fetching user details:", error);
        alert("Failed to fetch user details.");
      }
    };

    fetchUserData();
  }, []);
  // Handle CNC line selection and fill the respective cycle time
  const handleCncLineChange = (e) => {
    const selectedLine = e.target.value;
    const selectedLineData = availableCncLines.find(line => line.cnc_line === selectedLine);
    const selectedCycleTime = selectedLineData ? selectedLineData.remaining_cycle_time : 0;

    setFormData((prevState) => ({
      ...prevState,
      cnc_line: selectedLine,
      cell_cycle_time: selectedCycleTime, // Set the cell cycle time based on the selected line
    }));
  };

  // Calculate weeks for the selected month
  useEffect(() => {
    const calculateWeeks = (year, month) => {
      const weeks = [];
      const date = new Date(year, month, 1); // First day of the month
      const end = new Date(year, month + 1, 0); // Last day of the month
  
      while (date <= end) {
        // Get the day of the week (0 - Sunday, 1 - Monday, ..., 6 - Saturday)
        const dayOfWeek = date.getDay();
        
        // Calculate how many days to subtract to get to the previous Monday
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        
        // Set the start of the week (Monday)
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - daysToSubtract); 
  
        // Set the end of the week (Sunday)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // Sunday is 6 days after Monday
  
        // Add week to weeks array if it belongs to the month
        if (weekStart.getMonth() === month || weekEnd.getMonth() === month) {
          weeks.push({
            weekNumber: weeks.length + 1,
            startDate: weekStart.toISOString().slice(0, 10),
            endDate: weekEnd.toISOString().slice(0, 10),
          });
        }
  
        // Move to the next week
        date.setDate(date.getDate() + 7); 
      }
  
      return weeks;
    };
  
    const [year, month] = selectedMonth.split("-").map(Number);
    const weeks = calculateWeeks(year, month - 1);
    setWeekOptions(weeks);
  }, [selectedMonth]);
  
  const handleWeekChange = async (e) => {
    const selectedWeek = weekOptions.find(
      (week) => week.weekNumber === parseInt(e.target.value, 10)
    );
    if (selectedWeek) {
      setFormData((prevState) => ({
        ...prevState,
        Target_start_date: selectedWeek.startDate,
        Target_End_date: selectedWeek.endDate,
      }));
  
      // Fetch the available CNC lines based on the selected week
      try {
        const response = await axios.get(
          "http://192.168.1.199:8001/cnc/api/get-available-cnc-lines/",
          {
            params: {
              start_date: selectedWeek.startDate,
              end_date: selectedWeek.endDate,
            },
          }
        );
  
        // Set available lines with remaining cycle time in the dropdown
        setAvailableCncLines(response.data.available_lines);
      } catch (error) {
        console.error("Error fetching available CNC lines:", error);
        setError("Error fetching available CNC lines.");
      }
    }
  };

  // Handle component input change for suggestions
  const handleComponentChange = async (e) => {
    const query = e.target.value;
    setFormData({ ...formData, component: query });

    if (query.length >= 3) { // Trigger suggestion search when the query is 3 characters or more
      setLoading(true); // Set loading state to true when fetching suggestions
      try {
        const response = await axios.get('http://192.168.1.199:8001/raw_material/components/', {
          params: { component: query },
        });
        setSuggestions(response.data);  // Assuming the response is an array of component names
      } catch (error) {
        console.error("Error fetching component suggestions:", error);
      } finally {
        setLoading(false); // Set loading state to false once the request is complete
      }
    } else {
      setSuggestions([]); // Clear suggestions if query is too short
    }
  };

  // Handle selecting a component from the suggestions
  const handleComponentSelect = async (selectedComponent) => {
    setFormData({ ...formData, component: selectedComponent });
    setSuggestions([]); // Clear suggestions after selection

    try {
      const response = await axios.get('http://192.168.1.199:8001/raw_material/get-part-details/', {
        params: { component: selectedComponent },
      });
      const { customer, component_cycle_time } = response.data;
      setFormData((prevState) => ({
        ...prevState,
        customer: customer,  // Auto-fill customer
        component_cycle_time: component_cycle_time,  // Auto-fill component cycle time
      }));
    } catch (error) {
      console.error("Error fetching component details:", error);
    }
  };

  const handleCycleTimeAndTargetChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };
    let calculatedComponentCycleTime = 0;
  
    // If target changes, calculate the component_cycle_time
    if (name === "target") {
      if (!formData.component) {
        setError("Error: Please fill the Component field before setting the Target.");
        updatedFormData.target = ""; // Clear the target field
      } else {
        const target = parseFloat(value) || 0;
        const componentCycleTime = parseFloat(formData.component_cycle_time) || 0;
        calculatedComponentCycleTime = target * componentCycleTime * 2;
  
        if (calculatedComponentCycleTime > formData.cell_cycle_time) {
          setError("Error: Line is full. Component cycle time exceeds Line cycle time.");
          updatedFormData.target = ""; // Clear the target if the cycle time exceeds the limit
          updatedFormData.required_cycle_time = ""; // Clear the required_cycle_time field
        } else {
          setError(""); // Clear error if valid
          updatedFormData.required_cycle_time = calculatedComponentCycleTime; // Set the calculated required cycle time
        }
      }
    }
  
    setFormData(updatedFormData);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://192.168.1.199:8001/cnc/cncplanning/",
        formData
      );
      setResponseMessage(`Success! Cnc_uid: ${response.data.Cnc_uid}`);
      // Display success pop-up and refresh the page after confirmation
      alert("Form submitted successfully!");
      window.location.reload();  // Refresh the page
      setFormData({
        create_date: "",
        Target_start_date: "",
        Target_End_date: "",
        component: "",
        customer: "",
        target: "",
        component_cycle_time: "",
        required_cycle_time: "",
        cnc_line:"",
        cell: "na",
        cell_cycle_time: "",
        machine_no: "na",
    machine_cycle_time: 0,
        done: "No",  // Auto-filled "Done" with "No"
        how_much_compleate: 0,  // Auto-filled "How Much Complete" with 0
        verified_by: "", // Reset verified_by
      });
    } catch (error) {
      console.error("Error response:", error.response);
      setResponseMessage(
        "Error: " + (error.response?.data || "An error occurred")
      );
    }
  };
  return (
    <div className=" mx-auto mt-24">
  <Sidebar />
  <h1 className="text-4xl font-semibold text-black text-center mb-6">Machining Planning</h1>
  
  {responseMessage && <p className="text-center text-green-500 mb-4">{responseMessage}</p>}

  {/* Flex container for Form and CNC Planning List */}
  <div className="flex justify-between space-x-2">
    {/* Form Section */}
    <div className="w-1/2 bg-white p-6 rounded-lg shadow-md">
    <form onSubmit={handleSubmit} className="space-y-6">
        <div className="hidden">
          <input
            type="date"
            name="create_date"
            value={formData.create_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-6">

        {/* Month Field */}
        <div className="flex flex-col space-y-2">
          <label className="text-lg text-black">Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-3 rounded-lg text-black shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Week Selection */}
        <div className="flex flex-col space-y-2">
          <label className="text-lg text-black">Week Number:</label>
          <select
            onChange={handleWeekChange}
            className="p-3 rounded-lg text-black shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Week</option>
            {weekOptions.map((week) => (
              <option key={week.weekNumber} value={week.weekNumber}>
                Week {week.weekNumber} ({week.startDate} - {week.endDate})
              </option>
            ))}
          </select>
        </div>
        </div>

        {/* Target Dates */}
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col space-y-2">
            <label className="text-lg text-black">Target Start Date:</label>
            <input
              type="date"
              name="Target_start_date"
              value={formData.Target_start_date}
              readOnly
              className="p-3 rounded-lg text-gray-500 bg-gray-100 shadow-md"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-lg text-black">Target End Date:</label>
            <input
              type="date"
              name="Target_End_date"
              value={formData.Target_End_date}
              readOnly
              className="p-3 rounded-lg text-gray-500 bg-gray-100 shadow-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">

        {/* Component Field */}
        <div className="flex flex-col space-y-2 relative">
          <label className="text-lg text-black">Component:</label>
          <input
            type="text"
            name="component"
            value={formData.component}
            onChange={handleComponentChange}
            required
            className="p-3 rounded-lg text-black shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {loading && <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white"><span>Loading...</span></div>}
          {suggestions.length > 0 && (
            <ul className="absolute mt-1 bg-white shadow-lg rounded-lg w-full">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleComponentSelect(suggestion)}
                  className="p-2 hover:bg-blue-200 cursor-pointer"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Customer Field */}
        <div className="flex flex-col space-y-2">
          <label className="text-lg text-black">Customer:</label>
          <input
            type="text"
            name="customer"
            value={formData.customer}
            readOnly
            className="p-3 rounded-lg text-gray-500 bg-gray-100 shadow-md"
          />
        </div>
        <div className="flex flex-col space-y-2">
            <label className="text-lg text-black">Component Cycle Time:</label>
            <input
              type="number"
              name="component_cycle_time"
              value={formData.component_cycle_time}
              onChange={handleCycleTimeAndTargetChange}
              readOnly
              className="p-3 rounded-lg text-gray-500 bg-gray-100 shadow-md"
            />
          </div>
        </div>

        {/* Cycle Time Fields */}
        <div className="grid grid-cols-3 gap-6">
          
          
        

        {/* CNC Line */}
        <div className="flex flex-col space-y-2">
          <label className="text-lg text-black">CNC Line:</label>
          <select
            name="cnc_line"
            value={formData.cnc_line}
            onChange={handleCncLineChange}
            className="p-3 rounded-lg text-black shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select CNC Line</option>
            {availableCncLines.map((line) => (
              <option key={line.cnc_line} value={line.cnc_line}>
                {line.cnc_line} (Remaining Cycle Time: {line.remaining_cycle_time} sec.)
              </option>
            ))}
          </select>
        </div>

        {/* Cell Cycle Time */}
        <div className="flex flex-col space-y-2">
          <label className="text-lg text-black">Line Cycle Time:</label>
          <input
            type="number"
            name="cell_cycle_time"
            value={formData.cell_cycle_time}
            onChange={handleChange}
            required
            readOnly
            className="p-3 rounded-lg text-gray-500 bg-gray-100 shadow-md"
          />
        </div>
        {/* Target Field */}
        <div className="flex flex-col space-y-2">
          <label className="text-lg text-black">Target:</label>
          <input
                type="number"
                name="target"
                value={formData.target}
                onChange={handleCycleTimeAndTargetChange}
                required
                disabled={!formData.component} // Disable if component is empty
                className={`p-3 rounded-lg shadow-md focus:outline-none focus:ring-2 ${
                    formData.component ? "text-black" : "text-gray-400 bg-gray-200"
                }`}
                />

        </div>
        <div className="hidden">
            <label className="text-lg text-black">Required Cycle Time:</label>
            <input
              type="number"
              name="required_cycle_time"
              value={formData.required_cycle_time}
              onChange={handleCycleTimeAndTargetChange}
              required
              readOnly
              className="p-3 rounded-lg text-gray-500 bg-gray-100 shadow-md"
            />
          </div>
        </div>

        

        {error && <p className="text-red-500">{error}</p>}

        {/* Hidden Inputs */}
        <input
          type="text"
          name="done"
          value={formData.done}
          onChange={handleChange}
          style={{ display: "none" }}
        />
        <input
          type="number"
          name="how_much_compleate"
          value={formData.how_much_compleate}
          onChange={handleChange}
          style={{ display: "none" }}
        />

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Submit <FaCogs className="inline-block ml-2" />
          </button>
        </div>
      </form>
    </div>

    {/* CNC Planning List Section */}
    <div className="w-1/2 bg-white  rounded-lg shadow-md">
      <CncPlanningList />
    </div>
  </div>
</div>

  );
};

export default CncPlanningForm;
