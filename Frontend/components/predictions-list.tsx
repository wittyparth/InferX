"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Eye } from "lucide-react"

interface Prediction {
  id: string
  model: string
  input: string
  output: string
  confidence: number
  timestamp: string
  status: "success" | "error"
}

const mockPredictions: Prediction[] = [
  {
    id: "pred-001",
    model: "Customer Churn Predictor",
    input: "Customer ID: 12345",
    output: "Will churn in 30 days",
    confidence: 92.5,
    timestamp: "2024-10-21 14:32:00",
    status: "success",
  },
  {
    id: "pred-002",
    model: "Fraud Detection",
    input: "Transaction: $5,000",
    output: "Legitimate transaction",
    confidence: 98.1,
    timestamp: "2024-10-21 14:28:15",
    status: "success",
  },
  {
    id: "pred-003",
    model: "Sentiment Analysis",
    input: "Great product, highly recommend!",
    output: "Positive sentiment",
    confidence: 96.3,
    timestamp: "2024-10-21 14:15:42",
    status: "success",
  },
  {
    id: "pred-004",
    model: "Price Forecasting",
    input: "Historical data: 30 days",
    output: "Predicted price: $125.50",
    confidence: 87.2,
    timestamp: "2024-10-21 13:45:20",
    status: "success",
  },
]

export function PredictionsList() {
  const [predictions] = useState(mockPredictions)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPredictions = predictions.filter((pred) => pred.model.toLowerCase().includes(searchTerm.toLowerCase()))

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return "text-green-400"
    if (confidence >= 85) return "text-blue-400"
    return "text-yellow-400"
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Input
        placeholder="Search predictions by model..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="bg-input border-border/50"
      />

      {/* Predictions List */}
      <div className="space-y-4">
        {filteredPredictions.map((prediction, index) => (
          <motion.div
            key={prediction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-effect border border-border/50 p-6 hover-lift">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Prediction Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-foreground">{prediction.model}</h3>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                      {prediction.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Input</p>
                      <p className="text-foreground truncate">{prediction.input}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Output</p>
                      <p className="text-foreground truncate">{prediction.output}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Timestamp</p>
                      <p className="text-foreground">{prediction.timestamp}</p>
                    </div>
                  </div>
                </div>

                {/* Confidence & Actions */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-muted-foreground text-sm">Confidence</p>
                    <p className={`text-2xl font-bold ${getConfidenceColor(prediction.confidence)}`}>
                      {prediction.confidence}%
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-border/50 hover:bg-primary/10 bg-transparent"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-border/50 hover:bg-primary/10 bg-transparent"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
