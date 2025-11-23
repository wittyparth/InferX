"use client"

import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Activity,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    BarChart3,
    AlertTriangle
} from "lucide-react"
import { api } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts"

interface AnalyticsData {
    model_id: string
    model_name: string
    model_version: string
    statistics: {
        total_predictions: number
        successful_predictions: number
        failed_predictions: number
        success_rate: number
        avg_inference_time_ms: number | null
        min_inference_time_ms: number | null
        max_inference_time_ms: number | null
    }
    usage_trends: Array<{
        date: string
        prediction_count: number
        avg_inference_time_ms: number | null
    }>
    recent_errors: Array<{
        timestamp: string
        error_message: string
        input_data: any
    }>
    analysis_period_days: number
}

export default function ModelAnalyticsPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const modelId = params.id as string

    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [days, setDays] = useState(7)

    useEffect(() => {
        if (modelId) {
            fetchAnalytics()
        }
    }, [modelId, days])

    const fetchAnalytics = async () => {
        try {
            setIsLoading(true)
            const response = await api.models.analytics(modelId, days)
            setAnalytics(response.data)
        } catch (error: any) {
            console.error("Failed to fetch analytics:", error)
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to load analytics",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const formatTimestamp = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!analytics) {
        return (
            <div className="p-6 md:p-8">
                <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Failed to load analytics</p>
                    <Button onClick={() => router.back()} className="mt-4">
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    const stats = analytics.statistics
    const trends = analytics.usage_trends

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-4"
            >
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.back()}
                    className="shrink-0"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-semibold text-foreground">Analytics</h1>
                    <p className="text-muted-foreground mt-1">
                        {analytics.model_name} <Badge variant="outline" className="ml-2">v{analytics.model_version}</Badge>
                    </p>
                </div>
                <div className="flex gap-2">
                    {[7, 30, 90].map((d) => (
                        <Button
                            key={d}
                            variant={days === d ? "default" : "outline"}
                            size="sm"
                            onClick={() => setDays(d)}
                        >
                            {d} Days
                        </Button>
                    ))}
                </div>
            </motion.div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Total Predictions</p>
                                <p className="text-2xl font-semibold">{stats.total_predictions.toLocaleString()}</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Success Rate</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-semibold">{stats.success_rate}%</p>
                                    {stats.success_rate >= 90 ? (
                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 text-red-600" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                                <p className="text-2xl font-semibold">
                                    {stats.avg_inference_time_ms ? `${Math.round(stats.avg_inference_time_ms)}ms` : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-500/10">
                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Failed Predictions</p>
                                <p className="text-2xl font-semibold">{stats.failed_predictions.toLocaleString()}</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Usage Trends Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold">Daily Usage</h3>
                        </div>
                        {trends.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={trends}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={formatDate}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        labelFormatter={formatDate}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar dataKey="prediction_count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                No usage data available
                            </div>
                        )}
                    </Card>
                </motion.div>

                {/* Inference Time Trends */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold">Inference Time Trends</h3>
                        </div>
                        {trends.length > 0 && trends.some(t => t.avg_inference_time_ms) ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={trends}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={formatDate}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        labelFormatter={formatDate}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="avg_inference_time_ms"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        name="Avg Time (ms)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                No inference time data available
                            </div>
                        )}
                    </Card>
                </motion.div>
            </div>

            {/* Performance Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-muted/30">
                            <p className="text-sm text-muted-foreground mb-1">Minimum Response Time</p>
                            <p className="text-xl font-semibold">
                                {stats.min_inference_time_ms ? `${stats.min_inference_time_ms}ms` : 'N/A'}
                            </p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/30">
                            <p className="text-sm text-muted-foreground mb-1">Average Response Time</p>
                            <p className="text-xl font-semibold">
                                {stats.avg_inference_time_ms ? `${Math.round(stats.avg_inference_time_ms)}ms` : 'N/A'}
                            </p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/30">
                            <p className="text-sm text-muted-foreground mb-1">Maximum Response Time</p>
                            <p className="text-xl font-semibold">
                                {stats.max_inference_time_ms ? `${stats.max_inference_time_ms}ms` : 'N/A'}
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Recent Errors */}
            {analytics.recent_errors.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <h3 className="text-lg font-semibold">Recent Errors</h3>
                            <Badge variant="destructive" className="ml-2">
                                {analytics.recent_errors.length}
                            </Badge>
                        </div>
                        <div className="space-y-3">
                            {analytics.recent_errors.map((error, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-red-800 dark:text-red-400">
                                                {error.error_message || 'Unknown error'}
                                            </p>
                                            <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                                                {formatTimestamp(error.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                    {error.input_data && (
                                        <details className="mt-2">
                                            <summary className="text-xs text-red-700 dark:text-red-400 cursor-pointer">
                                                View Input Data
                                            </summary>
                                            <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 rounded text-xs overflow-x-auto">
                                                {JSON.stringify(error.input_data, null, 2)}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            )}
        </div>
    )
}
