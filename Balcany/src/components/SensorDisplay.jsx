
import React, { useEffect, useState, useRef } from 'react';
import CoolGauge from 'react-cool-gauge';


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

  return (
    <div className="sensor-card" style={{ minWidth: 340, alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ marginBottom: 20 }}>🌡️ Temperature & 💧 Humidity</h2>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 30, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CoolGauge
            value={latest.temperature}
            min={-10}
            max={60}
            startAngle={210}
            endAngle={-30}
            color="#ffb347"
            backgroundColor="#232526"
            needleColor="#fff"
            width={160}
            height={120}
            label="°C"
            valueLabelStyle={{ fontSize: 28, fill: '#ffb347', fontWeight: 'bold' }}
            labelStyle={{ fontSize: 16, fill: '#ffb347' }}
          />
          <span style={{ color: '#ffb347', marginTop: 8, fontWeight: 'bold' }}>Temperature</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CoolGauge
            value={latest.humidity}
            min={0}
            max={100}
            startAngle={210}
            endAngle={-30}
            color="#00ffb3"
            backgroundColor="#232526"
            needleColor="#fff"
            width={160}
            height={120}
            label="%"
            valueLabelStyle={{ fontSize: 28, fill: '#00ffb3', fontWeight: 'bold' }}
            labelStyle={{ fontSize: 16, fill: '#00ffb3' }}
          />
          <span style={{ color: '#00ffb3', marginTop: 8, fontWeight: 'bold' }}>Humidity</span>
        </div>
      </div>
      <div style={{ fontSize: '0.9em', color: '#888', marginTop: 18 }}>
        {latest.timestamp ? new Date(latest.timestamp).toLocaleString() : ''}
      </div>
    </div>
  );
}
