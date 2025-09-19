"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Clock } from "lucide-react"

interface DeviceStatus {
  ESP32?: {
    online?: boolean
    lastSeen?: string
  }
  device_name?: string
}

interface DeviceStatusPanelProps {
  status: DeviceStatus | null
}

export function DeviceStatusPanel({ status }: DeviceStatusPanelProps) {
  const [formattedLastSeen, setFormattedLastSeen] = useState<string>("")
  const [isOnline, setIsOnline] = useState<boolean>(false)

  useEffect(() => {
    if (status?.ESP32?.lastSeen) {
      const lastSeenDate = new Date(status.ESP32.lastSeen)
      setFormattedLastSeen(lastSeenDate.toLocaleString())

      const diffMs = Date.now() - lastSeenDate.getTime()
      const diffMins = diffMs / 60000

      // within 3 minutes → online
      setIsOnline(diffMins <= 3)
    } else {
      setIsOnline(false)
    }
  }, [status?.ESP32?.lastSeen])

  const getTimeSince = (timestamp: string) => {
    const now = new Date()
    const lastSeen = new Date(timestamp)
    const diffMs = now.getTime() - lastSeen.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minutes ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hours ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} days ago`
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          {isOnline ? <Wifi className="h-5 w-5 text-green-400" /> : <WifiOff className="h-5 w-5 text-red-400" />}
          Device Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">{status.device_name || "ESP32 Garden Controller"}</div>
                <div className="text-sm text-gray-400">Smart Garden Device</div>
              </div>
              <Badge
                variant={isOnline ? "default" : "destructive"}
                className={isOnline ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              >
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-400" : "bg-red-400"}`} />
                  <span className="text-gray-300 text-sm">Connection Status</span>
                </div>
                <div className={`text-lg font-semibold ${isOnline ? "text-green-400" : "text-red-400"}`}>
                  {isOnline ? "Connected" : "Disconnected"}
                </div>
              </div>

              {status.ESP32?.lastSeen && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">Last Seen</span>
                  </div>
                  <div className="text-white font-medium">{getTimeSince(status.ESP32.lastSeen)}</div>
                  <div className="text-xs text-gray-400 mt-1">{formattedLastSeen}</div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400">Loading device status...</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
