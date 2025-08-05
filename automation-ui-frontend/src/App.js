import React from "react";
import TestCaseTable from "./components/TestCaseTable";
import Sidebar from "./components/Sidebar";
import UploadController from "./components/UploadController";
import ConfigModal from "./components/ConfigModal";
import Terminal from "./components/Terminal";
import * as XLSX from "xlsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AllAllureReports from "./components/AllureReportHistory";

function MainApp() {
  const [selectedScenario, setSelectedScenario] = React.useState(null);
  const [configData, setConfigData] = React.useState(null);
  const [showConfigModal, setShowConfigModal] = React.useState(false);
  const [projects, setProjects] = React.useState([]);
  const [tableData, setTableData] = React.useState([]);
  const [showTable, setShowTable] = React.useState(false);
  const [selectedAppName, setSelectedAppName] = React.useState(null);
  const [excelSheetName, setexcelSheetName] = React.useState(null);
  // const [logs, setLogs] = React.useState([]);
  // const [loading, setLoading] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const handleSelectScenario = (scenario, action) => {
    setSelectedScenario(scenario); // keep whole object
    setSelectedAppName(scenario.appName);
    console.log(`Scenario "${scenario.name}" action: ${action}`);
  };

  const onEditClick = async (excelSheetName, scenario) => {
    setShowTable(true);
    // const scenarioName = scenario.name;
    // const excelSheetName = scenario.excelSheetName;
    console.log(excelSheetName);

    try {
      const res = await fetch(`/resources/TestData/${excelSheetName}`);
      if (!res.ok) {
        alert(`File /resources/TestData/${excelSheetName} not found`);
        return;
      }

      const arrayBuffer = await res.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      if (workbook.SheetNames.length === 0) {
        alert("No sheets found in workbook");
        return;
      }

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      setTableData(jsonData);
      setSelectedScenario(scenario.name);
      setSelectedAppName(scenario.appName);
      setexcelSheetName(excelSheetName);
    } catch (err) {
      console.error("Error in onEditClick:", err);
      alert("Failed to load scenario data");
    }
  };

  const handleConfigureClick = async () => {
    try {
      const res = await fetch(`/resources/Controller_Web.xlsx`);
      if (!res.ok) {
        alert("File /resources/Controller_Web.xlsx not found");
        return;
      }

      const arrayBuffer = await res.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      if (workbook.SheetNames.length === 0) {
        alert("No sheets found in Controller file");
        return;
      }

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      setConfigData(jsonData);
      setShowConfigModal(true);
    } catch (err) {
      console.error("Error in handleConfigureClick:", err);
      alert("Failed to load controller configuration");
    }
  };

  return (
    <>
      <div style={{ display: "flex" }} className="border-r border-gray-300">
        <Sidebar
          projects={projects}
          onSelectScenario={handleSelectScenario}
          onEditClick={onEditClick}
          onConfigureClick={handleConfigureClick}
          appName={selectedAppName}
          sheetName={excelSheetName}
        />
        <div className="flex-3 p-4">
          <UploadController onProjectLoaded={setProjects} />

          {!showConfigModal && (
            <>
              <TestCaseTable
                appName={selectedAppName} // ✅ new prop
                scenarioName={selectedScenario}
                rows={tableData}
                setRows={setTableData}
                isSidebarOpen={isSidebarOpen}
                showTable={showTable}
                setShowTable={setShowTable}
                sheetName={excelSheetName}
              />

              {selectedScenario && (
                <div style={{ marginTop: "20px", marginLeft: "20px" }}>
                  <h2>Live Terminal Output</h2>
                  <Terminal scenarioName={selectedScenario} />
                </div>
              )}
            </>
          )}
          {showConfigModal && (
            <ConfigModal
              configData={configData}
              onClose={() => setShowConfigModal(false)}
            />
          )}
        </div>
      </div>
    </>
  );
}

// export default MainApp;
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/allure-reports" element={<AllAllureReports />} />
    </Routes>
  );
}
