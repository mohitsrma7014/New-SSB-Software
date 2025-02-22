import React, { useState, useEffect } from "react";
import axios from "axios";

const Fi_edit_form = ({ forging, onClose }) => {
  const [formData, setFormData] = useState({
    component: "",
    part_name: "",
    customer: "",
    drawing_number: "",
    standerd: "",
    material_grade: "",
    slug_weight: "",
    bar_dia: "",
    ring_weight: "",
    cost: "",
    component_cycle_time: "",
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
          `http://192.168.1.199:8001/raw_material/MasterListViewSet/${formData.id}/`,
          formData
        );
      } else {
        // Create new record
        await axios.post(
          "http://192.168.1.199:8001/raw_material/MasterListViewSet/",
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
      <div className="bg-white p-6 rounded-lg w-full max-w-7xl shadow-lg overflow-y-auto">
        <h2 className="text-2xl mb-6">{formData.id ? "Edit Master List" : "Add Forging"}</h2>
        <form onSubmit={handleSubmit}>
          {/* Grid Layout for Fields */}
          <div className="grid grid-cols-2 md:grid-cols-7 gap-6">
            <div className="mb-4">
              <label className="block font-medium">Component:</label>
              <input
                type="text"
                name="component"
                value={formData.component}
                onChange={handleChange}
                disabled
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Part Name:</label>
              <input
                type="text"
                name="part_name"
                value={formData.part_name}
                onChange={handleChange}
                disabled
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">customer:</label>
              <input
                type="text"
                name="customer"
                value={formData.customer}
                disabled
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            
            <div className="mb-4">
              <label className="block font-medium">drawing_number:</label>
              <input
                type="text"
                name="drawing_number"
                disabled
                value={formData.drawing_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">standerd:</label>
              <input
                type="text"
                name="standerd"
                disabled
                value={formData.standerd}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">material_grade:</label>
              <input
                type="text"
                name="material_grade"
                value={formData.material_grade}
                disabled
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
           
            <div className="mb-4">
              <label className="block font-medium">slug_weight:</label>
              <input
                type="number"
                name="slug_weight"
                value={formData.slug_weight}
                disabled
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">bar_dia:</label>
              <input
                type="number"
                name="bar_dia"
                value={formData.bar_dia}
                disabled
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">ring_weight :</label>
              <input
                type="text"
                name="ring_weight"
                value={formData.ring_weight}
                disabled
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            
            <div className="mb-4">
              <label className="block font-medium">Production Time:</label>
              <input
                type="number"
                name="component_cycle_time"
                value={formData.component_cycle_time}
                
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

export default Fi_edit_form;