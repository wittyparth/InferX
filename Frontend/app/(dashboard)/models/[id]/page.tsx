"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    ArrowLeft,
    Loader2,
    Edit,
    Trash2,
    Play,
    BarChart3,
    Share2,
    CheckCircle,
    AlertCircle,
    AlertTriangle,
} from "lucide-react"
import { api } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { ShareModelDialog } from "@/components/share-model-dialog"

interface ModelData {
    id: string
    name: string
    description?: string
    model_type: string
    version: number
    status: string
    file_size: number
    created_at: string
    updated_at: string
    statistics?: {
        total_predictions: number
        avg_inference_time_ms: number
        success_rate: number
    }
}

export default function ModelDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const modelId = params.id as string

    const [model, setModel] = useState<ModelData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState({ description: "", status: "" })
    const [showShareDialog, setShowShareDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    // Prediction state
    const [predictionInput, setPredictionInput] = useState("")
    const [isPredicting, setIsPredicting] = useState(false)
    const [predictionResult, setPredictionResult] = useState<any>(null)

    useEffect(() => {
        fetchModelDetails()
    }, [modelId])

    const fetchModelDetails = async () => {
        setIsLoading(true)
        try {
            const response: any = await api.models.get(modelId)
            if (response.success) {
                setModel(response.data)
                setEditData({
                    description: response.data.description || "",
                    status: response.data.status,
                })
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error loading model",
                description: error.message || "Failed to fetch model details",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdate = async () => {
        try {
            await api.models.update(modelId, editData)
            toast({
                title: "Success!",
                description: "Model updated successfully",
            })
            setIsEditing(false)
            fetchModelDetails()
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Update failed",
                description: error.message || "Failed to update model",
            })
        }
    }

    const handleDelete = async () => {
        try {
            toast({
                title: "Archiving model...",
                description: "Please wait while we archive your model",
            })

            await api.models.delete(modelId)

            toast({
                title: "Success!",
                description: "Model archived successfully",
            })

            setTimeout(() => router.push("/models"), 500)
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Delete failed",
                description: error.message || "Failed to archive model",
            })
        } finally {
            setShowDeleteDialog(false)
        }
    }

    const handlePredict = async () => {
        if (!predictionInput.trim()) {
            toast({
                title: "Missing input",
                description: "Please provide prediction input as JSON",
            })
            return
        }

        setIsPredicting(true)
        setPredictionResult(null)

        // Show loading toast
        toast({
            title: "Running prediction...",
            description: "Your model is processing the input data",
        })

        try {
            const input = JSON.parse(predictionInput)
            const response: any = await api.predictions.create(modelId, input)

            if (response.success) {
                setPredictionResult(response.data)
                toast({
                    title: "Prediction successful!",
                    description: `Completed in ${response.data.metadata.inference_time_ms}ms`,
                })
            } else {
                throw new Error(response.message || "Prediction failed")
            }
        } catch (error: any) {
            setPredictionResult(null)
            console.error("Prediction error:", error)

            // Check if it's a JSON parsing error
            if (error instanceof SyntaxError) {
                toast({
                    variant: "destructive",
                    title: "Invalid JSON format",
                    description: "Please check your input syntax and try again",
                })
                return
            }

            // Extract the actual error message from the backend
            const errorMessage = error.message || "An unexpected error occurred"

            // Categorize error types for better user experience
            if (errorMessage.includes("Failed to load model") || errorMessage.includes("pickle") || errorMessage.includes("EOFError")) {
                toast({
                    variant: "destructive",
                    title: "Model Loading Error",
                    description: "The model file is corrupted or invalid. Please upload a new model trained with scikit-learn.",
                })
            } else if (errorMessage.includes("shape") || errorMessage.includes("features") || errorMessage.includes("dimension")) {
                toast({
                    variant: "destructive",
                    title: "Input Shape Mismatch",
                    description: `Your input doesn't match the model's expected features. ${errorMessage}`,
                })
            } else if (errorMessage.includes("Input validation failed")) {
                toast({
                    variant: "destructive",
                    title: "Invalid Input",
                    description: errorMessage,
                })
            } else if (errorMessage.includes("Model not found")) {
                toast({
                    variant: "destructive",
                    title: "Model Not Found",
                    description: "The model could not be found on the server.",
                })
            } else {
                // Show the actual backend error message
                toast({
                    variant: "destructive",
                    title: "Prediction Failed",
                    description: errorMessage,
                })
            }
        } finally {
            setIsPredicting(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B"
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
        return (bytes / (1024 * 1024)).toFixed(2) + " MB"
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!model) {
        return (
            <div className="p-6">
                <Card className="card-base p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-foreground mb-2">Model not found</h2>
                    <p className="text-muted-foreground mb-6">This model may have been deleted or you don't have access.</p>
                    <Link href="/models">
                        <Button>Back to Models</Button>
                    </Link>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Link href="/models" className="flex items-center gap-2 text-primary hover:text-accent mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Models
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-semibold text-foreground">{model.name}</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <Badge
                                className={`${model.status === "active"
                                    ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                                    : model.status === "deprecated"
                                        ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                                        : "bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400"
                                    }`}
                            >
                                {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                            </Badge>
                            <span className="text-muted-foreground text-sm">Version {model.version}</span>
                            <span className="text-muted-foreground text-sm">•</span>
                            <span className="text-muted-foreground text-sm">{model.model_type}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/models/${modelId}/analytics`)}
                            className="gap-2"
                        >
                            <BarChart3 className="w-4 h-4" />
                            Analytics
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowShareDialog(true)}
                            className="gap-2"
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="gap-2">
                            <Edit className="w-4 h-4" />
                            Edit
                        </Button>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(true)} className="gap-2 text-destructive">
                            <Trash2 className="w-4 h-4" />
                            Archive
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                            </div>
                            <AlertDialogTitle>Archive Model?</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="pt-2">
                            Are you sure you want to archive <strong>{model?.name}</strong>? This action cannot be undone and the model will no longer be available for predictions.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Archive Model
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Model Information */}
                    <Card className="card-base p-6">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Model Information</h2>
                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={editData.description}
                                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                        className="mt-2"
                                        rows={4}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        value={editData.status}
                                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                        className="w-full mt-2 px-4 py-2 bg-input border border-border rounded-lg"
                                    >
                                        <option value="active">Active</option>
                                        <option value="deprecated">Deprecated</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleUpdate}>Save Changes</Button>
                                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <span className="text-sm text-muted-foreground">Description</span>
                                    <p className="text-foreground mt-1">{model.description || "No description provided"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                    <div>
                                        <span className="text-sm text-muted-foreground">File Size</span>
                                        <p className="text-foreground font-semibold">{formatFileSize(model.file_size)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Created</span>
                                        <p className="text-foreground font-semibold">{formatDate(model.created_at)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Statistics */}
                    {model.statistics && (
                        <Card className="card-base p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-foreground">Statistics</h2>
                                <Link href={`/models/${modelId}/analytics`}>
                                    <Button variant="outline" className="gap-2">
                                        <BarChart3 className="w-4 h-4" />
                                        View Analytics
                                    </Button>
                                </Link>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/30 rounded-lg">
                                    <div className="text-2xl font-bold text-foreground">{model.statistics.total_predictions}</div>
                                    <div className="text-sm text-muted-foreground mt-1">Total Predictions</div>
                                </div>
                                <div className="text-center p-4 bg-muted/30 rounded-lg">
                                    <div className="text-2xl font-bold text-foreground">
                                        {model.statistics.avg_inference_time_ms?.toFixed(0) || 0}ms
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">Avg Inference Time</div>
                                </div>
                                <div className="text-center p-4 bg-muted/30 rounded-lg">
                                    <div className="text-2xl font-bold text-foreground">
                                        {model.statistics.success_rate?.toFixed(1) || 100}%
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">Success Rate</div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Interactive Testing Interface */}
                    <Card className="card-base p-0 overflow-hidden border-2 border-primary/20">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-6 border-b">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary/20 rounded-lg">
                                    <Play className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-2xl font-semibold text-foreground">Test Your Model</h2>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Try your model with sample inputs and see predictions in real-time
                            </p>
                        </div>

                        <div className="p-6">
                            {/* Quick Examples */}
                            <div className="mb-6">
                                <Label className="text-sm font-medium mb-3 block">Quick Examples (Iris Dataset)</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPredictionInput('[5.1, 3.5, 1.4, 0.2]')}
                                        className="justify-start text-xs"
                                    >
                                        🌸 Setosa Example
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPredictionInput('[6.3, 2.9, 5.6, 1.8]')}
                                        className="justify-start text-xs"
                                    >
                                        🌺 Versicolor Example
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPredictionInput('[7.2, 3.6, 6.1, 2.5]')}
                                        className="justify-start text-xs"
                                    >
                                        🌷 Virginica Example
                                    </Button>
                                </div>
                            </div>

                            {/* Input Section */}
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Label htmlFor="prediction-input" className="text-sm font-medium">
                                            Input Data (JSON)
                                        </Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setPredictionInput("")}
                                            className="h-6 px-2 text-xs"
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                    <Textarea
                                        id="prediction-input"
                                        placeholder='[5.1, 3.5, 1.4, 0.2]'
                                        value={predictionInput}
                                        onChange={(e) => setPredictionInput(e.target.value)}
                                        className="font-mono text-sm bg-muted/30 border-2 focus:border-primary/50"
                                        rows={6}
                                    />
                                    <div className="space-y-1 mt-2">
                                        <div className="flex items-start gap-2">
                                            <div className="flex-shrink-0 w-1 h-1 rounded-full bg-blue-500 mt-1.5" />
                                            <p className="text-xs text-muted-foreground">
                                                <strong>Format:</strong> Provide input as a JSON array of numbers
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="flex-shrink-0 w-1 h-1 rounded-full bg-green-500 mt-1.5" />
                                            <p className="text-xs text-muted-foreground">
                                                <strong>Example:</strong> For Iris model: [sepal_length, sepal_width, petal_length, petal_width]
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="flex-shrink-0 w-1 h-1 rounded-full bg-purple-500 mt-1.5" />
                                            <p className="text-xs text-muted-foreground">
                                                <strong>Alternative:</strong> You can also use named features: {`{"sepal_length": 5.1, "sepal_width": 3.5, ...}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handlePredict}
                                    disabled={isPredicting || !predictionInput.trim()}
                                    className="w-full gap-2 h-12 text-base font-semibold"
                                    size="lg"
                                >
                                    {isPredicting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Running Inference...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-5 h-5" />
                                            Run Prediction
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Loading State */}
                            {isPredicting && !predictionResult && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mt-6 p-8 bg-muted/30 border-2 border-primary/30 rounded-xl"
                                >
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <div className="relative">
                                            <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                            <div className="absolute inset-0 w-12 h-12 animate-ping rounded-full bg-primary/20" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-lg font-semibold text-foreground mb-1">
                                                Running Inference...
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Your model is processing the input data
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                            <span>Analyzing features</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Prediction Result */}
                            {predictionResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6"
                                >
                                    {/* Success Banner */}
                                    <div className="flex items-center gap-3 p-4 bg-green-500/10 border-2 border-green-500/30 rounded-lg mb-4">
                                        <div className="p-2 bg-green-500/20 rounded-full">
                                            <CheckCircle className="w-6 h-6 text-green-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-green-700 dark:text-green-400 text-lg">
                                                Prediction Successful!
                                            </h3>
                                            <p className="text-sm text-green-600/80 dark:text-green-400/80">
                                                Inference completed in {predictionResult.metadata.inference_time_ms}ms
                                            </p>
                                        </div>
                                    </div>

                                    {/* Main Result */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="p-5 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-2 border-blue-500/20 rounded-xl">
                                            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                                                Predicted Class
                                            </div>
                                            <div className="text-4xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                                                {JSON.stringify(predictionResult.prediction.prediction)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {predictionResult.prediction.prediction === 0 && "🌸 Iris Setosa"}
                                                {predictionResult.prediction.prediction === 1 && "🌺 Iris Versicolor"}
                                                {predictionResult.prediction.prediction === 2 && "🌷 Iris Virginica"}
                                            </div>
                                        </div>

                                        {predictionResult.prediction.confidence && (
                                            <div className="p-5 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-2 border-purple-500/20 rounded-xl">
                                                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                                                    Confidence Score
                                                </div>
                                                <div className="text-4xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                                                    {(predictionResult.prediction.confidence * 100).toFixed(1)}%
                                                </div>
                                                <div className="w-full h-2 bg-purple-500/20 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${predictionResult.prediction.confidence * 100}%` }}
                                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Class Probabilities */}
                                    {predictionResult.prediction.probabilities && (
                                        <div className="p-5 bg-muted/30 border-2 border-border rounded-xl">
                                            <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                                                <BarChart3 className="w-4 h-4" />
                                                Class Probabilities
                                            </h4>
                                            <div className="space-y-3">
                                                {predictionResult.prediction.probabilities.map((prob: number, idx: number) => {
                                                    const classNames = ["🌸 Setosa", "🌺 Versicolor", "🌷 Virginica"]
                                                    const colors = [
                                                        "bg-pink-500",
                                                        "bg-blue-500",
                                                        "bg-purple-500",
                                                    ]
                                                    const isMax = prob === Math.max(...predictionResult.prediction.probabilities)

                                                    return (
                                                        <div key={idx} className={`${isMax ? "scale-105" : ""} transition-transform`}>
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <span className={`text-sm font-medium ${isMax ? "text-foreground" : "text-muted-foreground"
                                                                    }`}>
                                                                    Class {idx} - {classNames[idx] || `Class ${idx}`}
                                                                </span>
                                                                <span
                                                                    className={`text-sm font-bold font-mono ${isMax ? "text-foreground" : "text-muted-foreground"
                                                                        }`}
                                                                >
                                                                    {(prob * 100).toFixed(2)}%
                                                                </span>
                                                            </div>
                                                            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${prob * 100}%` }}
                                                                    transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                                                                    className={`h-full ${colors[idx % colors.length]} ${isMax ? "shadow-lg" : ""
                                                                        }`}
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Metadata */}
                                    <div className="mt-4 p-4 bg-muted/20 rounded-lg border border-border">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">Prediction ID</div>
                                                <div className="text-xs font-mono text-foreground truncate">
                                                    {predictionResult.prediction_id?.slice(0, 8)}...
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">Model Version</div>
                                                <div className="text-sm font-semibold text-foreground">v{model.version}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">Inference Time</div>
                                                <div className="text-sm font-semibold text-foreground">
                                                    {predictionResult.metadata.inference_time_ms}ms
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">Status</div>
                                                <Badge className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">
                                                    Success
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column - Actions */}
                <div className="space-y-6">
                    <Card className="card-base p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link href={`/models/${modelId}/analytics`}>
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <BarChart3 className="w-4 h-4" />
                                    View Analytics
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2"
                                onClick={() => setShowShareDialog(true)}
                            >
                                <Share2 className="w-4 h-4" />
                                Share Model
                            </Button>
                        </div>
                    </Card>

                    <Card className="card-base p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">API Endpoint</h2>
                        <div className="space-y-2">
                            <Label>Prediction Endpoint</Label>
                            <div className="p-3 bg-muted rounded-lg font-mono text-xs break-all">
                                POST /api/v1/predict/{modelId}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Use this endpoint to make predictions programmatically with your API key.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Share Dialog */}
            {model && (
                <ShareModelDialog
                    modelId={modelId}
                    modelName={model.name}
                    open={showShareDialog}
                    onOpenChange={setShowShareDialog}
                />
            )}
        </div>
    )
}
