import React, { useEffect } from "react";
import * as XLSX from "xlsx";

const UploadController = ({ onProjectLoaded }) => {
  useEffect(() => {
    const loadExcel = async (filePath) => {
      const res = await fetch(filePath);
      if (!res.ok) throw new Error(`File not found: ${filePath}`);
      const arrayBuffer = await res.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      return XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    };

    const fetchController = async () => {
      try {
        const controllerData = await loadExcel("/resources/Controller_Web.xlsx");

        // Group test cases by application
        const grouped = {};
        for (const row of controllerData) {
          const appName = row["Application_Name"]?.trim();
          const scenarioName = row["Scenario"]?.trim();
          const excelSheetName = row["DataSheet_Name"]?.trim();

          if (!appName || !scenarioName || !excelSheetName) continue;

          if (!grouped[appName]) grouped[appName] = [];

          grouped[appName].push({ scenarioName, excelSheetName });
        }

        const projects = [];

        // Loop through applications
        let scenarioCounter = 1;
        for (const [appName, scenarioEntries] of Object.entries(grouped)) {
          const scenarios = [];

          for (const { scenarioName, excelSheetName } of scenarioEntries) {
            try {
              scenarios.push({
                id: `${projects.length + 1}-${scenarioCounter++}`,
                name: scenarioName,
                appName,
                excelSheetName
              });
            } catch (err) {
              console.warn(`Failed to load test case file: ${excelSheetName}`);
            }
          }

          projects.push({
            name: appName,
            scenarios
          });
        }

        onProjectLoaded(projects);
      } catch (err) {
        console.error("Error:", err);
        alert("Error loading project files. Check the console for details.");
      }
    };

    fetchController();
  }, [onProjectLoaded]);

  return null;
};

export default UploadController;
