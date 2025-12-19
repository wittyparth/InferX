"use client"

import { motion } from "framer-motion"
import { Loader2, Zap } from "lucide-react"

interface PremiumLoaderProps {
    text?: string
    size?: "sm" | "md" | "lg"
    fullScreen?: boolean
}

export function PremiumLoader({ text = "Loading", size = "md", fullScreen = false }: PremiumLoaderProps) {
    const sizes = {
        sm: { container: "w-8 h-8", icon: "w-4 h-4", text: "text-sm" },
        md: { container: "w-12 h-12", icon: "w-6 h-6", text: "text-base" },
        lg: { container: "w-16 h-16", icon: "w-8 h-8", text: "text-lg" },
    }

    const currentSize = sizes[size]

    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            {/* Animated loader with rings */}
            <div className="relative">
                {/* Outer ring */}
                <motion.div
                    className={`${currentSize.container} border-4 border-primary/20 rounded-full`}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                {/* Middle ring */}
                <motion.div
                    className={`absolute inset-0 ${currentSize.container} border-4 border-transparent border-t-primary border-r-primary rounded-full`}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />

                {/* Inner ring */}
                <motion.div
                    className={`absolute inset-0 ${currentSize.container} border-2 border-transparent border-t-accent rounded-full`}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />

                {/* Center icon */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Zap className={`${currentSize.icon} text-primary`} />
                </motion.div>
            </div>

            {/* Loading text */}
            {text && (
                <div className="flex items-center gap-1">
                    <motion.span className={`${currentSize.text} text-muted-foreground font-medium`}>
                        {text}
                    </motion.span>
                    <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                        className={`${currentSize.text} text-muted-foreground font-medium`}
                    >
                        .
                    </motion.span>
                    <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                        className={`${currentSize.text} text-muted-foreground font-medium`}
                    >
                        .
                    </motion.span>
                    <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                        className={`${currentSize.text} text-muted-foreground font-medium`}
                    >
                        .
                    </motion.span>
                </div>
            )}
        </div>
    )

    if (fullScreen) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center relative overflow-hidden">
                {/* Animated background orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
                        animate={{
                            scale: [1.3, 1, 1.3],
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="relative z-10"
                >
                    {content}
                </motion.div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {content}
        </motion.div>
    )
}

// Inline loader for buttons and small spaces
export function InlineLoader({ className = "" }: { className?: string }) {
    return (
        <motion.div
            className={`inline-flex items-center justify-center ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
                <Loader2 className="w-4 h-4" />
            </motion.div>
        </motion.div>
    )
}
