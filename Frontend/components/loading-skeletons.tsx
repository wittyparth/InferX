"use client"

import { motion } from "framer-motion"
import { Skeleton } from "./skeleton"

export function CardSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-base p-6 space-y-4"
        >
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-border">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
            </div>
        </motion.div>
    )
}

export function TableRowSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-4 py-4 border-b border-border"
        >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8" />
        </motion.div>
    )
}

export function DashboardSkeleton() {
    return (
        <div className="p-6 md:p-8 space-y-8">
            {/* Header Skeleton */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
            >
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-4 w-72" />
            </motion.div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="card-base p-6 space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-10 rounded-full" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-3 w-32" />
                    </motion.div>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 card-base p-6 space-y-4"
                >
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-64 w-full" />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="card-base p-6 space-y-4"
                >
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-48 w-48 mx-auto rounded-full" />
                </motion.div>
            </div>
        </div>
    )
}

export function ModelsGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <CardSkeleton />
                </motion.div>
            ))}
        </div>
    )
}
