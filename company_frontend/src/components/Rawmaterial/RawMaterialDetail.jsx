import React, { useState, useEffect } from "react";
import axios from "axios";
import './RawMaterialDetail.css'; // import CSS file
import PrintSlip from './PrintSlip'; // import PrintSlip component
import { Sidebar } from './Sidebar';

const RawMaterialDetail = ({ materialId, onBack }) => {
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState({
    milltc: null,
    spectro: null,
    ssb_inspection_report: null,
  });
  const [showPrintSlip, setShowPrintSlip] = useState(false); // State to toggle PrintSlip visibility
  const handlePrint = () => {
    setShowPrintSlip(true);
  };
  

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const response = await axios.get(
          `http://192.168.1.199:8001/raw_material/api/rawmaterials/${materialId}/`
        );
        setMaterial(response.data);
      } catch (error) {
        console.error("Error fetching material details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [materialId]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("weight", material.weight);
    formData.append("approval_status", material.approval_status);
    formData.append("comments", material.comments); // Add this line

    Object.keys(files).forEach((key) => {
      if (files[key]) {
        formData.append(key, files[key]);
      }
    });

    try {
      const response = await axios.put(
        `http://192.168.1.199:8001/raw_material/api/rawmaterials/${materialId}/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert("Material updated successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error updating material:", error.message);
      alert(`Failed to update material: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this material?");
    if (confirmDelete) {
      try {
        await axios.delete(
          `http://192.168.1.199:8001/raw_material/api/rawmaterials/${materialId}/`
        );
        alert("Material deleted successfully!");
        onBack();  // Navigate back to the list or reset the state after deletion
      } catch (error) {
        console.error("Error deleting material:", error.message);
        alert(`Failed to delete material: ${error.message}`);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaterial((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (fileList.length > 0) {
      setFiles((prev) => ({ ...prev, [name]: fileList[0] }));
    } else {
      setFiles((prev) => ({ ...prev, [name]: null }));
    }
  };

  const areAllFilesAttached = Object.values(files).every((file) => file !== null);

  const isFilesPreAttached = material && Object.keys(files).some(
    (key) => material[key] && !files[key]
  );

  if (loading) {
    return <p>Loading material details...</p>;
  }

  return (
    <div className="container mx-auto p-4 mt-[100px]">

        {showPrintSlip ? (
          <PrintSlip material={material} />
        ) : (
          <>
            <div className="ml-1/4 p-4">
              <h1 className="text-2xl font-bold mb-6">Material Details</h1>
              <form onSubmit={handleUpdate} className="space-y-6">
                {/* First row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <label className="flex flex-col">
                    Date:
                    <input
                      type="date"
                      name="date"
                      value={material.date || ""}
                      onChange={handleChange}
                      
                      className="input"
                    />
                  </label>
                  <label className="flex flex-col">
                    Supplier:
                    <input
                      type="text"
                      name="supplier"
                      value={material.supplier || ""}
                      onChange={handleChange}
                      disabled
                      className="input"
                    />
                  </label>
                  <label className="flex flex-col">
                    Grade:
                    <input
                      type="text"
                      name="grade"
                      value={material.grade || ""}
                      onChange={handleChange}
                      disabled
                      className="input"
                    />
                  </label>
                  <label className="flex flex-col">
                    Customer:
                    <input
                      type="text"
                      name="customer"
                      value={material.customer || ""}
                      onChange={handleChange}
                      disabled
                      className="input"
                    />
                  </label>
                </div>
    
                {/* Second row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <label className="flex flex-col">
                    Standard:
                    <input
                      type="text"
                      name="standerd"
                      value={material.standerd || ""}
                      onChange={handleChange}
                      
                      className="input"
                    />
                  </label>
                  <label className="flex flex-col">
                    Heat No:
                    <input
                      type="text"
                      name="heatno"
                      value={material.heatno || ""}
                      onChange={handleChange}
                      disabled
                      className="input"
                    />
                  </label>
                  <label className="flex flex-col">
                    Diameter:
                    <input
                      type="text"
                      name="dia"
                      value={material.dia || ""}
                      onChange={handleChange}
                      disabled
                      className="input"
                    />
                  </label>
                  <label className="flex flex-col">
                    Weight:
                    <input
                      type="number"
                      step="0.01"
                      name="weight"
                      value={material.weight || ""}
                      onChange={handleChange}
                      className="input editable-input"
                    />
                  </label>
                </div>
    
                {/* Third row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <label className="flex flex-col">
                    Rack No:
                    <input
                      type="text"
                      name="rack_no"
                      value={material.rack_no || ""}
                      onChange={handleChange}
                      disabled
                      className="input"
                    />
                  </label>
                  <label className="flex flex-col">
                    Location:
                    <input
                      type="text"
                      name="location"
                      value={material.location || ""}
                      onChange={handleChange}
                      disabled
                      className="input"
                    />
                  </label>
                  <label className="flex flex-col">
                    Type of Material:
                    <input
                      type="text"
                      name="type_of_material"
                      value={material.type_of_material || ""}
                      onChange={handleChange}
                      disabled
                      className="input"
                    />
                  </label>
                  <label className="flex flex-col">
                    Cost Per Kg:
                    <input
                      type="number"
                      step="0.01"
                      name="cost_per_kg"
                      value={material.cost_per_kg || ""}
                      onChange={handleChange}
                      disabled
                      className="input"
                    />
                  </label>
                </div>
    
                {/* Fourth row with file inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <label className="flex flex-col">
                    Invoice No:
                    <input
                      type="text"
                      name="invoice_no"
                      value={material.invoice_no || ""}
                      onChange={handleChange}
                      
                      className="input"
                    />
                  </label>
                  <label className="flex flex-col">
                    Mill TC:
                    <input type="file" name="milltc" onChange={handleFileChange} className="input" />
                    {material.milltc && (
                      <div>
                        <a
                          href={material.milltc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          View Existing File
                        </a>
                      </div>
                    )}
                  </label>
                  <label className="flex flex-col">
                    Spectro:
                    <input type="file" name="spectro" onChange={handleFileChange} className="input" />
                    {material.spectro && (
                      <div>
                        <a
                          href={material.spectro}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          View Existing File
                        </a>
                      </div>
                    )}
                  </label>
                  <label className="flex flex-col">
                    SSB Inspection Report:
                    <input
                      type="file"
                      name="ssb_inspection_report"
                      onChange={handleFileChange}
                      className="input"
                    />
                    {material.ssb_inspection_report && (
                      <div>
                        <a
                          href={material.ssb_inspection_report}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          View Existing File
                        </a>
                      </div>
                    )}
                  </label>
                </div>
    
                {/* Final row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <label className="flex flex-col">
                    Verified By:
                    <input
                      type="text"
                      name="verified_by"
                      value={material.verified_by || ""}
                      onChange={handleChange}
                      disabled
                      className="input"
                    />
                  </label>
                  <label className="flex flex-col">
                    Approval Status:
                    <select
                      name="approval_status"
                      value={material.approval_status || ""}
                      onChange={handleChange}
                      className="input editable-input"
                    >
                      <option value="Under Inspection">Under Inspection</option>
                      {isFilesPreAttached && (
                        <>
                          <option value="Approved">Approved</option>
                          <option value="Hold">Hold</option>
                          <option value="Rejected">Rejected</option>
                        </>
                      )}
                    </select>
                  </label>
                  <label className="flex flex-col">
                    Comments:
                    <textarea
                      name="comments"
                      value={material.comments || ""}
                      onChange={handleChange}
                      className="input editable-input"
                    />
                  </label>
                </div>
    
                {/* Action buttons */}
                <div className="flex gap-4">
                  <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={onBack}
                    className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                  >
                    Back to List
                  </button>
                  <button
                      type="button"
                      onClick={() => {
                        handlePrint();  // Calls your handlePrint function
                        setTimeout(() => {
                          window.location.reload(); // Reload the window after 3 seconds
                        }, 1000); // 3000 milliseconds = 3 seconds
                      }}
                      className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
                    >
                      Print Tag
                    </button>



                  <button
                    type="button"
                    onClick={handleDelete}
                    className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                  >
                    Delete Material
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    );
    
};

export default RawMaterialDetail;
