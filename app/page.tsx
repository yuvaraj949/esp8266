"use client"

import { useState, useEffect } from "react"
import { SensorDataPanel } from "@/components/sensor-data-panel"
import { PumpControlPanel } from "@/components/pump-control-panel"
import { HistoricalGraphs } from "@/components/historical-graphs"
import { DeviceStatusPanel } from "@/components/device-status-panel"
import { RestartButton } from "@/components/restart-button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Wifi } from "lucide-react"
import {
  fetchLatestSensorData,
  fetchPumpStatus,
  // fetchDeviceStatus, // Uncomment if you add device status to Firestore
} from "@/lib/api"

const DASHBOARD_SENSOR_POLL_INTERVAL = 30 * 1000; // 30 seconds
const DASHBOARD_PUMP_POLL_INTERVAL = 60 * 1000; // 1 minute

export default function Dashboard() {
  const [sensorData, setSensorData] = useState<{
    temperature?: number;
    humidity?: number;
    soil_moisture1?: number;
    soil_moisture2?: number;
    timestamp?: string;
  } | null>(null)
  const [pumpStatus, setPumpStatus] = useState<{
    status: boolean;
    last_changed?: string;
  } | null>(null)
  const [deviceStatus, setDeviceStatus] = useState<{ ESP32: { online: boolean; lastSeen: string } } | null>(null)
  const [loading, setLoading] = useState(true)
  const [connectionError, setConnectionError] = useState(false)
  const [lastPumpPoll, setLastPumpPoll] = useState(Date.now())

  // Fetch all dashboard data from Firestore (sensor + device status)
  const fetchSensorAndDeviceData = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const sensor = await fetchLatestSensorData()
      setSensorData(sensor)
      // Infer device status from sensor timestamp
      if (sensor && sensor.timestamp) {
        const now = Date.now()
        const lastSeen = new Date(sensor.timestamp).toISOString()
        const diff = now - new Date(sensor.timestamp).getTime()
        const online = diff < 2 * DASHBOARD_SENSOR_POLL_INTERVAL // 1 minute
        setDeviceStatus({ ESP32: { online, lastSeen } })
      } else {
        setDeviceStatus(null)
      }
      setConnectionError(false)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      setConnectionError(true)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  // Fetch pump status (separately, every 1 min or after user action)
  const fetchPumpStatusAndSet = async () => {
    try {
      const pump = await fetchPumpStatus()
      setPumpStatus(pump)
      setLastPumpPoll(Date.now())
    } catch (error) {
      console.error("Failed to fetch pump status:", error)
    }
  }

  useEffect(() => {
    fetchSensorAndDeviceData(true)
    fetchPumpStatusAndSet()
  }, [])

  // Poll sensor/device status every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSensorAndDeviceData(false)
    }, DASHBOARD_SENSOR_POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  // Poll pump status every 1 min
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPumpStatusAndSet()
    }, DASHBOARD_PUMP_POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  // When user toggles pump, refresh pump status after action
  const handlePumpStatusChange = () => {
    fetchPumpStatusAndSet()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading dashboard...</div>
          <div className="text-gray-400 text-sm mt-2">Connecting to garden sensors...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Smart Garden Dashboard</h1>
              <p className="text-gray-400">Monitor and control your garden remotely</p>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className={`h-5 w-5 ${connectionError ? "text-red-400" : "text-green-400"}`} />
              <span className={`text-sm ${connectionError ? "text-red-400" : "text-green-400"}`}>
                {connectionError ? "Disconnected" : "Connected"}
              </span>
            </div>
          </div>
        </header>

        {connectionError && (
          <Alert className="mb-6 bg-yellow-900 border-yellow-600">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-yellow-200">
              Unable to connect to garden sensors. Please check your network or API service.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sensor Data Panel */}
          <div className="lg:col-span-1">
            <SensorDataPanel data={sensorData} />
          </div>

          {/* Pump Control Panel */}
          <div className="lg:col-span-1">
            <PumpControlPanel status={pumpStatus} onStatusChange={handlePumpStatusChange} />
          </div>

          {/* Historical Graphs */}
          <div className="lg:col-span-2">
            <HistoricalGraphs />
          </div>

          {/* Device Status Panel */}
          <div className="lg:col-span-1">
            <DeviceStatusPanel status={deviceStatus} />
          </div>

          {/* Restart Button */}
          <div className="lg:col-span-1">
            <RestartButton />
          </div>
        </div>
      </div>
    </div>
  )
}
