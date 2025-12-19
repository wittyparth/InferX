"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw, Filter, TrendingUp, Clock, CheckCircle2, XCircle } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { api } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import { TableRowSkeleton } from "@/components/loading-skeleton"

interface Prediction {
  id: string
  model_id: string
  model_name?: string
  user_id: string
  input_data: any
  output_data: any
  inference_time_ms: number
  status: "success" | "failed"
  error_message?: string
  created_at: string
}

export default function PredictionsPage() {
  const { toast } = useToast()
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [modelFilter, setModelFilter] = useState<string | undefined>(undefined)
  const [models, setModels] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    fetchModels()
  }, [])

  useEffect(() => {
    fetchPredictions()
  }, [page, modelFilter])

  const fetchModels = async () => {
    try {
      const response: any = await api.models.list(1, 100)
      if (response.success) {
        setModels(response.data.map((m: any) => ({ id: m.id, name: m.name })))
      }
    } catch (error) {
      console.error("Failed to fetch models:", error)
    }
  }

  const fetchPredictions = async () => {
    setIsLoading(true)
    try {
      const response: any = await api.predictions.list(modelFilter, page, 20)
      if (response.success) {
        setPredictions(response.data)
        setTotalPages(response.pagination.total_pages)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading predictions",
        description: error.message || "Failed to fetch prediction history",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const exportData = () => {
    const csv = [
      ["Model", "Timestamp", "Status", "Inference Time (ms)", "Result"],
      ...predictions.map((p) => [
        p.model_name || p.model_id,
        p.created_at,
        p.status,
        p.inference_time_ms.toString(),
        JSON.stringify(p.output_data),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `predictions-${new Date().toISOString()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export successful!",
      description: `Exported ${predictions.length} predictions to CSV`,
    })
  }

  const columnHelper = createColumnHelper<Prediction>()

  const columns: ColumnDef<Prediction, any>[] = [
    columnHelper.accessor("model_name", {
      header: "Model",
      cell: (info) => (
        <span className="font-medium text-foreground dark:text-foreground">{info.getValue() || info.row.original.model_id.substring(0, 8)}</span>
      ),
    }),
    columnHelper.accessor("created_at", {
      header: "Timestamp",
      cell: (info) => <span className="text-muted-foreground dark:text-muted-foreground text-sm">{formatDate(info.getValue())}</span>,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue()
        return (
          <Badge
            variant={status === "success" ? "default" : "destructive"}
            className={
              status === "success"
                ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700"
                : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700"
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      },
    }),
    columnHelper.accessor("inference_time_ms", {
      header: "Response Time",
      cell: (info) => <span className="font-mono text-sm text-foreground dark:text-foreground">{info.getValue()}ms</span>,
    }),
    columnHelper.accessor("output_data", {
      header: "Result",
      cell: (info) => {
        const data = info.getValue()
        if (!data) return <span className="text-muted-foreground dark:text-muted-foreground">-</span>

        const prediction = data.prediction
        const confidence = data.confidence

        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-foreground dark:text-foreground">{JSON.stringify(prediction).substring(0, 30)}...</span>
            {confidence && (
              <>
                <div className="w-16 h-2 bg-muted dark:bg-muted rounded-full overflow-hidden border border-border dark:border-border">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-foreground dark:text-foreground tabular-nums">{(confidence * 100).toFixed(0)}%</span>
              </>
            )}
          </div>
        )
      },
    }),
  ]

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-foreground">Predictions</h1>
            <p className="text-muted-foreground mt-1">View and analyze your prediction history</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchPredictions} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="button-primary gap-2" onClick={exportData} disabled={predictions.length === 0}>
                <Download className="w-4 h-4" />
                Export
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="card-base p-5 border-border/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Filter className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 flex items-center gap-3">
              <label className="text-sm font-medium text-foreground">Filter by model:</label>
              <select
                value={modelFilter || ""}
                onChange={(e) => {
                  setModelFilter(e.target.value || undefined)
                  setPage(1)
                }}
                className="px-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              >
                <option value="">All Models</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <TableRowSkeleton count={8} />
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && predictions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="card-base p-12 text-center max-w-lg mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(var(--primary-rgb, 79 70 229), 0)",
                    "0 0 0 10px rgba(var(--primary-rgb, 79 70 229), 0)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl"
              />
              <TrendingUp className="w-10 h-10 text-primary" strokeWidth={2} />
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-semibold text-foreground mb-3"
            >
              No predictions yet
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground"
            >
              {modelFilter
                ? "No predictions found for this model. Try selecting a different model or clear the filter."
                : "Start making predictions with your models to see history here. Use the API or upload data to get started."}
            </motion.p>
          </Card>
        </motion.div>
      )}

      {/* Data Table */}
      {!isLoading && predictions.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <DataTable columns={columns} data={predictions} searchPlaceholder="Search predictions..." searchKey="model_name" />
        </motion.div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground dark:text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
