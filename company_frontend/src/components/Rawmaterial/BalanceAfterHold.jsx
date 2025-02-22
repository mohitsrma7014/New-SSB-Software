import React, { useEffect, useState, useMemo } from 'react'; // Use useMemo for memoization
import PropTypes from 'prop-types';
import { Database, ListChecks, AlertTriangle } from 'lucide-react';
import { Sidebar } from './Sidebar';
import * as XLSX from 'xlsx';  // Import XLSX for Excel export functionality

const formatDate = (date) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

function InfoCard({ title, value, icon, color, textColor }) {
  return (
    <div className={`${color} rounded-lg shadow-sm p-2`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="ml-5">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <div className={`mt-1 ${textColor} text-xl font-semibold`}>
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

InfoCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired,
  textColor: PropTypes.string.isRequired,
};

function Table({ data }) {
  return (
    <div className="overflow-x-auto max-w-full">
      <table className="min-w-full divide-y divide-gray-200 table-fixed">
        <TableHeader />
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <TableRow key={row.id ?? index} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

Table.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

function TableHeader() {
  const COLUMNS = [
    { key: 'approval_status', label: 'Status' },
    { key: 'date', label: 'Date' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'grade', label: 'Grade' },
    { key: 'customer', label: 'Customer' },
    { key: 'heatno', label: 'Heat No' },
    { key: 'dia', label: 'Diameter' },
    { key: 'weight', label: 'Receiving (Kg)' },
    { key: 'weight1', label: 'Hold (Kg)' },
    { key: 'af_issu_weight_diff', label: 'Available (Kg)' },
    { key: 'weight_diff', label: 'New Parts(Kg)' },
    { key: 'rack_no', label: 'Rack No' },
    { key: 'type_of_material', label: 'Material Type' },
    { key: 'fifo_no', label: 'FIFO' },
  ];

  return (
    <thead className="bg-gray-50 sticky top-0 z-10">
      <tr>
        {COLUMNS.map((column) => (
          <th
            key={column.key}
            className="px-3 py-3 text-left text-xs  font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
          >
            {column.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function TableRow({ row }) {
  const COLUMNS = [
    { key: 'approval_status' },
    { key: 'date' },
    { key: 'supplier' },
    { key: 'grade' },
    { key: 'customer' },
    { key: 'heatno' },
    { key: 'dia' },
    { key: 'weight' },
    { key: 'weight1' },
    { key: 'af_issu_weight_diff' },
    { key: 'weight_diff' },
    { key: 'rack_no' },
    { key: 'type_of_material' },
    { key: 'fifo_no' },
  ];

  const renderCell = (key) => {
    const value = row[key];

    if (value == null) return '-';

    if (key === 'date') {
      return formatDate(value);
    }

    if (key === 'approval_status') {
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${value === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {value.toUpperCase()}
        </span>
      );
    }

    return String(value).toUpperCase();
  };

  return (
    <tr className="hover:bg-gray-50">
      {COLUMNS.map(({ key }) => (
        <td key={key} className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
          {renderCell(key)}
        </td>
      ))}
    </tr>
  );
}

TableRow.propTypes = {
  row: PropTypes.object.isRequired,
};

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    supplier: '',
    grade: '',
    customer: '',
    dia: '',
    heatno: '',
    rack_no: ''
  });
  const [suggestions, setSuggestions] = useState({
    supplier: [],
    grade: [],
    customer: [],
    dia: [],
    heatno: [],
    rack_no: []
  });

  useEffect(() => {
    fetch('http://192.168.1.199:8001/raw_material/api/balance-after-hold/')
      .then(response => response.text())  
      .then((text) => {
        const sanitizedText = text.replace(/NaN/g, 'null');
        const sanitizedData = JSON.parse(sanitizedText);
        setData(sanitizedData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      });
  }, []);


  const handleDownloadExcel = () => {
    // Convert filteredData to an Excel sheet
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    
    // Write to file
    XLSX.writeFile(wb, 'RM_Data.xlsx');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));

    if (value.length > 1) {
      const uniqueSuggestions = Array.from(new Set(data.filtered_df_dict.map(row => row[name]))); 
      setSuggestions(prevSuggestions => ({
        ...prevSuggestions,
        [name]: uniqueSuggestions.filter(val => val.toLowerCase().includes(value.toLowerCase()))
      }));
    }
  };

  const filteredData = data
    ? data.filtered_df_dict.filter((row) => {
        return Object.keys(filters).every((key) => {
          return filters[key].length === 0 || row[key]?.toString().toLowerCase().includes(filters[key].toLowerCase());
        });
      })
    : [];

  // Calculate the total of af_issu_weight_diff from the filtered data
  const totalAfIssuWeightDiff = useMemo(() => {
    return filteredData.reduce((acc, row) => acc + (parseFloat(row.af_issu_weight_diff/1000) || 0), 0).toFixed(2);
  }, [filteredData]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
  <Sidebar />
  <div className="flex items-center mb-8">
    <h1 className="text-3xl font-bold text-gray-800">RM</h1>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-2">
    <InfoCard 
      title="Hold Status" 
      value={data.filtered_df_dict1.hold}
      icon={<Database className="h-6 w-6 text-amber-600" />}
      color="bg-amber-50"
      textColor="text-amber-600"
    />
    <InfoCard 
      title="Rejected" 
      value={data.filtered_df_dict1.rejected}
      icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
      color="bg-red-50"
      textColor="text-red-600"
    />
    <InfoCard 
      title="Under Inspection" 
      value={data.filtered_df_dict1['under inspection']}
      icon={<ListChecks className="h-6 w-6 text-blue-600" />}
      color="bg-blue-50"
      textColor="text-blue-600"
    />
    <InfoCard 
          title="Total Available RM (Ton)" 
          value={`${totalAfIssuWeightDiff} Ton`} 
          icon={<Database className="h-6 w-6 text-amber-600" />}
          color="bg-amber-50"
          textColor="text-amber-800"
        />
  </div>
  <div className="bg-white rounded-lg shadow-md p-2 mt-2 mb-2">
  <div className="flex items-center justify-start">
    <h2 className="text-xl font-semibold text-gray-800 mr-5">Inactive Racks : </h2>
    <div className="flex gap-2">
      {data.missing_racks.map((rack) => (
        <span key={rack} className="px-3 py-1 bg-gray-100 rounded-full text-gray-700">
          Rack {rack}
        </span>
      ))}
    </div>
  </div>
</div>


  <div className="mb-2">
    <input
      type="text"
      name="supplier"
      value={filters.supplier}
      onChange={handleFilterChange}
      className="border rounded p-2 mr-2"
      placeholder="Search Supplier"
    />
    <input
      type="text"
      name="grade"
      value={filters.grade}
      onChange={handleFilterChange}
      className="border rounded p-2 mr-2"
      placeholder="Search Grade"
    />
    <input
      type="text"
      name="customer"
      value={filters.customer}
      onChange={handleFilterChange}
      className="border rounded p-2 mr-2"
      placeholder="Search Customer"
    />
    <input
      type="text"
      name="dia"
      value={filters.dia}
      onChange={handleFilterChange}
      className="border rounded p-2 mr-2"
      placeholder="Search Diameter"
    />
    <input
      type="text"
      name="heatno"
      value={filters.heatno}
      onChange={handleFilterChange}
      className="border rounded p-2 mr-2"
      placeholder="Search Heat No"
    />
    <input
      type="text"
      name="rack_no"
      value={filters.rack_no}
      onChange={handleFilterChange}
      className="border rounded p-2 mr-2"
      placeholder="Search Rack No"
    />
    <button 
    onClick={handleDownloadExcel} 
    className="border rounded h-8 w-3 p-2 mr-2 bg-blue-600 text-white"/>
    Download
  </div>

  <div className="bg-white rounded-lg shadow-md">
    <div className="overflow-x-auto">
      <div className="max-h-[500px] overflow-y-auto">
        <table className="min-w-[1500px] table-auto divide-y divide-gray-200">
          {/* Sticky Header */}
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heat No</th>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diameter</th>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receiving (Kg)</th>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hold (Kg)</th>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available In Rack (Kg)</th>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available For New (Kg)</th>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rack No</th>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Type</th>
              
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FIFO</th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((row, index) => (
              <TableRow key={row.id ?? index} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

  );
}
