import React, { useState, useEffect } from "react";
import api from "../../api";
import { toast } from "react-toastify";

const ComplaintHistory = ({ complaint, onClose }) => {
  const [history, setHistory] = useState([]);
  const API_URL = `http://192.168.1.199:8001/costumer_complaint/api/complaints/${complaint?.id}/history/`;

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
    <div 
      className="modal show d-flex align-items-center justify-content-center"
      style={{ zIndex: 1050, position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog" style={{ maxWidth: "800px", width: "90%" }}>  
        <div className="modal-content" style={{ height: "600px", top: 50}}> 
          <div className="modal-header">
            <h5 className="modal-title">Complaint History</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body" style={{ overflowY: "auto", maxHeight: "500px" }}>
            {history.length > 0 ? (
              <ul className="list-group">
                {history.map((entry, index) => {
                  const isFileField = ["complaintfile", "evidencefile"].includes(entry.field_changed);
                  let newFileUrl = entry.new_value;
                  if (isFileField && entry.old_value?.startsWith("http") && entry.new_value) {
                    const oldFilePath = entry.old_value.substring(0, entry.old_value.lastIndexOf("/") + 1);
                    newFileUrl = oldFilePath + entry.new_value;
                  }

                  return (
                    <li key={index} className="list-group-item">
                      <strong>{entry.field_changed}</strong>: 
                      {entry.old_value?.startsWith("http") ? (
                        <a href={entry.old_value} target="_blank" rel="noopener noreferrer">
                          <span className="badge bg-secondary">Old File</span>
                        </a>
                      ) : (
                        entry.old_value
                      )}
                      {" → "}
                      {newFileUrl?.startsWith("http") ? (
                        <a href={newFileUrl} target="_blank" rel="noopener noreferrer">
                          <span className="badge bg-primary">New File</span>
                        </a>
                      ) : (
                        entry.new_value
                      )}
                      <span className="text-muted"> (by {entry.changed_by})</span>
                    </li>
                  );
                })}
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

export default ComplaintHistory;
