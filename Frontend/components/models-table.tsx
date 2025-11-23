"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Edit2, Play, Pause, Download } from "lucide-react"

interface Model {
  id: string
  name: string
  version: string
  accuracy: number
  status: "active" | "inactive" | "training"
  lastUpdated: string
  predictions: number
}

const mockModels: Model[] = [
  {
    id: "1",
    name: "Customer Churn Predictor",
    version: "2.1.0",
    accuracy: 96.5,
    status: "active",
    lastUpdated: "2024-10-20",
    predictions: 12450,
  },
  {
    id: "2",
    name: "Fraud Detection",
    version: "1.8.3",
    accuracy: 98.2,
    status: "active",
    lastUpdated: "2024-10-19",
    predictions: 8920,
  },
  {
    id: "3",
    name: "Sentiment Analysis",
    version: "3.0.0",
    accuracy: 94.1,
    status: "training",
    lastUpdated: "2024-10-21",
    predictions: 5340,
  },
  {
    id: "4",
    name: "Price Forecasting",
    version: "1.5.2",
    accuracy: 91.8,
    status: "inactive",
    lastUpdated: "2024-10-15",
    predictions: 2100,
  },
]

export function ModelsTable() {
  const [models, setModels] = useState(mockModels)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "training">("all")
  const [hoveredModelId, setHoveredModelId] = useState<string | null>(null)

  const filteredModels = models.filter((model) => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || model.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "inactive":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      case "training":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const handleDelete = (id: string) => {
    setModels(models.filter((m) => m.id !== id))
  }

  const handleToggleStatus = (id: string) => {
    setModels(models.map((m) => (m.id === id ? { ...m, status: m.status === "active" ? "inactive" : "active" } : m)))
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <Input
          placeholder="Search models..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-input border-border/50"
        />
        <div className="flex gap-2">
          {(["all", "active", "inactive", "training"] as const).map((status) => (
            <motion.div key={status} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant={filterStatus === status ? "default" : "outline"}
                onClick={() => setFilterStatus(status)}
                className={`capitalize ${
                  filterStatus === status
                    ? "bg-primary text-primary-foreground"
                    : "border-border/50 text-foreground hover:bg-muted"
                }`}
              >
                {status}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredModels.map((model, index) => (
            <motion.div
              key={model.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredModelId(model.id)}
              onMouseLeave={() => setHoveredModelId(null)}
            >
              <motion.div
                animate={{
                  y: hoveredModelId === model.id ? -4 : 0,
                  boxShadow:
                    hoveredModelId === model.id
                      ? "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                      : "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                }}
                transition={{ duration: 0.2 }}
              >
                <Card className="glass-effect border border-border/50 p-6 hover-lift">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Model Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{model.name}</h3>
                        <motion.span
                          animate={{
                            scale: hoveredModelId === model.id ? 1.05 : 1,
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(model.status)}`}
                        >
                          {model.status}
                        </motion.span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Version</p>
                          <p className="font-semibold text-foreground">{model.version}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Accuracy</p>
                          <p className="font-semibold text-accent">{model.accuracy}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Predictions</p>
                          <p className="font-semibold text-foreground">{model.predictions.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Updated</p>
                          <p className="font-semibold text-foreground">{model.lastUpdated}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap md:flex-nowrap">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleToggleStatus(model.id)}
                          className="border-border/50 hover:bg-primary/10"
                          title={model.status === "active" ? "Pause" : "Play"}
                        >
                          {model.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-border/50 hover:bg-primary/10 bg-transparent"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-border/50 hover:bg-primary/10 bg-transparent"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(model.id)}
                          className="border-border/50 hover:bg-destructive/10 hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredModels.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border border-border/50 p-12 text-center">
            <p className="text-muted-foreground">No models found matching your criteria</p>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
