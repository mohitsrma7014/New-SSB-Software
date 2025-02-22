import React, { useState } from "react";
import axios from "axios";
import { Button } from "@mui/material";
import { motion } from "framer-motion";
import { CircularProgress } from "@mui/material";
import { Sidebar } from './Sidebar';

const BatchTrackingTable = () => {
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({ component_no: "", heat_no: "", batch_number: "" });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters).toString();
            const url = `http://192.168.1.199:8001/raw_material/BatchTrackingView?${params}`;
            const response = await axios.get(url);
            setData(response.data);
            setSubmitted(true);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        setLoading(false);
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <Sidebar />
            {!submitted ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 0.5 }}
                    className="flex flex-col gap-4 p-6 bg-white shadow-lg rounded-2xl"
                >
                    <input
                        type="text"
                        name="component_no"
                        placeholder="Filter by Component No"
                        value={filters.component_no}
                        onChange={handleFilterChange}
                        className="border p-3 rounded-md shadow-sm"
                    />
                    <input
                        type="text"
                        name="heat_no"
                        placeholder="Filter by Heat No"
                        value={filters.heat_no}
                        onChange={handleFilterChange}
                        className="border p-3 rounded-md shadow-sm"
                    />
                    <input
                        type="text"
                        name="batch_number"
                        placeholder="Filter by Batch No"
                        value={filters.batch_number}
                        onChange={handleFilterChange}
                        className="border p-3 rounded-md shadow-sm"
                    />
                    <Button onClick={fetchData} variant="contained" color="primary" className="mt-2 flex items-center justify-center gap-2">
                        {loading && <CircularProgress size={20} />} Submit
                    </Button>
                </motion.div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-5xl overflow-auto"
                >
                    <Button onClick={() => setSubmitted(false)} variant="contained" color="secondary" className="mb-4">
                        Back to Filters
                    </Button>
                    <table className="min-w-full border-collapse border border-gray-300 shadow-lg rounded-lg">
                        <thead className="sticky top-0 bg-gray-200 shadow-md">
                            <tr>
                                <th className="border p-2">Block MT ID</th>
                                <th className="border p-2">Customer</th>
                                <th className="border p-2">Material Grade</th>
                                <th className="border p-2">Bardia</th>
                                <th className="border p-2">Component No</th>
                                <th className="border p-2">Heat No</th>
                                <th className="border p-2">Rack No</th>
                                <th className="border p-2">Line</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index} className="border hover:bg-gray-100 transition">
                                    <td className="border p-2">{item.block_mt_id}</td>
                                    <td className="border p-2">{item.customer}</td>
                                    <td className="border p-2">{item.material_grade}</td>
                                    <td className="border p-2">{item.bardia}</td>
                                    <td className="border p-2">{item.component_no}</td>
                                    <td className="border p-2">{item.heat_no}</td>
                                    <td className="border p-2">{item.rack_no}</td>
                                    <td className="border p-2">{item.line}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            )}
        </div>
    );
};

export default BatchTrackingTable;
