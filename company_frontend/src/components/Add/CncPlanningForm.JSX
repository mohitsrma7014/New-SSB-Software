import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CncPlanningForm({ selectedMachine }) {
  const [formData, setFormData] = useState({
    create_date: "",
    Target_start_date: "",
    Target_End_date: "",
    component: "",
    customer: "",
    target: "",
    component_cycle_time: "",
    required_cycle_time: "",
    cnc_line: "",
    cell: "na",
    cell_cycle_time: "",
    machine_no: "na",
    machine_cycle_time: 0,
    done: "No", // Auto-filled "Done" with "No"
    how_much_compleate: 0, // Auto-filled "How Much Complete" with 0
    verified_by: "", // Hidden autofilled field
  });

  const [responseMessage, setResponseMessage] = useState('');

  // Fetch user details on mount to autofill "verified_by"
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

  // Fill the form with machine details when a cell is clicked
  useEffect(() => {
    if (selectedMachine) {
      setFormData((prevState) => ({
        ...prevState,
        cnc_line: selectedMachine.line,
        cell: selectedMachine.cell,
        machine_no: selectedMachine.machineNo,
      }));
    }
  }, [selectedMachine]);

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
      window.location.reload(); // Refresh the page
      setFormData({
        create_date: "",
        Target_start_date: "",
        Target_End_date: "",
        component: "",
        customer: "",
        target: "",
        component_cycle_time: "",
        required_cycle_time: "",
        cnc_line: "",
        cell: "na",
        cell_cycle_time: "",
        machine_no: "na",
        machine_cycle_time: 0,
        done: "No", // Auto-filled "Done" with "No"
        how_much_compleate: 0, // Auto-filled "How Much Complete" with 0
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-semibold">Create Date</label>
          <input
            type="date"
            value={formData.create_date}
            onChange={(e) =>
              setFormData((prevState) => ({
                ...prevState,
                create_date: e.target.value,
              }))
            }
            className="border p-2 w-full"
            disabled
          />
        </div>
        <div className="flex-1">
          <label className="block font-semibold">Target Start Date</label>
          <input
            type="date"
            value={formData.Target_start_date}
            onChange={(e) =>
              setFormData((prevState) => ({
                ...prevState,
                Target_start_date: e.target.value,
              }))
            }
            className="border p-2 w-full"
          />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-semibold">Target End Date</label>
          <input
            type="date"
            value={formData.Target_End_date}
            onChange={(e) =>
              setFormData((prevState) => ({
                ...prevState,
                Target_End_date: e.target.value,
              }))
            }
            className="border p-2 w-full"
          />
        </div>
        <div className="flex-1">
          <label className="block font-semibold">CNC Line</label>
          <input
            type="text"
            value={formData.cnc_line}
            onChange={(e) =>
              setFormData((prevState) => ({
                ...prevState,
                cnc_line: e.target.value,
              }))
            }
            className="border p-2 w-full"
            disabled
          />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-semibold">Cell</label>
          <input
            type="text"
            value={formData.cell}
            onChange={(e) =>
              setFormData((prevState) => ({
                ...prevState,
                cell: e.target.value,
              }))
            }
            className="border p-2 w-full"
            disabled
          />
        </div>
        <div className="flex-1">
          <label className="block font-semibold">Machine No</label>
          <input
            type="text"
            value={formData.machine_no}
            onChange={(e) =>
              setFormData((prevState) => ({
                ...prevState,
                machine_no: e.target.value,
              }))
            }
            className="border p-2 w-full"
            disabled
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-semibold">Component</label>
          <input
            type="text"
            value={formData.component}
            onChange={(e) =>
              setFormData((prevState) => ({
                ...prevState,
                component: e.target.value,
              }))
            }
            className="border p-2 w-full"
          />
        </div>
        <div className="flex-1">
          <label className="block font-semibold">Target</label>
          <input
            type="number"
            value={formData.target}
            onChange={(e) =>
              setFormData((prevState) => ({
                ...prevState,
                target: e.target.value,
              }))
            }
            className="border p-2 w-full"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-semibold">Component Cycle Time</label>
          <input
            type="number"
            value={formData.component_cycle_time}
            onChange={(e) =>
              setFormData((prevState) => ({
                ...prevState,
                component_cycle_time: e.target.value,
              }))
            }
            className="border p-2 w-full"
          />
        </div>
        <div className="flex-1">
          <label className="block font-semibold">Required Cycle Time</label>
          <input
            type="number"
            value={formData.required_cycle_time}
            onChange={(e) =>
              setFormData((prevState) => ({
                ...prevState,
                required_cycle_time: e.target.value,
              }))
            }
            className="border p-2 w-full"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-semibold">Cell Cycle Time</label>
          <input
            type="number"
            value={formData.cell_cycle_time}
            onChange={(e) =>
              setFormData((prevState) => ({
                ...prevState,
                cell_cycle_time: e.target.value,
              }))
            }
            className="border p-2 w-full"
          />
        </div>
        <div className="flex-1">
          <label className="block font-semibold">Machine Cycle Time</label>
          <input
            type="number"
            value={formData.machine_cycle_time}
            onChange={(e) =>
              setFormData((prevState) => ({
                ...prevState,
                machine_cycle_time: e.target.value,
              }))
            }
            className="border p-2 w-full"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-semibold">Done</label>
          <select
            value={formData.done}
            onChange={(e) =>
              setFormData((prevState) => ({
                ...prevState,
                done: e.target.value,
              }))
            }
            className="border p-2 w-full"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block font-semibold">How Much Complete</label>
          <input
            type="number"
            value={formData.how_much_compleate}
            onChange={(e) =>
              setFormData((prevState) => ({
                ...prevState,
                how_much_compleate: e.target.value,
              }))
            }
            className="border p-2 w-full"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 bg-blue-500 text-white p-2 rounded"
      >
        Submit
      </button>
    </form>
  );
}

export default CncPlanningForm;
