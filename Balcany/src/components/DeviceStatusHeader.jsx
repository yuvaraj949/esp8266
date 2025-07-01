import React, { useEffect, useState } from 'react';
import './DeviceStatusHeader.css';

const dotStyle = (online) => ({
  display: 'inline-block',
  width: 12,
  height: 12,
  borderRadius: '50%',
  marginRight: 8,
  background: online ? '#27ae60' : '#e74c3c',
  border: '1.5px solid #222',
  verticalAlign: 'middle',
});

export default function DeviceStatusHeader() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let timer;
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        setStatus(data);
      } catch {}
    };
    fetchStatus();
    timer = setInterval(fetchStatus, 4000);
    return () => clearInterval(timer);
  }, []);

  if (!status) return (
    <div className="device-status-header">
      <span>Device Status: <span style={{ color: '#888' }}>Loading...</span></span>
    </div>
  );

  return (
    <div className="device-status-header">
      <span style={{ marginRight: 24 }}>
        <span style={dotStyle(status.raspberrypi.online)} />
        <b>Raspberry Pi</b>
        <span style={{ marginLeft: 8, color: '#888', fontSize: 13 }}>
          {status.raspberrypi.online ? `Ping: ${status.raspberrypi.ping ?? 'N/A'} ms` : 'Offline'}
        </span>
      </span>
      <span>
        <span style={dotStyle(status.nodemcu.online)} />
        <b>NodeMCU</b>
        <span style={{ marginLeft: 8, color: '#888', fontSize: 13 }}>
          {status.nodemcu.online ? `Last seen: ${status.nodemcu.lastSeen ? new Date(status.nodemcu.lastSeen).toLocaleTimeString() : 'N/A'}` : 'Offline'}
        </span>
      </span>
    </div>
  );
}
