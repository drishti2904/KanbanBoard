import { useEffect, useState } from 'react';
import axios from 'axios';
import './ActivityLog.css';

function ActivityLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/actions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(res.data);
      } catch (err) {
        console.error('Error fetching logs', err);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="activity-log">
      <h2>Activity Log</h2>
      {logs.length === 0 ? (
        <p className="log-message">No activity yet.</p>
      ) : (
        <ul className="log-list">
          {logs.map((log) => (
            <li key={log._id} className="log-item">
              <div>
                <strong>{log.user?.username || 'Unknown User'}</strong> performed <em>{log.actionType}</em>
              </div>
              {log.taskId && (
                <div>
                  on task <strong>{log.taskId.title}</strong>
                </div>
              )}
              <div className="log-timestamp">
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ActivityLog;
