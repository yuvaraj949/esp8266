import { useState } from 'react'
import SensorDisplay from './components/SensorDisplay';
import HistoryGraph from './components/HistoryGraph';
import PumpSwitch from './components/PumpSwitch';
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  // Responsive maxWidth for graph
  const [graphWidth, setGraphWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const w = window.innerWidth;
      if (w < 500) return w - 32; // small phones
      if (w < 900) return w - 64; // tablets
      return 700; // desktop
    }
    return 350;
  });

  // Update on resize
  React.useEffect(() => {
    function handleResize() {
      const w = window.innerWidth;
      if (w < 500) setGraphWidth(w - 32);
      else if (w < 900) setGraphWidth(w - 64);
      else setGraphWidth(700);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="garden-app">
      <h1>🌿 Smart Garden Dashboard</h1>
      <div className="dashboard">
        <SensorDisplay />
        <PumpSwitch />
        <div style={{ width: '100%', maxWidth: graphWidth, margin: '32px auto 0', display: 'flex', justifyContent: 'center' }}>
          <HistoryGraph />
        </div>
      </div>
      <footer style={{ marginTop: 40, color: '#888' }}>
        Made with <span style={{ color: '#27ae60' }}>♥</span> for your garden
      </footer>
    </div>
  )
}

export default App
