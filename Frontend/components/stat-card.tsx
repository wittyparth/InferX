"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  delay?: number
}

export function StatCard({ label, value, icon: Icon, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
    >
      <Card className="glass-effect border border-border/50 p-6 hover-lift">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Icon className="w-6 h-6 text-accent" />
          </div>
          {trend && (
            <div className={`text-sm font-semibold ${trend.isPositive ? "text-green-400" : "text-red-400"}`}>
              {trend.isPositive ? "+" : "-"}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </Card>
    </motion.div>
  )
}
