import React, { useState } from "react";
import axios from "axios";
import api from "../../api";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = "http://192.168.1.199:8001/cnc/api/complaints/";

const CncLineForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    line: "",
    cell: "",
    machine_no: "",
    machine_cycle_time: "",
    runningstatus: "",
    remark: "",
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
    setFormData((prev) => ({ ...prev, part_number: component }));
    try {
      const response = await axios.get("http://192.168.1.199:8001/raw_material/get-part-details/", {
        params: { component },
      });
      const data = response.data;
      setFormData((prev) => ({
        ...prev,
        customer_name: data.customer,
        part_number: component,
      }));
    } catch (error) {
      console.error("Error fetching part details:", error);
      alert("Please enter a correct part number.");
      setFormData((prev) => ({ ...prev, part_number: "", customer_name: "" }));
    }
    setSuggestions([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "part_number" && value) fetchComponentSuggestions(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(API_URL, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      toast.success("Complaint added successfully");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Error adding complaint");
    }
  };
  
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h3>Add Complaint</h3>
        <form onSubmit={handleSubmit} className="mb-4">
        
          {/* Row for Line Name and Cell */}
          <div className="row mb-2">
            <div className="col-6">
              <label>Line Name:</label>
              <select 
                name="line" 
                className="form-control" 
                value={formData.line} 
                onChange={handleInputChange} 
                required
              >
                <option value="">Select a Line</option>
                <option value="Line-A">Line-A</option>
                <option value="Line-B">Line-B</option>
                <option value="Line-C">Line-C</option>
                <option value="Basement">Basement</option>
                <option value="New Plant">New Plant</option>
              </select>
            </div>
            
            <div className="col-6">
              <label>Cell:</label>
              <input 
                name="cell" 
                className="form-control" 
                value={formData.cell} 
                onChange={handleInputChange} 
                pattern="C(1[0-9]|20|[1-9])" 
                title="Please enter a value between C1 and C20" 
                required
              />
            </div>
          </div>
          
          {/* Row for Machine No. and Machine Cycle Time */}
          <div className="row mb-2">
            <div className="col-6">
              <label>Machine No.:</label>
              <input 
                type="text" 
                name="machine_no" 
                className="form-control" 
                value={formData.machine_no} 
                onChange={handleInputChange} 
                pattern="^M([1-9]|[1-9][0-9]|100)$" 
                title="Please enter a value between M1 and M100" 
                required
              />
            </div>
            
            <div className="col-6">
              <label>Machine Cycle Time:</label>
              <input 
                type="number" 
                name="machine_cycle_time" 
                className="form-control" 
                value={formData.machine_cycle_time} 
                onChange={handleInputChange} 
                min="1" 
                max="36000" 
                required 
              />
            </div>
          </div>
  
          {/* Row for Running Status and Remark */}
          <div className="row mb-2">
            <div className="col-6">
              <label>Running Status:</label>
              <select 
                name="runningstatus" 
                className="form-control" 
                value={formData.runningstatus} 
                onChange={handleInputChange} 
                required
              >
                <option value="">Select Status</option>
                <option value="RUNNING">RUNNING</option>
                <option value="NOT RUNNING">NOT RUNNING</option>
              </select>
            </div>
            
            <div className="col-6">
              <label>Remark:</label>
              <input 
                type="text" 
                name="remark" 
                className="form-control" 
                value={formData.remark} 
                onChange={handleInputChange} 
                required
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary">Add Machine</button>
        </form>
      </div>
    </div>
  );
  
};

export default CncLineForm;
