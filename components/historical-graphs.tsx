"use client"

import React, { useEffect, useState } from "react"
import ReactECharts from "echarts-for-react"
import { fetchHistoricalSensorData } from "@/lib/api"
import { ChartContainer } from "@/components/ui/chart"
import { useTheme } from "next-themes"

const TIME_RANGES = [
  { label: "1 Hour", value: "1h", ms: 1 * 60 * 60 * 1000 },
  { label: "12 Hours", value: "12h", ms: 12 * 60 * 60 * 1000 },
  { label: "24 Hours", value: "24h", ms: 24 * 60 * 60 * 1000 },
]

function generateTimeGrid(range: string, intervalMinutes = 5) {
  const now = new Date()
  let start: Date
  if (range === "24h") {
    start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  } else if (range === "12h") {
    start = new Date(now.getTime() - 12 * 60 * 60 * 1000)
  } else {
    // 1h
    start = new Date(now.getTime() - 1 * 60 * 60 * 1000)
  }
  const grid = []
  for (let t = start.getTime(); t <= now.getTime(); t += intervalMinutes * 60 * 1000) {
    grid.push(new Date(t))
  }
  // Ensure exact start and end are included
  if (grid.length === 0 || grid[0].getTime() !== start.getTime()) {
    grid.unshift(start)
  }
  if (grid[grid.length - 1].getTime() !== now.getTime()) {
    grid.push(now)
  }
  return grid
}

export function HistoricalGraphs() {
  const [timeRange, setTimeRange] = useState("24h")
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { resolvedTheme } = useTheme();

  // Theme-aware colors
  const isDark = resolvedTheme === 'dark';
  const bgColor = isDark ? '#1f2937' : '#fff';
  const gridColor = isDark ? '#374151' : '#e5e7eb';
  const axisColor = isDark ? '#9ca3af' : '#374151';
  const textColor = isDark ? '#e5e7eb' : '#374151';
  const legendTextColor = isDark ? '#d1d5db' : '#374151';

  // Chart config for color theming (optional, can be extended)
  const chartConfig = {
    temperature: { color: '#F87171', label: 'Temperature' },
    humidity: { color: '#60A5FA', label: 'Humidity' },
    soil_moisture1: { color: '#34D399', label: 'Soil Moisture 1' },
    soil_moisture2: { color: '#A78BFA', label: 'Soil Moisture 2' },
  }

  // ECharts options for temperature/humidity
  const tempHumOptions = {
    animation: false,
    // backgroundColor: 'transparent', // Ensure no background color is set
    tooltip: {
      trigger: 'axis',
      backgroundColor: bgColor,
      borderColor: gridColor,
      textStyle: { color: textColor },
    },
    toolbox: { feature: { saveAsImage: {} } },
    legend: {
      data: ['Temperature', 'Humidity'],
      textStyle: { color: legendTextColor },
    },
    xAxis: {
      type: 'time',
      min: data[0]?.timestamp,
      max: data[data.length - 1]?.timestamp,
      axisLabel: {
        formatter: (value: string) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        color: axisColor,
        rotate: 30, // Rotate labels for readability
        interval: 'auto', // Let ECharts auto-hide overlapping labels
      },
      axisLine: { lineStyle: { color: gridColor } },
      splitLine: { lineStyle: { color: gridColor } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: axisColor },
      axisLine: { lineStyle: { color: gridColor } },
      splitLine: { lineStyle: { color: gridColor } },
    },
    series: [
      {
        name: 'Temperature',
        type: 'line',
        showSymbol: false,
        connectNulls: false,
        data: data.map(d => [d.timestamp, d.temperature]),
        lineStyle: { color: chartConfig.temperature.color },
      },
      {
        name: 'Humidity',
        type: 'line',
        showSymbol: false,
        connectNulls: false,
        data: data.map(d => [d.timestamp, d.humidity]),
        lineStyle: { color: chartConfig.humidity.color },
      },
    ],
    // Remove or comment out dataZoom to disable zooming and scrolling
    // dataZoom: [
    //   { type: 'inside', throttle: 50 },
    //   { type: 'slider', backgroundColor: 'transparent', dataBackground: { lineStyle: { color: gridColor }, areaStyle: { color: gridColor } }, borderColor: gridColor, textStyle: { color: textColor } },
    // ],
    grid: { left: 40, right: 20, top: 40, bottom: 40, containLabel: true, backgroundColor: 'transparent' },
  }

  // ECharts options for soil moisture
  const soilOptions = {
    animation: false,
    // backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: bgColor,
      borderColor: gridColor,
      textStyle: { color: textColor },
    },
    toolbox: { feature: { saveAsImage: {} } },
    legend: {
      data: ['Soil Moisture 1', 'Soil Moisture 2'],
      textStyle: { color: legendTextColor },
    },
    xAxis: {
      type: 'time',
      min: data[0]?.timestamp,
      max: data[data.length - 1]?.timestamp,
      axisLabel: {
        formatter: (value: string) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        color: axisColor,
        rotate: 30, // Rotate labels for readability
        interval: 'auto', // Let ECharts auto-hide overlapping labels
      },
      axisLine: { lineStyle: { color: gridColor } },
      splitLine: { lineStyle: { color: gridColor } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: axisColor },
      axisLine: { lineStyle: { color: gridColor } },
      splitLine: { lineStyle: { color: gridColor } },
    },
    series: [
      {
        name: 'Soil Moisture 1',
        type: 'line',
        showSymbol: false,
        connectNulls: false,
        data: data.map(d => [d.timestamp, d.soil_moisture1]),
        lineStyle: { color: chartConfig.soil_moisture1.color },
      },
      {
        name: 'Soil Moisture 2',
        type: 'line',
        showSymbol: false,
        connectNulls: false,
        data: data.map(d => [d.timestamp, d.soil_moisture2]),
        lineStyle: { color: chartConfig.soil_moisture2.color },
      },
    ],
    // Remove or comment out dataZoom to disable zooming and scrolling
    // dataZoom: [
    //   { type: 'inside', throttle: 50 },
    //   { type: 'slider', backgroundColor: 'transparent', dataBackground: { lineStyle: { color: gridColor }, areaStyle: { color: gridColor } }, borderColor: gridColor, textStyle: { color: textColor } },
    // ],
    grid: { left: 40, right: 20, top: 40, bottom: 40, containLabel: true, backgroundColor: 'transparent' },
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        let since
        if (timeRange === "24h") {
          since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        } else if (timeRange === "12h") {
          since = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        } else {
          // 1h
          since = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        }
        const response = await fetchHistoricalSensorData({ since, limit: 5000 })
        // Sort ascending (oldest to newest)
        const sorted = response.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        // Generate time grid
        const grid = generateTimeGrid(timeRange, 5)
        // Find the earliest data timestamp
        const firstDataTime = sorted.length > 0 ? new Date(sorted[0].timestamp).getTime() : null
        // Align data to grid, fill undefined before first data point
        let filled = grid.map((dt) => {
          const t = dt.getTime()
          if (firstDataTime && t < firstDataTime) {
            // Before first data point, always undefined
            return {
              timestamp: dt.toISOString(),
              temperature: undefined,
              humidity: undefined,
              soil_moisture1: undefined,
              soil_moisture2: undefined,
            }
          }
          // Find the closest data point within 2.5 minutes
          const match = sorted.find((item: any) => {
            const diff = Math.abs(new Date(item.timestamp).getTime() - t)
            return diff <= 2.5 * 60 * 1000
          })
          return match
            ? { ...match, timestamp: dt.toISOString() }
            : {
                timestamp: dt.toISOString(),
                temperature: undefined,
                humidity: undefined,
                soil_moisture1: undefined,
                soil_moisture2: undefined,
              }
        })
        // Ensure first and last points are at the exact start/end
        const startISO = grid[0].toISOString()
        const endISO = grid[grid.length - 1].toISOString()
        if (filled[0].timestamp !== startISO) {
          filled.unshift({
            timestamp: startISO,
            temperature: undefined,
            humidity: undefined,
            soil_moisture1: undefined,
            soil_moisture2: undefined,
          })
        }
        if (filled[filled.length - 1].timestamp !== endISO) {
          filled.push({
            timestamp: endISO,
            temperature: undefined,
            humidity: undefined,
            soil_moisture1: undefined,
            soil_moisture2: undefined,
          })
        }
        setData(filled)
      } catch (error) {
        console.error("Failed to fetch historical data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [timeRange])

  // Theme-aware border and background classes
  const cardClass = isDark
    ? "bg-gray-800 border border-gray-700 rounded-lg p-4"
    : "bg-white border border-gray-300 rounded-lg p-4"

  return (
    <div className="space-y-8">
      <div className="flex gap-2 mb-4">
        {TIME_RANGES.map((r) => (
          <button
            key={r.value}
            className={`px-3 py-1 rounded ${timeRange === r.value ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200"}`}
            onClick={() => setTimeRange(r.value)}
            disabled={loading}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={cardClass}>
          <h3 className="text-lg font-semibold mb-2">Temperature & Humidity</h3>
          <ChartContainer
            config={chartConfig}
            echartOption={tempHumOptions}
            echartTheme={resolvedTheme}
            themeMode={resolvedTheme}
          />
        </div>
        <div className={cardClass}>
          <h3 className="text-lg font-semibold mb-2">Soil Moisture</h3>
          <ChartContainer
            config={chartConfig}
            echartOption={soilOptions}
            echartTheme={resolvedTheme}
            themeMode={resolvedTheme}
          />
        </div>
      </div>
    </div>
  )
}
