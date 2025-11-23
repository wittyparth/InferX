"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Zap, CheckCircle, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { api } from "@/lib/api-client"

interface Activity {
  id: string
  type: "prediction" | "model_upload"
  model: string
  time: string
  status: "success" | "failed" | "pending"
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    try {
      setIsLoading(true)

      // Check if user is authenticated
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      if (!token) {
        console.warn("No authentication token found, skipping recent activity fetch")
        setActivities([])
        return
      }

      // Fetch recent predictions without model_id filter
      const predictionsResponse: any = await api.predictions.list(undefined, 1, 10)

      console.log("Recent Activity API Response:", predictionsResponse)
      console.log("Response type:", typeof predictionsResponse)
      console.log("Response keys:", predictionsResponse ? Object.keys(predictionsResponse) : 'null/undefined')

      // Handle different response structures - ensure we have an array
      let predictions: any[] = []

      if (predictionsResponse && typeof predictionsResponse === 'object') {
        if (Array.isArray(predictionsResponse.items)) {
          predictions = predictionsResponse.items
        } else if (Array.isArray(predictionsResponse.data)) {
          predictions = predictionsResponse.data
        } else if (Array.isArray(predictionsResponse)) {
          predictions = predictionsResponse
        }
      }

      console.log("Extracted predictions array:", predictions)
      console.log("Is array?", Array.isArray(predictions))

      // Ensure predictions is an array before filtering
      if (!Array.isArray(predictions)) {
        console.warn("Predictions is not an array, setting to empty array")
        predictions = []
      }

      // Convert predictions to activities
      const recentActivities: Activity[] = predictions
        .filter((pred: any) => pred && pred.id && pred.created_at)
        .map((pred: any) => ({
          id: pred.id,
          type: "prediction" as const,
          model: pred.model_name || "Unknown Model",
          time: formatTimeAgo(pred.created_at),
          status: pred.status === "completed" ? "success" : pred.status === "failed" ? "failed" : "pending",
        }))

      setActivities(recentActivities.slice(0, 5))
    } catch (error) {
      console.error("Failed to fetch recent activity:", error)
      console.error("Error details:", error instanceof Error ? error.message : String(error))
      // Set empty activities on error
      setActivities([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return "just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    return `${Math.floor(seconds / 86400)} days ago`
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "model_upload":
        return <Upload className="w-4 h-4" />
      case "prediction":
        return <Zap className="w-4 h-4" />
      default:
        return <CheckCircle className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30 ml-4 shrink-0">
            Success
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30 ml-4 shrink-0">
            Failed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30 ml-4 shrink-0">
            Pending
          </Badge>
        )
    }
  }

  return (
    <Card className="card-base card-hover p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Recent Activity</h3>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              onMouseEnter={() => setHoveredActivityId(activity.id)}
              onMouseLeave={() => setHoveredActivityId(null)}
              className="flex items-center justify-between p-4 rounded-lg border border-border/50 transition-all duration-200 hover:bg-muted/30"
            >
              <div className="flex items-center gap-4 flex-1">
                <motion.div
                  className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0"
                  animate={{
                    scale: hoveredActivityId === activity.id ? 1.1 : 1,
                    rotate: hoveredActivityId === activity.id ? 5 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {getIcon(activity.type)}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {activity.type === "prediction" ? "Prediction" : "Model Upload"} - {activity.model}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
              <motion.div
                animate={{
                  scale: hoveredActivityId === activity.id ? 1.05 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {getStatusBadge(activity.status)}
              </motion.div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  )
}
