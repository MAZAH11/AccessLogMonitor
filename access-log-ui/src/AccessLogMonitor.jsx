import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css'; 

const AccessLogMonitor = () => {
  const [userName, setUserName]         = useState('');
  const [roomName, setRoomName]         = useState('');
  const [accessStatus, setAccessStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [logs, setLogs]                 = useState([]);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      const { data } = await axios.get('/logs');
      setLogs(data);
    } catch {
      setErrorMessage('Failed to fetch logs.');
    }
  };

  const requestAccess = async () => {
    setErrorMessage(''); setAccessStatus('');
    const u = userName.trim(), r = roomName.trim();
    if (!u || !r) {
      setErrorMessage('Please enter both user and room.');
      return;
    }
    try {
      const res = await axios.post('/access', { userName: u, roomName: r });
      setAccessStatus(res.data.message);
      fetchLogs();
    } catch (err) {
      setErrorMessage(err.response?.data || err.message);
    }
  };

  const exportLogs = async () => {
    try {
      const res = await axios.get('/download', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'accesslog.txt';
      document.body.appendChild(a); a.click();
      a.remove(); URL.revokeObjectURL(url);
    } catch {
      setErrorMessage('Failed to export logs.');
    }
  };

  return (
    <div className="app-container">
      <h1>Access Log Monitor</h1>

      <div className="form-row">
        <input
          type="text"
          placeholder="User Name"
          value={userName}
          onChange={e => setUserName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={e => setRoomName(e.target.value)}
        />
        <button onClick={requestAccess}>Request Access</button>
      </div>

      {accessStatus && (
        <p className={`status ${accessStatus.includes('Granted') ? 'granted' : 'denied'}`}>
          {accessStatus}
        </p>
      )}
      {errorMessage && <p className="status denied">{errorMessage}</p>}

      <table className="logs-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Room</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i}>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.userName}</td>
              <td>{log.roomName}</td>
              <td>{log.accessGranted ? 'Granted' : 'Denied'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="export-btn" onClick={exportLogs}>
        Export Logs to accesslog.txt
      </button>
    </div>
  );
};

export default AccessLogMonitor;
