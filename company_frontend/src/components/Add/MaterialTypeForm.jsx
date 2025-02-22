import { useState } from "react";
import axios from "axios";

const MaterialTypeForm = ({ reloadData }) => {
    const [name, setName] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://192.168.1.199:8001/raw_material/material_types/", { name });
            setName("");
            reloadData(); // Reload data after adding
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-auto mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add Material Type</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Material Type Name"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    >
                        Add Material Type
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MaterialTypeForm;
