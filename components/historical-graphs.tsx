"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { TrendingUp, Droplets } from "lucide-react"
import { apiRequest } from "@/lib/api"

interface HistoricalData {
  timestamp: string
  temperature?: number
  humidity?: number
  soil_moisture1?: number
  soil_moisture2?: number
}

export function HistoricalGraphs() {
  const [data, setData] = useState<HistoricalData[]>([])
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState("24h")

  const fetchHistoricalData = async (range: string) => {
    setLoading(true)
    try {
      const hoursBack = range === "24h" ? 24 : range === "7d" ? 168 : 1
      const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString()
      const limit = range === "24h" ? 144 : 168 // More points for 24h, fewer for 7d

      const response = await apiRequest(`/api-data-history?since=${since}&limit=${limit}`)

      // Process data for charts
      const processedData = response.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp).toLocaleTimeString(),
      }))

      setData(processedData)
    } catch (error) {
      console.error("Failed to fetch historical data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistoricalData(timeRange)
  }, [timeRange])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
          <p className="text-white font-medium">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.name.includes("Temperature") ? "°C" : "%"}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2 justify-center">
        {["1h", "24h", "7d"].map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(range)}
            className={
              timeRange === range ? "bg-blue-600 hover:bg-blue-700" : "border-gray-600 text-gray-300 hover:bg-gray-700"
            }
          >
            {range}
          </Button>
        ))}
      </div>

      {/* Temperature & Humidity Chart */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Temperature & Humidity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-gray-400">Loading chart data...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Temperature"
                  dot={false}
                />
                <Line type="monotone" dataKey="humidity" stroke="#3B82F6" strokeWidth={2} name="Humidity" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Soil Moisture Chart */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Soil Moisture Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-gray-400">Loading chart data...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="soil_moisture1"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Soil Moisture 1"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="soil_moisture2"
                  stroke="#34D399"
                  strokeWidth={2}
                  name="Soil Moisture 2"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
