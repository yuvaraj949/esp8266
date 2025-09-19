"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CloudRain, Sun, Thermometer } from "lucide-react"

export function WeatherAwarenessPanel() {
  // Dummy data
  const rainDetected = false
  const temperature = 32 // °C
  const humidity = 68 // %
  const mistOn = temperature > 35 // Mist sprays if temperature > 35°C

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CloudRain className="h-5 w-5 text-blue-400" />
          Weather Awareness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rain Sensor */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <CloudRain className="h-4 w-4 text-blue-400" />
            <span className="text-gray-300 text-sm">Rain Sensor</span>
          </div>
          <div className={`text-lg font-semibold ${rainDetected ? "text-green-400" : "text-red-400"}`}>
            {rainDetected ? "Rain Detected" : "No Rain"}
          </div>
        </div>

        {/* Mist Spray */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className="h-4 w-4 text-yellow-400" />
            <span className="text-gray-300 text-sm">Mist Spray</span>
          </div>
          <div className={`text-lg font-semibold ${mistOn ? "text-green-400" : "text-red-400"}`}>
            {mistOn ? "Mist ON (High Temp)" : "Mist OFF (Temp Normal)"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
