import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Upload, Download, File, Loader2 } from "lucide-react";
import { Sidebar } from "../Quality/Sidebar";

function UploadPage() {
  const [file, setFile] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [zipFileName, setZipFileName] = useState("");  // Store the ZIP file name

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);

    // Extract file name without extension and append .zip
    if (uploadedFile) {
      const originalName = uploadedFile.name.split(".").slice(0, -1).join(".");
      setZipFileName(`${originalName}.zip`);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://192.168.1.199:8001/other/upload-pdf/", formData, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
      {/* Sidebar */}
      <Sidebar />

      {/* Animated Header */}
      <motion.h2 
        className="text-3xl font-bold mb-6 text-gray-200"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Upload & Process Your PDF
      </motion.h2>

      {/* Upload Box */}
      <motion.div 
        className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 transition">
          <File className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-gray-300">{file ? file.name : "Click to select a PDF file"}</span>
          <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
        </label>

        {/* Upload Button */}
        <div 
          className="mt-4 w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition px-6 py-2 rounded-lg cursor-pointer text-center justify-center"
          onClick={handleUpload}
          style={{ opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          {loading ? "Uploading..." : "Upload & Process"}
        </div>
      </motion.div>

      {/* Download Button */}
      {downloadUrl && (
        <motion.div 
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <a 
            href={downloadUrl} 
            download={zipFileName}  // Dynamic file name
            className="bg-green-600 hover:bg-green-500 transition px-6 py-2 rounded-lg flex items-center gap-2"
            onClick={() => setDownloadUrl("")}  // Clear the download URL after clicking
          >
            <Download className="w-5 h-5" />
            Download {zipFileName}
          </a>
        </motion.div>
      )}
    </div>
  );
}

export default UploadPage;
