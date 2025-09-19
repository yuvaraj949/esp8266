"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, TrendingDown, TrendingUp } from "lucide-react"

export function LeakageDrainagePanel() {
  // Dummy data
  const pumpedLiters = 120
  const savedLiters = 35

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Droplets className="h-5 w-5 text-blue-400" />
          Leakage & Drainage Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-gray-300 text-sm">Water Pumped</span>
          </div>
          <div className="text-lg font-semibold text-white">{pumpedLiters} L</div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-blue-400" />
            <span className="text-gray-300 text-sm">Water Saved</span>
          </div>
          <div className="text-lg font-semibold text-green-400">{savedLiters} L</div>
        </div>
      </CardContent>
    </Card>
  )
}
