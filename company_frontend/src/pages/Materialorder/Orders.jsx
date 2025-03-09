import { useEffect, useState } from "react";
import axios from "axios";
import { Sidebar } from '../../components/Rawmaterial/Sidebar';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Import Framer Motion for animations

const API_BASE_URL = "http://192.168.1.199:8001/raw_material/api/orders";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/`)
      .then(response => {
        const sortedOrders = response.data.sort((a, b) => {
          const statusA = a.actual_delivery_date ? 1 : 0;
          const statusB = b.actual_delivery_date ? 1 : 0;
          if (statusA !== statusB) return statusA - statusB;
          return new Date(b.po_date) - new Date(a.po_date);
        });
        setOrders(sortedOrders);
      })
      .catch(error => console.error("Error fetching orders:", error));
  }, []);

  const filteredOrders = orders.filter(order =>
    (String(order.supplier_name || "").toLowerCase().includes(search.toLowerCase())) ||
    (String(order.rm_grade || "").toLowerCase().includes(search.toLowerCase()))||
    (String(order.heat_no || "").toLowerCase().includes(search.toLowerCase()))||
    (String(order.po_number || "").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className=" mx-auto mt-24">
      <Sidebar />
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-3xl font-bold text-gray-800">Orders List</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-green-500 text-white px-2 py-1 rounded-lg shadow-md hover:bg-green-600 transition-all flex items-center gap-2"
          onClick={() => navigate("/CreateOrder")}
        >
          <span className="text-xl">+</span>
          <span>Create Order</span>
        </motion.button>
      </div>
      <input
        type="text"
        placeholder="Search by Supplier or RM Grade..."
        className="border p-3 mb-2 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="w-full border-collapse">
          <thead className="bg-gray-300 text-black sticky top-0">
            <tr>
              {["Supplier", "RM Grade", "Standard", "Bar Dia", "Quantity", "PO Date","PO Number", "Delivery Date", "Actual Delivery Date"," Heat", "Verified By", "Status", "Delivery Performance", "Actions"].map((header, index) => (
                <th key={index} className="p-3 text-left">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b hover:bg-white transition-colors"
              >
                <td className="p-1 text-center">{order.supplier_name || "N/A"}</td>
                <td className="p-1 text-center">{order.rm_grade || "N/A"}</td>
                <td className="p-1 text-center">{order.rm_standard || "N/A"}</td>
                <td className="p-1 text-center">{order.bar_dia || "N/A"}</td>
                <td className="p-1 text-center">{order.qty || "N/A"}</td>
                <td className="p-1 text-center">{order.po_date || "N/A"}</td>
                <td className="p-1 text-center">{order.po_number || "N/A"}</td>
                <td className="p-1 text-center">{order.delivery_date || "N/A"}</td>
                <td className="p-1 text-center">{order.actual_delivery_date || "Not updated"}</td>
                <td className="p-1 text-center">{order.heat_no || "Not Recived"}</td>
                <td className="p-1 text-center">{order.verified_by || "N/A"}</td>
                <td className={`p-1 font-bold text-center ${order.actual_delivery_date ? 'text-green-600' : 'text-red-600'}`}>
                  {order.actual_delivery_date ? 'Closed' : 'Open'}
                </td>
                <td className={`p-1 font-bold text-center ${order.actual_delivery_date ? (order.delay_days <= 0 ? 'text-green-600' : 'text-red-600') : ''}`}>
                  {order.actual_delivery_date ? (order.delay_days <= 0 ? 'On Time' : `${order.delay_days} Days Late`) : ''}
                </td>
                <td className="p-1 text-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Details
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedOrder && <OrderDetails order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
};
const OrderDetails = ({ order, onClose }) => {
  const [actualDate, setActualDate] = useState(order.actual_delivery_date || "");
  const [heatNo, setHeatNo] = useState(order.heat_no || "");
  const [message, setMessage] = useState("");
  const [isUpdated, setIsUpdated] = useState(false);

  const handleUpdate = async () => {
    if (!actualDate || !heatNo) {
      setMessage("Both fields are required");
      return;
    }

    try {
      const response = await axios.patch(`${API_BASE_URL}/${order.id}/update-delivery/`, {
        actual_delivery_date: actualDate,
        heat_no: heatNo,
      });
      setMessage(`Updated! Delay Days: ${response.data.delay_days}`);
      setIsUpdated(true);
    } catch (error) {
      setMessage("Error updating");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full"
      >
        <h3 className="text-2xl font-bold mb-6 text-gray-800">Order Details</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries({
            "Supplier": order.supplier_name,
            "RM Grade": order.rm_grade,
            "Standard": order.rm_standard,
            "Bar Dia": order.bar_dia,
            "Quantity": order.qty,
            "PO Date": order.po_date,
            "PO Number": order.po_number,
            "Delivery Date": order.delivery_date,
            "Actual Delivery Date": order.actual_delivery_date || "Not updated",
            "Heat Reacived": order.heat_no || "Not Recived",
            "Verified By": order.verified_by,
            "Delay Days": order.delay_days || "N/A",
          }).map(([key, value]) => (
            <div key={key} className="text-gray-700">
              <strong>{key}:</strong> {value}
            </div>
          ))}
        </div>
        {!isUpdated && !order.actual_delivery_date && (
          <div className="mt-6">
            <div className="flex gap-4">
              <input
                type="date"
                className="border p-3 rounded-lg w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={actualDate}
                onChange={(e) => setActualDate(e.target.value)}
              />
              <input
                type="text"
                placeholder="Enter Heat No"
                className="border p-3 rounded-lg w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={heatNo}
                onChange={(e) => setHeatNo(e.target.value)}
              />
            </div>
            
          </div>
        )}
        {isUpdated && (
          <div className="mt-4 text-green-600 font-bold">{message}</div>
        )}
        {message && !isUpdated && <p className="mt-4 text-red-600">{message}</p>}
        <div className="flex gap-4 mt-4">
              <button
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all flex-1"
                onClick={handleUpdate}
              >
                Update
              </button>
              <button
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-all flex-1"
                onClick={onClose}
              >
                Close
              </button>
            </div>
      </motion.div>
    </motion.div>
  );
};


export { Orders };