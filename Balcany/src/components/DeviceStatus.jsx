import React, { useEffect, useState } from 'react';
import { apiRequest, API_ENDPOINTS } from '../config/api.js';

function formatTime(dateString) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleString();
}

export default function DeviceStatus() {
  const [status, setStatus] = useState({ ESP32: { online: false, lastSeen: null } });
  const [trigger, setTrigger] = useState({ ESP32: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [componentError, setComponentError] = useState(null);

  // Error boundary for the component
  if (componentError) {
    return (
      <div className="device-status-container">
        <h3>ESP32 Device Status & Control</h3>
        <p style={{ color: '#ff6b6b' }}>Error loading device status: {componentError.message}</p>
        <button className="device-status-button" onClick={() => setComponentError(null)}>Retry</button>
      </div>
    );
  }

  // Poll device status every 10 seconds
  useEffect(() => {
    try {
      const fetchStatus = async () => {
        try {
          const data = await apiRequest(API_ENDPOINTS.DEVICE_STATUS);
          if (data && typeof data === 'object' && data.ESP32) {
            setStatus(data);
          } else {
            setStatus({ ESP32: { online: false, lastSeen: null } });
          }
        } catch (error) {
          setStatus({ ESP32: { online: false, lastSeen: null } });
        }
      };
      fetchStatus();
      const interval = setInterval(fetchStatus, 10000);
      return () => clearInterval(interval);
    } catch (error) {
      setComponentError(error);
    }
  }, []);

  // Poll trigger state every 5 seconds
  useEffect(() => {
    try {
      let isMounted = true;
      const fetchTrigger = async () => {
        try {
          const data = await apiRequest(API_ENDPOINTS.RESTART_TRIGGER);
          if (isMounted && data && typeof data === 'object' && data.ESP32 !== undefined) {
            setTrigger(data);
          } else if (isMounted) {
            setTrigger({ ESP32: false });
          }
        } catch (error) {
          if (isMounted) {
            setError('Failed to fetch trigger state');
            setTrigger({ ESP32: false });
          }
        }
      };
      fetchTrigger();
      const interval = setInterval(fetchTrigger, 5000);
      return () => { isMounted = false; clearInterval(interval); };
    } catch (error) {
      setComponentError(error);
    }
  }, []);

  const handleRestart = async () => {
    try {
      setLoading(true);
      setError('');
      try {
        const data = await apiRequest(API_ENDPOINTS.RESTART_TRIGGER_POST, {
          method: 'POST',
          body: JSON.stringify({ device: 'ESP32' })
        });
        setTrigger(data);
      } catch (error) {
        setError(error.message || 'Failed to set trigger');
      }
      setLoading(false);
    } catch (error) {
      setComponentError(error);
    }
  };

  return (
    <div className="device-status-container">
      <h3 style={{ margin: '0 0 1rem 0', color: '#27ae60', fontSize: '1.1rem' }}>ESP32 Device Status</h3>
      
      {/* Device Status Table */}
      <table className="device-status-table">
        <thead>
          <tr>
            <th>Device</th>
            <th>Status</th>
            <th>Last Seen</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ESP32</td>
            <td>
              <span style={{
                color: status.ESP32?.online ? '#27ae60' : '#ff6b6b',
                fontWeight: 'bold'
              }}>
                {status.ESP32?.online ? 'Online' : 'Offline'}
              </span>
            </td>
            <td>{formatTime(status.ESP32?.lastSeen)}</td>
          </tr>
        </tbody>
      </table>

      {/* Restart Control */}
      <div style={{ borderTop: '1px solid #444', paddingTop: '1rem' }}>
        <button
          className="device-status-button"
          onClick={handleRestart}
          disabled={loading || trigger.ESP32}
        >
          {loading ? 'Restarting...' : 'Restart ESP32'}
        </button>
        
        {error && <div className="device-status-error">{error}</div>}
        
        <div className="device-status-info">
          Trigger: <b>{trigger.ESP32 ? 'Pending' : 'Idle'}</b>
        </div>
      </div>
    </div>
  );
}