const express = require("express");
const cors = require("cors");
const XLSX = require("xlsx");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const { spawn } = require("child_process");
const fs = require("fs");
const multer = require("multer");
const upload = multer();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
const PORT = 4000;

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  console.log("🟢 New client connected");

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected");
  });
});
{
  /*For running test via TestNg*/
}
app.post("/run-test", (req, res) => {
  const { projectName } = req.body;
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset);

  const timestamp = istTime
    .toISOString()
    .replace("T", "_")
    .replace(/[:.]/g, "_")
    .split("Z")[0];
  const allureFolder = `${projectName}_${timestamp}`;
  console.log("🚀 Received projectName:", projectName);
  const controllerPath = path.join(
    __dirname,
    "../public/resources/Controller_Web.xlsx"
  );

  try {
    const workbook = XLSX.readFile(controllerPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    const match = rows.find((row) => row.Application_Name === projectName);

    if (!match) {
      return res.status(404).json({
        error: `Project '${projectName}' not found in Controller_Web.xlsx`,
      });
    }

    const browser = match.Browser;
    const sheetName = match.DataSheet_Name;
    const scenario = match.Scenario;
    console.log("sheetName:", sheetName);

    const testngProjectPath = path.join(__dirname, "../../TestNG_Automation_1");
    const allureResultsDir = path.join(
      testngProjectPath,
      "allure-results",
      allureFolder
    );
    const allureReportDir = path.join(
      testngProjectPath,
      "allure-report",
      allureFolder
    );
    const command = `mvn test -Dtest=automation_Test.EndToEndTests_Form -Dbrowser=${browser} -Dsheet=${sheetName} -DappName=${projectName} -Dscenario=${scenario} -Dallure.results.directory=${allureResultsDir}`;

    const testProcess = spawn(command, {
      cwd: testngProjectPath,
      shell: true,
    });

    testProcess.stdout.on("data", (data) => {
      console.log("STDOUT:", data.toString());
      io.emit("test-log", data.toString());
    });

    testProcess.stderr.on("data", (data) => {
      console.error("STDERR:", data.toString());
      io.emit("test-log", data.toString());
    });

    const { exec } = require("child_process");

    testProcess.on("close", (code) => {
      console.log(`Test process exited with code ${code}`);

      // Generate Allure report
      exec(
        `allure generate "${allureResultsDir}" --clean -o "${allureReportDir}"`,
        { cwd: testngProjectPath }, // Run in test project directory
        (err, stdout, stderr) => {
          if (err) {
            console.error("Allure generation failed:", err);
            return res
              .status(500)
              .json({ message: "Allure generation failed" });
          }

          console.log("Allure report generated");
          res.status(200).json({
            message: "Suite run completed.",
            reportUrl: `/allure-report/${allureFolder}/index.html`, // optional if you're serving it via Express
          });
        }
      );
    });
  } catch (error) {
    console.error("Controller read error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
{
  /*For configuration of controller excel*/
}
app.post("/controller-config", (req, res) => {
  const { data } = req.body;

  console.log("Received config data:", data); // 🔍 Debug log

  if (!data || !Array.isArray(data)) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  const controllerPath = path.join(
    __dirname,
    "../public/resources/Controller_Web.xlsx"
  );

  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Controller");

    XLSX.writeFile(workbook, controllerPath);

    console.log("✅ Controller file saved.");
    res.json({ message: "Configuration saved successfully" });
  } catch (error) {
    console.error("❌ Failed to save controller config:", error);
    res.status(500).json({ error: "Failed to save configuration" });
  }
});
{
  /*For creating excel file*/
}
app.post("/create-file", (req, res) => {
  const { fileName } = req.body;

  console.log("📥 Request to create file:", fileName);

  if (!fileName || !fileName.trim()) {
    return res.status(400).json({ message: "fileName is required" });
  }

  try {
    const folderPath = path.join(__dirname, "../public/resources/TestData/");

    // Create 'data' folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    const filePath = path.join(
      folderPath,
      fileName.endsWith(".xlsx") ? fileName : `${fileName}`
    );

    // Create a new workbook and sheet with headers
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      [
        "SrNo",
        "Module",
        "PageName",
        "RunStatus",
        "Control",
        "ObjectType",
        "Object",
        "Perform",
      ],
    ]); // Default headers
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    XLSX.writeFile(wb, filePath);

    console.log("✅ File created:", filePath);
    return res.status(200).json({ message: "File created successfully" });
  } catch (err) {
    console.error("❌ Error creating file:", err);
    return res.status(500).json({ message: "Failed to create file" });
  }
});
app.post("/create-scenario", upload.single("file"), (req, res) => {
  const { originalname, buffer } = req.file;
  const { filename } = req.body;

  if (!filename) {
    return res.status(400).json({ message: "Filename missing" });
  }

  const savePath = path.join(
    __dirname,
    "resources",
    "TestData",
    `${filename}.xlsx`
  );

  fs.writeFile(savePath, buffer, (err) => {
    if (err) {
      console.error("Failed to write file:", err);
      return res.status(500).json({ message: "Failed to save file" });
    }

    console.log("✅ File created:", savePath);
    return res.json({ message: "File created successfully" });
  });
});
{
  /*For updating excel*/
}
app.post("/update-file", (req, res) => {
  const { fileName, data } = req.body;

  if (!fileName || !data || !Array.isArray(data)) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  try {
    const filePath = path.join(
      __dirname,
      "../public/resources/TestData/",
      `${fileName}`
    );

    // Create worksheet & workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Write to file
    XLSX.writeFile(workbook, filePath);

    res.status(200).json({ message: `File ${fileName} updated successfully.` });
  } catch (err) {
    console.error("Error updating Excel:", err);
    res.status(500).json({ message: "Server error" });
  }
});
app.post("/run-suite", (req, res) => {
  const { sheetNames, projectName } = req.body;

  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset);

  const timestamp = istTime
    .toISOString()
    .replace("T", "_")
    .replace(/[:.]/g, "_")
    .split("Z")[0];
  //   const baseDir = path.resolve(__dirname, "../../TestNG_Automation_1");

  const allureFolder = `${projectName}_${timestamp}`;
  //   const allureResultsDir = `allure-results/${allureFolder}`;

  console.log("Received Sheet Names:", sheetNames);
  console.log("Received Project Name:", projectName);

  const controllerPath = path.join(
    __dirname,
    "../public/resources/Controller_Web.xlsx"
  );

  const workbook = XLSX.readFile(controllerPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);
  const results = [];

  if (!sheetNames || !Array.isArray(sheetNames) || sheetNames.length === 0) {
    return res.status(400).json({ message: "No sheet names provided." });
  }

  sheetNames.forEach((sheetName) => {
    const match = rows.find(
      (row) =>
        row.Application_Name === projectName && row.DataSheet_Name === sheetName
    );

    if (!match) {
      results.push({
        sheet: sheetName,
        error: `Sheet '${sheetName}' not found for project '${projectName}'`,
      });
    } else {
      results.push({
        sheet: sheetName,
        browser: match.Browser,
        scenario: match.Scenario,
      });
    }
  });

  const notFound = results.filter((res) => res.error);
  if (notFound.length === results.length) {
    return res
      .status(404)
      .json({ error: "No matching sheets found.", results });
  }

  const browsers = results
    .filter((r) => !r.error)
    .map((r) => r.browser)
    .join(",");
  const scenarios = results
    .filter((r) => !r.error)
    .map((r) => r.scenario)
    .join(",");
  const sheetNamesParam = sheetNames.join(",");
  const testngProjectPath = path.join(__dirname, "../../TestNG_Automation_1");
  const allureResultsDir = path.join(
    testngProjectPath,
    "allure-results",
    allureFolder
  );
  const allureReportDir = path.join(
    testngProjectPath,
    "allure-report",
    allureFolder
  );
  const command = `mvn test -Dtest=automation_Test.EndToEndTests_Form -Dbrowser=${browsers} -Dsheet=${sheetNamesParam} -DappName=${projectName} -Dscenario=${scenarios} -Dallure.results.directory=${allureResultsDir}`;

  const testProcess = spawn(command, {
    cwd: testngProjectPath,
    shell: true,
  });

  testProcess.stdout.on("data", (data) => {
    console.log("STDOUT:", data.toString());
    io.emit("test-log", data.toString());
  });

  testProcess.stderr.on("data", (data) => {
    console.error("STDERR:", data.toString());
    io.emit("test-log", data.toString());
  });

  const { exec } = require("child_process");

  testProcess.on("close", (code) => {
    console.log(`Test process exited with code ${code}`);

    // Generate Allure report
    exec(
      `allure generate "${allureResultsDir}" --clean -o "${allureReportDir}"`,
      { cwd: testngProjectPath }, // Run in test project directory
      (err, stdout, stderr) => {
        if (err) {
          console.error("Allure generation failed:", err);
          return res.status(500).json({ message: "Allure generation failed" });
        }

        console.log("Allure report generated");
        res.status(200).json({
          message: "Suite run completed.",
          reportUrl: `/allure-report/${allureFolder}/index.html`, // optional if you're serving it via Express
        });
      }
    );
  });
});
app.get("/report-history", (req, res) => {
  const dir = path.join(__dirname, "../../TestNG_Automation_1/allure-report");
  if (!fs.existsSync(dir)) return res.json([]);
  const folders = fs.readdirSync(dir).filter((f) => f !== ".DS_Store");
  res.json(folders.sort().reverse()); // optional: latest first
});

app.use(
  "/allure-report",
  express.static(
    path.join(__dirname, "../../TestNG_Automation_1/allure-report")
  )
);

app.use("/resources", express.static(path.join(__dirname, "resources")));
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
