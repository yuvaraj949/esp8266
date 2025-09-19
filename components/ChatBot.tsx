"use client"

import { useState, useEffect } from "react"
import { MessageCircle, X } from "lucide-react"

interface ChatBotProps {
  sensorData?: {
    temperature?: number
    humidity?: number
    soil_moisture1?: number
    soil_moisture2?: number
  }
  pumpStatus?: {
    status: boolean
    last_changed?: string
  }
  deviceOnline?: boolean
}

export function ChatBot({ sensorData, pumpStatus, deviceOnline }: ChatBotProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<{ sender: "user" | "bot"; text: string }[]>([
    { sender: "bot", text: "Hello! I'm your Garden Assistant 🤖. I can show you some stats." },
  ])
  const [input, setInput] = useState("")

  // Send initial stats when chat opens
useEffect(() => {
  if (open) {
    setTimeout(() => {
      const stats: string[] = []

      if (sensorData) {
        stats.push(
          `🌡 Temp: ${sensorData.temperature ?? "N/A"}°C, 💧 Humidity: ${sensorData.humidity ?? "N/A"}%`
        )
        stats.push(
          `🌱 Soil Moisture: ${sensorData.soil_moisture1 ?? "N/A"} / ${sensorData.soil_moisture2 ?? "N/A"}`
        )
      }

      if (pumpStatus) {
        stats.push(`🚰 Pump: ${pumpStatus.status ? "Running" : "Stopped"}`)
      }

      if (deviceOnline !== undefined) {
        stats.push(`📡 Device: ${deviceOnline ? "Online" : "Offline"}`)
      }

      setMessages((prev) => [
        ...prev,
        ...stats.map((text) => ({ sender: "bot" as const, text })),
      ])
    }, 500)
  }
}, [open, sensorData, pumpStatus, deviceOnline])


  const handleSend = () => {
    if (!input.trim()) return
    setMessages((prev) => [...prev, { sender: "user", text: input }])
    setInput("")
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "I'm not trained to do this yet. Still in experimental mode." },
      ])
    }, 500)
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600/70 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all z-50"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-0 right-0 w-80 h-96 bg-gray-900 border-l border-t border-gray-700 rounded-tl-2xl shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
            <h3 className="text-white font-semibold">Garden Chatbot</h3>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center">Say hello 👋</p>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg max-w-[80%] ${
                    msg.sender === "user"
                      ? "ml-auto bg-blue-600 text-white"
                      : "mr-auto bg-gray-700 text-gray-200"
                  }`}
                >
                  {msg.text}
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}
