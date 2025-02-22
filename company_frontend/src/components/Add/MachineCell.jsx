import React from 'react';

const standardCycleTime = 36000; // Standard machine cycle time in seconds

const MachineCell = ({ line, machines, machinesData }) => {
  return (
    <div className="cell p-4 rounded bg-gray-200 hover:bg-gray-300 transition-all duration-300">
      <div className="grid grid-cols-2 gap-2">
        {machines.map((machineNo, idx) => {
          const machine = machinesData.find((data) => data.machine_no === machineNo);

          if (!machine) {
            return (
              <div key={idx} className="bg-gray-400 p-2 rounded text-center text-sm text-gray-700">
                <div>No Data</div>
                <div>{`Machine ${machineNo}`}</div>
              </div>
            );
          }

          const { total_machine_cycle_time, total_required_cycle_time } = machine;
          const bookTimePercentage = (total_machine_cycle_time / standardCycleTime) * 100;

          let cellColor = 'bg-black'; // Default black if no data
          if (bookTimePercentage === 0) {
            cellColor = 'bg-green-200';
          } else if (bookTimePercentage < 75) {
            cellColor = 'bg-orange-300';
          } else if (bookTimePercentage < 90) {
            cellColor = 'bg-red-300';
          } else {
            cellColor = 'bg-green-500';
          }

          return (
            <div key={idx} className={`p-2 rounded ${cellColor} hover:scale-105 transition-transform duration-300`}>
              <div className="text-center font-semibold">{`Machine ${machineNo}`}</div>
              <div className="text-center text-sm">{`Cycle Time: ${total_machine_cycle_time} sec`}</div>
              <div className="text-center text-sm">{`Required Cycle Time: ${total_required_cycle_time} sec`}</div>
              <div className="text-center text-sm">{`Book Time: ${bookTimePercentage.toFixed(2)}%`}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MachineCell;
