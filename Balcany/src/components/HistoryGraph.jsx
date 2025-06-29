import React, { useEffect, useState, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function HistoryGraph() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeScale, setTimeScale] = useState('1d');
  const intervalRef = useRef();

  useEffect(() => {
    let mounted = true;
    const fetchHistory = async () => {
      try {
        const res = await fetch('https://esp8266-server.vercel.app/api/data/history');
        const data = await res.json();
        if (mounted) setHistory(data);
      } catch (e) {
        if (mounted) setHistory([]);
      }
      setLoading(false);
    };
    fetchHistory();
    intervalRef.current = setInterval(fetchHistory, 10000);
    return () => {
      mounted = false;
      clearInterval(intervalRef.current);
    };
  }, []);

  // Time scale options
  const timeScales = [
    { label: '1hr', value: '1h', ms: 60 * 60 * 1000 },
    { label: '12hr', value: '12h', ms: 12 * 60 * 60 * 1000 },
    { label: '1d', value: '1d', ms: 24 * 60 * 60 * 1000 },
    { label: '1mo', value: '1mo', ms: 31 * 24 * 60 * 60 * 1000 },
    { label: '1yr', value: '1y', ms: 366 * 24 * 60 * 60 * 1000 },
  ];

  // Filter data by selected time scale
  const now = Date.now();
  const selectedScale = timeScales.find(t => t.value === timeScale);
  // Format x-axis label based on scale
  function formatXAxisLabel(ts) {
    const date = new Date(ts);
    switch (timeScale) {
      case '1h':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '12h':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '1d':
        return date.toLocaleTimeString([], { hour: '2-digit' });
      case '1mo':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case '1y':
        return date.toLocaleDateString([], { month: 'short' });
      default:
        return date.toLocaleString();
    }
  }

  const filteredHistory = history.filter(d => {
    if (!selectedScale) return true;
    return now - new Date(d.timestamp).getTime() <= selectedScale.ms;
  }).map(d => ({
    ...d,
    time: d.timestamp,
  }));

  if (loading && !history.length) return <div className="sensor-card">Loading history...</div>;
  if (!history.length) return <div className="sensor-card">No history data</div>;

  return (
    <div className="sensor-card" style={{ background: 'linear-gradient(135deg, #181a1b 60%, #232526 100%)', boxShadow: '0 2px 16px #0ff2', color: '#fff', minWidth: 350 }}>
      <h2 style={{ color: '#00eaff', letterSpacing: 1, marginBottom: 8 }}>📈 Temperature & Humidity History</h2>
      <div style={{ display: 'flex', gap: 10, marginBottom: 8, justifyContent: 'center' }}>
        {timeScales.map(ts => (
          <button
            key={ts.value}
            onClick={() => setTimeScale(ts.value)}
            style={{
              background: timeScale === ts.value ? '#00eaff' : '#232526',
              color: timeScale === ts.value ? '#232526' : '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '4px 12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            {ts.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={260} minWidth={320} minHeight={200}>
        <LineChart
          data={filteredHistory}
          margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="time"
            angle={-30}
            textAnchor="end"
            height={50}
            tick={{ fill: '#aaa', fontSize: 12 }}
            tickFormatter={formatXAxisLabel}
          />
          <YAxis yAxisId="left" label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#ffb347', fontSize: 13 }} tick={{ fill: '#ffb347', fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: '%', angle: 90, position: 'insideRight', fill: '#00ffb3', fontSize: 13 }} tick={{ fill: '#00ffb3', fontSize: 12 }} />
          <Tooltip contentStyle={{ background: '#232526', border: '1px solid #00eaff', color: '#fff' }} labelFormatter={formatXAxisLabel} />
          <Legend wrapperStyle={{ color: '#fff' }} />
          <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="#ffb347" strokeWidth={1.2} dot={false} activeDot={{ r: 5 }} />
          <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#00ffb3" strokeWidth={1.2} dot={false} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="graph-labels" style={{ marginTop: 8 }}>
        <span style={{ color: '#ffb347' }}>● Temp (°C)</span>
        <span style={{ color: '#00ffb3' }}>● Humidity (%)</span>
      </div>
    </div>
  );
}

export default HistoryGraph;
