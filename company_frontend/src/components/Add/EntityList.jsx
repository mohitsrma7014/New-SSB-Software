import { useEffect, useState } from "react";
import axios from "axios";
import { FaCogs, FaList } from "react-icons/fa"; // Importing icons for use

const EntityList = ({ endpoint, title, reload }) => {
  const [items, setItems] = useState([]);

  // Fetch data whenever the component mounts or when 'reload' prop changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://192.168.1.199:8001/raw_material/${endpoint}/`);
        setItems(response.data); // Set the fetched data in state
      } catch (error) {
        console.error(error);
      }
    };

    fetchData(); // Fetch data when 'reload' is triggered or the component mounts
  }, [endpoint, reload]);

  // Helper function to format items as a dictionary
  const formatItems = (items) => {
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      delivery_days: endpoint === "suppliers" ? item.delivery_days : null, // Only include delivery_days for suppliers
    }));
  };

  const formattedItems = formatItems(items);

  return (
    <div className="entity-list bg-white shadow-lg rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-gray-800 flex items-center space-x-2">
          <FaList className="text-blue-500" />
          <span>{title}</span>
        </h3>
        <span className="text-sm text-gray-500">{formattedItems.length} Entries</span>
      </div>

      <ul className="space-y-4 max-h-64 overflow-y-auto"> {/* Removed mt-4 to eliminate top margin */}
        {formattedItems.length > 0 ? (
          formattedItems.map((item) => (
            <li
              key={item.id}
              className="flex justify-between items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-300 ease-in-out transform hover:scale-105"
            >
              <div className="flex items-center space-x-2">
                <FaCogs className="text-gray-600" />
                <span className="text-gray-700">
                  {item.name} 
                  {endpoint === "suppliers" && item.delivery_days !== null ? ` - Deliver in ${item.delivery_days} Days` : ""}
                </span>
              </div>
            </li>
          ))
        ) : (
          <li className="text-gray-500">No data available</li>
        )}
      </ul>
    </div>
  );
};

export default EntityList;
