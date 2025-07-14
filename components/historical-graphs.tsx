"use client"

import { useState, useEffect, useMemo } from "react"
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
  formattedLabel?: string
}

export function HistoricalGraphs() {
  const [data, setData] = useState<HistoricalData[]>([])
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState("24h")
  const [formattedData, setFormattedData] = useState<HistoricalData[]>([])

  const fetchHistoricalData = async (range: string) => {
    setLoading(true)
    try {
      let since;
      if (range === "7d") {
        const now = new Date();
        const sinceDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        sinceDate.setUTCHours(0, 0, 0, 0); // Start of the day, 7 days ago
        since = sinceDate.toISOString();
      } else if (range === "24h") {
        since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      } else {
        since = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
      }
      let limit = 12; // default for 1h
      if (range === "24h") limit = 144;
      if (range === "7d") limit = 168;

      const response = await apiRequest(`/api-data-history?since=${since}&limit=5000`)
      // Sort ascending (oldest to newest)
      const sorted = response.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      // Debug log
      console.log("First timestamp:", sorted[0]?.timestamp, "Last timestamp:", sorted[sorted.length-1]?.timestamp);
      setData(sorted);
    } catch (error) {
      console.error("Failed to fetch historical data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistoricalData(timeRange)
  }, [timeRange])

  // Format timestamps for X-axis based on range
  useEffect(() => {
    setFormattedData(
      data.map((item: any) => {
        let label = ""
        const date = new Date(item.timestamp)
        if (timeRange === "1h" || timeRange === "24h") {
          label = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        } else if (timeRange === "7d") {
          label = date.toLocaleDateString([], { month: "short", day: "numeric" })
        }
        return { ...item, formattedLabel: label }
      })
    )
  }, [data, timeRange])

  // Memoize tick values to reduce overlap
  const xTicks = useMemo(() => {
    if (formattedData.length === 0) return [];
    let ticks: string[] = [];
    if (timeRange === "1h") {
      ticks = formattedData.map((d) => d.timestamp);
    } else if (timeRange === "24h") {
      ticks = formattedData.filter((_, i) => i % 12 === 0).map((d) => d.timestamp);
    } else if (timeRange === "7d") {
      ticks = formattedData.filter((_, i) => i % 24 === 0).map((d) => d.timestamp);
    } else {
      ticks = formattedData.map((d) => d.timestamp);
    }
    return ticks;
  }, [formattedData, timeRange]);

  // Custom Tooltip to match dark theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formatted = date.toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
      return (
        <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, padding: 12, color: '#fff', minWidth: 180 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{`Time: ${formatted}`}</div>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ color: entry.color, fontWeight: 500 }}>
              {`${entry.name}: ${entry.value}${entry.name === "Temperature" ? "°C" : entry.name === "Humidity" ? "%" : ""}`}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

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
              <LineChart data={formattedData.map(d => ({ ...d, ts: new Date(d.timestamp).getTime() }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="ts"
                  type="number"
                  scale="time"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={value => {
                    const date = new Date(value);
                    return date.toLocaleDateString([], { month: "short", day: "numeric" }) +
                      " " +
                      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
                  }}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  labelFormatter={value => {
                    const date = new Date(value);
                    return date.toLocaleString([], { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true });
                  }}
                  content={<CustomTooltip />}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Temperature"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Humidity"
                  dot={false}
                />
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
              <LineChart data={formattedData.map(d => ({ ...d, ts: new Date(d.timestamp).getTime() }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="ts"
                  type="number"
                  scale="time"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={value => {
                    const date = new Date(value);
                    return date.toLocaleDateString([], { month: "short", day: "numeric" }) +
                      " " +
                      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
                  }}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  labelFormatter={value => {
                    const date = new Date(value);
                    return date.toLocaleString([], { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true });
                  }}
                  content={<CustomTooltip />}
                />
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
