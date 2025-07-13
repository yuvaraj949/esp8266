"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Droplets, Power, Wifi } from "lucide-react"
import { apiRequest } from "@/lib/api"

interface PumpStatus {
  status?: boolean
  last_changed?: string
}

interface PumpControlPanelProps {
  status: PumpStatus | null
  onStatusChange: () => void
}

export function PumpControlPanel({ status, onStatusChange }: PumpControlPanelProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastAction, setLastAction] = useState<string | null>(null)

  const togglePump = async (newState: boolean) => {
    setIsUpdating(true)
    setLastAction(null)

    try {
      const response = await apiRequest("/api-pump-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ on: newState }),
      })

      if (response.success) {
        setLastAction(`Pump ${newState ? "activated" : "deactivated"}`)
      }

      if (status) {
        status.status = newState
        status.last_changed = new Date().toISOString()
      }

      onStatusChange()
    } catch (error) {
      console.error("Failed to toggle pump:", error)
      setLastAction("Error: Could not control pump")
    } finally {
      setIsUpdating(false)
      setTimeout(() => setLastAction(null), 3000)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Pump Control
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {status ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Power className={`h-6 w-6 ${status.status ? "text-green-400" : "text-gray-400"}`} />
                <div>
                  <div className="text-white font-medium">Water Pump</div>
                  <div className={`text-sm ${status.status ? "text-green-400" : "text-gray-400"}`}>
                    {status.status ? "Running" : "Stopped"}
                  </div>
                </div>
              </div>
              <Switch
                checked={status.status || false}
                onCheckedChange={togglePump}
                disabled={isUpdating}
                className="data-[state=checked]:bg-green-600"
              />
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="text-sm text-gray-300 mb-1">Status</div>
              <div className={`text-lg font-semibold ${status.status ? "text-green-400" : "text-red-400"}`}>
                {status.status ? "ON" : "OFF"}
              </div>
            </div>

            {status.last_changed && (
              <div className="text-sm text-gray-400 text-center pt-2 border-t border-gray-600">
                Last changed: {formatTimestamp(status.last_changed)}
              </div>
            )}

            {isUpdating && (
              <div className="text-center text-yellow-400 text-sm animate-pulse">Updating pump status...</div>
            )}

            {lastAction && (
              <div
                className={`text-center text-sm p-2 rounded ${
                  lastAction.includes("Error") ? "bg-red-900 text-red-300" : "bg-green-900 text-green-300"
                }`}
              >
                {lastAction}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="text-gray-400 mt-2">Loading pump status...</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
