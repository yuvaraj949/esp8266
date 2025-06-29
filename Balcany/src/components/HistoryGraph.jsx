import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

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
      const res = await fetch('https://esp8266-server.vercel.app/api/data/history');
      const data = await res.json();
      setHistory(data.map(d => ({
        ...d,
        time: new Date(d.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      })));
    } catch (e) {
      setHistory([]);
    }
    setLoading(false);
  };

  if (loading) return <div className="sensor-card">Loading history...</div>;
  if (!history.length) return <div className="sensor-card">No history data</div>;

  return (
    <div className="sensor-card" style={{ background: 'linear-gradient(135deg, #181a1b 60%, #232526 100%)', boxShadow: '0 2px 16px #0ff2', color: '#fff', minWidth: 350 }}>
      <h2 style={{ color: '#00eaff', letterSpacing: 1, marginBottom: 8 }}>📈 Temperature & Humidity History</h2>
      <ResponsiveContainer width="100%" height={260} minWidth={320} minHeight={200}>
        <LineChart
          data={history}
          margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="time" angle={-30} textAnchor="end" height={50} tick={{ fill: '#aaa', fontSize: 12 }} />
          <YAxis yAxisId="left" label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#ffb347', fontSize: 13 }} tick={{ fill: '#ffb347', fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: '%', angle: 90, position: 'insideRight', fill: '#00ffb3', fontSize: 13 }} tick={{ fill: '#00ffb3', fontSize: 12 }} />
          <Tooltip contentStyle={{ background: '#232526', border: '1px solid #00eaff', color: '#fff' }} />
          <Legend wrapperStyle={{ color: '#fff' }} />
          <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="#ffb347" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
          <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#00ffb3" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="graph-labels" style={{ marginTop: 8 }}>
        <span style={{ color: '#ffb347' }}>● Temp (°C)</span>
        <span style={{ color: '#00ffb3' }}>● Humidity (%)</span>
      </div>
    </div>
  );
}
