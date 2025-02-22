import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MachineCell from './MachineCell'; // Custom component for each machine cell
import { Sidebar } from '../AdminComponents/Sidebar';
function Cnc_planning() {
  const [selectedMonth, setSelectedMonth] = useState('2025-01'); // Default month
  const [weekOptions, setWeekOptions] = useState([]); // Store the calculated weeks
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [machinesData, setMachinesData] = useState([]);

  // Calculate weeks for the selected month
  useEffect(() => {
    const calculateWeeks = (year, month) => {
      const weeks = [];
      const date = new Date(year, month, 1); // First day of the month
      const end = new Date(year, month + 1, 0); // Last day of the month
  
      while (date <= end) {
        const dayOfWeek = date.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        
        // Set the start of the week (Monday)
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - daysToSubtract);
  
        // Set the end of the week (Sunday)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // Sunday is 6 days after Monday
  
        // Add week to weeks array if it belongs to the month
        if (weekStart.getMonth() === month || weekEnd.getMonth() === month) {
          weeks.push({
            weekNumber: weeks.length + 1,
            startDate: weekStart.toISOString().slice(0, 10),
            endDate: weekEnd.toISOString().slice(0, 10),
          });
        }
  
        // Move to the next week
        date.setDate(date.getDate() + 7);
      }
  
      return weeks;
    };

    const [year, month] = selectedMonth.split("-").map(Number);
    const weeks = calculateWeeks(year, month - 1);
    setWeekOptions(weeks);
  }, [selectedMonth]);

  // Handle week selection
  const handleWeekChange = async (e) => {
    const selectedWeek = weekOptions.find(
      (week) => week.weekNumber === parseInt(e.target.value, 10)
    );
    if (selectedWeek) {
      setStartDate(selectedWeek.startDate);
      setEndDate(selectedWeek.endDate);
  
      // Fetch the CNC data for the selected week
      try {
        const response = await axios.get(
          'http://192.168.1.199:8001/cnc/api/cnc-cycle-time/', // Correct endpoint
          {
            params: {
              start_date: selectedWeek.startDate,
              end_date: selectedWeek.endDate,
            },
          }
        );
  
        // Set the machine data based on the selected week
        setMachinesData(response.data);
      } catch (error) {
        console.error("Error fetching CNC data:", error);
      }
    }
  };

  // Manually defined machine numbers with corresponding cell names
  const machineNumbers = {
    'Line 1': [
      { cellName: 'Cell A', machines: ['M1', 'M2', 'M3', 'M4'] },
      { cellName: 'Cell B', machines: ['M5', 'M6', 'M7', 'M8'] },
      { cellName: 'Cell C', machines: ['M9', 'M10', 'M11', 'M12'] },
      { cellName: 'Cell D', machines: ['M13', 'M14', 'M15', 'M16'] },
    ],
    'Line 2': [
      { cellName: 'Cell A', machines: ['M17', 'M18', 'M19', 'M20'] },
      { cellName: 'Cell B', machines: ['M21', 'M22', 'M23', 'M24'] },
      { cellName: 'Cell C', machines: ['M25', 'M26', 'M27', 'M28'] },
      { cellName: 'Cell D', machines: ['M29', 'M30', 'M31', 'M32'] },
    ],
    'Line 3': [
      { cellName: 'Cell A', machines: ['M33', 'M34', 'M35', 'M36'] },
      { cellName: 'Cell B', machines: ['M37', 'M38', 'M39', 'M40'] },
      { cellName: 'Cell C', machines: ['M41', 'M42', 'M43', 'M44'] },
      { cellName: 'Cell D', machines: ['M45', 'M46', 'M47', 'M48'] },
      { cellName: 'Cell E', machines: ['M49', 'M50', 'M51', 'M52'] },
    ],
    'Basement': [
      { cellName: 'Cell A', machines: ['M53', 'M54', 'M55', 'M56'] },
      { cellName: 'Cell B', machines: ['M57', 'M58', 'M59', 'M60'] },
      { cellName: 'Cell C', machines: ['M61', 'M62', 'M63', 'M64'] },
      { cellName: 'Cell D', machines: ['M65', 'M66', 'M67', 'M68'] },
      { cellName: 'Cell E', machines: ['M69', 'M70', 'M71', 'M72'] },
      { cellName: 'Cell F', machines: ['M73', 'M74', 'M75', 'M76'] },
    ],
    'New Plant': [
      { cellName: 'Cell A', machines: ['M77', 'M78', 'M79', 'M80'] },
      { cellName: 'Cell B', machines: ['M81', 'M82', 'M83', 'M84'] },
      { cellName: 'Cell C', machines: ['M85', 'M86', 'M87', 'M88'] },
      { cellName: 'Cell D', machines: ['M89', 'M90', 'M91', 'M92'] },
    ],
    'Robot': [
      { cellName: 'Cell A', machines: ['M93', 'M94', 'M95', 'M96'] },
    ],
    'VMC': [
      { cellName: 'Cell A', machines: ['M97', 'M98', 'M99', 'M100'] },
      { cellName: 'Cell B', machines: ['M101', 'M102', 'M103', 'M104'] },
      { cellName: 'Cell C', machines: ['M105', 'M106', 'M107', 'M108'] },
    ],
    'Broch': [
      { cellName: 'Cell A', machines: ['M109', 'M110', 'M111', 'M112'] },
    ],
  };

  return (
    <div className="p-6 mt-24">
        <Sidebar />  {/* Move Sidebar outside the form container */}
      {/* Month Selector */}
      {/* Top Section: Month and Week Selector */}
      <div className="flex justify-between mb-6">
        <div className="flex items-center gap-4">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            onChange={handleWeekChange}
            className="p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a Week</option>
            {weekOptions.map((week) => (
              <option key={week.weekNumber} value={week.weekNumber}>
                Week {week.weekNumber} ({week.startDate} - {week.endDate})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Machine Layout */}
      <div className="space-y-12">
        {Object.keys(machineNumbers).map((line, idx) => (
          <div key={idx} className="line-section">
            <h3 className="font-bold text-xl text-center mb-4">{line}</h3>
            <div
              className={`grid ${
                line === 'Basement'
                  ? 'grid-cols-6'
                  : line === 'New Plant'
                  ? 'grid-cols-4'
                  : 'grid-cols-2'
              } gap-4`}
            >
              {/* Render cells with their respective cell names */}
              {machineNumbers[line].map((cell, index) => (
                <div key={index} className="cell">
                  <h4 className="font-bold text-center">{cell.cellName}</h4>
                  <MachineCell
                    key={index}
                    line={line}
                    machines={cell.machines}
                    machinesData={machinesData}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Cnc_planning;
