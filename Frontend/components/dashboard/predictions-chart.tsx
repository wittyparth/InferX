"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import { TrendingUp, Activity } from "lucide-react"
import { useState, useEffect } from "react"
import { api } from "@/lib/api-client"
import { Skeleton } from "@/components/ui/skeleton"

interface PredictionData {
  date: string
  predictions: number
}

export function PredictionsChart() {
  const [data, setData] = useState<PredictionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [trend, setTrend] = useState(0)

  useEffect(() => {
    fetchPredictionsData()
  }, [])

  const fetchPredictionsData = async () => {
    try {
      setIsLoading(true)

      // Check if user is authenticated
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      if (!token) {
        console.warn("No authentication token found, skipping predictions chart fetch")
        setData([
          { date: "Mon", predictions: 0 },
          { date: "Tue", predictions: 0 },
          { date: "Wed", predictions: 0 },
          { date: "Thu", predictions: 0 },
          { date: "Fri", predictions: 0 },
          { date: "Sat", predictions: 0 },
          { date: "Sun", predictions: 0 },
        ])
        return
      }

      // Fetch predictions for the last 7 days
      const response: any = await api.predictions.list(undefined, 1, 100)

      console.log("Predictions Chart API Response:", response)
      console.log("Response type:", typeof response)
      console.log("Response keys:", response ? Object.keys(response) : 'null/undefined')

      // Handle different response structures - ensure we have an array
      let predictions: any[] = []

      if (response && typeof response === 'object') {
        if (Array.isArray(response.items)) {
          predictions = response.items
        } else if (Array.isArray(response.data)) {
          predictions = response.data
        } else if (Array.isArray(response)) {
          predictions = response
        }
      }

      console.log("Extracted predictions for chart:", predictions)
      console.log("Is array?", Array.isArray(predictions))

      // Ensure predictions is an array before filtering
      if (!Array.isArray(predictions)) {
        console.warn("Predictions is not an array, setting to empty array")
        predictions = []
      }

      // Filter out invalid predictions
      const validPredictions = predictions.filter((pred: any) => pred && pred.created_at)      // Group by date
      const grouped = validPredictions.reduce((acc: any, pred: any) => {
        const date = new Date(pred.created_at).toLocaleDateString('en-US', { weekday: 'short' })
        if (!acc[date]) {
          acc[date] = 0
        }
        acc[date]++
        return acc
      }, {})

      // Convert to array format for chart
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const chartData = days.map(day => ({
        date: day,
        predictions: grouped[day] || 0
      }))

      setData(chartData)

      // Calculate trend
      const total = chartData.reduce((sum, d) => sum + d.predictions, 0)
      const avg = total / (chartData.length || 1)
      setTrend(Math.round((avg / (total || 1)) * 100))
    } catch (error) {
      console.error("Failed to fetch predictions data:", error)
      // Fallback to empty data
      setData([
        { date: "Mon", predictions: 0 },
        { date: "Tue", predictions: 0 },
        { date: "Wed", predictions: 0 },
        { date: "Thu", predictions: 0 },
        { date: "Fri", predictions: 0 },
        { date: "Sat", predictions: 0 },
        { date: "Sun", predictions: 0 },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const chartConfig = {
    predictions: {
      label: "Predictions",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="card-base p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Predictions Over Time</h3>
          </div>
          {trend > 0 && !isLoading && (
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              <span className="font-medium">Active</span>
            </div>
          )}
        </div>

        {isLoading ? (
          <Skeleton className="w-full h-[300px]" />
        ) : data.length === 0 || data.every(d => d.predictions === 0) ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No prediction data available</p>
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPredictions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="predictions"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#colorPredictions)"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </Card>
    </motion.div>
  )
}
