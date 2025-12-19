"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
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
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="glass-effect border border-border/50 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group relative overflow-hidden">
        {/* Hover gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ opacity: 0 }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <motion.div
              className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Icon className="w-6 h-6 text-primary" />
            </motion.div>
            {trend && (
              <motion.div
                className={`flex items-center gap-1 text-sm font-semibold ${trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.2 }}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
              </motion.div>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <motion.p
              className="text-3xl font-bold text-foreground"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.1, type: "spring", stiffness: 200 }}
            >
              {value}
            </motion.p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
