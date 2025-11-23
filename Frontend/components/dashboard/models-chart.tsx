"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Zap, Package } from "lucide-react"
import { useState, useEffect } from "react"
import { api } from "@/lib/api-client"
import { Skeleton } from "@/components/ui/skeleton"

interface ModelData {
  name: string
  value: number
  fill: string
}

export function ModelsChart() {
  const [data, setData] = useState<ModelData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalModels, setTotalModels] = useState(0)

  useEffect(() => {
    fetchModelsData()
  }, [])

  const fetchModelsData = async () => {
    try {
      setIsLoading(true)
      const response: any = await api.models.list(1, 100)

      // Handle different response structures - ensure we have an array
      let models = []

      if (response) {
        if (Array.isArray(response.items)) {
          models = response.items
        } else if (Array.isArray(response.data)) {
          models = response.data
        } else if (Array.isArray(response)) {
          models = response
        }
      }

      // Filter out invalid models
      const validModels = models.filter((model: any) => model)

      // Group by status
      const statusCounts: Record<string, number> = {}
      validModels.forEach((model: any) => {
        const status = model.status || 'active'
        statusCounts[status] = (statusCounts[status] || 0) + 1
      })

      // Convert to chart format
      const chartData: ModelData[] = Object.entries(statusCounts).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        fill: status === 'active' ? 'hsl(var(--chart-1))' :
          status === 'deprecated' ? 'hsl(var(--chart-2))' :
            'hsl(var(--chart-3))'
      }))

      setData(chartData.length > 0 ? chartData : [
        { name: "Active", value: validModels.length || 0, fill: "hsl(var(--chart-1))" }
      ])
      setTotalModels(validModels.length)
    } catch (error) {
      console.error("Failed to fetch models data:", error)
      // Fallback to empty data
      setData([
        { name: "Active", value: 0, fill: "hsl(var(--chart-1))" }
      ])
      setTotalModels(0)
    } finally {
      setIsLoading(false)
    }
  }

  const chartConfig = {
    models: {
      label: "Models",
    },
    active: {
      label: "Active",
      color: "hsl(var(--chart-1))",
    },
    deprecated: {
      label: "Deprecated",
      color: "hsl(var(--chart-2))",
    },
    archived: {
      label: "Archived",
      color: "hsl(var(--chart-3))",
    },
  }

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="card-base p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-6">
          <Package className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Models by Status</h3>
        </div>

        {isLoading ? (
          <Skeleton className="w-full h-[280px]" />
        ) : totalModels === 0 ? (
          <div className="flex items-center justify-center h-[280px] text-muted-foreground">
            <div className="text-center">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No models available</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    animationDuration={1000}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Center label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="text-3xl font-bold text-foreground">{totalModels}</div>
              <div className="text-xs text-muted-foreground">Total Models</div>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
