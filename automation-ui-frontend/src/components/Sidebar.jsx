import React, { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import "./Sidebar.css";
import { Link } from "react-router-dom";
const Sidebar = ({ projects = [], onSelectScenario, onEditClick, onConfigureClick,appName ,sheetName}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSheets, setSelectedSheets] = useState([]);
  const [reportUrl, setReportUrl] = useState([]);

const handleRun = async (appName,msheetName, scenario) => {
    onEditClick(msheetName, scenario)
    setLogs(["Running test..."]);
    setLoading(true);
  
    try {
        const response = await fetch("http://localhost:4000/run-test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({projectName: appName }),
        });
    
        const data = await response.json();
        if (response.status === 200 && data.reportUrl) {
          // ⚠️ Use full backend URL
          const fullReportUrl = `http://localhost:4000${data.reportUrl}`;
          setReportUrl(fullReportUrl);
          window.open(fullReportUrl, "_blank");
        } else {
          alert("Test run failed.");
        }
      } catch (error) {
        console.error("Error running Test:", error);
        alert("Error running Test.");
      }
  };
  const handleSuiteRun = async (appName, scenario) => {
    onEditClick(selectedSheets[0], scenario[0])
    if (selectedSheets.length === 0) {
      alert("Please select at least one scenario.");
      return;
    }
  
    console.log("Selected Sheets:", selectedSheets); // Debugging
  
    try {
      const response = await fetch("http://localhost:4000/run-suite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetNames: selectedSheets, projectName: appName }),
      });
  
      const data = await response.json();
      if (response.status === 200 && data.reportUrl) {
        // ⚠️ Use full backend URL
        const fullReportUrl = `http://localhost:4000${data.reportUrl}`;
        setReportUrl(fullReportUrl);
        window.open(fullReportUrl, "_blank");
      } else {
        alert("Suite run failed.");
      }
    } catch (error) {
      console.error("Error running suite:", error);
      alert("Error running suite.");
    }
  };
   // Handle checkbox toggle
   const handleCheckboxChange = (excelSheetName) => {
    setSelectedSheets((prevSelected) =>
      prevSelected.includes(excelSheetName)
        ? prevSelected.filter((name) => name !== excelSheetName) // Remove if already selected
        : [...prevSelected, excelSheetName] // Add if not selected
    );
  };
return (
    <div className="sidebar-container">
        {/* Hamburger */}
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-4 focus:outline-none text-xl"
            title="Toggle Sidebar"
        >
            <FaBars />
        </button>

        {/* Sidebar Menu */}
        {isOpen && (
            <div className="sidebar">
                {/* <div className="flex items-center justify-between mb-4"> */}
    <h2 className="font-bold text-xl">PROJECTS</h2>
    <div className="button-link-runsuite">
      {reportUrl && (
        <Link
          to="/allure-reports"
          className="button-link"
        >
          📊 <span className="hidden sm:inline">Report</span>
        </Link>
      )}
      <button
        onClick={onConfigureClick}
        className="button-link configure flex items-center gap-1"
        title="Configure"
      >
        ⚙️ <span className="hidden sm:inline">Configure</span>
      </button>
    {/* </div> */}
  </div>
    

                {projects.map((project) => (
                    <div key={project.name} className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="project-name">{project.name}
                            <button 
                         onClick={() => handleSuiteRun(project.name,  project.scenarios)}
                         className="button-link-runsuite">
                           ▶️ Run Suite
                        </button>
                        </h3>
                        </div>
                        {/* <h5>Select Scenarios</h5> */}
                        {(project.scenarios || []).map((scenario) => (
                            <div key={scenario.id} className='scenario-card'>
                                <input
                                    type="checkbox"
                                    id={scenario.id}
                                    onChange={() => handleCheckboxChange(scenario.excelSheetName)}
                                />
                                <label htmlFor={scenario.id}>{scenario.name}</label>
                                {/* <div className="flex gap-3 mt-2"> */}
                                    <button
                                        onClick={() => handleRun(scenario.appName, scenario.excelSheetName, scenario)}
                                        className="button-link"
                                    >
                                   ▶️ Run
                                    </button>
                                    <button
                                        onClick={() =>
                                            onEditClick(scenario.excelSheetName, scenario)
                                        }
                                        className="button-link edit"
                                    >
                                       ⚙️ Edit
                                    </button>
                                {/* </div> */}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        )}
    </div>
);
};


export default Sidebar;
