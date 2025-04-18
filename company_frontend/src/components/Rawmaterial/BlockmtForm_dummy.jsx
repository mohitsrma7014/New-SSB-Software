import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from './Sidebar';
import DashboardHeader from './DashboardHeader';

const BlockmtForm_dummy = ({ schedule, onClose }) => {
  const [formData, setFormData] = useState({
    component: schedule?.component || '',
    customer: '',
    supplier: '',
    grade1: '',
    standerd: '',
    heatno: '',
    slug_weight: '',
    dia: '',
    rack_no: '',
    pices: '',
    line: '',
    weight: '',
    verified_by: '',
    Available_Rm: '',
  });
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
      const response = await axios.get('http://192.168.1.199:8001/raw_material/components/', {
        params: { component: query },
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

    // Fetch component suggestions if the 'component' field is being updated
    if (field === 'component' && value) {
      fetchComponentSuggestions(value);
    }

    // Handle other field changes, like "pices" (pieces)
    if (field === 'pices') {
      const pieces = parseFloat(value);
      const slugWeight = parseFloat(formData.slug_weight);
      const availableRm = parseFloat(formData.Available_Rm);

      if (!isNaN(slugWeight) && !isNaN(pieces)) {
        const calculatedWeight = (slugWeight * pieces) * 1.03;

        if (!isNaN(availableRm) && calculatedWeight > availableRm) {
          alert('RM not available: Calculated weight exceeds the Available RM.');
          setFormData((prevFormData) => ({
            ...prevFormData,
            weight: '',
            pices: '',
          }));
        } else {
          setFormData((prevFormData) => ({
            ...prevFormData,
            weight: calculatedWeight.toFixed(2),
          }));
        }
      } else {
        setFormData((prevFormData) => ({
          ...prevFormData,
          weight: '',
        }));
      }
    }
  };

  const handleSelectSuggestion = (component) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      component,
    }));

    // Fetch part details for the selected component
    const fetchPartDetails = async () => {
      try {
        const response = await axios.get('http://192.168.1.199:8001/raw_material/get-part-details/', {
          params: { component },
        });
        const data = response.data;

        setFormData((prevFormData) => ({
          ...prevFormData,
          customer: data.customer,
          grade1: data.material_grade,
          dia: data.bar_dia,
          slug_weight: data.slug_weight,
        }));

        if (data.material_grade && data.bar_dia && data.customer) {
          const additionalResponse = await axios.get('http://192.168.1.199:8001/raw_material/get-part-details1/', {
            params: {
              grade: data.material_grade,
              dia: data.bar_dia,
              customer: data.customer,
            },
          });
          const additionalData = additionalResponse.data;

          setFormData((prevFormData) => ({
            ...prevFormData,
            supplier: additionalData.supplier,
            grade: additionalData.grade,
            standerd: additionalData.standerd_rm,
            heatno: additionalData.heatno,
            rack_no: additionalData.rack_no,
            Available_Rm: additionalData.weight_diff,
          }));
        } else {
          console.log('Grade or diameter value is missing');
        }
      } catch (error) {
        console.error('Error fetching part details:', error);
        alert('Raw Material not avaliable.');
        setFormData((prevFormData) => ({
          ...prevFormData,
          component: '',
          customer: '',
          grade1: '',
          dia: '',
          slug_weight: '',
        }));
      }
    };

    fetchPartDetails();
    setSuggestions([]); // Clear suggestions after selection
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://192.168.1.199:8001/raw_material/create-blockmt/', formData);
      alert(`Blockmt created successfully. Blockmt ID: ${response.data.block_mt_id}`);
      
      // Clear all fields and suggestions after successful submission
      setFormData({
        component: '',
        customer: '',
        supplier: '',
        grade1: '',
        standerd: '',
        heatno: '',
        dia: '',
        rack_no: '',
        pices: '',
        line: '',
        weight: '',
        slug_weight: '',
        verified_by: '',
        Available_Rm: '',
      });
      setSuggestions([]); // Clear suggestions
      // Refresh the page
    window.location.reload();
  
    } catch (error) {
      alert('Failed to add Blockmt.');
      console.error('Error:', error);
    }
  };
  

  return (
    <div className="App bg-gray-50 min-h-screen flex">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <DashboardHeader />
      {/* Main content area */}
      <div className="flex-1  ml-60 max-w-[calc(100vw-240px)] overflow-x-auto">
 
  <div className="form-container">
    <form onSubmit={handleSubmit} className="blockmt-form">
      <h2>Poduction Planning Rm Cheq</h2>
      <div className="form-grid">
        {Object.keys(formData).map((key) => {
          if (key === 'line') {
            return (
              <div key={key} className="form-group">
                <label className="form-label">Line:</label>
                <select
                  name="line"
                  value={formData.line}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">Select Line</option>
                  <option value="FFL">FFL</option>
                  <option value="NHF-1000">NHF-1000</option>
                  <option value="1600 TON">1600 TON</option>
                  <option value="HAMMER1">HAMMER1</option>
                  <option value="HAMMER2">HAMMER2</option>
                  <option value="A-SET">A-SET</option>
                  <option value="W-SET">W-SET</option>
                  
                </select>
              </div>
              
            );
          }

          return (
            <div key={key} className="form-group">
              <label className="form-label">{key.replace('_', ' ')}:</label>
              <input
                type={key === 'weight' || key === 'slug_weight' ? 'number' : 'text'}
                name={key}
                value={formData[key]}
                onChange={(e) => handleInputChange(key, e.target.value)}
                step={key === 'weight' || key === 'slug_weight' ? '0.01' : undefined}
                className="form-input"
                required={key !== 'verified_by'}
                readOnly={['customer', 'supplier','slug_weight', 'grade','grade1', 'standerd', 'heatno', 'dia', 'rack_no', 'Available_Rm','verified_by'].includes(key)}
              />
              {key === 'component' && (
                <ul className="suggestions-list">
                  {loadingSuggestions ? (
                    <li>Loading...</li>
                  ) : (
                    suggestions.map((suggestion) => (
                      <li key={suggestion} onClick={() => handleSelectSuggestion(suggestion)}>
                        {suggestion}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      
    </form>
  </div>
</div>
</div>
</div>
  );
};

export default BlockmtForm_dummy;
