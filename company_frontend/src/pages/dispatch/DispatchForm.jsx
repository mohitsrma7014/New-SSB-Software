import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from './Sidebar';

const DispatchForm = () => {
  const [formData, setFormData] = useState({
    date: '',
    component: '',
    pices: '',
    invoiceno: '',
    addpdf: null,
    verified_by: '',
    heat_no: '',
    target1: 0,
    total_produced: '',
    remaining: 0,
    batch_number: '',
  });

  const [batchSuggestions, setBatchSuggestions] = useState([]); // Suggestions for batch number
  const [componentSuggestions, setComponentSuggestions] = useState([]); // Suggestions for component
  const [loadingBatchSuggestions, setLoadingBatchSuggestions] = useState(false); // Loading state for batch number suggestions
  const [loadingComponentSuggestions, setLoadingComponentSuggestions] = useState(false); // Loading state for component suggestions
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          'http://192.168.1.199:8001/api/user-details/',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );
        const { name, lastname } = response.data;
        setFormData((prevData) => ({
          ...prevData,
          verified_by: `${name} ${lastname}`,
        }));
      } catch (error) {
        console.error('Error fetching user details:', error);
        alert('Failed to fetch user details.');
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      addpdf: e.target.files[0],
    }));
  };

  // Handle batch number change
  const handleBatchNumberChange = async (e) => {
    const query = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      batch_number: query,
    }));

    if (!query) {
      setBatchSuggestions([]);
      return;
    }

    setLoadingBatchSuggestions(true);
    try {
      const response = await axios.get(
        "http://192.168.1.199:8001/raw_material/autocompleteforging/",
        { params: { block_mt_id: query } }
      );
      setBatchSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching batch suggestions:', error);
    } finally {
      setLoadingBatchSuggestions(false);
    }
  };

  const handleBatchSuggestionSelect = async (batchNumber) => {
    setFormData((prevData) => ({
      ...prevData,
      batch_number: batchNumber,
    }));
    setBatchSuggestions([]);

    try {
      const partDetailsResponse = await axios.get(
        "http://192.168.1.199:8001/raw_material/get_part_detailsforging/",
        { params: { block_mt_id: batchNumber } }
      );
      const partData = partDetailsResponse.data;
      setFormData((prevData) => ({
        ...prevData,
        component: partData.component,
        heat_no: partData.heatno,
        total_produced: partData.total_production || 0,
      }));
    } catch (error) {
      console.error('Error fetching part details:', error);
    }
  };

  const handleComponentChange = async (e) => {
    const query = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      component: query,
    }));
  
    if (!query) {
      setComponentSuggestions([]);
      return;
    }
  
    setLoadingComponentSuggestions(true);
    try {
      const response = await axios.get(
        'http://192.168.1.199:8001/raw_material/components/',
        { params: { component: query } }
      );
      setComponentSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching component suggestions:', error);
    } finally {
      setLoadingComponentSuggestions(false);
    }
  };
  
  const handleComponentSelect = (selectedComponent) => {
    setFormData((prevData) => ({
      ...prevData,
      component: selectedComponent,
    }));
    setComponentSuggestions([]); // Clear suggestions after selection
  };
  
  // Check if the user manually enters a value that is not in the suggestions list
  const handleComponentBlur = () => {
    const { component } = formData;
    
    if (!componentSuggestions.includes(component)) {
      setFormData((prevData) => ({
        ...prevData,
        component: '', // Clear the input if the value is not in the suggestions
      }));
    }
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Prevent submission if already submitting
    if (isSubmitting) return;
  
    setIsSubmitting(true); // Disable the submit button
  
    // Validate form data
    if (!formData.date || !formData.component || !formData.pices || !formData.invoiceno || !formData.addpdf ||  !formData.verified_by ) {
      alert('Please fill in all required fields.');
      setIsSubmitting(false); // Enable button again if validation fails
      return;
    }
  
    const form = new FormData();
    for (const key in formData) {
      form.append(key, formData[key]);
    }
  
    try {
      const response = await axios.post('http://192.168.1.199:8001/raw_material/api/dispatch/', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccessMessage('Form submitted successfully!');
      setFormData({
        date: '',
        component: '',
        pices: '',
        invoiceno: '',
        addpdf: null,
        verified_by: '',
        heat_no: '',
        target1: 0,
        total_produced: '',
        remaining: 0,
        batch_number: '',
      });
    } catch (error) {
      console.error('Error:', error.response?.data || error);
      setSuccessMessage('There was an error submitting the form.');
    } finally {
      setIsSubmitting(false); // Re-enable the submit button after submission
    }
  };
  

  return (
    <form onSubmit={handleSubmit} className="container mx-auto mt-29 p-8 bg-gray-100 rounded shadow-lg mt-[150px]">
      <Sidebar />
      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="block mb-2 font-semibold">Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Batch Number:</label>
          <input
            type="text"
            name="batch_number"
            value={formData.batch_number}
            onChange={handleBatchNumberChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {loadingBatchSuggestions && <p>Loading suggestions...</p>}
          {batchSuggestions.length > 0 && (
            <ul className="absolute bg-white border border-gray-300 rounded mt-1 w-full max-h-40 overflow-y-auto">
              {batchSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleBatchSuggestionSelect(suggestion)}
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="block mb-2 font-semibold">Component:</label>
          <input
  type="text"
  name="component"
  value={formData.component}
  onChange={handleComponentChange}
  onBlur={handleComponentBlur}  // Add onBlur to check if the entered value is valid
  className="w-full p-2 border border-gray-300 rounded"
/>

          {loadingComponentSuggestions && <p>Loading suggestions...</p>}
          {componentSuggestions.length > 0 && (
            <ul className="absolute bg-white border border-gray-300 rounded mt-1 w-full max-h-40 overflow-y-auto">
              {componentSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleComponentSelect(suggestion)}
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label className="block mb-2 font-semibold">Heat No:</label>
          <input
            type="text"
            name="heat_no"
            value={formData.heat_no}
            readOnly
            className="w-full p-2 border border-gray-300 rounded bg-gray-100"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">Pieces:</label>
          <input
            type="number"
            name="pices"
            value={formData.pices}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">Invoice No:</label>
          <input
            type="text"
            name="invoiceno"
            value={formData.invoiceno}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">Upload PDF:</label>
          <input
            type="file"
            name="addpdf"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">Verified By:</label>
          <input
            type="text"
            name="verified_by"
            value={formData.verified_by}
            readOnly
            className="w-full p-2 border border-gray-300 rounded bg-gray-100"
          />
        </div>
        
        <div style={{ display: 'none' }}>
          <label className="block mb-2 font-semibold">Target1:</label>
          <input
            type="number"
            name="target1"
            value={formData.target1}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div style={{ display: 'none' }}>
          <label className="block mb-2 font-semibold">Total Produced:</label>
          <input
            type="number"
            name="total_produced"
            value={formData.total_produced}
            readOnly
            className="w-full p-2 border border-gray-300 rounded bg-gray-100"
          />
        </div>
        <div style={{ display: 'none' }}>
          <label className="block mb-2 font-semibold">Remaining:</label>
          <input
            type="number"
            name="remaining"
            value={formData.remaining}
            readOnly
            className="w-full p-2 border border-gray-300 rounded bg-gray-100"
          />
        </div>
      </div>
      <div className="mt-6">
  <button
    type="submit"
    className="w-full p-3 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600"
    disabled={isSubmitting} // Disable the button if isSubmitting is true
  >
    Submit
  </button>
</div>

      {successMessage && <p className="mt-4 text-green-600">{successMessage}</p>}
    </form>
  );
};

export default DispatchForm;
