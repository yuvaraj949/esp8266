"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Droplets, Sprout } from "lucide-react"

interface SensorData {
  temperature?: number
  humidity?: number
  soil_moisture1?: number
  soil_moisture2?: number
  timestamp?: string
}

interface SensorDataPanelProps {
  data: SensorData | null
}

export function SensorDataPanel({ data }: SensorDataPanelProps) {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Thermometer className="h-5 w-5" />
          Sensor Readings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="h-4 w-4 text-red-400" />
                  <span className="text-gray-300 text-sm">Temperature</span>
                </div>
                <div className="text-2xl font-bold text-white">{data.temperature?.toFixed(1) || "--"}°C</div>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300 text-sm">Humidity</span>
                </div>
                <div className="text-2xl font-bold text-white">{data.humidity?.toFixed(1) || "--"}%</div>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sprout className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Soil Moisture 1</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {data.soil_moisture1 || "--"}%
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sprout className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Soil Moisture 2</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {data.soil_moisture2 || "--"}%
                </div>
              </div>
            </div>

            {data.timestamp && (
              <div className="text-sm text-gray-400 text-center pt-2 border-t border-gray-600">
                Last updated: {formatTimestamp(data.timestamp)}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400">Loading sensor data...</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
