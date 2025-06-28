import React, { useState } from 'react';

export default function PumpSwitch() {
  const [triggered, setTriggered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSwitch = async (e) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/pump', { method: 'POST' });
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
      <h2>🕹️ Manual Pump Switch</h2>
      <label style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '1em 0' }}>
        <span style={{ color: triggered ? '#27ae60' : '#888', fontWeight: 'bold' }}>
          {triggered ? 'Pump ON' : 'Pump OFF'}
        </span>
        <input
          type="checkbox"
          checked={triggered}
          onChange={handleSwitch}
          disabled={loading || triggered}
          style={{ width: 32, height: 32, accentColor: '#27ae60', cursor: loading || triggered ? 'not-allowed' : 'pointer' }}
        />
      </label>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
}
