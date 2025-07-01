import React, { useState, useEffect } from 'react';

const API_BASE = 'https://esp8266-server.vercel.app/api';

export default function DeviceRestartButtons() {
  const [trigger, setTrigger] = useState({ nodeMCU: false, raspberryPi: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Poll trigger state every 2 seconds
  useEffect(() => {
    let isMounted = true;
    const fetchTrigger = () => {
      fetch(`${API_BASE}/restart-trigger`)
        .then(res => res.json())
        .then(data => { if (isMounted) setTrigger(data); })
        .catch(() => { if (isMounted) setError('Failed to fetch trigger state'); });
    };
    fetchTrigger();
    const interval = setInterval(fetchTrigger, 2000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  const handleRestart = async (device) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/restart-trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device })
      });
      const data = await res.json();
      if (res.ok) {
        setTrigger(data);
      } else {
        setError(data.error || 'Failed to set trigger');
      }
    } catch {
      setError('Failed to set trigger');
    }
    setLoading(false);
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, borderRadius: 8, maxWidth: 350 }}>
      <h3>Device Restart Control</h3>
      <button
        onClick={() => handleRestart('nodeMCU')}
        disabled={loading || trigger.nodeMCU}
        style={{ marginRight: 12 }}
      >
        Restart NodeMCU
      </button>
      <button
        onClick={() => handleRestart('raspberryPi')}
        disabled={loading || trigger.raspberryPi}
      >
        Restart Raspberry Pi
      </button>
      <div style={{ marginTop: 12, color: 'red' }}>{error}</div>
      <div style={{ marginTop: 8, fontSize: 13, color: '#555' }}>
        NodeMCU trigger: <b>{trigger.nodeMCU ? 'Pending' : 'Idle'}</b><br />
        Raspberry Pi trigger: <b>{trigger.raspberryPi ? 'Pending' : 'Idle'}</b>
      </div>
    </div>
  );
}
