import React, { useEffect } from 'react';
import './PrintSlip.css';
import logo from '../../assets/logo.png';

const PrintSlip = ({ material, onClose }) => {
  useEffect(() => {
    // Automatically trigger printing
    window.print();

    // Close the component after printing
    const handleAfterPrint = () => {
      if (onClose) onClose();
    };

    window.addEventListener('afterprint', handleAfterPrint);

    // Auto-close after a timeout (e.g., 5 seconds)
    const timeout = setTimeout(() => {
      if (onClose) onClose();
    }, 2);

    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
      clearTimeout(timeout);
    };
  }, [onClose]);

  let statusClass = '';
  switch (material.approval_status.toLowerCase()) {
    case 'approved':
      statusClass = 'status-approved';
      break;
    case 'rejected':
      statusClass = 'status-rejected';
      break;
    case 'hold':
      statusClass = 'status-hold';
      break;
    case 'under inspection':
      statusClass = 'status-under-inspection';
      break;
    default:
      statusClass = '';
  }

  return (
    <div className={`container2 print-content ${statusClass}`}>
      <img src={logo} alt="Logo" className="logo" />
      <h1 style={{ textAlign: 'center', fontSize: '30px', fontWeight: 'bold' }}>
        {material.approval_status.toUpperCase()}
      </h1>
      <table>
        <tr><th>Received Date</th><td>{material.date}</td></tr>
        <tr><th>Supplier</th><td>{material.supplier}</td></tr>
        <tr><th>Material Grade</th><td>{material.grade}</td></tr>
        <tr><th>Customer</th><td>{material.customer}</td></tr>
        <tr><th>Standard</th><td>{material.standerd}</td></tr>
        <tr><th>Heat Number</th><td>{material.heatno}</td></tr>
        <tr><th>Dia(MM)</th><td>{material.dia}</td></tr>
        <tr><th>Received Weight</th><td>{material.weight} kg</td></tr>
        <tr><th>Rack Number</th><td>{material.rack_no}</td></tr>
        <tr><th>Location</th><td>{material.location}</td></tr>
        <tr><th>Type of Material</th><td>{material.type_of_material}</td></tr>
        <tr><th>Invoice Number</th><td>{material.invoice_no}</td></tr>
        <tr><th>Verify By</th><td>{material.verified_by}</td></tr>
      </table>
      <div className="signature-box">Authorised Signatory:</div>
      <div className="print-info">Printed on: {new Date().toLocaleString()}</div>
    </div>
  );
};

export default PrintSlip;
