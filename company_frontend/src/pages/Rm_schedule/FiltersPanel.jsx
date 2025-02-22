import { useState } from "react";

const FiltersPanel = () => {
  const [month, setMonth] = useState("");
  const [customer, setCustomer] = useState("");
  const [location, setLocation] = useState("");
  const [diameter, setDiameter] = useState("");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-black">
      <h2 className="text-xl font-semibold mb-4 text-black">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Month Filter */}
        <div>
          <label htmlFor="month" className="block mb-2 font-medium text-black">
            Month/Year
          </label>
          <input
            type="month"
            id="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-black"
            aria-label="Select month and year"
          />
        </div>

        {/* Customer Filter */}
        <div>
          <label htmlFor="customer" className="block mb-2 font-medium text-black">
            Customer
          </label>
          <input
            type="text"
            id="customer"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-black"
            placeholder="Enter customer name"
            aria-label="Enter customer name"
          />
        </div>

        {/* Location Filter */}
        <div>
          <label htmlFor="location" className="block mb-2 font-medium text-black">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-black"
            placeholder="Enter location"
            aria-label="Enter location"
          />
        </div>

        {/* Diameter Filter */}
        <div>
          <label htmlFor="diameter" className="block mb-2 font-medium text-black">
            Diameter
          </label>
          <input
            type="text"
            id="diameter"
            value={diameter}
            onChange={(e) => setDiameter(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-black"
            placeholder="Enter diameter"
            aria-label="Enter diameter"
          />
        </div>
      </div>
    </div>
  );
};

export default FiltersPanel;
