import React, { useEffect, useState, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function HistoryGraph() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeScale, setTimeScale] = useState('1d');
  const intervalRef = useRef();

  // Fetch history with ?since= for efficient scaling
  useEffect(() => {
    let mounted = true;
    const fetchHistory = async () => {
      let url = 'https://esp8266-server.vercel.app/api/data/history';
      const selected = timeScales.find(t => t.value === timeScale);
      if (selected) {
        const since = Date.now() - selected.ms;
        url += `?since=${since}&limit=1000`;
      } else {
        url += '?limit=1000';
      }
      try {
        const res = await fetch(url);
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
  }, [timeScale]);

  // Time scale options
  const timeScales = [
    { label: '1hr', value: '1h', ms: 60 * 60 * 1000 },
    { label: '12hr', value: '12h', ms: 12 * 60 * 60 * 1000 },
    { label: '1d', value: '1d', ms: 24 * 60 * 60 * 1000 },
    { label: '1mo', value: '1mo', ms: 31 * 24 * 60 * 60 * 1000 },
    { label: '1yr', value: '1y', ms: 366 * 24 * 60 * 60 * 1000 },
  ];

  // Filter and rescale data for the selected time window
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

  // Filter and sort data for the selected time window
  let filteredHistory = [];
  if (selectedScale) {
    // Only include data points newer than (now - selectedScale.ms)
    const cutoff = now - selectedScale.ms;
    filteredHistory = history
      .filter(d => {
        const t = new Date(d.timestamp).getTime();
        // Only include if t >= cutoff and t <= now
        return t >= cutoff && t <= now;
      })
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(d => ({ ...d, time: new Date(d.timestamp).getTime() }));
  } else {
    filteredHistory = history
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(d => ({ ...d, time: new Date(d.timestamp).getTime() }));
  }

  if (loading && !history.length) return (
    <div className="sensor-card" style={{
      background: 'linear-gradient(135deg, #181a1b 60%, #232526 100%)',
      boxShadow: '0 2px 16px #0ff2',
      color: '#fff',
      minWidth: 350,
      minHeight: 220,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18
    }}>
      <span style={{ color: '#00eaff' }}>Loading history...</span>
    </div>
  );
  if (!history.length) return (
    <div className="sensor-card" style={{
      background: 'linear-gradient(135deg, #181a1b 60%, #232526 100%)',
      boxShadow: '0 2px 16px #0ff2',
      color: '#fff',
      minWidth: 350,
      minHeight: 220,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18
    }}>
      <span style={{ color: '#888' }}>No history data</span>
    </div>
  );

  return (
    <div className="sensor-card" style={{
      background: 'linear-gradient(135deg, #181a1b 60%, #232526 100%)',
      boxShadow: '0 2px 16px #0ff2',
      color: '#fff',
      minWidth: 350,
      padding: 24,
      borderRadius: 18
    }}>
      <h2 style={{
        color: '#00eaff',
        letterSpacing: 1,
        marginBottom: 12,
        textShadow: '0 2px 8px #00eaff44',
        fontWeight: 700
      }}>📈 Temperature & Humidity History</h2>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, justifyContent: 'center' }}>
        {timeScales.map(ts => (
          <button
            key={ts.value}
            onClick={() => setTimeScale(ts.value)}
            style={{
              background: timeScale === ts.value ? 'linear-gradient(90deg, #00eaff 60%, #6ee7b7 100%)' : '#232526',
              color: timeScale === ts.value ? '#232526' : '#fff',
              border: timeScale === ts.value ? '2px solid #00eaff' : 'none',
              borderRadius: 8,
              padding: '4px 14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 15,
              boxShadow: timeScale === ts.value ? '0 2px 8px #00eaff44' : 'none',
              transition: 'all 0.2s'
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
            tick={{ fill: '#aaa', fontSize: 13 }}
            tickFormatter={formatXAxisLabel}
          />
          <YAxis yAxisId="left" label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#ffb347', fontSize: 14 }} tick={{ fill: '#ffb347', fontSize: 13 }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: '%', angle: 90, position: 'insideRight', fill: '#00ffb3', fontSize: 14 }} tick={{ fill: '#00ffb3', fontSize: 13 }} />
          <Tooltip contentStyle={{ background: '#232526', border: '1px solid #00eaff', color: '#fff' }} labelFormatter={formatXAxisLabel} />
          <Legend wrapperStyle={{ color: '#fff' }} />
          <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="#ffb347" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
          <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#00ffb3" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="graph-labels" style={{ marginTop: 10, display: 'flex', gap: 18, justifyContent: 'center', fontSize: 15 }}>
        <span style={{ color: '#ffb347', fontWeight: 600 }}>● Temp (°C)</span>
        <span style={{ color: '#00ffb3', fontWeight: 600 }}>● Humidity (%)</span>
      </div>
    </div>
  );
}

export default HistoryGraph;
