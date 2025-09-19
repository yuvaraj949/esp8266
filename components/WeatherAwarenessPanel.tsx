"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CloudRain, Sun, Thermometer } from "lucide-react"

export function WeatherAwarenessPanel() {
  // Dummy data
  const rainDetected = false
  const temperature = 32 // °C
  const humidity = 68 // %

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CloudRain className="h-5 w-5 text-blue-400" />
          Weather Awareness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <CloudRain className="h-4 w-4 text-blue-400" />
            <span className="text-gray-300 text-sm">Rain Sensor</span>
          </div>
          <div className={`text-lg font-semibold ${rainDetected ? "text-green-400" : "text-red-400"}`}>
            {rainDetected ? "Rain Detected" : "No Rain"}
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className="h-4 w-4 text-yellow-400" />
            <span className="text-gray-300 text-sm">Temperature</span>
          </div>
          <div className="text-lg font-semibold text-white">{temperature}°C</div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Sun className="h-4 w-4 text-orange-400" />
            <span className="text-gray-300 text-sm">Humidity</span>
          </div>
          <div className="text-lg font-semibold text-white">{humidity}%</div>
        </div>
      </CardContent>
    </Card>
  )
}
