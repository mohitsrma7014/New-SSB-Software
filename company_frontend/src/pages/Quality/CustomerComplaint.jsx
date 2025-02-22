import React, { useState, useEffect } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import "tailwindcss/tailwind.css";
import ComplaintForm from "./ComplaintForm";
import Notification from "./Notification";

import EditComplaintForm from "./EditComplaintForm";
import ComplaintHistory from "./ComplaintHistory";
import { Sidebar } from './Sidebar';
const API_URL = "http://192.168.1.199:8001/costumer_complaint/api/complaints/";

const CustomerComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      const sortedData = response.data.sort((a, b) => new Date(b.complaint_date) - new Date(a.complaint_date));
      const openComplaints = sortedData.filter(c => c.completion_status !== "closed");
      const closedComplaints = sortedData.filter(c => c.completion_status === "closed");
      setComplaints([...openComplaints, ...closedComplaints]);
      setFilteredComplaints([...openComplaints, ...closedComplaints]);
      setComplaints(response.data);
      setFilteredComplaints(response.data);
      extractSuggestions(response.data);
    } catch (error) {
      toast.error("Error fetching complaints");
    }
  };

  const handleEditClick = (complaint) => {
    setSelectedComplaint(complaint);
    setIsEditFormOpen(true);
  };

  const handleHistoryClick = (complaint) => {
    setSelectedComplaint(complaint);
    setIsHistoryOpen(true);
  };
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [filters, setFilters] = useState({
    date: "",
    customer: "",
    component: "",
    invoice: ""
  });
  const [suggestions, setSuggestions] = useState({
    customers: [],
    components: [],
    invoices: []
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  

  const extractSuggestions = (data) => {
    const customers = [...new Set(data.map(item => item.customer_name))];
    const components = [...new Set(data.map(item => item.part_number))];
    const invoices = [...new Set(data.map(item => item.invoice_batch_no))];
    setSuggestions({ customers, components, invoices });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    applyFilters({ ...filters, [name]: value });
  };

  const applyFilters = (updatedFilters) => {
    let filtered = complaints.filter(complaint =>
      (updatedFilters.id ? complaint.id.toString().includes(updatedFilters.id) : true) &&
      (updatedFilters.date ? complaint.complaint_date.includes(updatedFilters.date) : true) &&
      (updatedFilters.customer ? complaint.customer_name.includes(updatedFilters.customer) : true) &&
      (updatedFilters.component ? complaint.part_number.includes(updatedFilters.component) : true) &&
      (updatedFilters.invoice ? complaint.invoice_batch_no.includes(updatedFilters.invoice) : true)
    );
    setFilteredComplaints(filtered);
  };

  return (
    <div className="w-full h-screen flex flex-col p-0  bg-white mt-24">
       <Sidebar />
      <h2 className="text-2xl font-bold text-center mb-6">Customer Complaint Management</h2>
      <div className="fixed top-20 right-7 z-50">
        <Notification complaints={complaints} />
      </div>
      
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl">
            <ComplaintForm onClose={() => setIsFormOpen(false)} onSuccess={fetchComplaints} />
          </div>
        </div>
      )}
      {isEditFormOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <EditComplaintForm complaint={selectedComplaint} onClose={() => setIsEditFormOpen(false)} onSuccess={fetchComplaints} />
          </div>
        </div>
      )}
      {isHistoryOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <ComplaintHistory complaint={selectedComplaint} onClose={() => setIsHistoryOpen(false)} />
          </div>
        </div>
      )}
      <div className="flex justify-between items-center w-full p-4">
        <div className="flex space-x-2">
          <input type="text" name="id" value={filters.id} onChange={handleFilterChange} className="border p-2" placeholder="Filter by ID" />
          <input type="date" name="date" value={filters.date} onChange={handleFilterChange} className="border p-2" />
          <input list="customers" name="customer" value={filters.customer} onChange={handleFilterChange} className="border p-2" placeholder="Filter by Customer" />
          <datalist id="customers">{suggestions.customers.map((customer, index) => <option key={index} value={customer} />)}</datalist>
          <input list="components" name="component" value={filters.component} onChange={handleFilterChange} className="border p-2" placeholder="Filter by Component" />
          <datalist id="components">{suggestions.components.map((component, index) => <option key={index} value={component} />)}</datalist>
          <input list="invoices" name="invoice" value={filters.invoice} onChange={handleFilterChange} className="border p-2" placeholder="Filter by Invoice" />
          <datalist id="invoices">{suggestions.invoices.map((invoice, index) => <option key={index} value={invoice} />)}</datalist>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700" onClick={() => setIsFormOpen(true)}>
          + Add Complaint
        </button>
      </div>
      
      <div className="w-full h-[700px] overflow-y-auto">

      <table className="w-full border-collapse border rounded-lg shadow-md">

          <thead className="bg-gray-200 text-black sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2">Complaint Date</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Component</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Invoice/batch</th>
              <th className="px-4 py-2">Lot Size</th>
              <th className="px-4 py-2">Rejection Qty</th>
              <th className="px-4 py-2">Root Cause</th>
              <th className="px-4 py-2">Action Complaint Date</th>
              <th className="px-4 py-2">Capa Submission Date</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
          {filteredComplaints.map((complaint) => (
              <tr key={complaint.id} className="border-t">
                <td className="px-4 py-2 text-center">{complaint.complaint_date}</td>
                <td className="px-4 py-2 text-center">{complaint.customer_name}</td>
                <td className="px-4 py-2 text-center">{complaint.part_number}</td>
                <td className="px-4 py-2 text-center">{complaint.complaint_description}</td>
                <td className="px-4 py-2 text-center">{complaint.invoice_batch_no}</td>
                <td className="px-4 py-2 text-center">{complaint.lot_size}</td>
                <td className="px-4 py-2 text-center">{complaint.rejection_qty}</td>
                <td className="px-4 py-2 text-center">{complaint.root_cause}</td>
                <td className="px-4 py-2 text-center">{complaint.target_submission_date}</td>
                <td className="px-4 py-2 text-center">{complaint.capa_submission_date}</td>
                <td className={`px-4 py-2 text-center font-bold ${complaint.completion_status === "closed" ? "text-red-500" : "text-green-500"}`}>
                  {complaint.completion_status}
                </td>
                <td className="px-4 py-2 text-center flex justify-center gap-2">
                  <button 
                    className="bg-yellow-500 text-white px-3 py-1 rounded shadow hover:bg-yellow-600" 
                    onClick={() => handleEditClick(complaint)}
                  >
                    Details
                  </button>
                  <button 
                    className="bg-blue-500 text-white px-3 py-1 rounded shadow hover:bg-blue-600" 
                    onClick={() => handleHistoryClick(complaint)}
                  >
                    History
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerComplaint;