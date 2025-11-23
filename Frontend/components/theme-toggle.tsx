"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg border border-border bg-card animate-pulse" />
    )
  }

  const isDark = theme === "dark"

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-10 h-10 rounded-lg border border-border bg-linear-to-br from-card to-muted/50 hover:border-primary/50 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md hover:shadow-primary/10"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Sun className="w-5 h-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              animate={{
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 bg-linear-to-br from-primary/10 via-accent/10 to-secondary/10"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.button>
  )
}
