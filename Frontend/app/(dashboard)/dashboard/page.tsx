"use client"

import { motion } from "framer-motion"
import { StatsCard } from "@/components/dashboard/stats-card"
import { PredictionsChart } from "@/components/dashboard/predictions-chart"
import { ModelsChart } from "@/components/dashboard/models-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Zap, TrendingUp, Key, Gauge, Loader2 } from 'lucide-react'
import { useState, useEffect } from "react"
import { api } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface DashboardStats {
  totalModels: number
  totalPredictions: number
  activeApiKeys: number
  avgResponseTime: string
  modelsTrend: number
  predictionsTrend: number
  apiKeysTrend: number
  responseTimeTrend: number
}

export default function DashboardPage() {
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats>({
    totalModels: 0,
    totalPredictions: 0,
    activeApiKeys: 0,
    avgResponseTime: "0ms",
    modelsTrend: 0,
    predictionsTrend: 0,
    apiKeysTrend: 0,
    responseTimeTrend: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true)

      // Fetch models count
      const modelsResponse: any = await api.models.list(1, 1)
      let totalModels = 0

      if (modelsResponse) {
        if (modelsResponse.total !== undefined) {
          totalModels = modelsResponse.total
        } else if (Array.isArray(modelsResponse.items)) {
          totalModels = modelsResponse.items.length
        } else if (Array.isArray(modelsResponse.data)) {
          totalModels = modelsResponse.data.length
        } else if (Array.isArray(modelsResponse)) {
          totalModels = modelsResponse.length
        }
      }

      // Fetch predictions count and calculate success rate
      const predictionsResponse: any = await api.predictions.list(undefined, 1, 100)
      console.log("Dashboard Stats - Predictions API Response:", predictionsResponse)

      let totalPredictions = 0
      let predictions: any[] = []

      if (predictionsResponse) {
        if (predictionsResponse.total !== undefined) {
          totalPredictions = predictionsResponse.total
        }

        if (Array.isArray(predictionsResponse.items)) {
          predictions = predictionsResponse.items
        } else if (Array.isArray(predictionsResponse.data)) {
          predictions = predictionsResponse.data
        } else if (Array.isArray(predictionsResponse)) {
          predictions = predictionsResponse
        }

        // If total wasn't set but we have predictions, use array length
        if (totalPredictions === 0 && predictions.length > 0) {
          totalPredictions = predictions.length
        }
      }

      // Ensure predictions is an array
      if (!Array.isArray(predictions)) {
        console.warn("Predictions is not an array, setting to empty array")
        predictions = []
      }

      // Filter out invalid predictions
      const validPredictions = predictions.filter((p: any) => p && typeof p === 'object')

      // Calculate average inference time from recent predictions
      const avgTime = validPredictions.length > 0
        ? validPredictions.reduce((sum: number, p: any) => sum + (p.inference_time_ms || p.inference_time || 0), 0) / validPredictions.length
        : 0

      // Fetch API keys count
      const apiKeysResponse: any = await api.apiKeys.list()
      let apiKeysArray: any[] = []

      if (apiKeysResponse) {
        if (Array.isArray(apiKeysResponse.data)) {
          apiKeysArray = apiKeysResponse.data
        } else if (Array.isArray(apiKeysResponse)) {
          apiKeysArray = apiKeysResponse
        }
      }

      // Ensure apiKeysArray is an array
      if (!Array.isArray(apiKeysArray)) {
        console.warn("API keys is not an array, setting to empty array")
        apiKeysArray = []
      }

      const validApiKeys = apiKeysArray.filter((k: any) => k && typeof k === 'object')
      const activeApiKeys = validApiKeys.filter((k: any) => k.is_active).length

      // For now, set trends to 0 (would need historical data to calculate)
      setStats({
        totalModels,
        totalPredictions,
        activeApiKeys,
        avgResponseTime: `${Math.round(avgTime)}ms`,
        modelsTrend: 0,
        predictionsTrend: 0,
        apiKeysTrend: 0,
        responseTimeTrend: 0,
      })
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-4xl font-semibold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your ML platform overview.</p>
      </motion.div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div variants={itemVariants}>
            <StatsCard
              title="Total Models"
              value={stats.totalModels.toString()}
              subtitle="Active models"
              icon={Zap}
              trend={stats.modelsTrend > 0 ? { value: stats.modelsTrend, isPositive: true } : undefined}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatsCard
              title="Total Predictions"
              value={stats.totalPredictions.toLocaleString()}
              subtitle="All time"
              icon={TrendingUp}
              trend={stats.predictionsTrend > 0 ? { value: stats.predictionsTrend, isPositive: true } : undefined}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatsCard
              title="Active API Keys"
              value={stats.activeApiKeys.toString()}
              subtitle="Valid keys"
              icon={Key}
              trend={stats.apiKeysTrend > 0 ? { value: stats.apiKeysTrend, isPositive: true } : undefined}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatsCard
              title="Avg Inference Time"
              value={stats.avgResponseTime}
              subtitle="Recent predictions"
              icon={Gauge}
              trend={stats.responseTimeTrend > 0 ? { value: stats.responseTimeTrend, isPositive: false } : undefined}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Charts */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <PredictionsChart />
        </motion.div>
        <motion.div variants={itemVariants}>
          <ModelsChart />
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <RecentActivity />
      </motion.div>
    </div>
  )
}
