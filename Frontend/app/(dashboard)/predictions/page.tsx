"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Loader2, RefreshCw, Filter } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { api } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"

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
      <Card className="card-base p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground dark:text-muted-foreground">Filter by model:</span>
            <select
              value={modelFilter || ""}
              onChange={(e) => {
                setModelFilter(e.target.value || undefined)
                setPage(1)
              }}
              className="px-3 py-1.5 bg-input dark:bg-input border border-border dark:border-border rounded-md text-sm text-foreground dark:text-foreground"
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && predictions.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="card-base p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-primary dark:text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground dark:text-foreground mb-2">No predictions yet</h3>
              <p className="text-muted-foreground dark:text-muted-foreground">
                {modelFilter
                  ? "No predictions found for this model"
                  : "Start making predictions with your models to see history here"}
              </p>
            </div>
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
