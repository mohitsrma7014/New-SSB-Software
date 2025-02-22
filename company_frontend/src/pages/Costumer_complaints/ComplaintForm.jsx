import React, { useState } from "react";
import axios from "axios";
import api from "../../api";
import { toast } from "react-toastify";

const API_URL = "http://192.168.1.199:8001/costumer_complaint/api/complaints/";

const getCurrentDate = (offsetDays = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split("T")[0]; // Format YYYY-MM-DD
};

const ComplaintForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    customer_name: "",
    complaint_description: "",
    complaint_date: "",
    target_submission_date: getCurrentDate(7),
    part_number: "",
    phenomena: "",
    is_repeated: false,
    invoice_batch_no: "",
    lot_size: 0,
    rejection_qty: 0,
    interim_action: "",
    root_cause: "",
    corrective_action: "",
    documents_revised: "",
    action_complaint_date: getCurrentDate(7), // Default to today + 7 days
    capa_submission_date: getCurrentDate(28), // Default to today + 28 days
    effectiveness_review: "",
    completion_status: "open",
    complaintfile: null,
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
      setFormData((prev) => ({ ...prev, part_number: "", customer_name: "" }));
    }
  };
 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "part_number" && value) fetchComponentSuggestions(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Create a FormData object to handle both text fields and file upload
    const formDataToSend = new FormData();
  
    // Append all form fields (ensure proper defaults)
    formDataToSend.append("customer_name", formData.customer_name || "");
    formDataToSend.append("complaint_description", formData.complaint_description || "");
    formDataToSend.append("complaint_date", formData.complaint_date || "");
    formDataToSend.append("target_submission_date", formData.target_submission_date || getCurrentDate(7));
    formDataToSend.append("part_number", formData.part_number || "");
    formDataToSend.append("phenomena", formData.phenomena || "Na");
    formDataToSend.append("is_repeated", formData.is_repeated ? "true" : "false");
    formDataToSend.append("invoice_batch_no", formData.invoice_batch_no || "");
    formDataToSend.append("lot_size", formData.lot_size ? Number(formData.lot_size) : 0);
    formDataToSend.append("rejection_qty", formData.rejection_qty ? Number(formData.rejection_qty) : 0);
    formDataToSend.append("interim_action", formData.interim_action || "Na");
    formDataToSend.append("root_cause", formData.root_cause || "Na");
    formDataToSend.append("corrective_action", formData.corrective_action || "Na");
    formDataToSend.append("documents_revised", formData.documents_revised || "Na");
    formDataToSend.append("action_complaint_date", formData.action_complaint_date || getCurrentDate(7));
    formDataToSend.append("capa_submission_date", formData.capa_submission_date || getCurrentDate(28));
    formDataToSend.append("effectiveness_review", formData.effectiveness_review || "Under review");
    formDataToSend.append("completion_status", formData.completion_status || "open");
  
    // Append file if a file is selected
    if (formData.complaintfile) {
      formDataToSend.append("complaintfile", formData.complaintfile);
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
        customer_name: "",
        complaint_description: "",
        complaint_date: "",
        target_submission_date: getCurrentDate(7),
        part_number: "",
        phenomena: "",
        is_repeated: false,
        invoice_batch_no: "",
        lot_size: 0,
        rejection_qty: 0,
        interim_action: "",
        root_cause: "",
        corrective_action: "",
        documents_revised: "",
        action_complaint_date: getCurrentDate(7),
        capa_submission_date: getCurrentDate(28),
        effectiveness_review: "",
        completion_status: "open",
        complaintfile: null, // Reset file field
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
        <h3 className="text-xl font-semibold mb-4">Add Complaint</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">Part Number:</label>
            <input
              type="text"
              name="part_number"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.part_number}
              onChange={handleInputChange}
            />
            {loadingSuggestions && <p className="text-sm text-gray-500">Loading...</p>}
            {suggestions.length > 0 && (
              <ul className="absolute w-full bg-white border rounded-lg mt-1 shadow-md z-10 max-h-40 overflow-auto">
                {suggestions.map((s, index) => (
                  <li key={index} className="p-2 hover:bg-gray-100 cursor-pointer" onMouseDown={() => handleSelectSuggestion(s)}>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Name:</label>
            <input type="text" name="customer_name" className="form-control" value={formData.customer_name} onChange={handleInputChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Complaint Description:</label>
            <textarea name="complaint_description" className="form-control" value={formData.complaint_description} onChange={handleInputChange} required></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Complaint Date:</label>
            <input type="date" name="complaint_date" className="form-control" value={formData.complaint_date} onChange={handleInputChange} required />
          </div>
         
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Is Repeated:</label>
            <input type="checkbox" name="is_repeated" className="form-check-input" checked={formData.is_repeated} onChange={handleInputChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Invoice Batch No:</label>
            <input type="text" name="invoice_batch_no" className="form-control" value={formData.invoice_batch_no} onChange={handleInputChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Lot Size:</label>
            <input type="number" name="lot_size" className="form-control" value={formData.lot_size} onChange={handleInputChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rejected Qty:</label>
            <input type="number" name="rejection_qty" className="form-control" value={formData.rejection_qty} onChange={handleInputChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Complaint File:</label>
            <input
              type="file"
              name="complaintfile"
              className="form-control"
              onChange={(e) => setFormData({ ...formData, complaintfile: e.target.files[0] })}
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

export default ComplaintForm;
