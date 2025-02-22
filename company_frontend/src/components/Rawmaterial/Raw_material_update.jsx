import React, { useState } from "react";
import RawMaterialList from "./RawMaterialList";
import RawMaterialDetail from "./RawMaterialDetail";

const App = () => {
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);

  const handleSelectMaterial = (id) => {
    setSelectedMaterialId(id);
  };

  const handleBackToList = () => {
    setSelectedMaterialId(null);
  };

  return (
    <div>
      {selectedMaterialId ? (
        <RawMaterialDetail
          materialId={selectedMaterialId}
          onBack={handleBackToList}
        />
      ) : (
        <RawMaterialList onSelectMaterial={handleSelectMaterial} />
      )}
    </div>
  );
};

export default App;
