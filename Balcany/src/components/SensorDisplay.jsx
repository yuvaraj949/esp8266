
import React, { useEffect, useState, useRef } from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';


export default function SensorDisplay() {
  const [latest, setLatest] = useState(null);
  const intervalRef = useRef();

  useEffect(() => {
    let mounted = true;
    const fetchLatest = async () => {
      try {
        const res = await fetch('https://esp8266-server.vercel.app/api/data/latest');
        const data = await res.json();
        if (mounted) setLatest(data);
      } catch (e) {
        if (mounted) setLatest(null);
      }
    };
    fetchLatest();
    intervalRef.current = setInterval(fetchLatest, 5000);
    return () => {
      mounted = false;
      clearInterval(intervalRef.current);
    };
  }, []);

  if (!latest) return <div className="sensor-card">No data available</div>;

  // Gauge data for recharts
  const tempData = [{ name: 'Temperature', value: latest.temperature, fill: '#ffb347' }];
  const humData = [{ name: 'Humidity', value: latest.humidity, fill: '#00ffb3' }];

  return (
    <div className="sensor-card" style={{ minWidth: 340, alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ marginBottom: 20 }}>🌡️ Temperature & 💧 Humidity</h2>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 30, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <RadialBarChart
            width={140}
            height={140}
            cx={70}
            cy={70}
            innerRadius={50}
            outerRadius={65}
            barSize={18}
            data={tempData}
            startAngle={210}
            endAngle={-30}
          >
            <PolarAngleAxis
              type="number"
              domain={[-10, 60]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              minAngle={15}
              background
              clockWise
              dataKey="value"
              cornerRadius={10}
            />
            <text x={70} y={80} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 28, fill: '#ffb347', fontWeight: 'bold' }}>{latest.temperature}°C</text>
            <text x={70} y={120} textAnchor="middle" style={{ fontSize: 16, fill: '#ffb347' }}>Temperature</text>
          </RadialBarChart>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <RadialBarChart
            width={140}
            height={140}
            cx={70}
            cy={70}
            innerRadius={50}
            outerRadius={65}
            barSize={18}
            data={humData}
            startAngle={210}
            endAngle={-30}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              minAngle={15}
              background
              clockWise
              dataKey="value"
              cornerRadius={10}
            />
            <text x={70} y={80} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 28, fill: '#00ffb3', fontWeight: 'bold' }}>{latest.humidity}%</text>
            <text x={70} y={120} textAnchor="middle" style={{ fontSize: 16, fill: '#00ffb3' }}>Humidity</text>
          </RadialBarChart>
        </div>
      </div>
      <div style={{ fontSize: '0.9em', color: '#888', marginTop: 18 }}>
        {latest.timestamp ? new Date(latest.timestamp).toLocaleString() : ''}
      </div>
    </div>
  );
}
