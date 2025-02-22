import React, { useState, useEffect } from "react";
import axios from "axios";

const ForgingForm = ({ forging, onClose }) => {
  const [formData, setFormData] = useState({
    batch_number: "",
    date: "",
    shift: "",
    component: "",
    customer: "",
    slug_weight: "",
    rm_grade: "",
    heat_number: "",
    line: "",
    line_incharge: "",
    forman: "",
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
          `http://192.168.1.199:8001/forging/ForgingViewSet/${formData.id}/`,
          formData
        );
      } else {
        // Create new record
        await axios.post(
          "http://192.168.1.199:8001/forging/ForgingViewSet/",
          formData
        );
      }
      onClose(); // Close the form after saving
    } catch (error) {
      console.error("Error saving the forging", error);
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
              <label className="block font-medium">Shift:</label>
              <input
                type="text"
                name="shift"
                value={formData.shift}
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
              <label className="block font-medium">Customer:</label>
              <input
                type="text"
                name="customer"
                disabled
                value={formData.customer}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            {/* Second Row */}
            <div className="mb-4">
              <label className="block font-medium">Slug Weight:</label>
              <input
                type="number"
                name="slug_weight"
                value={formData.slug_weight}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">RM Grade:</label>
              <input
                type="text"
                name="rm_grade"
                disabled
                value={formData.rm_grade}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Heat Number:</label>
              <input
                type="text"
                name="heat_number"
                disabled
                value={formData.heat_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Line:</label>
              <input
                type="text"
                name="line"
                disabled
                value={formData.line}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Line Incharge:</label>
              <input
                type="text"
                name="line_incharge"
                disabled
                value={formData.line_incharge}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            {/* Third Row (non-editable fields) */}
            <div className="mb-4">
              <label className="block font-medium">Forman:</label>
              <input
                type="text"
                name="forman"
                disabled
                value={formData.forman}
                
                className="w-full px-4 py-2 border rounded-md bg-gray-200"
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
              <label className="block font-medium">Production:</label>
              <input
                type="number"
                name="production"
                value={formData.production}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Rework:</label>
              <input
                type="number"
                name="rework"
                value={formData.rework}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Up Setting:</label>
              <input
                type="number"
                name="up_setting"
                value={formData.up_setting}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            {/* Fourth Row */}
            <div className="mb-4">
              <label className="block font-medium">Half Piercing:</label>
              <input
                type="number"
                name="half_piercing"
                value={formData.half_piercing}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Full Piercing:</label>
              <input
                type="number"
                name="full_piercing"
                value={formData.full_piercing}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Ring Rolling:</label>
              <input
                type="number"
                name="ring_rolling"
                value={formData.ring_rolling}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Sizing:</label>
              <input
                type="number"
                name="sizing"
                value={formData.sizing}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Overheat:</label>
              <input
                type="number"
                name="overheat"
                value={formData.overheat}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            {/* Fifth Row */}
            <div className="mb-4">
              <label className="block font-medium">Bar Crack PCS:</label>
              <input
                type="number"
                name="bar_crack_pcs"
                value={formData.bar_crack_pcs}
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

export default ForgingForm;
