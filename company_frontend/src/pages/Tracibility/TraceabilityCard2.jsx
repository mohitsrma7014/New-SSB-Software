import React, { useState } from 'react';
import axios from 'axios';
import { Sidebar } from '../../components/AdminComponents/Sidebar';

const TraceabilityCard2 = () => {
  const [componentNumber, setComponentNumber] = useState('');
  const [daysBefore, setDaysBefore] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [suggestions, setSuggestions] = useState([]);

  const handleComponentNumberChange = async (e) => {
    const value = e.target.value;
    setComponentNumber(value);

    if (value.length > 1) { 
      try {
        const response = await axios.get(
          'http://192.168.1.199:8001/raw_material/components/',
          { params: { component: value } }
        );
        setSuggestions(response.data || []);
      } catch (err) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setComponentNumber(suggestion);
    setSuggestions([]);
  };


  const handleDaysBeforeChange = (e) => {
    setDaysBefore(e.target.value);
  };

  const fetchData = async () => {
    if (!componentNumber) {
      setError('Component number is required.');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await axios.post('http://192.168.1.199:8001/raw_material/api/traceability-card2/', {
        component_number: componentNumber,
        days_before: daysBefore ? parseInt(daysBefore, 10) : undefined,
      });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (data) => {
      // Define which fields to display for each location
      const locationFields = {
        'Batch Details': ['block_mt_id', 'customer','supplier', 'grade', 'standerd', 'heatno', 'dia', 'rack_no', 'pices', 'weight', 'created_at', 'verified_by'],
        'Isuue Details': ['batch_number',  'heatno', 'rack_no','kg_qty', 'created_at','verified_by'],
        'FORGING Details': ['date','batch_number', 'shift', 'slug_weight', 'heat_number', 'line','line_incharge','forman'],
        'HEAT TREATMENT Details': ['date', 'shift','heat_no', 'process','furnace','supervisor','operator','cycle_time','unit','hardness','verified_by'],
        'SHOT-BLAST Details': ['date', 'shift', 'machine', 'no_of_pic','operator','verified_by'],
        'PRE MACHINING Details': ['date', 'heat_no', 'shop_floor', 'qty', 'verified_by'],
        'MARKING Details': ['date', 'machine', 'operator', 'shift','qty','verified_by'],
        'FINAL INSPECTION Details': ['date', 'shift', 'chaker', 'production','verified_by'],
        'VISUAL INSPECTION Details': ['date', 'shift', 'chaker','chaker1','production','verified_by'],
        'CNC Details': ['date', 'shift', 'operator','inspector','setup','production','verified_by'],
        'DISPATCH Details': ['block_mt_id', 'rack_no', 'date','invoiceno','pices', 'created_at'],
      };
    
      const locations = [
        { location: 'Batch Details', dataKey: 'Blockmt_qs' },
        { location: 'Isuue Details', dataKey: 'batch_tracking_df' },
        { location: 'FORGING Details', dataKey: 'forging_df', totalKey: 'total_production_p' },
        { location: 'HEAT TREATMENT Details', dataKey: 'heat_treatment_df', totalKey: 'total_production_ht' },
        { location: 'SHOT-BLAST Details', dataKey: 'Shotblast_df', totalKey: 'total_production_sh' },
        { location: 'PRE MACHINING Details', dataKey: 'pre_mc_df', totalKey: 'total_production_pri' },
        { location: 'MARKING Details', dataKey: 'marking_df', totalKey: 'total_production_mr' },
        { location: 'FINAL INSPECTION Details', dataKey: 'fi_df', totalKey: 'total_production_fi' },
        { location: 'VISUAL INSPECTION Details', dataKey: 'visual_df', totalKey: 'total_production_v' },
        { location: 'CNC Details', dataKey: 'cnc_df', totalKey: 'total_production_c' },
        { location: 'DISPATCH Details', dataKey: 'dispatch_df', totalKey: 'total_dispatch_df' },
      ];
    
      return (
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden mx-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Location</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Total Production</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {locations.map((loc) => {
                const locationData = data[loc.dataKey] || [];
                const totalProduction = data[loc.totalKey] || 'No data available';
                const fieldsForLocation = locationFields[loc.location] || [];
      
                return (
                  <tr key={loc.location}>
                    <td className="px-4 py-2 font-medium text-gray-700 border-b-4 border-gray-800">{loc.location}</td>
                    <td className="px-4 py-2 border-l-4 border-gray-800">
                      {locationData.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4  border-gray-300 ">
                          {locationData.map((item, index) => (
                            <div key={index} className=" border-2 border-gray-200 pl-4">
                              {fieldsForLocation.map((field) => {
                                if (item[field]) {
                                  return (
                                    <div key={field} className="text-gray-700">
                                      <strong>{field.replace(/_/g, ' ')}:</strong> {item[field]}
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-700">No data available</p>
                      )}
                    </td>
                    <td className="px-4 py-2 font-medium text-gray-700 border-b-4 border-gray-800">
                      <p className="text-gray-700">{totalProduction}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      };
    return (
      <div className="bg-gray-50 min-h-screen flex justify-center items-center p-6  w-full">
          <Sidebar />
        <div className="w-full max-w-full bg-white shadow-lg rounded-lg p-6 transition-all duration-300 transform">
          <h1 className="text-3xl font-semibold text-center mb-4 text-gray-800">Traceability Card For Component</h1>
  
          <div className="input-group mb-4">
          <label htmlFor="componentNumber">Component Number:</label>
          <input
            type="text"
            id="componentNumber"
            value={componentNumber}
            onChange={handleComponentNumberChange}
            placeholder="Enter component number"
            className="w-full border p-2 rounded"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border w-full mt-16 max-h-40 overflow-y-auto shadow-lg">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
      </div>

      <div className="input-group">
        <label htmlFor="daysBefore">Days Before:</label>
        <input
          type="number"
          id="daysBefore"
          value={daysBefore}
          onChange={handleDaysBeforeChange}
          placeholder="Enter days before"
        />
      </div>
  
          <div className="text-center">
            <button
              onClick={fetchData}
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition duration-300"
            >
              {loading ? 'Loading...' : 'Fetch Data'}
            </button>
          </div>
  
          {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
  
          {data && (
            <div className="mt-6" style={{ width: '100%', overflowX: 'auto' }}>
              <h2 className="text-2xl font-semibold text-gray-800">
                Results for Component:{data.components || 'No data available'}
              </h2>
              <div style={{ maxWidth: '100%' }}>
                {renderTable(data)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default TraceabilityCard2;
  