import React, { useState, useEffect } from "react";
import api from "../../api";
import { toast } from "react-toastify";

const CncLineHistory = ({ complaint, onClose }) => {
  const [history, setHistory] = useState([]);
  const API_URL = `http://192.168.1.199:8001/cnc/api/complaints/${complaint?.id}/history/`;

  useEffect(() => {
    if (complaint?.id) {
      fetchHistory();
    }
  }, [complaint]);

  const fetchHistory = async () => {
    try {
      const response = await api.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      setHistory(response.data);
    } catch (error) {
      toast.error("Error fetching complaint history");
    }
  };

  return (
    <div className="modal show d-block mt-[100px]" style={{ zIndex: 1050 }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Complaint History</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {history.length > 0 ? (
              <ul className="list-group">
                {history.map((entry, index) => (
                  <li key={index} className="list-group-item">
                    <strong>{entry.field_changed}</strong>: {entry.old_value} → {entry.new_value}  
                    <span className="text-muted"> (by {entry.changed_by})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No history available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CncLineHistory;
