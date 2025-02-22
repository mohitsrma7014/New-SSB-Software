import React, { useState, useEffect } from "react";
import axios from "axios";

const Shot_blast_edit_form = ({ forging, onClose }) => {
  const [formData, setFormData] = useState({
    batch_number: "",
    date: "",
    shift: "",
    heat_no: "",
    component: "",
    machine: "",
    weight: "",
    no_of_pic: "",
    operator: "",
    target: "",
    total_produced: "",
    verified_by: "",
  });

  // Set form data when editing a forging
  useEffect(() => {
    if (forging && forging.id) {
      setFormData(forging);
    }
  }, [forging]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        // Update record
        await axios.put(
          `http://192.168.1.199:8001/shot_blast/ShotblastViewSet/${formData.id}/`,
          formData
        );
      } else {
        // Create new record
        await axios.post(
          "http://192.168.1.199:8001/shot_blast/ShotblastViewSet/",
          formData
        );
      }
      onClose(); // Close the form after saving
    } catch (error) {
      console.error("Error saving the Pre m/c", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 pt-24">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl shadow-lg overflow-y-auto">
        <h2 className="text-2xl mb-6">{formData.id ? "Edit Forging" : "Add Forging"}</h2>
        <form onSubmit={handleSubmit}>
          {/* Grid Layout for Fields */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="mb-4">
              <label className="block font-medium">Batch Number:</label>
              <input
                type="text"
                name="batch_number"
                value={formData.batch_number}
                onChange={handleChange}
                disabled
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Shift:</label>
              <input
                type="text"
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                disabled
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Date:</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Heat No.:</label>
              <input
                type="text"
                name="heat_no"
                value={formData.heat_no}
                disabled
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Component:</label>
              <input
                type="text"
                name="component"
                disabled
                value={formData.component}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Machine:</label>
              <input
                type="text"
                name="machine"
                value={formData.machine}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            {/* Second Row */}
            <div className="mb-4">
              <label className="block font-medium">Ring weight:</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">No Of Pcs.:</label>
              <input
                type="number"
                name="no_of_pic"
                value={formData.no_of_pic}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Operator:</label>
              <input
                type="text"
                name="operator"
                disabled
                value={formData.operator}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            
            <div className="mb-4">
              <label className="block font-medium">Target:</label>
              <input
                type="number"
                name="target"
                disabled
                value={formData.target}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Verified By:</label>
              <input
                type="text"
                name="verified_by"
                disabled
                value={formData.verified_by}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Shot_blast_edit_form;