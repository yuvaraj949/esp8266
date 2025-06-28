import React, { useState } from 'react';

export default function PumpControl() {
  const [triggered, setTriggered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const triggerPump = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://esp8266-vzzf.vercel.app/api/pump', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTriggered(true);
        setTimeout(() => setTriggered(false), 5000);
      } else {
        setError('Failed to trigger pump');
      }
    } catch (e) {
      setError('Failed to trigger pump');
    }
    setLoading(false);
  };

  return (
    <div className="sensor-card">
      <h2>🚿 Pump Control</h2>
      <label style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '1em 0' }}>
        <span style={{ color: triggered ? '#27ae60' : '#888', fontWeight: 'bold' }}>
          {triggered ? 'Pump ON' : 'Pump OFF'}
        </span>
        <input
          type="checkbox"
          checked={triggered}
          onChange={triggerPump}
          disabled={loading || triggered}
          style={{ width: 32, height: 32, accentColor: '#27ae60', cursor: loading || triggered ? 'not-allowed' : 'pointer' }}
        />
      </label>
      <button
        className="pump-btn"
        onClick={triggerPump}
        disabled={loading || triggered}
        style={{ background: triggered ? '#27ae60' : '#2ecc71', color: '#fff', fontWeight: 'bold', fontSize: '1.2em', padding: '1em 2em', border: 'none', borderRadius: 8, cursor: loading || triggered ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px #b2f2c9' }}
      >
        {triggered ? 'Pump ON' : loading ? 'Triggering...' : 'Manual Trigger'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
}
