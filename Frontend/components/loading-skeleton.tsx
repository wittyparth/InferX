"use client"

import { motion } from "framer-motion"

export function LoadingSkeleton() {
  return (
    <motion.div
      animate={{
        backgroundPosition: ["200% center", "-200% center"],
      }}
      transition={{
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear"
      }}
      className="h-12 rounded-lg bg-gradient-to-r from-muted/50 via-muted to-muted/50 bg-[length:200%_100%]"
    />
  )
}

export function CardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-effect border-border/50 p-6 rounded-lg space-y-4"
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          className="w-12 h-12 rounded-lg bg-muted/70"
        />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton />
          <motion.div
            animate={{
              backgroundPosition: ["200% center", "-200% center"],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
              delay: 0.2
            }}
            className="h-4 w-3/4 rounded bg-gradient-to-r from-muted/50 via-muted to-muted/50 bg-[length:200%_100%]"
          />
        </div>
      </div>
      <motion.div
        animate={{
          backgroundPosition: ["200% center", "-200% center"],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
          delay: 0.4
        }}
        className="h-20 rounded-lg bg-gradient-to-r from-muted/50 via-muted to-muted/50 bg-[length:200%_100%]"
      />
    </motion.div>
  )
}

export function PulseSkeleton() {
  return (
    <motion.div
      animate={{
        opacity: [0.4, 1, 0.4],
        scale: [0.98, 1, 0.98]
      }}
      transition={{
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut"
      }}
      className="h-12 rounded-lg bg-gradient-to-r from-muted/60 to-muted/80"
    />
  )
}

export function TableRowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: i * 0.1,
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="relative overflow-hidden"
        >
          <motion.div
            animate={{
              backgroundPosition: ["200% center", "-200% center"],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
              delay: i * 0.15
            }}
            className="h-16 rounded-lg bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%] border border-border/30"
          />
        </motion.div>
      ))}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-effect border-border/50 p-6 rounded-xl space-y-4"
    >
      <div className="flex items-center justify-between">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          className="w-10 h-10 rounded-lg bg-muted/70"
        />
        <motion.div
          animate={{
            backgroundPosition: ["200% center", "-200% center"],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="h-4 w-16 rounded bg-gradient-to-r from-muted/50 via-muted to-muted/50 bg-[length:200%_100%]"
        />
      </div>
      <div className="space-y-2">
        <motion.div
          animate={{
            backgroundPosition: ["200% center", "-200% center"],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear", delay: 0.2 }}
          className="h-8 w-24 rounded bg-gradient-to-r from-muted/50 via-muted to-muted/50 bg-[length:200%_100%]"
        />
        <motion.div
          animate={{
            backgroundPosition: ["200% center", "-200% center"],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear", delay: 0.4 }}
          className="h-4 w-32 rounded bg-gradient-to-r from-muted/50 via-muted to-muted/50 bg-[length:200%_100%]"
        />
      </div>
    </motion.div>
  )
}
