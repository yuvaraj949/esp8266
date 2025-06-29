import React, { useState, useEffect, useRef } from 'react';

function PumpSwitch() {
  const [triggered, setTriggered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastUserAction = useRef(0);

  // Sync with backend pump status on mount and poll every 5s
  // Only sync with backend if not loading (not during user action)
  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      // Ignore backend sync for 2s after user action
      if (Date.now() - lastUserAction.current < 2000) return;
      try {
        const res = await fetch('https://esp8266-server.vercel.app/api/pump');
        const data = await res.json();
        if (mounted) setTriggered(!!data.triggered);
      } catch {}
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const handleSwitch = async () => {
    setError(null);
    setLoading(true);
    lastUserAction.current = Date.now();
    try {
      const res = await fetch('https://esp8266-server.vercel.app/api/pump', {
        method: 'POST',
        body: JSON.stringify({ on: !triggered }),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setTriggered(data.triggered);
      } else {
        setError('Failed to switch pump');
      }
    } catch (e) {
      setError('Failed to switch pump');
    }
    setLoading(false);
  };

  return (
    <div className="sensor-card">
      <h2>🛁 Pump Switch</h2>
      <label style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '1em 0' }}>
        <span style={{ color: triggered ? '#27ae60' : '#888', fontWeight: 'bold', fontSize: 18 }}>
          {triggered ? 'Pump ON' : 'Pump OFF'}
        </span>
        <div
          style={{
            position: 'relative',
            width: 64,
            height: 36,
            background: triggered ? '#27ae60' : '#555',
            borderRadius: 36,
            transition: 'background 0.2s',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
          onClick={loading ? undefined : handleSwitch}
        >
          <div
            style={{
              position: 'absolute',
              top: 4,
              left: triggered ? 32 : 4,
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 2px 8px #2224',
              transition: 'left 0.2s'
            }}
          />
        </div>
      </label>
      {loading && <div style={{ color: '#888', fontSize: 14 }}>Switching...</div>}
      {error && <div style={{ color: 'red', fontSize: 14 }}>{error}</div>}
    </div>
  );
}

export default PumpSwitch;
