import React, { useEffect, useState } from "react";
import io from "socket.io-client";

// Always use full URL to avoid proxy issues
const socket = io("http://localhost:4000");

const Terminal = ({scenarioName}) => {
    console.log("🚀 Received scenarioName:", scenarioName);
  const [logs, setLogs] = useState("");

  useEffect(() => {
    console.log("📡 Connecting to socket...");
    
    socket.on("connect", () => {
      console.log("✅ Socket connected");
    });

    socket.on("test-log", (data) => {
      setLogs((prevLogs) => prevLogs + data);
    });

    return () => {
      socket.off("test-log");
    };
  }, []);

  const handleRunTest = async () => {
    setLogs(["Running test..."]);
    // setLoading(true);
    console.log("🚀 Received scenarioName at handleRunTest:", scenarioName);
    fetch('http://localhost:4000/run-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectName: scenarioName })
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
    <div >
      {/* <button onClick={handleRunTest} style={{ marginBottom: "10px" }}>
        Run Test
      </button> */}
      <pre
      className="table-container"
        style={{
          backgroundColor: "#000",
          color: "#0f0",
          padding: "10px",
          height: "300px",
          overflowY: "auto",
          fontFamily: "monospace",
        }}
      >
        {logs}
      </pre>
    </div>
  );
};

export default Terminal;
