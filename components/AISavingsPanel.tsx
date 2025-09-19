"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Leaf, Wind, Droplets } from "lucide-react"   // ✅ Added Droplets

export function AISavingsPanel() {
  // Dummy data
  const solarSavings = "2.3 kWh"
  const waterConservation = "45 L"
  const carbonOffset = "1.2 kg CO₂"

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-400" />
          AI Sustainability Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Sun className="h-4 w-4 text-yellow-400" />
            <span className="text-gray-300 text-sm">Solar Energy Saved</span>
          </div>
          <div className="text-lg font-semibold text-white">{solarSavings}</div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="h-4 w-4 text-blue-400" />   {/* ✅ Fixed import used here */}
            <span className="text-gray-300 text-sm">Water Conserved</span>
          </div>
          <div className="text-lg font-semibold text-white">{waterConservation}</div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Wind className="h-4 w-4 text-gray-300" />
            <span className="text-gray-300 text-sm">Carbon Offset</span>
          </div>
          <div className="text-lg font-semibold text-white">{carbonOffset}</div>
        </div>
      </CardContent>
    </Card>
  )
}
