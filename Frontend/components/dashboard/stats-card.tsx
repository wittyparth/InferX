"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
  subtitle: string
  icon: LucideIcon
  trend?: { value: number; isPositive: boolean }
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend }: StatsCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 30 }}>
      <Card className="card-base card-hover p-6 group relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />

        <div className="relative z-10 flex items-start justify-between mb-4">
          <div className="flex-1">
            <motion.p
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2"
              initial={{ opacity: 0.7 }}
              whileHover={{ opacity: 1 }}
            >
              {title}
            </motion.p>
            <motion.h3
              className="text-3xl font-semibold text-foreground"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {value}
            </motion.h3>
            <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
          </div>
          <motion.div
            className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors duration-200 flex-shrink-0 ml-4"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Icon className="w-6 h-6 text-primary" />
          </motion.div>
        </div>

        {trend && (
          <motion.div
            className="flex items-center gap-2 text-xs"
            initial={{ opacity: 0.7 }}
            whileHover={{ opacity: 1 }}
          >
            <motion.div
              className={`flex items-center gap-1 font-medium ${trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              animate={{ x: [0, 2, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{trend.value}%</span>
            </motion.div>
            <span className="text-muted-foreground">vs last month</span>
          </motion.div>
        )}
      </Card>
    </motion.div>
  )
}
