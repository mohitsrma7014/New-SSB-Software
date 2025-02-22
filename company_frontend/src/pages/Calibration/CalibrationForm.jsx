import React, { useState } from "react";
import axios from "axios";
import api from "../../api";
import { toast } from "react-toastify";

const API_URL = "http://192.168.1.199:8001/calibration/api/complaints/";

const getCurrentDate = (offsetDays = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split("T")[0]; // Format YYYY-MM-DD
};

const CalibrationForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    po_date: "",
    name_of_instrument: "",
    uid: "",
    catagory: "",
    department: "",
    supplier: "",
    CALIBRATION_AGENCY: "",
    CALIBRATION_DONE_DATE: "",
    due_date: "",
    RANGE: "",
    LEAST_COUNT: "",
    LOCATION: "",
    component: "",
    status: "",
    remark: "",
    add_pdf: null,
    serial_number:"",
  });
  
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const fetchComponentSuggestions = async (query) => {
    setLoadingSuggestions(true);
    try {
      const response = await axios.get("http://192.168.1.199:8001/raw_material/components/", {
        params: { component: query },
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching component suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSelectSuggestion = async (component) => {
    setFormData((prev) => ({ ...prev, component: component }));
    setSuggestions([]);
    try {
      const response = await axios.get("http://192.168.1.199:8001/raw_material/get-part-details/", {
        params: { component },
      });
      setFormData((prev) => ({
        ...prev,
        customer_name: response.data.customer,
      }));
    } catch (error) {
      console.error("Error fetching part details:", error);
      toast.error("Please enter a correct part number.");
      setFormData((prev) => ({ ...prev, component: "", customer_name: "" }));
    }
  };
 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "component" && value) fetchComponentSuggestions(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Create a FormData object to handle both text fields and file upload
    const formDataToSend = new FormData();
  
    // Append all form fields (ensure proper defaults)
    formDataToSend.append("po_date", formData.po_date || "");
    formDataToSend.append("name_of_instrument", formData.name_of_instrument || "");
    formDataToSend.append("uid", formData.uid || "");
    formDataToSend.append("catagory", formData.catagory || "Na");
    formDataToSend.append("department", formData.department || "");
    formDataToSend.append("supplier", formData.supplier || "");

    formDataToSend.append("CALIBRATION_AGENCY", formData.CALIBRATION_AGENCY || "Na");
    formDataToSend.append("CALIBRATION_DONE_DATE", formData.CALIBRATION_DONE_DATE || "Na");
    formDataToSend.append("due_date", formData.due_date || "");
    formDataToSend.append("RANGE", formData.RANGE || "Na");
    formDataToSend.append("LEAST_COUNT", formData.LEAST_COUNT || "Na");
    formDataToSend.append("LOCATION", formData.LOCATION || "Na");
    formDataToSend.append("component", formData.component || "Na");
    formDataToSend.append("status", formData.status || "Na");
    formDataToSend.append("remark", formData.remark || "Na");
    formDataToSend.append("serial_number", formData.serial_number || "Na");
   
    // Append file if a file is selected
    if (formData.add_pdf) {
      formDataToSend.append("add_pdf", formData.add_pdf);
    }
  
    try {
      await api.post(API_URL, formDataToSend, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "multipart/form-data", // Needed for file uploads
        },
      });
  
      toast.success("Complaint added successfully");
  
      // Reset form fields
      setFormData({
        po_date: "",
        name_of_instrument: "",
        uid: "",
        catagory: "",
        department: "",
        supplier:"",
        CALIBRATION_AGENCY: "",
        CALIBRATION_DONE_DATE: "",
        due_date: "",
        RANGE: 0,
        LEAST_COUNT: 0,
        LOCATION: "",
        component: "",
        status: "",
        remark: "",
        add_pdf: null,
        serial_number:"",
      });
  
      // Refresh the page
      setTimeout(() => {
        window.location.reload();
      }, 1000); // Delayed reload for better UX
  
    } catch (error) {
      toast.error(`Error adding complaint: ${error.response?.data?.message || "Unknown error"}`);
    }
  };
  
  

  
  return (
    <div className="popup-overlay">
      <div className="popup-content p-6 bg-white rounded-lg shadow-lg max-w-5xl">
        <button className="close-button" onClick={onClose}>×</button>
        <h3 className="text-xl font-semibold mb-4">Add Instrument</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-2">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Po Date:</label>
            <input type="date" name="po_date" className="form-control" value={formData.po_date} onChange={handleInputChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700"> Name Of Instrument:</label>
            <input  type="text" name="name_of_instrument" className="form-control" value={formData.name_of_instrument} onChange={handleInputChange} required></input>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">UID:</label>
            <input type="text" name="uid" className="form-control" value={formData.uid} onChange={handleInputChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Serial Number:</label>
            <input type="text" name="serial_number" className="form-control" value={formData.serial_number} onChange={handleInputChange} />
          </div>
         
          <div>
            <label className="block text-sm font-medium text-gray-700">Category:</label>
            <select
              name="catagory"
              className="form-control"
              value={formData.catagory}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a category</option>
              <option value="COMPARATOR STANDS">COMPARATOR STANDS</option>
              <option value="CNC INSTRUMENTS">CNC INSTRUMENTS</option>
              <option value="METALLURGY LAB INSTRUMENTS">METALLURGY LAB INSTRUMENTS</option>
              <option value="AIR BASED GAUGES">AIR BASED GAUGES</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Department:</label>
            <select
              name="department"
              className="form-control"
              value={formData.department}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a department</option>
              <option value="CNC">CNC</option>
              <option value="Lab">Lab</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Supplier:</label>
            <select
              name="supplier"
              className="form-control"
              value={formData.supplier}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a supplier</option>
              <option value="Supplier A">Supplier A</option>
              <option value="Supplier B">Supplier B</option>
              <option value="Supplier C">Supplier C</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Calibration Agency:</label>
            <select
              name="CALIBRATION_AGENCY"
              className="form-control"
              value={formData.CALIBRATION_AGENCY}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a calibration agency</option>
              <option value="Agency A">Agency A</option>
              <option value="Agency B">Agency B</option>
              <option value="Agency C">Agency C</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Calibration Done:</label>
            <input type="date" name="CALIBRATION_DONE_DATE" className="form-control" value={formData.CALIBRATION_DONE_DATE} onChange={handleInputChange} required/>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Calibration Due:</label>
            <input type="date" name="due_date" className="form-control" value={formData.due_date} onChange={handleInputChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Range:</label>
            <input type="text" name="RANGE" className="form-control" value={formData.RANGE} onChange={handleInputChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Least Count:</label>
            <input type="text" name="LEAST_COUNT" className="form-control" value={formData.LEAST_COUNT} onChange={handleInputChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location:</label>
            <select
              name="LOCATION"
              className="form-control"
              value={formData.LOCATION}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a location</option>
              <option value="Warehouse">Warehouse</option>
              <option value="Lab">Lab</option>
              <option value="Factory Floor">Factory Floor</option>
              <option value="Office">Office</option>
            </select>
          </div>


          <div >
            <label className="block text-sm font-medium text-gray-700">Component:</label>
            <input type="text" name="component" className="form-control" value={formData.component} onChange={handleInputChange} required/>
            {loadingSuggestions && <p className="text-sm text-gray-500">Loading...</p>}
            {suggestions.length > 0 && (
              <ul className="absolute max-w-xl bg-white border rounded-lg mt-1 shadow-md z-10 max-h-40 overflow-auto">
                {suggestions.map((s, index) => (
                  <li key={index} className="p-2 hover:bg-gray-100 cursor-pointer" onMouseDown={() => handleSelectSuggestion(s)}>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
          <label className="block text-sm font-medium text-gray-700">Status:</label>
          <select
            name="status"
            className="form-control"
            value={formData.status}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a status</option>
            <option value="Running">Running</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Remark:</label>
            <input type="test" name="remark" className="form-control" value={formData.remark} onChange={handleInputChange} />
          </div>
         
          <div>
            <label className="block text-sm font-medium text-gray-700">Add Certificate:</label>
            <input
              type="file"
              name="add_pdf"
              className="form-control"
              onChange={(e) => setFormData({ ...formData, add_pdf: e.target.files[0] })}
              accept=".pdf,.doc,.docx,.jpg,.png"
            />
          </div>
          <div className="col-span-3 text-center mt-4">
            <button type="submit" className="btn btn-primary">Add Complaint</button>
          </div>
        </form>
      </div>
    </div>
  );
  
  
};

export default CalibrationForm;
