"use client"

import { motion } from "framer-motion"
import { X, Check, AlertCircle, Info } from "lucide-react"
import { useEffect } from "react"

interface ToastProps {
  id: string
  title: string
  description?: string
  type?: "success" | "error" | "info" | "warning"
  duration?: number
  onClose: (id: string) => void
}

export function Toast({ id, title, description, type = "info", duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration)
    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const icons = {
    success: <Check className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-400" />,
  }

  const colors = {
    success: "bg-green-500/10 border-green-500/30",
    error: "bg-red-500/10 border-red-500/30",
    info: "bg-blue-500/10 border-blue-500/30",
    warning: "bg-yellow-500/10 border-yellow-500/30",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 20 }}
      transition={{ duration: 0.3 }}
      className={`glass-effect border ${colors[type]} p-4 rounded-lg flex items-start gap-3 max-w-sm`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1">
        <p className="font-semibold text-foreground">{title}</p>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onClose(id)}
        className="text-muted-foreground hover:text-foreground transition-colors duration-200"
      >
        <X className="w-4 h-4" />
      </motion.button>
    </motion.div>
  )
}
