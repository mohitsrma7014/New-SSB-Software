import React, { useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = "http://192.168.1.199:8001/costumer_complaint/api/complaints/";

const EditComplaintForm = ({ complaint, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ ...complaint, complaintfile: null, avidancefile: null });

  // Store existing file URLs
  const [existingComplaintFile, setExistingComplaintFile] = useState(complaint.complaintfile || null);
  const [existingAvidanceFile, setExistingAvidanceFile] = useState(complaint.avidancefile || null);

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
    if (name === "complaintfile") setExistingComplaintFile(null);
    if (name === "avidancefile") setExistingAvidanceFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    // Append form fields except files
    Object.keys(formData).forEach((key) => {
      if (!["complaintfile", "avidancefile"].includes(key)) {
        formDataToSend.append(key, formData[key]);
      }
    });

    // Append new files if uploaded
    if (formData.complaintfile) {
      formDataToSend.append("complaintfile", formData.complaintfile);
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
            <h5 className="modal-title">Complaint Details</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-1">
              
            <div className="mb-2">
                <label>Part Number:</label>
                <input type="text" name="part_number" className="form-control"  readOnly value={formData.part_number} onChange={handleInputChange} />
              </div>
              <div className="mb-2">
                <label>Customer Name:</label>
                <input type="text" name="customer_name" className="form-control"  readOnly value={formData.customer_name} onChange={handleInputChange} required />
              </div>
              <div className="mb-2">
                <label>Complaint Description:</label>
                <textarea name="complaint_description" className="form-control" value={formData.complaint_description} onChange={handleInputChange} required></textarea>
              </div>
              
              <div className="mb-2">
                <label>Target Submission Date:</label>
                <input type="date" name="target_submission_date" className="form-control" value={formData.target_submission_date} onChange={handleInputChange} />
              </div>
              
              <div className="mb-2">
                <label>Is Repeated:</label>
                <input type="checkbox" name="is_repeated" className="form-check-input" checked={formData.is_repeated} onChange={handleInputChange} />
              </div>
              <div className="mb-2">
                <label>Invoice Batch No:</label>
                <input type="text" name="invoice_batch_no" className="form-control" value={formData.invoice_batch_no} onChange={handleInputChange} />
              </div>
              <div className="mb-2">
                <label>Lot Size:</label>
                <input type="number" name="lot_size" className="form-control" value={formData.lot_size} onChange={handleInputChange} />
              </div>
              <div className="mb-2">
                <label>Rejected Qty:</label>
                <input type="number" name="rejection_qty" className="form-control" value={formData.rejection_qty} onChange={handleInputChange} />
              </div>
              <div className="mb-2">
                <label>Phenomena :</label>
                <input type="text" name="phenomena" className="form-control" value={formData.phenomena} onChange={handleInputChange} />
              </div>
              <div className="mb-2">
                <label>interim_action :</label>
                <input type="text" name="interim_action" className="form-control" value={formData.interim_action} onChange={handleInputChange} />
              </div>
              <div className="mb-2">
                <label>root_cause :</label>
                <input type="text" name="root_cause" className="form-control" value={formData.root_cause} onChange={handleInputChange} />
              </div>
              <div className="mb-2">
                <label>corrective_action :</label>
                <input type="text" name="corrective_action" className="form-control" value={formData.corrective_action} onChange={handleInputChange} />
              </div>
              <div className="mb-2">
                <label>documents_revised :</label>
                <input type="text" name="documents_revised" className="form-control" value={formData.documents_revised} onChange={handleInputChange} />
              </div>
              <div className="mb-2">
                <label>effectiveness_review :</label>
                <input type="text" name="effectiveness_review" className="form-control" value={formData.effectiveness_review} onChange={handleInputChange} />
              </div>

              <div className="mb-2">
                <label>Complaint File:</label>
                {existingComplaintFile ? (
                  <div>
                    <a href={existingComplaintFile} target="_blank" rel="noopener noreferrer" className="btn btn-info btn-sm me-2">
                      View File
                    </a>
                    <input type="file" name="complaintfile" className="form-control mt-2" onChange={handleFileChange} />
                  </div>
                ) : (
                  <input type="file" name="complaintfile" className="form-control" onChange={handleFileChange} />
                )}
              </div>

              <div className="mb-2">
                <label>Evidence File:</label>
                {existingAvidanceFile ? (
                  <div>
                    <a href={existingAvidanceFile} target="_blank" rel="noopener noreferrer" className="btn btn-info btn-sm me-2">
                      View File
                    </a>
                    <input type="file" name="avidancefile" className="form-control mt-2" onChange={handleFileChange} />
                  </div>
                ) : (
                  <input type="file" name="avidancefile" className="form-control" onChange={handleFileChange} />
                )}
              </div>

              <div className="mb-2">
                <label>Status:</label>
                <select
                  name="completion_status"
                  className="form-control"
                  value={formData.completion_status}
                  onChange={handleInputChange}
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
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

export default EditComplaintForm;
