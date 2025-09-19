"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollText } from "lucide-react"

export function AILogPanel() {
  // Dummy data logs
  const logs = [
    { time: "07:15", message: "Pump turned ON (soil dry)" },
    { time: "07:45", message: "Pump turned OFF (soil moist)" },
    { time: "08:10", message: "Rain detected - watering paused" },
    { time: "12:30", message: "Heatwave detected - activated spray nozzles" },
    { time: "18:20", message: "Pump turned ON (scheduled)" },
  ]

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-gray-300" />
          AI Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {logs.map((log, idx) => (
            <div
              key={idx}
              className="bg-gray-700 p-3 rounded-lg text-sm text-gray-200 flex justify-between"
            >
              <span>{log.message}</span>
              <span className="text-gray-400">{log.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
