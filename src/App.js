import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [userName, setUserName] = useState("Tanya");
  const [roomName, setRoomName] = useState("3rd Floor");
  const [logs, setLogs] = useState([]);

  const requestAccess = async () => {
    try {
      const res = await axios.post("/access", { userName, roomName });
      alert(`Access ${res.data.granted ? "GRANTED" : "DENIED"}`);
      fetchLogs(); // refresh logs
    } catch (err) {
      alert("Error: " + err.response?.data || err.message);
    }
  };

  const fetchLogs = async () => {
    const res = await axios.get("/logs");
    setLogs(res.data);
  };

  const exportLogs = async () => {
    await axios.get("/export");
    alert("Logs exported to access_logs.txt (on server)");
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Access Log Monitor</h1>
      <div>
        <label>User:</label>
        <select value={userName} onChange={(e) => setUserName(e.target.value)}>
          <option>Tanya</option>
          <option>Bil</option>
          <option>Jack</option>
        </select>

        <label style={{ marginLeft: "1rem" }}>Room:</label>
        <select value={roomName} onChange={(e) => setRoomName(e.target.value)}>
          <option>3rd Floor</option>
          <option>Employee Lounge</option>
          <option>Lobby</option>
        </select>

        <button onClick={requestAccess} style={{ marginLeft: "1rem" }}>
          Request Access
        </button>
      </div>

      <h2 style={{ marginTop: 30 }}>Access Logs</h2>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Time</th>
            <th>User</th>
            <th>Room</th>
            <th>Granted</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i}>
              <td>{log.timestamp}</td>
              <td>{log.userName}</td>
              <td>{log.roomName}</td>
              <td>{log.accessGranted ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={exportLogs} style={{ marginTop: "1rem" }}>
        Export Logs
      </button>
    </div>
  );
}

export default App;
