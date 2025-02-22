import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Sidebar } from '../../components/AdminComponents/Sidebar';

function ScheduleForm() {
    const [formData, setFormData] = useState({
        component: '',
        customer: '',
        grade: '',
        standerd: '',
        dia: '',
        slug_weight: '',
        pices: '',
        weight: '',
        date1: null, // Set to null for DatePicker
        location: '',
        verified_by: '',
    });

    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`http://192.168.1.199:8001/api/user-details/`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });
                const { name, lastname } = response.data;
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    verified_by: `${name} ${lastname}`,
                }));
            } catch (err) {
                console.error('Error fetching user details:', err);
                alert('Failed to fetch user details. Please check your credentials and try again.');
            }
        };

        fetchUserData();
    }, []);

    const fetchComponentSuggestions = async (query) => {
        setLoadingSuggestions(true);
        try {
            const response = await axios.get(`http://192.168.1.199:8001/raw_material/components/`, {
                params: { component: query },
            });
            setSuggestions(response.data);
        } catch (error) {
            console.error('Error fetching component suggestions:', error);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [field]: value,
        }));

        if (field === 'component' && value) {
            fetchComponentSuggestions(value);
        }

        if (field === 'pices') {
            const pieces = parseFloat(value);
            const slugWeight = parseFloat(formData.slug_weight);

            if (!isNaN(slugWeight) && !isNaN(pieces)) {
                const calculatedWeight = (slugWeight * pieces) * 1.03;
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    weight: calculatedWeight.toFixed(2),
                }));
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

        const fetchPartDetails = async () => {
            try {
                const response = await axios.get(`http://192.168.1.199:8001/raw_material/get-part-details/`, {
                    params: { component },
                });
                const data = response.data;

                setFormData((prevFormData) => ({
                    ...prevFormData,
                    standerd: data.standerd,
                    customer: data.customer,
                    grade: data.material_grade,
                    dia: data.bar_dia,
                    slug_weight: data.slug_weight,
                }));
            } catch (error) {
                console.error('Error fetching part details:', error);
                alert('Please enter a correct part number.');
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    component: '',
                    customer: '',
                    grade: '',
                    dia: '',
                    slug_weight: '',
                }));
            }
        };

        fetchPartDetails();
        setSuggestions([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation for required fields
        if (!formData.date1 || !formData.location || !formData.verified_by) {
            alert('Please fill out all required fields: Date1, Location, Verified By.');
            return;
        }

        try {
            const response = await axios.post(
                `http://192.168.1.199:8001/raw_material/ScheduleViewSet/`,
                formData,
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );
            console.log('Success:', response.data);
            alert('Form submitted successfully!');

            // Reload the window after 2 seconds
            setTimeout(() => {
                window.location.reload();
            }, 20);
        } catch (error) {
            console.error('Error submitting the form:', error);
            alert('Failed to submit the form. Please try again.');
        }
    };

    return (
        <div className="page-container">
            <Sidebar />
            <div className="form-container">
                <form onSubmit={handleSubmit} className="blockmt-form">
                    <h2>Add Customer Schedule</h2>
                    <div className="form-grid">
                        {Object.keys(formData).map((key) => (
                            <div key={key} className="form-group">
                                <label className="form-label">{key.replace('_', ' ')}:</label>
                                {key === 'location' ? (
                                    <select
                                        name={key}
                                        value={formData[key]}
                                        onChange={(e) => handleInputChange(key, e.target.value)}
                                        className="form-input"
                                        required
                                    >
                                        <option value="">Select Location</option>
                                        <option value=" ">Without location</option>
                                        <option value="Noida">Noida</option>
                                        <option value="Sanand">Sanand</option>
                                        <option value="Belgaum">Belgaum</option>
                                        
                                    </select>
                                ) : key === 'date1' ? (
                                    <DatePicker
                                        selected={formData.date1}
                                        onChange={(date) => handleInputChange('date1', date)}
                                        dateFormat="yyyy-MM-dd"
                                        className="form-input"
                                        placeholderText="Select a date"
                                        required
                                    />
                                ) : (
                                    <input
                                        type={['weight', 'slug_weight'].includes(key) ? 'number' : 'text'}
                                        name={key}
                                        value={formData[key]}
                                        onChange={(e) => handleInputChange(key, e.target.value)}
                                        step={['weight', 'slug_weight'].includes(key) ? '0.01' : undefined}
                                        className="form-input"
                                        required={['date1', 'location', 'verified_by'].includes(key)}
                                        readOnly={['customer', 'slug_weight', 'grade', 'standerd', 'dia', 'verified_by'].includes(key)}
                                    />
                                )}
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
                        ))}
                    </div>
                    <button type="submit" className="form-submit">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ScheduleForm;
