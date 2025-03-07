import { useState } from "react";

const UpdateDelivery = () => {
  const [id, setId] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Delivery Date Updated!");
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Update Actual Delivery Date</h2>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <input className="border p-2 rounded" name="id" placeholder="Order ID" onChange={(e) => setId(e.target.value)} required />
        <input className="border p-2 rounded" name="actual_delivery_date" type="date" onChange={(e) => setDate(e.target.value)} required />
        <button className="bg-green-500 text-white p-2 rounded hover:bg-green-600" type="submit">Update</button>
      </form>
    </div>
  );
};

export default UpdateDelivery;
