import React, { useEffect, useState } from 'react';

export default function HistoryGraph() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/data/history');
      const data = await res.json();
      setHistory(data);
    } catch (e) {
      setHistory([]);
    }
    setLoading(false);
  };

  if (loading) return <div className="sensor-card">Loading history...</div>;
  if (!history.length) return <div className="sensor-card">No history data</div>;

  // Unique SVG area graph for temperature
  const width = 320, height = 120, padding = 30;
  const temps = history.map(d => d.temperature);
  const hums = history.map(d => d.humidity);
  const maxT = Math.max(...temps), minT = Math.min(...temps);
  const maxH = Math.max(...hums), minH = Math.min(...hums);
  const points = (arr, min, max) => arr.map((v, i) => [
    padding + (i * (width - 2 * padding)) / (arr.length - 1),
    height - padding - ((v - min) * (height - 2 * padding)) / (max - min || 1)
  ]);
  const tempPoints = points(temps, minT, maxT);
  const humPoints = points(hums, minH, maxH);
  const toPath = pts => pts.map((p, i) => i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`).join(' ');
  const toArea = pts => toPath(pts) + ` L${pts[pts.length-1][0]},${height-padding} L${pts[0][0]},${height-padding} Z`;

  return (
    <div className="sensor-card" style={{ background: 'linear-gradient(135deg, #181a1b 60%, #232526 100%)', boxShadow: '0 2px 16px #0ff2', color: '#fff' }}>
      <h2 style={{ color: '#00eaff', letterSpacing: 1 }}>🌡️ Temperature</h2>
      <div className="graph-container" style={{ background: '#10131a', border: '2px solid #00eaff', marginBottom: 24 }}>
        <svg width={width} height={height} style={{ borderRadius: 12 }}>
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffb347" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#232526" stopOpacity="0.1" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path d={toArea(tempPoints)} fill="url(#tempGradient)" filter="url(#glow)" />
          <path d={toPath(tempPoints)} stroke="#ffb347" strokeWidth="3" fill="none" filter="url(#glow)" />
        </svg>
        <div className="graph-labels">
          <span style={{ color: '#ffb347' }}>● Temp (°C)</span>
          <span style={{ color: '#fff' }}>{minT} - {maxT}°C</span>
        </div>
      </div>
      <h2 style={{ color: '#00ffb3', letterSpacing: 1 }}>💧 Humidity</h2>
      <div className="graph-container" style={{ background: '#10131a', border: '2px solid #00ffb3' }}>
        <svg width={width} height={height} style={{ borderRadius: 12 }}>
          <defs>
            <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00ffb3" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#232526" stopOpacity="0.1" />
            </linearGradient>
            <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path d={toArea(humPoints)} fill="url(#humGradient)" filter="url(#glow2)" />
          <path d={toPath(humPoints)} stroke="#00ffb3" strokeWidth="3" fill="none" filter="url(#glow2)" />
        </svg>
        <div className="graph-labels">
          <span style={{ color: '#00ffb3' }}>● Humidity (%)</span>
          <span style={{ color: '#fff' }}>{minH} - {maxH}%</span>
        </div>
      </div>
    </div>
  );
}
