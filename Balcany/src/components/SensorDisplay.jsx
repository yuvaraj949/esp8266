import React, { useEffect, useState } from 'react';

export default function SensorDisplay() {
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatest();
    const interval = setInterval(fetchLatest, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLatest = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://esp8266-server.vercel.app/api/data/latest');
      const data = await res.json();
      setLatest(data);
    } catch (e) {
      setLatest(null);
    }
    setLoading(false);
  };

  if (loading) return <div className="sensor-card">Loading latest data...</div>;
  if (!latest) return <div className="sensor-card">No data available</div>;

  return (
    <div className="sensor-card">
      <h2>🌡️ Current Temperature & Humidity</h2>
      <div className="sensor-values" style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#00eaff', margin: '1.2em 0' }}>
        <div style={{ fontSize: '1.1em', color: '#ffb347', marginBottom: 10 }}>
          <span role="img" aria-label="Temperature">🌡️</span> {latest.temperature}°C
        </div>
        <div style={{ fontSize: '1.1em', color: '#00ffb3' }}>
          <span role="img" aria-label="Humidity">💧</span> {latest.humidity}%
        </div>
      </div>
      <div style={{ fontSize: '0.9em', color: '#888' }}>
        {new Date(latest.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
