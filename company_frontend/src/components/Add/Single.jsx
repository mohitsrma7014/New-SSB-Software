import React, { useState } from "react";
import SupplierForm from "./SupplierForm";
import GradeForm from "./GradeForm";
import CustomerForm from "./CustomerForm";
import TypeOfMaterialForm from "./TypeOfMaterialForm";
import MaterialTypeForm from "./MaterialTypeForm";
import EntityList from "./EntityList";
import { FaSyncAlt } from 'react-icons/fa'; // Icon for reload
import { Sidebar } from '../Rawmaterial/Sidebar';

const Single = () => {
  // State variable to trigger re-fetching the list
  const [reload, setReload] = useState(false);

  // This function toggles the `reload` state and triggers a re-fetch of the list.
  const reloadData = () => {
    setReload(!reload);
  };

  return (
    <div className="App bg-gray-50 min-h-screen p-6">
         <Sidebar /> 
      {/* Container for forms and lists with reduced top margin */}
      <div className="w-full mt-16"> {/* Changed mt-32 to mt-16 to reduce the top margin */}
        
        {/* Container for forms and lists with grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Supplier Form */}
          <div className="card bg-white p-2 rounded-lg shadow-lg">
            <SupplierForm reloadData={reloadData} />
            <EntityList endpoint="suppliers" title="Suppliers" reload={reload} />
          </div>

          {/* Grade Form */}
          <div className="card bg-white p-6 rounded-lg shadow-lg">
            <GradeForm reloadData={reloadData} />
            <EntityList endpoint="grades" title="Grades" reload={reload} />
          </div>

          {/* Customer Form */}
          <div className="card bg-white p-6 rounded-lg shadow-lg">
            <CustomerForm reloadData={reloadData} />
            <EntityList endpoint="customers" title="Customers" reload={reload} />
          </div>

          {/* Type of Material Form */}
          <div className="card bg-white p-6 rounded-lg shadow-lg">
            <TypeOfMaterialForm reloadData={reloadData} />
            <EntityList endpoint="types_of_material" title="Location" reload={reload} />
          </div>

          {/* Material Type Form */}
          <div className="card bg-white p-6 rounded-lg shadow-lg">
            <MaterialTypeForm reloadData={reloadData} />
            <EntityList endpoint="material_types" title="Material Types" reload={reload} />
          </div>
        </div>

        {/* Reload button with animation and icon */}
        <div className="flex justify-center mt-6">
          <button
            onClick={reloadData}
            className="flex items-center space-x-2 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition duration-300 transform hover:scale-105"
          >
            <FaSyncAlt className="text-lg animate-spin" />
            <span>Reload Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Single;
