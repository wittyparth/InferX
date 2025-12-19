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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="glass-effect border-border/50 p-12 text-center max-w-lg mx-auto relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.6,
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
            className="mb-6 flex justify-center"
          >
            {icon ? (
              <div className="relative">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(var(--primary-rgb, 79 70 229), 0)",
                      "0 0 0 10px rgba(var(--primary-rgb, 79 70 229), 0)",
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 flex items-center justify-center text-primary"
                >
                  {icon}
                </motion.div>
              </div>
            ) : null}
          </motion.div>

          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-2xl font-semibold text-foreground mb-3"
          >
            {title}
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-muted-foreground mb-8 text-base leading-relaxed"
          >
            {description}
          </motion.p>

          {actionLabel && onAction && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={onAction}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 transition-all duration-300 ease-out h-11 px-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
              >
                <Plus className="w-5 h-5" />
                {actionLabel}
              </Button>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
