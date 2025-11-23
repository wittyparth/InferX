"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="glass-effect border-border/50 p-12 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mb-4 flex justify-center"
        >
          {icon ? (
            <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              {icon}
            </div>
          ) : null}
        </motion.div>
        <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        {actionLabel && onAction && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onAction}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 transition-all duration-300 ease-out"
            >
              <Plus className="w-4 h-4" />
              {actionLabel}
            </Button>
          </motion.div>
        )}
      </Card>
    </motion.div>
  )
}
