import React, { useEffect, useState } from 'react';

function formatTime(dateString) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleString();
}

export default function DeviceStatus() {
  const [status, setStatus] = useState({ raspberryPi: {}, nodeMCU: {} });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/device-status');
        const data = await res.json();
        setStatus(data);
      } catch {
        setStatus({ raspberryPi: { online: false }, nodeMCU: { online: false } });
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ margin: '1em 0' }}>
      <h3>Device Status</h3>
      <table>
        <thead>
          <tr>
            <th>Device</th>
            <th>Status</th>
            <th>Last Seen</th>
          </tr>
        </thead>
        <tbody>
          {['raspberryPi', 'nodeMCU'].map(dev => (
            <tr key={dev}>
              <td>{dev === 'raspberryPi' ? 'Raspberry Pi' : 'NodeMCU'}</td>
              <td>
                <span style={{
                  color: status[dev]?.online ? 'green' : 'red',
                  fontWeight: 'bold'
                }}>
                  {status[dev]?.online ? 'Online' : 'Offline'}
                </span>
              </td>
              <td>{formatTime(status[dev]?.lastSeen)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}