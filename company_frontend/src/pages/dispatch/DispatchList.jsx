import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DispatchList.css'; // For custom styles
import { Sidebar } from '../../components/AdminComponents/Sidebar';
const DispatchList = () => {
    const [dispatches, setDispatches] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // State to hold the search term

    useEffect(() => {
        axios.get('http://192.168.1.199:8001/raw_material/api/dispatches/')
            .then(response => {
                // Sort the response data by date in descending order (latest to oldest)
                const sortedDispatches = response.data.sort((a, b) => {
                    return new Date(b.date) - new Date(a.date);
                });
                setDispatches(sortedDispatches);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    // Filter dispatches based on the search term
    const filteredDispatches = dispatches.filter(dispatch => {
        return (
            dispatch.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dispatch.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dispatch.invoiceno.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dispatch.heat_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dispatch.batch_number.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="dispatch-list-container">
            <div class="top">
            <Sidebar />
            </div>
            <h1>Dispatch List</h1>

            {/* Sticky Search input field */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-box"
                />
            </div>

            {/* Table with sticky headers */}
            <table border="1" className="dispatch-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Component</th>
                        <th>Pices</th>
                        <th>Invoice No</th>
                        <th>PDF</th>
                        <th>Verified By</th>
                        <th>Heat No</th>
                       
                        <th>Batch Number</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDispatches.map((dispatch) => (
                        <tr key={dispatch.id}>
                            <td>{dispatch.date}</td>
                            <td>{dispatch.component}</td>
                            <td>{dispatch.pices}</td>
                            <td>{dispatch.invoiceno}</td>
                            <td>
                                {dispatch.addpdf ? (
                                    <a href={`http://192.168.1.199:8001${dispatch.addpdf}`} target="_blank" rel="noopener noreferrer">
                                        View PDF
                                    </a>
                                ) : (
                                    'No PDF'
                                )}
                            </td>
                            <td>{dispatch.verified_by}</td>
                            <td>{dispatch.heat_no}</td>
                            
                            <td>{dispatch.batch_number}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DispatchList;
