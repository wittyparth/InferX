"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  delay?: number
}

export function ChartCard({ title, description, children, delay = 0 }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
    >
      <Card className="glass-effect border border-border/50 p-6 hover-lift">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="w-full overflow-x-auto">{children}</div>
      </Card>
    </motion.div>
  )
}
