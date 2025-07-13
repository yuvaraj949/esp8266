"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { RotateCcw, AlertTriangle, Wifi } from "lucide-react"
import { apiRequest } from "@/lib/api"

interface RestartTriggerStatus {
  ESP32?: boolean
}

export function RestartButton() {
  const [isRestarting, setIsRestarting] = useState(false)
  const [lastRestart, setLastRestart] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [triggerStatus, setTriggerStatus] = useState<RestartTriggerStatus | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)

  const fetchTriggerStatus = async () => {
    setIsLoadingStatus(true)
    try {
      const response = await apiRequest("/api-restart-trigger")
      setTriggerStatus(response)
    } catch (error) {
      console.error("Failed to fetch trigger status:", error)
    } finally {
      setIsLoadingStatus(false)
    }
  }

  useEffect(() => {
    fetchTriggerStatus()
    // Poll for trigger status every 5 seconds
    const interval = setInterval(fetchTriggerStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleRestart = async () => {
    setIsRestarting(true)
    setActionMessage("Sending restart command...")

    try {
      const response = await apiRequest("/api-restart-trigger-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ device: "ESP32" }),
      })

      if (response.success) {
        setActionMessage("Restart command sent successfully")
        setLastRestart(new Date().toLocaleString())
        // Fetch updated trigger status
        setTimeout(fetchTriggerStatus, 1000)
      }
    } catch (error) {
      console.error("Failed to restart device:", error)
      setActionMessage("Error: Could not restart device")
      setLastRestart(new Date().toLocaleString())
    } finally {
      setTimeout(() => {
        setIsRestarting(false)
        setActionMessage(null)
      }, 3000)
    }
  }

  const isDeviceRestarting = triggerStatus?.ESP32 === true

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Device Control
          </div>
          {triggerStatus && (
            <Badge 
              variant={isDeviceRestarting ? "destructive" : "outline"} 
              className={isDeviceRestarting ? "bg-red-600 hover:bg-red-700" : "text-green-400 border-green-400"}
            >
              {isDeviceRestarting ? "Restarting..." : "Ready"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <span className="text-gray-300 text-sm">Emergency Controls</span>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="w-full bg-red-600 hover:bg-red-700" 
                disabled={isRestarting || isDeviceRestarting}
              >
                {isRestarting ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                    Sending Command...
                  </>
                ) : isDeviceRestarting ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                    Device Restarting...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restart ESP32
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gray-800 border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Restart ESP32 Device</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-300">
                  This will restart the ESP32 controller. The device will be offline for about 30 seconds during the
                  restart process. Are you sure you want to continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleRestart} className="bg-red-600 hover:bg-red-700">
                  Restart Device
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {actionMessage && (
          <div className="text-center text-sm p-2 rounded bg-blue-900 text-blue-300">{actionMessage}</div>
        )}

        {isDeviceRestarting && (
          <div className="text-center text-sm p-2 rounded bg-yellow-900 text-yellow-300">
            Device is currently restarting. Please wait...
          </div>
        )}

        {lastRestart && (
          <div className="text-sm text-gray-400 text-center pt-2 border-t border-gray-600">
            Last restart: {lastRestart}
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">Use this button only if the device becomes unresponsive</div>
      </CardContent>
    </Card>
  )
}
