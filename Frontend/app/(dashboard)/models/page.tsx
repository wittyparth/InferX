"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreVertical, Loader2, RefreshCw } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface Model {
  id: string
  name: string
  model_type: string
  status: string
  created_at: string
  prediction_count: number
  version: number
  description?: string
}

export default function ModelsPage() {
  const { toast } = useToast()
  const [models, setModels] = useState<Model[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  useEffect(() => {
    fetchModels()
  }, [page, statusFilter])

  const fetchModels = async () => {
    setIsLoading(true)
    try {
      const response: any = await api.models.list(page, 20, statusFilter)
      if (response.success) {
        setModels(response.data)
        setTotalPages(response.pagination.total_pages)
      }
    } catch (error: any) {
      toast({
        title: "Error loading models",
        description: error.message || "Failed to fetch models",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-4xl font-semibold text-foreground">Models</h1>
            <p className="text-muted-foreground mt-1">Manage and monitor your ML models</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchModels}
              disabled={isLoading}
              className="border-border/50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Link href="/models/upload">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="button-primary gap-2">
                  <Plus className="w-4 h-4" />
                  Upload Model
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-3">
        <Button
          variant={statusFilter === undefined ? "default" : "outline"}
          onClick={() => setStatusFilter(undefined)}
          className="text-sm"
        >
          All
        </Button>
        <Button
          variant={statusFilter === "active" ? "default" : "outline"}
          onClick={() => setStatusFilter("active")}
          className="text-sm"
        >
          Active
        </Button>
        <Button
          variant={statusFilter === "deprecated" ? "default" : "outline"}
          onClick={() => setStatusFilter("deprecated")}
          className="text-sm"
        >
          Deprecated
        </Button>
        <Button
          variant={statusFilter === "archived" ? "default" : "outline"}
          onClick={() => setStatusFilter("archived")}
          className="text-sm"
        >
          Archived
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && models.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <Card className="card-base p-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No models yet</h3>
              <p className="text-muted-foreground mb-6">
                Get started by uploading your first ML model
              </p>
              <Link href="/models/upload">
                <Button className="button-primary gap-2">
                  <Plus className="w-4 h-4" />
                  Upload Your First Model
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Models Grid */}
      {!isLoading && models.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {models.map((model) => (
            <motion.div key={model.id} variants={itemVariants}>
              <Link href={`/models/${model.id}`}>
                <Card className="card-base card-hover p-6 cursor-pointer group h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                        {model.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {model.model_type} • v{model.version}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => e.preventDefault()}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200 shrink-0"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {model.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{model.description}</p>
                  )}

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge
                        className={`${model.status === "active"
                            ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30"
                            : model.status === "deprecated"
                              ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30"
                              : "bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-500/30"
                          }`}
                      >
                        {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Predictions</span>
                      <span className="text-foreground font-semibold">{model.prediction_count || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Uploaded</span>
                      <span className="text-foreground text-xs">{formatDate(model.created_at)}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
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
