import React, { useState, useEffect } from "react";

const ConfigModal = ({ configData, onClose }) => {
  const [editableData, setEditableData] = useState([]);
  const [newRowIndex, setNewRowIndex] = useState(null);

  useEffect(() => {
    setEditableData(configData);
  }, [configData]);

  const handleChange = (rowIndex, key, value) => {
    const updatedData = [...editableData];
    updatedData[rowIndex][key] = value;
    setEditableData(updatedData);
  };

  const handleDelete = (indexToDelete) => {
    const updatedData = editableData.filter((_, index) => index !== indexToDelete);
    setEditableData(updatedData);
  };
  const handleCreateFile = (e) => {
    if (e) e.preventDefault();
    const lastRow = editableData[newRowIndex];
  
    const fileName = lastRow?.DataSheet_Name?.trim();
    console.log(fileName);
  
    if (!fileName) {
      alert("Please enter a value for 'DataSheet_Name' before creating a file.");
      return;
    }
  
    fetch("http://localhost:4000/create-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: `${fileName}` }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || `File ${fileName} created successfully.`);
        setNewRowIndex(null); // reset once file is created
      })
      .catch((err) => {
        alert("Failed to create file: " + err.message);
      });
      handleSave();
  };
  

//   const handleAddRow = () => {
//     if (editableData.length === 0) return;

//     const newRow = {};
//     Object.keys(editableData[0]).forEach((key) => {
//       newRow[key] = "";
//     });

//     setEditableData([...editableData, newRow]);
//   };
const handleAddRow = () => {
    if (editableData.length === 0) return;
  
    const newRow = {};
    Object.keys(editableData[0]).forEach((key) => {
      newRow[key] = "";
    });
  
    const newIndex = editableData.length; // new row index
    setEditableData([...editableData, newRow]);
    setNewRowIndex(newIndex); // mark new row added
  };
  
  const handleSave = () => {
    fetch("http://localhost:4000/controller-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: editableData }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("🔧 Saving controller config data:", data);
        alert("Configuration saved successfully.");
        onClose();
      })
      .catch((err) => {
        alert("Failed to save configuration.");
        console.error(err);
      });
  };

  if (!editableData || editableData.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded shadow-lg w-2/3 max-h-[80vh] overflow-auto relative">
          <h2 className="text-xl font-bold mb-4">Controller Configure</h2>
          <p>No configuration data available.</p>
          <div className="mt-4 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-2/3 max-h-[80vh] overflow-auto relative">
        <h2 className="text-xl font-bold mb-4">Controller Configure</h2>

        <div className="mb-2 text-right">
          <button
            onClick={handleAddRow}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            ➕ Add Row
          </button>
        </div>

        <table className="table-auto w-full border border-gray-400 text-sm">
          <thead>
            <tr>
              {Object.keys(editableData[0]).map((key) => (
                <th key={key} className="border px-2 py-1 bg-gray-100 text-left">
                  {key}
                </th>
              ))}
              <th className="border px-2 py-1 bg-gray-100 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {editableData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.entries(row).map(([key, value], colIndex) => (
                  <td key={colIndex} className="border px-2 py-1 break-words">
                    <input
                      type="text"
                      value={value || ""}
                      onChange={(e) => handleChange(rowIndex, key, e.target.value)}
                      className="w-full border rounded px-1 py-0.5 text-xs"
                    />
                  </td>
                ))}
                <td className="border px-2 py-1 text-center">
                  <button
                    onClick={() => handleDelete(rowIndex)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
                  >
                    Delete
                  </button>
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 text-right space-x-2">
        {newRowIndex !== null && (
        <button
        onClick={(e)=> handleCreateFile(e)}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
        Create File
        </button>
        )}

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;
