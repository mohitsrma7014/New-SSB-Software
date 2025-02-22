import React, { useState, useEffect } from "react";
import axios from "axios";

const Ht_edit_form = ({ forging, onClose }) => {
  const [formData, setFormData] = useState({
    batch_number: "",
    date: "",
    shift: "",
    process: "",
    component: "",
    supervisor: "",
    operator: "",
    remark: "",
    ringweight: "",
    production: "",
    cycle_time: "",
    unit: "",
    heat_no: "",
    target: "",
    hardness: "",
    micro: "",
    grain_size: "",
    verified_by: "",
    total_produced: "",
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
          `http://192.168.1.199:8001/heat_treatment/HeattreatmentViewSet/${formData.id}/`,
          formData
        );
      } else {
        // Create new record
        await axios.post(
          "http://192.168.1.199:8001/heat_treatment/HeattreatmentViewSet/",
          formData
        );
      }
      onClose(); // Close the form after saving
    } catch (error) {
      console.error("Error saving the Heat-Treatment m/c", error);
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
              <label className="block font-medium">shift:</label>
              <input
                type="text"
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Process:</label>
              <input
                type="text"
                name="process"
                value={formData.process}
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
              <label className="block font-medium">Supervisor:</label>
              <input
                type="text"
                name="supervisor"
                value={formData.supervisor}
                disabled
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Operator:</label>
              <input
                type="text"
                name="operator"
                value={formData.operator}
                disabled
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Remark:</label>
              <input
                type="text"
                name="remark"
                value={formData.remark}
                
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Ring-Wight:</label>
              <input
                type="number"
                name="ringweight"
                value={formData.ringweight}
                
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Production:</label>
              <input
                type="number"
                name="production"
                value={formData.production}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Cycle Time:</label>
              <input
                type="text"
                name="cycle_time"
                value={formData.cycle_time}
                
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Unit:</label>
              <input
                type="number"
                name="unit"
                value={formData.unit}
                
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

            {/* Second Row */}
            <div className="mb-4">
              <label className="block font-medium">Hardness:</label>
              <input
                type="text"
                name="hardness"
                value={formData.hardness}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Micro</label>
              
              {formData.micro ? (
                <button
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                  onClick={() => handleViewFile(formData.micro)}
                >
                  View
                </button>
              ) : (
                <p className="mt-2 text-gray-500">File not attached</p>
              )}
            </div>

            
            <div className="mb-4">
              <label className="block font-medium">Grain size:</label>
              
              {formData.grain_size ? (
                <button
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                  onClick={() => handleViewFile(formData.grain_size)}
                >
                  View
                </button>
              ) : (
                <p className="mt-2 text-gray-500">File not attached</p>
              )}
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

export default Ht_edit_form;