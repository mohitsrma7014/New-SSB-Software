import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from './Sidebar';
import DashboardHeader from './DashboardHeader';


const BatchForm = () => {
  // State variables to hold form data in a single object
  const [formData, setFormData] = useState({
    block_mt_id: '',
    customer: '',
    standerd: '',
    component_no: '',
    heat_no: '',
    bardia: '',
    supplier: '',
    material_grade: '',
    rack_no: '',
    bar_qty: '',
    kg_qty: '',
    line: '',
    verified_by: '',
    Allotted_rm: '',
  });
  const [batchNumber, setBatchNumber] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formVisible, setFormVisible] = useState(true); // To toggle form visibility
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Fetch user details on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://192.168.1.199:8001/api/user-details/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        const { name, lastname } = response.data;
        const fullName = `${name} ${lastname}`;
        setFormData((prevFormData) => ({ ...prevFormData, verified_by: fullName }));
      } catch (err) {
        console.error('Error fetching user details:', err);
        alert('Failed to fetch user details. Please check your credentials and try again.');
      }
    };

    fetchUserData();
  }, []);

  // Fetch component suggestions
  const fetchComponentSuggestions = async (query) => {
    setLoadingSuggestions(true);
    try {
      const response = await axios.get('http://192.168.1.199:8001/raw_material/block_mt_id_suggestion/', {
        params: { block_mt_id: query },
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching component suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleInputChange = async (field, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));

    // Fetch component suggestions if the 'block_mt_id' field is being updated
    if (field === 'block_mt_id' && value) {
      fetchComponentSuggestions(value);
    }
    if (field === 'kg_qty') {
      const kg_qty = (value); // Use `value` from the event
      const Allotted_rm = parseFloat(formData.Allotted_rm);
    
      if (!isNaN(Allotted_rm) && !isNaN(kg_qty)) {
        if (kg_qty > Allotted_rm) {
          alert('RM not available: Exceeds the Allotted RM.');
          setFormData((prevFormData) => ({
            ...prevFormData,
            kg_qty: '', // Reset to an empty string
          }));
        } else {
          setFormData((prevFormData) => ({
            ...prevFormData,
            kg_qty: kg_qty, // Set valid kg_qty
          }));
        }
      } else {
        // Handle invalid input gracefully
        setFormData((prevFormData) => ({
          ...prevFormData,
          kg_qty: '', // Reset to an empty string for invalid input
        }));
      }
    }
    
  };

  const handleSelectSuggestion = (block_mt_id) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      block_mt_id,
    }));

    // Fetch part details for the selected component
    const fetchPartDetails = async () => {
      try {
        const response = await axios.get('http://192.168.1.199:8001/raw_material/get_part_details3/', {
          params: { block_mt_id },
        });
        const data = response.data;

        setFormData((prevFormData) => ({
          ...prevFormData,
          component_no: data.component,
          customer: data.customer,
          standerd: data.standerd,
          heat_no: data.heatno,
          bardia: data.dia,
          supplier: data.supplier,
          material_grade: data.grade,
          rack_no: data.rack_no,
          line: data.line,
          Allotted_rm: data.remaining,
        }));

        
      } catch (error) {
        console.error('Error fetching part details:', error);
        alert('Please enter a correct part number.');
        setFormData((prevFormData) => ({
          ...prevFormData,
          block_mt_id: '',
          component_no: '',
          customer: '',
          standerd: '',
          heat_no: '',
          bardia:'',
          supplier: '',
          material_grade: '',
          rack_no: '',
          line: '',
        }));
      }
    };

    fetchPartDetails();
    setSuggestions([]); // Clear suggestions after selection
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Make the POST request to the Django API
      const response = await axios.post('http://192.168.1.199:8001/raw_material/api/generate-batch/', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Handle successful response
      setBatchNumber(response.data.batch_number);
      setQrCodeUrl(response.data.qr_code_url);
      setFormVisible(false); // Hide form after success
       // Automatically refresh the page after 3 seconds
       setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      // Handle error response
      setError('Error generating batch number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `batch-${batchNumber}.png`; // Set a filename for the QR code image
    link.click();
  };

  const handleClear = () => {
    // Clear all form fields
    setFormData({
      block_mt_id: '',
      customer: '',
      standerd: '',
      component_no: '',
      heat_no: '',
      bardia: '',
      supplier: '',
      material_grade: '',
      rack_no: '',
      bar_qty: '',
      kg_qty: '',
      line: '',
      verified_by: '',
    });
    setBatchNumber('');
    setQrCodeUrl('');
    setFormVisible(true); // Show form again
  };

  return (
    <div className="App bg-gray-50 min-h-screen flex">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <DashboardHeader />
      {/* Main content area */}
      <div className="flex-1 p-16 mt-12 ml-60 max-w-[calc(100vw-240px)] overflow-x-auto">
      {formVisible && (
        <>
          <h2 className="text-2xl font-semibold mb-4 text-center">Generate Batch Tracking Number</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(formData).map(([key, value]) => (
              key !== 'verified_by' && (
                <div key={key} className="col-span-1">
                  <label htmlFor={key} className="block text-sm font-medium text-gray-700">
                    {key.replace(/_/g, ' ').toUpperCase()}:
                  </label>
                  <input
                    type={key === 'kg_qty' ? 'number' : 'text'}
                    id={key}
                    value={value}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                    
                    required={key !== 'verified_by'}
                    readOnly={['customer', 'standerd','component_no', 'heat_no','bardia', 'supplier', 'material_grade', 'rack_no', 'line', 'Allotted_rm','verified_by'].includes(key)}
                  />
                  {key === 'block_mt_id' && (
  <div className="relative">
    
    {value && (
      <ul className="absolute bg-white border border-gray-300 rounded-md mt-1 w-full z-10 max-h-48 overflow-auto">
        {loadingSuggestions ? (
          <li className="p-2 text-gray-500">Loading...</li>
        ) : suggestions.length ? (
          suggestions.map((suggestion) => (
            <li
              key={suggestion}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              {suggestion}
            </li>
          ))
        ) : (
          <li className="p-2 text-gray-500"></li>
        )}
      </ul>
    )}
  </div>
)}

                </div>
              )
            ))}

            <div className="col-span-1">
              <label htmlFor="verified_by" className="block text-sm font-medium text-gray-700">
                VERIFIED BY:
              </label>
              <input
                type="text"
                id="verified_by"
                value={formData.verified_by}
                readOnly
                className="mt-1 p-2 border border-gray-300 rounded-md w-full bg-gray-100"
              />
            </div>

            <div className="col-span-1 sm:col-span-2 lg:col-span-4 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {loading ? 'Generating...' : 'Generate Batch'}
              </button>
            </div>
          </form>
        </>
      )}

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

      {batchNumber && !formVisible && (
        <div className="mt-6 text-center">
          <h3 className="text-xl font-semibold">Batch Generated</h3>
          <p className="mt-2">Batch Number: {batchNumber}</p>
          {qrCodeUrl && (
            <div className="mt-4">
              <h4 className="font-medium">QR Code:</h4>
              <img src={qrCodeUrl} alt="QR Code" className="mx-auto mt-2 w-32 h-32" />
              <button
                onClick={handleDownload}
                className="mt-4 py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Download QR Code
              </button>
            </div>
          )}
          <button
            onClick={handleClear}
            className="mt-4 py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Clear and Generate New Batch
          </button>
        </div>
      )}
    </div>
    </div>
    </div>
  );
};

export default BatchForm;
