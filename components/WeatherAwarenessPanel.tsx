"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CloudRain, Thermometer } from "lucide-react"

export function WeatherAwarenessPanel() {
  const [temperature, setTemperature] = useState(0)
  const [humidity, setHumidity] = useState(0)
  const [mistOn, setMistOn] = useState(false)

  const rainDetected = false // Dummy data

  useEffect(() => {
    // Example: Fetch sensor data from your backend or API
    const fetchData = async () => {
      try {
        const res = await fetch("/api/weather") // Replace with your API endpoint
        const data = await res.json()
        setTemperature(data.temperature)
        setHumidity(data.humidity)
        setMistOn(data.temperature > 35) // Mist ON if temperature > 35°C
      } catch (error) {
        console.error("Error fetching weather data:", error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000) // Fetch every 5 seconds
    return () => clearInterval(interval)
  }, [])

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
          <div className="text-gray-400 text-sm mt-1">
            Temp: {temperature}°C | Humidity: {humidity}%
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
