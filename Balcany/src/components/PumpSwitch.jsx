import React, { useState, useEffect } from 'react';

function PumpSwitch() {
  const [triggered, setTriggered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [optimistic, setOptimistic] = useState(false);

  // Poll backend pump status every second (GET)
  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      try {
        const res = await fetch('https://esp8266-server.vercel.app/api/pump');
        const data = await res.json();
        if (mounted) {
          setTriggered(!!data.status);
          setLastUpdated(new Date());
          setOptimistic(false); // Confirmed by backend
        }
      } catch {}
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  // When user toggles, POST to update status (optimistic UI)
  const handleSwitch = async () => {
    setError(null);
    setLoading(true);
    setOptimistic(true);
    setTriggered((prev) => !prev); // Optimistically update UI
    try {
      await fetch('https://esp8266-server.vercel.app/api/pump', {
        method: 'POST',
        body: JSON.stringify({ on: !triggered }),
        headers: { 'Content-Type': 'application/json' }
      });
      // The polling will update the UI to the backend state within 1s
    } catch (e) {
      setError('Failed to switch pump');
      setOptimistic(false);
    }
    setLoading(false);
  };

  return (
    <div className="sensor-card">
      <h2>🛁 Pump Switch</h2>
      <label style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '1em 0' }}>
        <span style={{
          color: triggered ? '#27ae60' : '#888',
          fontWeight: 'bold',
          fontSize: 18,
          transition: 'color 0.2s',
          opacity: loading ? 0.6 : 1
        }}>
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
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: triggered ? '0 0 8px 2px #27ae6088' : '0 2px 8px #2224',
            outline: optimistic ? '2px dashed #f39c12' : 'none',
            opacity: loading ? 0.7 : 1
          }}
          onClick={loading ? undefined : handleSwitch}
          aria-label={triggered ? 'Turn pump off' : 'Turn pump on'}
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
              transition: 'left 0.2s, background 0.2s',
              border: optimistic ? '2px solid #f39c12' : '2px solid #fff',
              opacity: loading ? 0.8 : 1
            }}
          />
        </div>
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 24 }}>
        {loading && <div style={{ color: '#888', fontSize: 14 }}>Switching...</div>}
        {optimistic && !loading && <div style={{ color: '#f39c12', fontSize: 14 }}>Waiting for confirmation...</div>}
        {error && <div style={{ color: 'red', fontSize: 14 }}>{error}</div>}
      </div>
      {lastUpdated && (
        <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

export default PumpSwitch;
