"use client"

import { useState, useEffect } from "react"
import { SensorDataPanel } from "@/components/sensor-data-panel"
import { PumpControlPanel } from "@/components/pump-control-panel"
import { HistoricalGraphs } from "@/components/historical-graphs"
import { DeviceStatusPanel } from "@/components/device-status-panel"
import { RestartButton } from "@/components/restart-button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Wifi } from "lucide-react"
import { apiRequest } from "@/lib/api"

export default function Dashboard() {
  const [sensorData, setSensorData] = useState(null)
  const [pumpStatus, setPumpStatus] = useState(null)
  const [deviceStatus, setDeviceStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connectionError, setConnectionError] = useState(false)

  // Fetch latest sensor data
  const fetchSensorData = async () => {
    try {
      const data = await apiRequest("/api-data-latest")
      setSensorData(data)
      setConnectionError(false)
    } catch (error) {
      console.error("Failed to fetch sensor data:", error)
      setConnectionError(true)
    }
  }

  // Fetch pump status
  const fetchPumpStatus = async () => {
    try {
      const data = await apiRequest("/api-pump-get")
      setPumpStatus(data)
    } catch (error) {
      console.error("Failed to fetch pump status:", error)
    }
  }

  // Fetch device status
  const fetchDeviceStatus = async () => {
    try {
      const data = await apiRequest("/api-device-status")
      setDeviceStatus(data)
    } catch (error) {
      console.error("Failed to fetch device status:", error)
    }
  }

  // Initial data fetch
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true)
      await Promise.all([fetchSensorData(), fetchPumpStatus(), fetchDeviceStatus()])
      setLoading(false)
    }

    fetchAllData()
  }, [])

  // Set up polling for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSensorData()
      fetchPumpStatus()
      fetchDeviceStatus()
    }, 15000) // Poll every 15 seconds

    return () => clearInterval(interval)
  }, [])

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
            <PumpControlPanel status={pumpStatus} onStatusChange={fetchPumpStatus} />
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
