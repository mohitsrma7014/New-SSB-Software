import React, { useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = "http://192.168.1.199:8001/calibration/api/complaints/";

const EditcalibrationForm = ({ complaint, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ ...complaint, add_pdf: null, avidancefile: null });

  // Store existing file URLs
  const [existingComplaintFile, setExistingComplaintFile] = useState(complaint.add_pdf || null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });

    // Remove reference to the old file
    if (name === "add_pdf") setExistingComplaintFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    // Append form fields except files
    Object.keys(formData).forEach((key) => {
      if (!["add_pdf", "avidancefile"].includes(key)) {
        formDataToSend.append(key, formData[key]);
      }
    });

    // Append new files if uploaded
    if (formData.add_pdf) {
      formDataToSend.append("add_pdf", formData.add_pdf);
    }
    if (formData.avidancefile) {
      formDataToSend.append("avidancefile", formData.avidancefile);
    }

    try {
      await api.put(`${API_URL}${complaint.id}/`, formDataToSend, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Complaint updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Error updating complaint");
    }
  };

  return (
    <div 
      className="modal show d-flex align-items-center justify-content-center"
      style={{
        zIndex: 1050, position: "fixed", top: 0, left: 0, width: "100vw", 
        height: "100vh", backgroundColor: "rgba(0, 0, 0, 0.5)"
      }}
    >
      <div className="popup-content p-3 bg-white rounded-lg shadow-lg max-w-5xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Instrument Details</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-1">
              
            <div className="mb-2">
                <label>Po Date:</label>
                <input type="date" name="po_date" className="form-control"   value={formData.po_date} onChange={handleInputChange} />
              </div>
              <div className="mb-2">
                <label>Name Of Instrument:</label>
                <input type="text" name="name_of_instrument" className="form-control"  readOnly value={formData.name_of_instrument} onChange={handleInputChange} required />
              </div>
              <div className="mb-2">
                <label> UID:</label>
                <input name="uid" className="form-control" value={formData.uid} readOnly onChange={handleInputChange} required></input>
              </div>

              <div className="mb-2">
                <label> Serial vnumber:</label>
                <input name="serial_number" className="form-control" value={formData.serial_number} onChange={handleInputChange} required></input>
              </div>
              
              <div className="mb-2">
                <label>catagory:</label>
                <input type="text" name="catagory" className="form-control" readOnly value={formData.catagory} onChange={handleInputChange} />
              </div>
              
              <div className="mb-2">
                <label>Department:</label>
                <input type="text" name="department" className="form-control" value={formData.department} onChange={handleInputChange} />
              </div>
              <div className="mb-2">
                <label>Supplier:</label>
                <input type="text" name="supplier" className="form-control" readOnly value={formData.supplier} onChange={handleInputChange} />
              </div>
              <div className="mb-2">
                <label>Agency:</label>
                <input type="text" name="CALIBRATION_AGENCY" className="form-control" value={formData.CALIBRATION_AGENCY} onChange={handleInputChange} />
              </div>
              <div className="mb-2">
                <label>Calibration Done:</label>
                <input type="date" name="CALIBRATION_DONE_DATE" className="form-control" value={formData.CALIBRATION_DONE_DATE} onChange={handleInputChange} />
              </div>
              <div className="mb-2">
                <label>Calibration Due :</label>
                <input type="date" name="due_date" className="form-control" value={formData.due_date} onChange={handleInputChange} />
              </div>
              <div className="mb-2">
                <label>Range:</label>
                <input type="text" name="RANGE" className="form-control" value={formData.RANGE} onChange={handleInputChange} />
              </div>
              <div className="mb-2">
                <label>Least Count :</label>
                <input type="text" name="LEAST_COUNT" className="form-control" value={formData.LEAST_COUNT} onChange={handleInputChange} />
              </div>
              <div className="mb-2">
                <label>Location :</label>
                <input type="text" name="LOCATION" className="form-control" value={formData.LOCATION} onChange={handleInputChange} />
              </div>
              <div className="mb-2">
                <label>Component :</label>
                <input type="text" name="component" className="form-control" value={formData.component} onChange={handleInputChange} />
              </div>
              <div className="mb-2">
                  <label>Status :</label>
                  <select
                    name="status"
                    className="form-control"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Running">Running</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

              <div className="mb-2">
                <label>Remark :</label>
                <input type="text" name="remark" className="form-control" value={formData.remark} onChange={handleInputChange} />
              </div>

              <div className="mb-2">
                <label>Certificate:</label>
                {existingComplaintFile ? (
                  <div>
                    <a href={existingComplaintFile} target="_blank" rel="noopener noreferrer" className="btn btn-info btn-sm me-2">
                      View File
                    </a>
                    <input type="file" name="add_pdf" className="form-control mt-2" onChange={handleFileChange} />
                  </div>
                ) : (
                  <input type="file" name="add_pdf" className="form-control" onChange={handleFileChange} />
                )}
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

export default EditcalibrationForm;
