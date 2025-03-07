import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RawMaterialForm.css'; // Import the CSS file
import { Sidebar } from './Sidebar';

const RawMaterialForm = () => {
  const initialFormData = {
    date: '',
    supplier: '',
    grade: '',
    customer: '',
    standerd: '',
    heatno: '',
    dia: '',
    weight: '',
    rack_no: '',
    location: '',
    type_of_material: '',
    cost_per_kg: '',
    invoice_no: '',
    verified_by: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [suggestions, setSuggestions] = useState({
    supplier: [],
    grade: [],
    customer: [],
    type_of_material: [],
    location: [],
  });

  const [errorMessage, setErrorMessage] = useState('');

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

  const handleInputChange = async (field, value) => {
    setErrorMessage('');
    setFormData({ ...formData, [field]: value });

    // Fetch suggestions only for the specified fields
    const suggestionFields = ['supplier', 'grade', 'customer', 'location', 'type_of_material'];
    if (suggestionFields.includes(field) && value.length > 1) {
      try {
        const response = await axios.get(`http://192.168.1.199:8001/raw_material/${field}s_suggestions/`, {
          params: { q: value },
        });
        setSuggestions((prev) => ({ ...prev, [field]: response.data }));
      } catch (error) {
        console.error(`Failed to fetch ${field} suggestions:`, error);
      }
    } else {
      // If the field is not in the list, clear suggestions
      setSuggestions((prev) => ({ ...prev, [field]: [] }));
    }
  };

  const handleSuggestionClick = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setSuggestions((prev) => ({ ...prev, [field]: [] })); // Clear suggestions
  };

  const handleBlur = (field) => {
    const suggestionFields = ['supplier', 'grade', 'customer', 'location', 'type_of_material'];
    if (suggestionFields.includes(field)) {
      // If suggestions are empty or the field value is not a valid suggestion, clear the field
      if (!suggestions[field]?.includes(formData[field])) {
        setFormData((prevData) => ({ ...prevData, [field]: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.verified_by) {
      alert('Verified By field is required and cannot be empty.');
      return;
    }
  
    try {
      const response = await axios.post('http://192.168.1.199:8001/raw_material/api/raw-materials/', formData);
      console.log('Success:', response.data);
      alert('Raw material added successfully!');
  
      // Reset form but keep "verified_by" intact
      setFormData((prevData) => ({
        ...initialFormData,
        verified_by: prevData.verified_by, // Keep verified_by
      }));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add raw material.');
    }
  };
  

  return (
    <div className="page-container">
      <Sidebar /> {/* Move Sidebar outside the form container */}
      <div className="form-container">
        <form onSubmit={handleSubmit} className="raw-material-form" autoComplete="off"> {/* Add autoComplete="off" */}
          <h2>Raw Material Form</h2>
          <div className="form-grid">
            {Object.keys(formData).map((key) => (
              <div key={key} className="form-group">
                <label className="form-label">{key.replace('_', ' ')}:</label>
                <input
                  type={
                    key === 'date'
                      ? 'date'
                      : key === 'weight' || key === 'cost_per_kg'
                      ? 'number'
                      : 'text'
                  }
                  name={key}
                  value={formData[key]}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  onBlur={() => handleBlur(key)} // Clear value if suggestions are empty for the relevant fields
                  onFocus={() => setErrorMessage('')} // Clear error message on focus
                  step={key === 'weight' || key === 'cost_per_kg' ? '0.01' : undefined}
                  className="form-input"
                  readOnly={key === 'verified_by'} // Make verified_by field non-editable
                  required={key !== 'verified_by'} // Optional for the verified_by field
                  autoComplete="off" // Disable autocomplete on each input field
                />
                {suggestions[key]?.length > 0 && (
                  <ul className="suggestions-list">
                    {suggestions[key].map((suggestion, index) => (
                      <li
                        key={index}
                        onClick={() => handleSuggestionClick(key, suggestion)}
                        className="suggestion-item"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit" className="form-submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default RawMaterialForm;
