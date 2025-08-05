import React, { useEffect, useState } from "react";

function AllAllureReports() {
  const [reportList, setReportList] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      const res = await fetch("http://localhost:4000/report-history");
      const data = await res.json();
      setReportList(data);
    };

    fetchReports();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Allure Reports</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {reportList.map((folderName, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              borderRadius: "8px",
              width: "300px",
              backgroundColor: "#f4f4f4",
            }}
          >
            <strong>{folderName}</strong>
            <div style={{ marginTop: "8px" }}>
              <a
                href={`http://localhost:4000/allure-report/${folderName}/index.html`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "blue", textDecoration: "underline" }}
              >
                📄 Open Report
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllAllureReports;
