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
    <div className="sensor-card" style={{
      background: 'linear-gradient(135deg, #181a1b 60%, #232526 100%)',
      boxShadow: '0 2px 16px #0ff2',
      color: '#fff',
      minWidth: 340,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      borderRadius: 18
    }}>
      <h2 style={{
        color: '#27ae60',
        letterSpacing: 1,
        marginBottom: 12,
        textShadow: '0 2px 8px #27ae6044',
        fontWeight: 700
      }}>🛁 Pump Switch</h2>
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        margin: '1.2em 0',
        fontSize: 20
      }}>
        <span style={{
          color: triggered ? '#27ae60' : '#888',
          fontWeight: 'bold',
          fontSize: 20,
          transition: 'color 0.2s',
          opacity: loading ? 0.6 : 1,
          textShadow: triggered ? '0 2px 8px #27ae6044' : 'none',
          letterSpacing: 1
        }}>
          {triggered ? 'Pump ON' : 'Pump OFF'}
        </span>
        <div
          style={{
            position: 'relative',
            width: 68,
            height: 38,
            background: triggered ? 'linear-gradient(90deg, #27ae60 60%, #6ee7b7 100%)' : '#555',
            borderRadius: 38,
            transition: 'background 0.2s',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: triggered ? '0 0 12px 2px #27ae6088' : '0 2px 8px #2224',
            outline: optimistic ? '2px dashed #f39c12' : 'none',
            opacity: loading ? 0.7 : 1,
            border: triggered ? '2px solid #27ae60' : '2px solid #555',
            display: 'flex',
            alignItems: 'center',
            transitionProperty: 'background, box-shadow, border, opacity'
          }}
          onClick={loading ? undefined : handleSwitch}
          aria-label={triggered ? 'Turn pump off' : 'Turn pump on'}
        >
          <div
            style={{
              position: 'absolute',
              top: 3,
              left: triggered ? 34 : 5,
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: triggered ? 'linear-gradient(135deg, #27ae60 60%, #b2f7ef 100%)' : '#fff',
              boxShadow: triggered ? '0 2px 12px #27ae6044' : '0 2px 8px #2224',
              transition: 'left 0.2s, background 0.2s, box-shadow 0.2s',
              border: optimistic ? '2px solid #f39c12' : '2px solid #fff',
              opacity: loading ? 0.8 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {loading && (
              <span style={{
                width: 16,
                height: 16,
                border: '2px solid #27ae60',
                borderTop: '2px solid #fff',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 1s linear infinite'
              }} />
            )}
          </div>
        </div>
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 24, marginBottom: 4 }}>
        {loading && <div style={{ color: '#888', fontSize: 14 }}>Switching...</div>}
        {optimistic && !loading && <div style={{ color: '#f39c12', fontSize: 14 }}>Waiting for confirmation...</div>}
        {error && <div style={{ color: 'red', fontSize: 14 }}>{error}</div>}
      </div>
      {lastUpdated && (
        <div style={{ color: '#888', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
          Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
        </div>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default PumpSwitch;
