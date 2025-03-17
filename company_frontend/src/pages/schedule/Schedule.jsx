import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/AdminComponents/Sidebar';
import BlockmtForm from '../../components/Rawmaterial/BlockmtForm1';

const Schedule = () => {
  const [scheduleData, setScheduleData] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [activeCustomer, setActiveCustomer] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const fetchSchedulesByMonth = () => {
    let url = 'http://192.168.1.199:8001/raw_material/api/schedule/';
    if (selectedMonth && selectedYear) {
      const formattedMonth = selectedMonth.toString().padStart(2, '0');
      const formattedDate = `${selectedYear}-${formattedMonth}`;
      url += `?month=${formattedDate}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.message || data.length === 0) {
          setScheduleData({});
          setFilteredData([]);
          setErrorMessage('Data not available for the selected month and year.');
          return;
        }

        const newScheduleData = data.reduce((acc, schedule) => {
          if (!acc[schedule.customer]) acc[schedule.customer] = [];
          acc[schedule.customer].push(schedule);
          return acc;
        }, {});
        setScheduleData(newScheduleData);
        const firstCustomer = Object.keys(newScheduleData)[0];
        setActiveCustomer(firstCustomer);
        setFilteredData(newScheduleData[firstCustomer]);
        setErrorMessage('');
      })
      .catch(() => {
        setScheduleData({});
        setFilteredData([]);
        setErrorMessage('Error fetching data. Please try again later.');
      });
  };

  const handleCustomerClick = (customer) => {
    setActiveCustomer(customer);
    setFilteredData(scheduleData[customer]);
  };
  const openForm = (schedule) => {
    setSelectedSchedule(schedule);
    setIsFormVisible(true);
  };

  const closeForm = () => {
    setIsFormVisible(false);
    setSelectedSchedule(null);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filteredSchedules = Object.values(scheduleData)
      .flat()
      .filter(
        (schedule) =>
          schedule.component.toLowerCase().includes(query) ||
          schedule.customer.toLowerCase().includes(query) ||
          schedule.grade.toLowerCase().includes(query)
      );
    setFilteredData(filteredSchedules);
  };

  useEffect(() => {
    fetchSchedulesByMonth();
  }, [selectedYear, selectedMonth]);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <Sidebar />
      <h1 className="text-2xl font-bold mb-6 text-left">Schedule</h1>

      {/* Filters and Search */}
      {/* Filters and Search */}
<div className="w-1/2 flex items-center justify-between mb-6 p-4 bg-white border border-gray-300 rounded-md">
  {/* Year Selector */}
  <div className="flex items-center space-x-1">
    
    <select
      value={selectedYear}
      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
      className="p-2 border border-gray-300 rounded-md bg-white"
    >
      {Array.from({ length: 10 }, (_, index) => new Date().getFullYear() - index).map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  </div>

  {/* Month Selector */}
  <div className="flex items-center space-x-1">
  <select
    value={selectedMonth}
    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
    className="p-2 border border-gray-300 rounded-md bg-white"
  >
    {[
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ].map((monthName, index) => (
      <option key={index + 1} value={index + 1}>
        {monthName}
      </option>
    ))}
  </select>
</div>


  {/* Search Bar */}
  <div className="flex-1">
    <input
      type="text"
      placeholder="Search by component, customer, or grade"
      value={searchQuery}
      onChange={handleSearchChange}
      className="w-full p-2 border border-gray-300 rounded-md"
    />
  </div>
</div>


      {/* Error Message */}
      {errorMessage && (
        <div className="text-red-500 font-medium mb-6">{errorMessage}</div>
      )}

      {/* Customer Buttons */}
      <div className="flex gap-2 mb-6">
        {Object.keys(scheduleData).map((customer) => (
          <button
            key={customer}
            onClick={() => handleCustomerClick(customer)}
            className={`px-4 py-2 rounded-md ${
              customer === activeCustomer
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {customer}
          </button>
        ))}
      </div>

      {/* Table */}
      <table className="w-full bg-white border border-gray-300 rounded-md">
        <thead>
          <tr className="bg-gray-200">
            {[
              'Component',
              'Customer',
              'Grade',
              'Dia',
              'Slug Weight',
              'Total Schedule Pieces',
              'Planned Pieces',
              'Dispatched',
              'Balance',
              'Weight',
              'Date',
              'Action'
            ].map((header) => (
              <th key={header} className="p-2 text-left border-b border-gray-300">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((schedule, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                } hover:bg-gray-100`}
              >
                <td className="p-2 border-b">{schedule.component}</td>
                <td className="p-2 border-b">{schedule.customer}</td>
                <td className="p-2 border-b">{schedule.grade}</td>
                <td className="p-2 border-b">{schedule.dia}</td>
                <td className="p-2 border-b">{schedule.slug_weight} kg</td>
                <td className="p-2 border-b">{schedule.total_schedule_pices}</td>
                <td
                  className={`p-2 border-b ${
                    schedule.blockmt_pices >= schedule.total_schedule_pices
                      ? 'bg-orange-200'
                      : ''
                  }`}
                >
                  {schedule.blockmt_pices}
                </td>
                <td
                  className={`p-2 border-b ${
                    schedule.dispatched >= schedule.total_schedule_pices
                      ? 'bg-green-200'
                      : ''
                  }`}
                >
                  {schedule.dispatched}
                </td>
                <td className="p-2 border-b">{schedule.balance}</td>
                <td className="p-2 border-b">{schedule.total_schedule_weight} kg</td>
                <td className="p-2 border-b">
                  {new Date(schedule.created_at).toLocaleString()}
                </td>
                <td>
                <button onClick={() => openForm(schedule)} className={`px-1 py-1 rounded-md bg-blue-500 text-white `}>Production Planning</button>
              </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" className="p-2 text-center">
                No data available for the selected month and year.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {isFormVisible && (
  <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
    {/* Form Component */}
    <div className="relative w-full h-full">
      {/* Close Button */}
      <button
        onClick={closeForm}
        className="absolute top-4 right-4 z-50 text-white text-xl hover:text-gray-300"
      >
        &#x2715; {/* Unicode character for the close icon */}
      </button>
      <BlockmtForm schedule={selectedSchedule} onClose={closeForm} />
    </div>
  </div>
)}





    </div>
  );
};

export default Schedule;
