"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"
import { useEffect, useState } from "react"

export interface ToastProps {
    id: string
    type: "success" | "error" | "warning" | "info"
    title: string
    description?: string
    duration?: number
    onClose: (id: string) => void
}

const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
}

const colors = {
    success: {
        bg: "bg-green-50 dark:bg-green-950/50",
        border: "border-green-200 dark:border-green-800",
        icon: "text-green-600 dark:text-green-400",
        text: "text-green-900 dark:text-green-100",
    },
    error: {
        bg: "bg-red-50 dark:bg-red-950/50",
        border: "border-red-200 dark:border-red-800",
        icon: "text-red-600 dark:text-red-400",
        text: "text-red-900 dark:text-red-100",
    },
    warning: {
        bg: "bg-yellow-50 dark:bg-yellow-950/50",
        border: "border-yellow-200 dark:border-yellow-800",
        icon: "text-yellow-600 dark:text-yellow-400",
        text: "text-yellow-900 dark:text-yellow-100",
    },
    info: {
        bg: "bg-blue-50 dark:bg-blue-950/50",
        border: "border-blue-200 dark:border-blue-800",
        icon: "text-blue-600 dark:text-blue-400",
        text: "text-blue-900 dark:text-blue-100",
    },
}

export function Toast({ id, type, title, description, duration = 5000, onClose }: ToastProps) {
    const [progress, setProgress] = useState(100)
    const Icon = icons[type]
    const color = colors[type]

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev <= 0) {
                    clearInterval(interval)
                    onClose(id)
                    return 0
                }
                return prev - (100 / duration) * 100
            })
        }, 100)

        return () => clearInterval(interval)
    }, [duration, id, onClose])

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`relative overflow-hidden rounded-xl border-2 ${color.bg} ${color.border} backdrop-blur-sm shadow-lg min-w-[320px] max-w-md`}
        >
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 ${color.icon}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${color.text}`}>{title}</p>
                        {description && (
                            <p className={`text-xs mt-1 ${color.text} opacity-80`}>{description}</p>
                        )}
                    </div>
                    <button
                        onClick={() => onClose(id)}
                        className={`flex-shrink-0 ${color.icon} hover:opacity-70 transition-opacity`}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-black/10 dark:bg-white/10">
                <motion.div
                    className={`h-full ${color.icon.replace('text-', 'bg-')}`}
                    initial={{ width: "100%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1, ease: "linear" }}
                />
            </div>
        </motion.div>
    )
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastProps[], onClose: (id: string) => void }) {
    return (
        <div className="fixed top-4 right-4 flex flex-col gap-2 pointer-events-none" style={{ zIndex: 99999 }}>
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <Toast {...toast} onClose={onClose} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    )
}
