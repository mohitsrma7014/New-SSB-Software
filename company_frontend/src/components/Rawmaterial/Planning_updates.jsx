// Import dependencies
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from './Sidebar';
import DashboardHeader from './DashboardHeader';
import {
    MagnifyingGlassIcon as SearchIcon,
    ArrowPathIcon as RefreshIcon,
    ExclamationCircleIcon as ExclamationIcon
} from "@heroicons/react/24/outline";

const PlanningUpdates = () => {
    const [blockmtData, setBlockmtData] = useState([]);
    const [filters, setFilters] = useState({
        block_mt_id: '',
        grade: '',
        heatno: '',
        component: ''
    });
    const [loading, setLoading] = useState(false);

    // Fetch data from the API
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://192.168.1.199:8001/raw_material/api/blockmt/', {
                params: filters
            });
            setBlockmtData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle input change for filters
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Submit filters to fetch data
    const handleSubmit = (e) => {
        e.preventDefault();
        fetchData();
    };

    return (
        <div className="App bg-gray-50 min-h-screen flex">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <DashboardHeader />
      {/* Main content area */}
      <div className="flex-1 p-6 mt-12 ml-60 max-w-[calc(100vw-240px)] overflow-x-auto">
 
        <h5 className=" font-extrabold text-gray-800 mb-2 text-center">New Planning List</h5>

        {/* Filter Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-2 mb-2 flex items-center space-x-2">
            {[
                { label: "Batch ID", name: "block_mt_id", value: filters.block_mt_id },
                { label: "Grade", name: "grade", value: filters.grade },
                { label: "Heat No", name: "heatno", value: filters.heatno },
                { label: "Component", name: "component", value: filters.component }
            ].map((filter) => (
                <div key={filter.name} className="flex flex-col w-full sm:w-auto">
                    <label htmlFor={filter.name} className="text-sm font-semibold text-gray-700 mb-2">
                        {filter.label}
                    </label>
                    <input
                        id={filter.name}
                        name={filter.name}
                        type="text"
                        value={filter.value}
                        onChange={handleInputChange}
                        className="block w-full sm:w-40 md:w-48 px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            ))}

            {/* Apply Filter Button */}
            <button
                type="submit"
                className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300">
                <SearchIcon className="h-6 w-6 mr-2" />
                Apply Filters
            </button>
        </form>

        {/* Data List */}
        {loading ? (
            <div className="flex justify-center items-center ">
                <RefreshIcon className="h-10 w-10 text-blue-500 animate-spin" />
                <p className="ml-2 text-lg text-blue-500">Loading data...</p>
            </div>
        ) : (
            <div className="grid gap-6" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gridAutoRows: '5px', // Smaller base row height for more precision
            }}>
                {blockmtData.length > 0 ? (
                    blockmtData.map((block) => (
                        <div
                            key={block.id}
                            className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition gap-0"
                            style={{
                                gridRowEnd: `span ${Math.ceil(
                                    (block.records.length * 40 + 70) / 5.5 // Adjust formula to fit content more accurately
                                )}`,
                            }}>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 m-0 p-0 leading-none">
                                Batch ID: {block.block_mt_id}
                            </h3>
                            <p className="text-gray-700 m-0 p-1 leading-none">
                                <span className="font-medium gap-0">Grade:</span> {block.grade}
                            </p>
                            <p className="text-gray-700 m-0 p-1 leading-none">
                                <span className="font-medium">Component:</span> {block.component}
                            </p>
                            <p className="text-gray-700 m-0 p-1 leading-none">
                                <span className="font-medium">Heat No:</span> {block.heatno}
                            </p>
                            <p className="text-gray-700 m-0 p-1 leading-none">
                                <span className="font-medium">Dia:</span> {block.dia}
                            </p>
                            <p className="text-gray-700 m-0 p-1 leading-none">
                                <span className="font-medium">Rack No:</span> {block.rack_no}
                            </p>
                            <p className="text-gray-700 m-0 p-1 leading-none">
                                <span className="font-medium">Alloted Weight:</span> {block.weight}
                            </p>
                            <p className="text-gray-700 m-0 p-1 leading-none">
                                <span className="font-medium">Remaining Weight:</span> {block.remaining_weight}
                            </p>
                            <p className="text-gray-700 m-0 p-1 leading-none">
                                <span className="font-medium"> Pcs:</span> {block.remainingpcs}
                            </p>
                            <div className="mt-2">
                                <h4 className="text-md font-semibold text-gray-800 mb-3">Records:</h4>
                                {block.records.map((record, index) => (
                                    <div
                                        key={index}
                                        className="p-3 bg-gray-100 rounded-lg mb-3 shadow-inner">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Type:</span> {record.type}
                                        </p>
                                        {Object.keys(record)
                                            .filter((key) => key !== 'type')
                                            .map((key) => (
                                                <p
                                                    key={key}
                                                    className="text-xs text-gray-500 m-1 p-1 leading-none">
                                                    {key}: {record[key]}
                                                </p>
                                            ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center py-16">
                        <ExclamationIcon className="h-14 w-14 text-gray-400" />
                        <p className="mt-4 text-lg text-gray-500">No data found</p>
                    </div>
                )}
            </div>
        )}
    </div>
</div>
</div>

    );
};

export default PlanningUpdates;