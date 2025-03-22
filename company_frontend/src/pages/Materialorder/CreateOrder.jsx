import { useState, useEffect } from "react";
import axios from "axios";
import { Sidebar } from '../../components/Rawmaterial/Sidebar';
import { motion } from "framer-motion"; // Import Framer Motion for animations
import { useNavigate } from "react-router-dom";
import DashboardHeader from '../../components/Rawmaterial/DashboardHeader';


const CreateOrder = () => {
  const [form, setForm] = useState({
    supplier: "",
    rm_grade: "",
    rm_standard: "",
    bar_dia: "",
    qty: "",
    po_date: "",
    po_number: "",
    verified_by: "",
  });
  const navigate = useNavigate();


  const [suppliers, setSuppliers] = useState([]);
  const [grades, setGrades] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("http://192.168.1.199:8001/raw_material/suppliers/");
        if (!response.ok) throw new Error("Failed to fetch suppliers");
        const data = await response.json();
        setSuppliers(data);
      } catch (err) {
        setError("Error fetching suppliers: " + err.message);
      }
    };

    fetchSuppliers();
  }, []);

  // Fetch RM Grades
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await fetch("http://192.168.1.199:8001/raw_material/grades/");
        if (!response.ok) throw new Error("Failed to fetch grades");
        const data = await response.json();
        setGrades(data);
      } catch (err) {
        setError("Error fetching grades: " + err.message);
      }
    };

    fetchGrades();
  }, []);

  // Fetch user details for "verified_by"
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "http://192.168.1.199:8001/api/user-details/",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        const { name, lastname } = response.data;
        setForm((prevForm) => ({
          ...prevForm,
          verified_by: `${name} ${lastname}`, // Autofill verified_by
        }));
      } catch (error) {
        console.error("Error fetching user details:", error);
        alert("Failed to fetch user details.");
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://192.168.1.199:8001/raw_material/api/orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier: parseInt(form.supplier, 10),
          rm_grade: form.rm_grade,
          rm_standard: form.rm_standard,
          bar_dia: parseFloat(form.bar_dia),
          qty: parseInt(form.qty, 10),
          po_date: form.po_date,
          po_number: form.po_number,
          verified_by: form.verified_by || null, // Ensure this is included
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong!");
      }

      alert("Order Created Successfully!");
      setForm({
        supplier: "",
        rm_grade: "",
        rm_standard: "",
        bar_dia: "",
        qty: "",
        po_date: "",
        po_number: "",
        verified_by: form.verified_by, // Keep the verified_by field unchanged
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App bg-gray-50 min-h-screen flex">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <DashboardHeader />
      {/* Main content area */}
      <div className="flex-1 p-16 mt-12 ml-60 max-w-[calc(100vw-240px)] overflow-x-auto">
 
        <div className="flex justify-between items-center mb-2">
        <h2 className="text-3xl font-bold text-gray-800">Create Orders</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-green-500 text-white px-2 py-1 rounded-lg shadow-md hover:bg-green-600 transition-all flex items-center gap-2"
          onClick={() => navigate("/Orders")}
        >
          <span>Back To List</span>
        </motion.button>
      </div>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Supplier Dropdown */}
          <select
            className="border p-2 rounded col-span-2"
            name="supplier"
            value={form.supplier}
            onChange={handleChange}
            required
          >
            <option value="">Select Supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>

          {/* RM Grade Dropdown */}
          <select
            className="border p-2 rounded col-span-2"
            name="rm_grade"
            value={form.rm_grade}
            onChange={handleChange}
            required
          >
            <option value="">Select RM Grade</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.name}>
                {grade.name}
              </option>
            ))}
          </select>

          <input className="border p-2 rounded" name="rm_standard" placeholder="RM Standard" value={form.rm_standard} onChange={handleChange} required />
          <input className="border p-2 rounded" name="bar_dia" type="number" step="0.01" placeholder="Bar Diameter" value={form.bar_dia} onChange={handleChange} required />
          <input className="border p-2 rounded" name="qty" type="number" placeholder="Quantity" value={form.qty} onChange={handleChange} required />
          <input className="border p-2 rounded" name="po_date" type="date" value={form.po_date} onChange={handleChange} required />
          <input className="border p-2 rounded" name="po_number" placeholder="Po Number " type="text" value={form.po_number} onChange={handleChange} required />

          {/* Verified By (Auto-filled & Readonly) */}
          <input
            className="border p-2 rounded bg-gray-100 "
            name="verified_by"
            placeholder="Verified By"
            value={form.verified_by}
            readOnly
          />


          <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 col-span-2" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
    </div>
    
  );
};

export default CreateOrder;