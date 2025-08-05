import React, { useState } from "react";
import "./MainLayout.css";
const ControllerTable = ({ appName, scenarioName, rows, setRows ,showTable, setShowTable, projects, sheetName}) => {
  const [editIndex, setEditIndex] = useState(null);
  const [logs, setLogs] = useState("");
  const performOptions = [
    "click", "sendKeys", "JAVASCRIPTCLICK", "ACTIONCLICK", "DOUBLECLICK", "RIGHTCLICK", "CLEAR", "CLEAR_USING_ACTION", "MOUSEHOVER", "GETTEXT", "CHECK_ENABILITY", "CHECK_DISABILITY", "CHECK_VISIBILITY", "CHECK_INVISIBILITY", "CHECK_INVISIBILITY", "SELECTVALUE",
    "navigateTo", "assertElementPresent", "takeScreenshot", "SELECTVALUE", "DATEPICKER", "SCROLLTOELEMENT", "MOVETOELEMENT", "INPUTFIELD", "BROWSEURL", "ACCEPTALERT", "TAB", "ENTER", "BACKSPACE",
    "ESC", 'PAGEDOWN', "PAGEUP", "ZOOMOUT", "ZOOMIN", "REFRESH", "CLOSEWINDOW", "SWITCH_WINDOW", "SET_PARENTWINDOW", "SWITCH_PARENTWINDOW","SWITCH_PARENTWINDOW", "SLEEP(ms)"];
  
  const [newRow, setNewRow] = useState({
    SrNo: "",
    Application_Name: appName,
   
    PageName: "",
    RunStatus: "",
    Control: "",
    ObjectType: "",
    Object: "",
    Perform: "",
    DataValues: "",
    Step_Description: "",
  });

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleEdit = (index) => setEditIndex(index);
  const handleSave = () => setEditIndex(null);

  const handleDelete = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const handleAddNew = () => {
    const requiredFields = [
      "SrNo",
      "Application_Name",
    //   "Module",
      "PageName",
      "RunStatus",
      "Control",
      "Perform",
    ];

    const hasEmptyField = requiredFields.some((field) => !newRow[field]);
    if (hasEmptyField) {
      return alert("Please fill in all required fields.");
    }

    const newRowData = {
      id: Date.now(),
      ...newRow,
    };

    setRows([...rows, newRowData]);
    setNewRow({
      SrNo: "",
      Application_Name: appName,
      
      PageName: "",
      RunStatus: "",
      Control: "",
      ObjectType: "",
      Object: "",
      Perform: "",
      DataValues: "",
      Step_Description: "",
    });
  };

  const handleAdd = (index) => {
    const newRow = {
      id: Date.now(),
      SrNo: "",
      Application_Name: appName,
     
      PageName: "",
      RunStatus: "",
      Control: "",
      ObjectType: "",
      Object: "",
      Perform: "",
      DataValues: "",
      Step_Description: "",
    };
    const updatedRows = [...rows.slice(0, index + 1), newRow, ...rows.slice(index + 1)];
    setRows(updatedRows);
    setEditIndex(index + 1);
  };

const handleSaveToExcel = (sheetName) => {
    const sheetData = rows.map(({ id, ...rest }) => rest);
  
    fetch("http://localhost:4000/update-file", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: sheetName,
        data: sheetData,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update file");
        return res.json();
      })
      .then((data) => {
        alert("Excel file updated successfully.");
        console.log("✅ File updated:", data);
      })
      .catch((err) => {
        console.error("❌ Error updating file:", err);
        alert("Failed to update Excel file.");
      });
  };
  const handleRunTest = async () => {
    
  console.log("✳️ App Name:", appName);
    setLogs(["Running test..."]);
    // setLoading(true);
    console.log("🚀 Received scenarioName at handleRunTest:", appName);
    fetch('http://localhost:4000/run-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectName: appName  })
    })
      .then(res => res.json())
      .then(data => {
        // setLoading(false);
        if (data.error) {
          setLogs(["❌ Error:", data.error]);
        }
      })
      .catch(err => {
        // setLoading(false);
        setLogs(["❌ Failed to trigger test", err.toString()]);
      });
  };
  return (
    <div className="controller-wrapper">
    
    {!showTable ? (
      <div className="full-center-message">
      <span>
        👉 Please select <b>Edit</b> from the sidebar to begin editing your test steps.
      </span>
    </div>
    ) : (
        <div className="table-container">
        <h2>Test Steps for Application: <b>{appName}</b> and Scenario: <b>{scenarioName}</b></h2>
        <h3>File Name: <b>{sheetName}</b></h3>
        <button onClick={() => handleSaveToExcel(sheetName)} style={{ marginBottom: "20px", marginLeft: "0" }}>Save to Excel</button>
        
        <button onClick={handleRunTest} style={{ marginLeft: "10px" }}>
          Run Test
        </button>
        <table border="1" cellPadding="5" cellSpacing="0" width="100%" >
          <thead>
            <tr>
              <th>SrNo</th>
              <th>Application_Name</th>
              {/* <th>Module</th> */}
              <th>PageName</th>
              <th>RunStatus</th>
              <th>Control</th>
              <th>ObjectType</th>
              <th>Object</th>
              <th>Perform</th>
              <th>DataValues</th>
              <th>Step_Description</th>
              <th>Actions</th>
              
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                {[
                  "SrNo",
                  "Application_Name",
                //   "Module",
                  "PageName",
                  "RunStatus",
                  "Control",
                  "ObjectType",
                  "Object",
                  "Perform",
                  "DataValues",
                  "Step_Description"
                ].map((field) => (
                 
                  <td
                  key={field} 
                  
                  >
                    {editIndex === index ? (
  field === "Perform" ? (
    <input
      list="performOptions"
      value={row[field] || ""}
      onChange={(e) => handleInputChange(index, field, e.target.value)}
      style={{ width: "100%" }}
    />
  ) : (
    <input
      value={row[field] || ""}
      onChange={(e) => handleInputChange(index, field, e.target.value)}
      style={{ width: "100%" }}
    />
  )
) : (
  row[field]
)}

                  </td>
  
                ))}
                <td>
                  {editIndex === index ? (
                    <button onClick={handleSave}>Save</button>
                  ) : (
                    <button onClick={() => handleEdit(index)}>Edit</button>
                  )}
                  <button onClick={() => handleDelete(index)} style={{ marginLeft: "8px" }}>Delete</button>
                  <button onClick={() => handleAdd(index)} style={{ marginLeft: "8px" }}>Add</button>
                </td>
              </tr>
            ))}
            <tr>
              {[
                "SrNo",
                "Application_Name",
                // "Module",
                "PageName",
                "RunStatus",
                "Control",
                "ObjectType",
                "Object",
                "Perform",
                "DataValues",
                "Step_Description",
              ].map((field) => (
                <td key={field}>
                 {field === "Perform" ? (
  <input
    list="performOptions"
    placeholder={field}
    value={newRow[field] || ""}
    onChange={(e) => setNewRow({ ...newRow, [field]: e.target.value })}
  />
) : (
  <input
    placeholder={field}
    value={newRow[field] || ""}
    onChange={(e) => setNewRow({ ...newRow, [field]: e.target.value })}
  />
)}

                </td>
              ))}
              <td>
                <button onClick={handleAddNew}>Add New</button>
              </td>
            </tr>
          </tbody>
        </table>
        <datalist id="performOptions">
  {performOptions.map((opt) => (
    <option key={opt} value={opt} />
  ))}
</datalist>

      </div>
    )}
    </div>
  );
};

export default ControllerTable;
