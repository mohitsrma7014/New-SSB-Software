import React, { useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = "http://192.168.1.199:8001/cnc/api/complaints/";

const EditlineForm = ({ complaint, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ ...complaint });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`${API_URL}${complaint.id}/`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      toast.success("Complaint updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Error updating complaint");
    }
  };

  return (
    <div className="modal show d-block fixed inset-0 flex items-center justify-center mt-[100px]" style={{ zIndex: 1050 }}>
      <div className="modal-dialog ">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Complaint</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
            
              {/* Row for Line and Cell */}
              <div className="row mb-2">
                <div className="col-6">
                  <label>Line:</label>
                  <input 
                    name="line" 
                    className="form-control" 
                    value={formData.line} 
                    onChange={handleInputChange} 
                    required
                    readOnly
                  />
                </div>
                
                <div className="col-6">
                  <label>Cell:</label>
                  <input 
                    type="text" 
                    name="cell" 
                    className="form-control" 
                    value={formData.cell} 
                    onChange={handleInputChange} 
                    pattern="^C([1-9]|[1-2][0-9]|30)$" 
                    title="Please enter a value between C1 and C30" 
                    required
                    readOnly
                  />
                </div>
              </div>
              
              {/* Row for Machine No and Running Time */}
              <div className="row mb-2">
                <div className="col-6">
                  <label>Machine No:</label>
                  <input 
                    type="text" 
                    name="machine_no" 
                    className="form-control" 
                    value={formData.machine_no} 
                    onChange={handleInputChange} 
                    pattern="^M([1-9]|[1-9][0-9]|100)$" 
                    title="Please enter a value between M1 and M100" 
                    required
                    readOnly
                  />
                </div>
  
                <div className="col-6">
                  <label>Running Time:</label>
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
                  />
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary">Update Complaint</button>
              <button type="button" className="btn btn-secondary ms-2" onClick={onClose}>Cancel</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default EditlineForm;