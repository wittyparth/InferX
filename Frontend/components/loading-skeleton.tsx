"use client"

import { motion } from "framer-motion"

export function LoadingSkeleton() {
  const shimmer = {
    initial: { backgroundPosition: "200% center" },
    animate: { backgroundPosition: "-200% center" },
  }

  return (
    <motion.div
      variants={shimmer}
      initial="initial"
      animate="animate"
      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      className="h-12 rounded-lg bg-gradient-to-r from-card via-card/50 to-card bg-[length:200%_100%]"
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="glass-effect border-border/50 p-6 rounded-lg space-y-4">
      <LoadingSkeleton />
      <LoadingSkeleton />
      <LoadingSkeleton />
    </div>
  )
}

export function PulseSkeleton() {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      className="h-12 rounded-lg bg-muted"
    />
  )
}

export function TableRowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="h-16 rounded-lg bg-gradient-to-r from-card via-card/50 to-card bg-[length:200%_100%] animate-pulse"
        />
      ))}
    </div>
  )
}
