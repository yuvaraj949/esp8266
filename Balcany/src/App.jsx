import { useState } from 'react'
import SensorDisplay from './components/SensorDisplay';
import HistoryGraph from './components/HistoryGraph';
import PumpControl from './components/PumpControl';
import PumpSwitch from './components/PumpSwitch';
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="garden-app">
      <h1>🌿 Smart Garden Dashboard</h1>
      <div className="dashboard">
        <SensorDisplay />
        <HistoryGraph />
        <PumpControl />
        <PumpSwitch />
      </div>
      <footer style={{ marginTop: 40, color: '#888' }}>
        Made with <span style={{ color: '#27ae60' }}>♥</span> for your garden
      </footer>
    </div>
  )
}

export default App
